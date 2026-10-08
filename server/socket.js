import { Server } from 'socket.io';

// Map of connected sockets and active calls
const connectedUsers = new Map(); // socketId -> userInfo
const userSockets = new Map(); // email -> Set(socketId)

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    // console.log(`[Socket] Nouvelle connexion: ${socket.id}`);

    // 1. Register authenticated user
    socket.on('register-user', (userData) => {
      if (!userData || !userData.email) return;

      const userEmail = userData.email.toLowerCase().trim();
      const userRole = userData.role || 'client';

      socket.user = {
        ...userData,
        email: userEmail,
        socketId: socket.id,
      };

      connectedUsers.set(socket.id, socket.user);

      if (!userSockets.has(userEmail)) {
        userSockets.set(userEmail, new Set());
      }
      userSockets.get(userEmail).add(socket.id);

      // Join individual room and role rooms
      socket.join(`user:${userEmail}`);
      socket.join(`role:${userRole}`);

      // If user is admin/direction, join direction room
      if (['admin', 'juridique', 'finance', 'superadmin', 'staff', 'direction'].includes(userRole)) {
        socket.join('room:direction');
      }

      // console.log(`[Socket] Utilisateur enregistré: ${userEmail} (${userRole}) [socket ${socket.id}]`);

      // Notify clients of online status
      io.emit('user-status-change', {
        email: userEmail,
        status: 'online',
      });
    });

    // 2. Call User (WebRTC Offer Signaling)
    socket.on('call-user', ({ toEmail, toRole, signalData, isVideo = false, channelId }) => {
      const caller = socket.user || {
        name: 'Utilisateur S2T',
        email: 'inconnu@s2t.tn',
        role: 'client',
      };

      const targetEmail = toEmail ? toEmail.toLowerCase().trim() : null;

      // console.log(`[Socket Call] ${caller.email} appelle ${targetEmail || toRole}`);

      const callPayload = {
        caller: {
          name: caller.name,
          email: caller.email,
          role: caller.role,
          companyName: caller.companyName || '',
          avatarBg: caller.avatarBg || (caller.role === 'admin' ? 'var(--s2t-blue)' : 'var(--s2t-blue)'),
          avatarText: caller.name ? caller.name.charAt(0) : 'U',
          socketId: socket.id,
        },
        signalData,
        isVideo,
        channelId: channelId || 'direction',
        timestamp: Date.now(),
      };

      // Determine target destination
      if (targetEmail) {
        // Direct call to specific email (e.g. client calling direction or admin calling specific resident)
        if (targetEmail === 'direction@s2t.tn' || targetEmail === 'direction') {
          socket.to('room:direction').emit('incoming-call', callPayload);
          socket.to('role:admin').emit('incoming-call', callPayload);
        } else {
          socket.to(`user:${targetEmail}`).emit('incoming-call', callPayload);
        }
      } else if (toRole === 'admin' || toRole === 'direction') {
        socket.to('room:direction').emit('incoming-call', callPayload);
        socket.to('role:admin').emit('incoming-call', callPayload);
      } else {
        // Broadcast to all other connections as fallback
        socket.broadcast.emit('incoming-call', callPayload);
      }
    });

    // 3. Accept Call (WebRTC Answer Signaling)
    socket.on('accept-call', ({ toSocketId, toEmail, signalData }) => {
      const answerer = socket.user || {
        name: 'Correspondant S2T',
        email: 'contact@s2t.tn',
      };

      // console.log(`[Socket Call] Appel accepté par ${answerer.email}`);

      const acceptPayload = {
        answerer: {
          name: answerer.name,
          email: answerer.email,
          socketId: socket.id,
        },
        signalData,
      };

      if (toSocketId) {
        io.to(toSocketId).emit('call-accepted', acceptPayload);
      } else if (toEmail) {
        io.to(`user:${toEmail.toLowerCase().trim()}`).emit('call-accepted', acceptPayload);
      } else {
        socket.broadcast.emit('call-accepted', acceptPayload);
      }
    });

    // 4. Reject / Busy Call
    socket.on('reject-call', ({ toSocketId, toEmail, reason = 'declined' }) => {
      const rejectPayload = {
        by: socket.user?.name || 'Destinataire',
        reason,
      };

      if (toSocketId) {
        io.to(toSocketId).emit('call-rejected', rejectPayload);
      } else if (toEmail) {
        io.to(`user:${toEmail.toLowerCase().trim()}`).emit('call-rejected', rejectPayload);
      } else {
        socket.broadcast.emit('call-rejected', rejectPayload);
      }
    });

    // 5. End Call (Hangup)
    socket.on('end-call', ({ toSocketId, toEmail, duration = 0 }) => {
      const endPayload = {
        by: socket.user?.name || 'Correspondant',
        duration,
      };

      if (toSocketId) {
        io.to(toSocketId).emit('call-ended', endPayload);
      }
      if (toEmail) {
        io.to(`user:${toEmail.toLowerCase().trim()}`).emit('call-ended', endPayload);
      }
      socket.broadcast.emit('call-ended', endPayload);
    });

    // 6. WebRTC ICE Candidate Forwarding
    socket.on('ice-candidate', ({ toSocketId, toEmail, toRole, candidate }) => {
      if (!candidate) return;

      const candidatePayload = {
        fromSocketId: socket.id,
        fromEmail: socket.user?.email,
        candidate,
      };

      if (toSocketId) {
        io.to(toSocketId).emit('ice-candidate', candidatePayload);
      } else if (toEmail) {
        const cleanEmail = toEmail.toLowerCase().trim();
        if (cleanEmail === 'direction@s2t.tn' || cleanEmail === 'direction') {
          socket.to('room:direction').emit('ice-candidate', candidatePayload);
          socket.to('role:admin').emit('ice-candidate', candidatePayload);
        } else {
          io.to(`user:${cleanEmail}`).emit('ice-candidate', candidatePayload);
        }
      } else if (toRole) {
        socket.to(`role:${toRole}`).emit('ice-candidate', candidatePayload);
      } else {
        socket.broadcast.emit('ice-candidate', candidatePayload);
      }
    });

    // 7. Real-time chat message broadcast
    socket.on('new-message', (messageData) => {
      socket.broadcast.emit('message-received', messageData);
    });

    // =========================================================================
    // 8. ONLINE MEETING ROOM (Visioconférence de Salle S2T 4K WebRTC)
    // =========================================================================

    // In-memory meeting rooms metadata (polls, whiteboard history, settings)
    if (!global.meetingRoomsData) {
      global.meetingRoomsData = new Map();
    }

    // Join online meeting room
    socket.on('join-meeting-room', ({ meetingId, user }) => {
      if (!meetingId) return;

      const roomName = `meeting:${meetingId}`;
      const roomData = global.meetingRoomsData.get(meetingId) || {
        isLocked: false,
        activePoll: null,
        whiteboardDraws: [],
        spotlightId: null,
      };
      global.meetingRoomsData.set(meetingId, roomData);

      if (roomData.isLocked && user?.role !== 'admin') {
        socket.emit('meeting-room-locked-error', {
          message: 'Cette réunion a été verrouillée par l\'organisateur S2T.',
        });
        return;
      }

      socket.join(roomName);
      socket.meetingId = meetingId;

      const participantInfo = {
        socketId: socket.id,
        user: {
          _id: user?._id || user?.id,
          name: user?.name || 'Participant S2T',
          email: user?.email || '',
          companyName: user?.companyName || '',
          role: user?.role || 'client',
        },
        joinedAt: Date.now(),
        isVideoOn: true,
        isAudioOn: true,
        isHandRaised: false,
        isScreenSharing: false,
      };

      socket.meetingUser = participantInfo;

      // Find all other sockets in this room
      const roomSockets = io.sockets.adapter.rooms.get(roomName);
      const otherParticipants = [];

      if (roomSockets) {
        for (const sockId of roomSockets) {
          if (sockId !== socket.id) {
            const clientSock = io.sockets.sockets.get(sockId);
            if (clientSock && clientSock.meetingUser) {
              otherParticipants.push(clientSock.meetingUser);
            }
          }
        }
      }

      // 1. Send existing participants list and room state to new joiner
      socket.emit('meeting-room-joined', {
        meetingId,
        otherParticipants,
        activePoll: roomData.activePoll,
        isLocked: roomData.isLocked,
        spotlightId: roomData.spotlightId,
      });

      // 2. Notify all existing participants that someone joined
      socket.to(roomName).emit('meeting-user-joined', participantInfo);
    });

    // Relay WebRTC signal between meeting participants
    socket.on('meeting-signal', ({ toSocketId, signalData, type }) => {
      if (!toSocketId) return;

      io.to(toSocketId).emit('meeting-signal', {
        fromSocketId: socket.id,
        signalData,
        type, // 'offer', 'answer', or 'ice-candidate'
      });
    });

    // In-meeting live text chat
    socket.on('meeting-chat-send', ({ meetingId, message }) => {
      if (!meetingId || !message) return;

      const chatPayload = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sender: socket.meetingUser?.user || { name: 'Participant S2T' },
        text: message.text,
        timestamp: Date.now(),
      };

      io.to(`meeting:${meetingId}`).emit('meeting-chat-message', chatPayload);
    });

    // Toggle in-meeting camera or microphone mute state
    socket.on('meeting-toggle-media', ({ meetingId, isVideoOn, isAudioOn }) => {
      if (!meetingId) return;

      if (socket.meetingUser) {
        if (isVideoOn !== undefined) socket.meetingUser.isVideoOn = isVideoOn;
        if (isAudioOn !== undefined) socket.meetingUser.isAudioOn = isAudioOn;
      }

      socket.to(`meeting:${meetingId}`).emit('meeting-user-media-changed', {
        socketId: socket.id,
        isVideoOn: socket.meetingUser?.isVideoOn,
        isAudioOn: socket.meetingUser?.isAudioOn,
      });
    });

    // Toggle hand raise
    socket.on('meeting-toggle-hand', ({ meetingId, isHandRaised }) => {
      if (!meetingId) return;

      if (socket.meetingUser) {
        socket.meetingUser.isHandRaised = Boolean(isHandRaised);
      }

      io.to(`meeting:${meetingId}`).emit('meeting-user-hand-changed', {
        socketId: socket.id,
        name: socket.meetingUser?.user?.name || 'Participant',
        isHandRaised: Boolean(isHandRaised),
      });
    });

    // Screen sharing state toggle
    socket.on('meeting-screen-share', ({ meetingId, isScreenSharing }) => {
      if (!meetingId) return;

      if (socket.meetingUser) {
        socket.meetingUser.isScreenSharing = Boolean(isScreenSharing);
      }

      socket.to(`meeting:${meetingId}`).emit('meeting-user-screen-changed', {
        socketId: socket.id,
        name: socket.meetingUser?.user?.name || 'Participant',
        isScreenSharing: Boolean(isScreenSharing),
      });
    });

    // Collaborative Whiteboard: Draw event
    socket.on('meeting-whiteboard-draw', ({ meetingId, drawAction }) => {
      if (!meetingId || !drawAction) return;
      socket.to(`meeting:${meetingId}`).emit('meeting-whiteboard-draw', drawAction);
    });

    // Collaborative Whiteboard: Clear canvas
    socket.on('meeting-whiteboard-clear', ({ meetingId }) => {
      if (!meetingId) return;
      socket.to(`meeting:${meetingId}`).emit('meeting-whiteboard-clear');
    });

    // Interactive Polls: Create Poll
    socket.on('meeting-poll-create', ({ meetingId, poll }) => {
      if (!meetingId || !poll) return;
      const roomData = global.meetingRoomsData.get(meetingId) || {};
      const newPoll = {
        id: `poll-${Date.now()}`,
        question: poll.question,
        options: poll.options.map((opt, idx) => ({ id: idx, text: opt, votes: 0 })),
        createdBy: socket.meetingUser?.user?.name || 'Organisateur',
        createdAt: Date.now(),
        isClosed: false,
        voters: [],
      };
      roomData.activePoll = newPoll;
      global.meetingRoomsData.set(meetingId, roomData);

      io.to(`meeting:${meetingId}`).emit('meeting-poll-created', newPoll);
    });

    // Interactive Polls: Cast Vote
    socket.on('meeting-poll-vote', ({ meetingId, pollId, optionId }) => {
      if (!meetingId) return;
      const roomData = global.meetingRoomsData.get(meetingId);
      if (roomData && roomData.activePoll && roomData.activePoll.id === pollId && !roomData.activePoll.isClosed) {
        const userId = socket.meetingUser?.user?._id || socket.id;
        if (!roomData.activePoll.voters.includes(userId)) {
          roomData.activePoll.voters.push(userId);
          const option = roomData.activePoll.options.find(o => o.id === optionId);
          if (option) {
            option.votes += 1;
          }
          io.to(`meeting:${meetingId}`).emit('meeting-poll-updated', roomData.activePoll);
        }
      }
    });

    // Interactive Polls: Close Poll
    socket.on('meeting-poll-close', ({ meetingId, pollId }) => {
      if (!meetingId) return;
      const roomData = global.meetingRoomsData.get(meetingId);
      if (roomData && roomData.activePoll && roomData.activePoll.id === pollId) {
        roomData.activePoll.isClosed = true;
        io.to(`meeting:${meetingId}`).emit('meeting-poll-closed', roomData.activePoll);
      }
    });

    // Live Speech Captions Broadcast
    socket.on('meeting-caption', ({ meetingId, text, lang }) => {
      if (!meetingId || !text) return;
      socket.to(`meeting:${meetingId}`).emit('meeting-caption', {
        speaker: socket.meetingUser?.user?.name || 'Participant',
        companyName: socket.meetingUser?.user?.companyName || '',
        text,
        lang: lang || 'fr-FR',
        timestamp: Date.now(),
      });
    });

    // Host Management Actions (Mute All, Lock Room, Kick User)
    socket.on('meeting-host-action', ({ meetingId, action, targetSocketId }) => {
      if (!meetingId || !action) return;

      const roomData = global.meetingRoomsData.get(meetingId) || {};

      if (action === 'mute-all') {
        socket.to(`meeting:${meetingId}`).emit('meeting-force-mute');
      } else if (action === 'lower-all-hands') {
        io.to(`meeting:${meetingId}`).emit('meeting-lower-all-hands');
      } else if (action === 'lock-room') {
        roomData.isLocked = !roomData.isLocked;
        global.meetingRoomsData.set(meetingId, roomData);
        io.to(`meeting:${meetingId}`).emit('meeting-lock-changed', { isLocked: roomData.isLocked });
      } else if (action === 'kick-user' && targetSocketId) {
        io.to(targetSocketId).emit('meeting-kicked');
      } else if (action === 'spotlight' && targetSocketId) {
        roomData.spotlightId = targetSocketId;
        io.to(`meeting:${meetingId}`).emit('meeting-spotlight-changed', { spotlightId: targetSocketId });
      }
    });

    // Explicit leave meeting room
    socket.on('leave-meeting-room', ({ meetingId }) => {
      const activeMeetingId = meetingId || socket.meetingId;
      if (activeMeetingId) {
        socket.to(`meeting:${activeMeetingId}`).emit('meeting-user-left', {
          socketId: socket.id,
          user: socket.meetingUser?.user,
        });
        socket.leave(`meeting:${activeMeetingId}`);
        socket.meetingId = null;
        socket.meetingUser = null;
      }
    });

    // 9. Disconnect handling
    socket.on('disconnect', () => {
      // Handle meeting room disconnect
      if (socket.meetingId) {
        socket.to(`meeting:${socket.meetingId}`).emit('meeting-user-left', {
          socketId: socket.id,
          user: socket.meetingUser?.user,
        });
      }

      const user = connectedUsers.get(socket.id);
      if (user) {
        const userEmail = user.email;
        connectedUsers.delete(socket.id);

        if (userSockets.has(userEmail)) {
          userSockets.get(userEmail).delete(socket.id);
          if (userSockets.get(userEmail).size === 0) {
            userSockets.delete(userEmail);
            io.emit('user-status-change', {
              email: userEmail,
              status: 'offline',
            });
          }
        }
      }
    });
  });

  return io;
};
