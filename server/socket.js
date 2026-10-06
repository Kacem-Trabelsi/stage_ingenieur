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
    socket.on('ice-candidate', ({ toSocketId, toEmail, candidate }) => {
      if (!candidate) return;

      const candidatePayload = {
        fromSocketId: socket.id,
        fromEmail: socket.user?.email,
        candidate,
      };

      if (toSocketId) {
        io.to(toSocketId).emit('ice-candidate', candidatePayload);
      } else if (toEmail) {
        io.to(`user:${toEmail.toLowerCase().trim()}`).emit('ice-candidate', candidatePayload);
      } else {
        socket.broadcast.emit('ice-candidate', candidatePayload);
      }
    });

    // 7. Real-time chat message broadcast
    socket.on('new-message', (messageData) => {
      socket.broadcast.emit('message-received', messageData);
    });

    // 8. Disconnect handling
    socket.on('disconnect', () => {
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
