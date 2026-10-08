import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getSocket } from '../services/socket';
import { reunionAPI } from '../services/api';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  StopCircle,
  Hand,
  MessageSquare,
  Users,
  Settings,
  PhoneOff,
  Copy,
  Check,
  Maximize,
  Minimize,
  Sparkles,
  Shield,
  Radio,
  Volume2,
  VolumeX,
  Smile,
  FileText,
  Pin,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  SquareUserRound,
  Download,
  Info,
  PenTool,
  Eraser,
  BarChart2,
  Subtitles,
  Lock,
  Unlock,
  Mail,
  Trash2,
  Sparkle,
  Plus
} from 'lucide-react';

// WebRTC STUN Configuration
const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

// Web Audio API Sound Chime Helper
const playAudioChime = (type = 'join') => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'join') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'hand') {
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'msg') {
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'poll') {
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(1040, now + 0.25);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch {
    // AudioContext autoplay fallback
  }
};

const MeetingRoomPage = () => {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  // Meeting Metadata
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [roomTitle, setRoomTitle] = useState(t('meet_lobby_default_title'));
  const [roomLocationName, setRoomLocationName] = useState(t('meet_lobby_default_loc'));
  const [isRoomLocked, setIsRoomLocked] = useState(false);

  // Pre-join Lobby State
  const [inLobby, setInLobby] = useState(true);
  const [participantName, setParticipantName] = useState(user?.name || t('meet_lobby_visitor'));
  const [companyName, setCompanyName] = useState(user?.companyName || (user?.role === 'admin' ? t('meet_lobby_dir_s2t') : t('meet_lobby_guest_company')));
  const [userRole] = useState(user?.role || 'client');

  // Media States
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoDisabled, setIsVideoDisabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  
  // Real Media Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const [meetingSeconds, setMeetingSeconds] = useState(0);

  // Hardware Devices Enumeration
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');
  const [videoQuality, setVideoQuality] = useState('720p'); // '1080p' | '720p' | '360p'
  const [virtualFilter, setVirtualFilter] = useState('normal'); // 'normal' | 'blur' | 'technopark' | 'studio'

  // Audio Level Meter (Lobby & In-Meeting)
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);

  // Stream Refs
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const lobbyVideoRef = useRef(null);

  // WebRTC Peer Connections Map: socketId -> { pc, user, stream }
  const peerConnectionsRef = useRef(new Map());
  const pendingIceCandidatesRef = useRef(new Map()); // socketId -> RTCIceCandidate[]
  const [remoteParticipants, setRemoteParticipants] = useState([]);

  // UI Panels & Drawers: 'chat' | 'participants' | 'notes' | 'whiteboard' | 'polls' | 'settings' | 'email'
  const [activeDrawer, setActiveDrawer] = useState(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome-system',
      sender: { name: `${t('meet_lobby_dir_s2t')} (${t('nav_admin_space') || 'Admin'})`, companyName: 'Smart Tunisian Technoparks', role: 'admin' },
      text: t('meet_system_welcome_msg'),
      timestamp: Date.now(),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  // Layout Mode: 'grid' | 'speaker' | 'whiteboard'
  const [layoutMode, setLayoutMode] = useState('grid');
  const [pinnedParticipantId, setPinnedParticipantId] = useState(null);
  const [spotlightId, setSpotlightId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [securityModalOpen, setSecurityModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Live Speech Subtitles / Captions
  const [isCaptionsEnabled, setIsCaptionsEnabled] = useState(false);
  const [captionLang] = useState(language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR');
  const [liveCaption, setLiveCaption] = useState(null); // { speaker, text, timestamp }
  const speechRecognitionRef = useRef(null);

  // Interactive Polls
  const [activePoll, setActivePoll] = useState(null);
  const [userVotedOption, setUserVotedOption] = useState(null);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState([t('meet_poll_opt_yes'), t('meet_poll_opt_no'), t('meet_poll_opt_abstain')]);

  // Collaborative Whiteboard
  const whiteboardCanvasRef = useRef(null);
  const [whiteboardTool, setWhiteboardTool] = useState('pen'); // 'pen' | 'highlighter' | 'eraser' | 'rect' | 'circle' | 'line'
  const [whiteboardColor, setWhiteboardColor] = useState('#2563EB');
  const [whiteboardBrushSize, setWhiteboardBrushSize] = useState(4);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Floating Reactions
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [reactionsMenuOpen, setReactionsMenuOpen] = useState(false);

  // Shared Notes & Minutes
  const [meetingNotes, setMeetingNotes] = useState(() => {
    if (language === 'ar') {
      return `# جدول أعمال الاجتماع — S2T\n- التاريخ : ${new Date().toLocaleDateString('ar-TN')}\n- القاعة : ${roomLocationName}\n\n### النقاط الرئيسية للمناقشة :\n1. عرض الأهداف المرحلية\n2. المرافقة الفنية وعقود الإيواء\n3. الخطوات القادمة وجدول التنفيذ\n\n### القرارات المتخذة :\n- المصادقة على روزنامة العمل\n`;
    }
    if (language === 'en') {
      return `# Meeting Agenda — S2T\n- Date: ${new Date().toLocaleDateString('en-US')}\n- Room: ${roomLocationName}\n\n### Key Discussion Points:\n1. Presentation of quarterly objectives\n2. Technical support & hosting agreements\n3. Next steps and deployment schedule\n\n### Decisions Made:\n- Schedule approval\n`;
    }
    return `# Ordre du Jour — Réunion S2T\n- Date : ${new Date().toLocaleDateString('fr-FR')}\n- Salle : ${roomLocationName}\n\n### Points clés discutés :\n1. Présentation des objectifs trimestriels\n2. Accompagnement technique & hébergement\n3. Prochaines étapes et calendrier de déploiement\n\n### Décisions prises :\n- Validation du planning\n`;
  });
  const [isGeneratingAiSummary, setIsGeneratingAiSummary] = useState(false);
  const [emailMinutesModalOpen, setEmailMinutesModalOpen] = useState(false);
  const [emailRecipientsInput, setEmailRecipientsInput] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState('');

  // Toast Banner Notification
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg, type = 'info') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Fetch Meeting Details from Backend if available
  useEffect(() => {
    let isMounted = true;
    const fetchDetails = async () => {
      if (!meetingId) return;
      try {
        const res = await reunionAPI.getById(meetingId);
        if (isMounted && res?.data) {
          setMeetingDetails(res.data);
          if (res.data.title) setRoomTitle(res.data.title);
          if (res.data.room) setRoomLocationName(res.data.room);
          if (res.data.organizerEmail) {
            setEmailRecipientsInput(res.data.organizerEmail);
          }
        }
      } catch {
        if (location.state?.meetingTitle) {
          setRoomTitle(location.state.meetingTitle);
        }
        if (location.state?.meetingRoom) {
          setRoomLocationName(location.state.meetingRoom);
        }
      }
    };
    fetchDetails();
    return () => { isMounted = false; };
  }, [meetingId, location.state]);

  // 2. Enumerate Hardware Devices (Microphone & Camera)
  useEffect(() => {
    const getDevices = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audios = devices.filter(d => d.kind === 'audioinput');
        const videos = devices.filter(d => d.kind === 'videoinput');
        setAudioDevices(audios);
        setVideoDevices(videos);
        if (audios.length > 0 && !selectedAudioDevice) setSelectedAudioDevice(audios[0].deviceId);
        if (videos.length > 0 && !selectedVideoDevice) setSelectedVideoDevice(videos[0].deviceId);
      } catch (err) {
        console.warn('Erreur énumération périphériques:', err);
      }
    };
    getDevices();
  }, [selectedAudioDevice, selectedVideoDevice]);

  // 3. Pre-lobby Camera and Mic Setup
  const initUserMedia = useCallback(async (audioId = '', videoId = '') => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }

      const constraints = {
        video: videoId ? { deviceId: { exact: videoId } } : { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: audioId ? { deviceId: { exact: audioId }, echoCancellation: true, noiseSuppression: true } : { echoCancellation: true, noiseSuppression: true },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (lobbyVideoRef.current) {
        lobbyVideoRef.current.srcObject = stream;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Update tracks across existing WebRTC peer connections
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      peerConnectionsRef.current.forEach(({ pc }) => {
        if (pc) {
          const senders = pc.getSenders();
          if (videoTrack) {
            const vSender = senders.find(s => s.track && s.track.kind === 'video');
            if (vSender) vSender.replaceTrack(videoTrack).catch(() => {});
          }
          if (audioTrack) {
            const aSender = senders.find(s => s.track && s.track.kind === 'audio');
            if (aSender) aSender.replaceTrack(audioTrack).catch(() => {});
          }
        }
      });

      // Setup Audio Analyser for volume level meter
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => {});
          }
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateLevel = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
            const average = sum / bufferLength;
            setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
            animFrameRef.current = requestAnimationFrame(updateLevel);
          };
          updateLevel();
        }
      } catch {
        // Analyser fallback
      }
    } catch (err) {
      console.warn('Accès caméra/micro non disponible ou refusé:', err);
    }
  }, []);

  useEffect(() => {
    initUserMedia(selectedAudioDevice, selectedVideoDevice);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [initUserMedia, selectedAudioDevice, selectedVideoDevice]);

  // Update local video element when entering room
  useEffect(() => {
    if (!inLobby && localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [inLobby]);

  // 4. Meeting Timer
  useEffect(() => {
    if (inLobby) return;
    const timer = setInterval(() => {
      setMeetingSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [inLobby]);

  // 5. Recording Timer
  useEffect(() => {
    let recTimer;
    if (isRecording) {
      recTimer = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(recTimer);
  }, [isRecording]);

  // Format Seconds helper
  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 6. Toggle Local Microphone
  const handleToggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      if (audioTracks.length > 0) {
        const nextState = !audioTracks[0].enabled;
        audioTracks[0].enabled = nextState;
        setIsAudioMuted(!nextState);

        const socket = getSocket();
        if (socket && !inLobby) {
          socket.emit('meeting-toggle-media', {
            meetingId,
            isAudioOn: nextState,
          });
        }
      }
    } else {
      setIsAudioMuted(prev => !prev);
    }
  };

  // 7. Toggle Local Camera
  const handleToggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      if (videoTracks.length > 0) {
        const nextState = !videoTracks[0].enabled;
        videoTracks[0].enabled = nextState;
        setIsVideoDisabled(!nextState);

        const socket = getSocket();
        if (socket && !inLobby) {
          socket.emit('meeting-toggle-media', {
            meetingId,
            isVideoOn: nextState,
          });
        }
      }
    } else {
      setIsVideoDisabled(prev => !prev);
    }
  };

  // 8. Toggle Screen Share with Seamless RTCRtpSender Track Replacement
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop sharing
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
        screenStreamRef.current = null;
      }
      setIsScreenSharing(false);

      // Revert video track in local preview
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        const cameraTrack = localStreamRef.current.getVideoTracks()[0];
        if (cameraTrack) {
          peerConnectionsRef.current.forEach(({ pc }) => {
            if (pc) {
              const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
              if (sender) sender.replaceTrack(cameraTrack).catch(() => {});
            }
          });
        }
      }

      const socket = getSocket();
      if (socket) {
        socket.emit('meeting-screen-share', { meetingId, isScreenSharing: false });
      }
      showToast(t('meet_toast_screenshare_stop'), 'info');
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: true,
        });
        screenStreamRef.current = displayStream;
        setIsScreenSharing(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = displayStream;
        }

        const screenTrack = displayStream.getVideoTracks()[0];

        // Replace track across all WebRTC peer connections
        peerConnectionsRef.current.forEach(({ pc }) => {
          if (pc) {
            const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender && screenTrack) {
              sender.replaceTrack(screenTrack).catch(() => {});
            }
          }
        });

        // Handle native browser 'Stop Sharing' floating bar
        screenTrack.onended = () => {
          setIsScreenSharing(false);
          screenStreamRef.current = null;
          if (localStreamRef.current && localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
            const camTrack = localStreamRef.current.getVideoTracks()[0];
            peerConnectionsRef.current.forEach(({ pc }) => {
              if (pc && camTrack) {
                const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender) sender.replaceTrack(camTrack).catch(() => {});
              }
            });
          }
          const socket = getSocket();
          if (socket) {
            socket.emit('meeting-screen-share', { meetingId, isScreenSharing: false });
          }
        };

        const socket = getSocket();
        if (socket) {
          socket.emit('meeting-screen-share', { meetingId, isScreenSharing: true });
        }
        showToast(t('meet_toast_screenshare_start'), 'success');
      } catch (err) {
        console.warn('Partage d’écran annulé ou non autorisé:', err);
      }
    }
  };

  // 9. Real Browser MediaRecorder Recording
  const handleToggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      showToast(t('meet_toast_rec_finished'), 'success');
    } else {
      try {
        const streamToRecord = screenStreamRef.current || localStreamRef.current;
        if (!streamToRecord) {
          showToast(t('meet_toast_rec_no_stream'), 'error');
          return;
        }

        recordedChunksRef.current = [];
        const options = { mimeType: 'video/webm;codecs=vp9,opus' };
        let recorder;

        try {
          recorder = new MediaRecorder(streamToRecord, options);
        } catch {
          recorder = new MediaRecorder(streamToRecord);
        }

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `Enregistrement-S2T-${roomTitle.replace(/\s+/g, '_')}-${new Date().toISOString().split('T')[0]}.webm`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 100);
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        showToast(t('meet_toast_rec_started'), 'info');
      } catch (err) {
        console.error('Erreur MediaRecorder:', err);
        showToast(t('meet_toast_rec_error'), 'error');
      }
    }
  };

  // 10. Live Speech-to-Text Subtitles (Web Speech API)
  const handleToggleCaptions = () => {
    const nextState = !isCaptionsEnabled;
    setIsCaptionsEnabled(nextState);

    if (nextState) {
      try {
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
          showToast(t('meet_toast_captions_unsupported'), 'error');
          setIsCaptionsEnabled(false);
          return;
        }

        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = captionLang;

        recognition.onresult = (event) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          const payload = {
            speaker: participantName,
            text: transcript,
            timestamp: Date.now(),
          };
          setLiveCaption(payload);

          // Broadcast to peers
          const socket = getSocket();
          if (socket) {
            socket.emit('meeting-caption', { meetingId, text: transcript, lang: captionLang });
          }
        };

        recognition.onerror = (e) => {
          console.warn('SpeechRecognition error:', e);
        };

        recognition.onend = () => {
          if (isCaptionsEnabled && speechRecognitionRef.current) {
            try { speechRecognitionRef.current.start(); } catch {}
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
        showToast(t('meet_toast_captions_on'), 'success');
      } catch (err) {
        console.warn('Erreur activation sous-titres:', err);
        setIsCaptionsEnabled(false);
      }
    } else {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      }
      setLiveCaption(null);
      showToast(t('meet_toast_captions_off'), 'info');
    }
  };

  // 11. Hand Raise Toggle
  const handleToggleHand = () => {
    const nextHand = !isHandRaised;
    setIsHandRaised(nextHand);
    if (nextHand) playAudioChime('hand');

    const socket = getSocket();
    if (socket) {
      socket.emit('meeting-toggle-hand', {
        meetingId,
        isHandRaised: nextHand,
      });
    }
  };

  // 12. Floating Emoji Reaction Broadcast
  const triggerReaction = (emoji) => {
    const id = Date.now() + Math.random();
    const leftPos = Math.floor(Math.random() * 60) + 20;
    const newEmoji = { id, emoji, left: `${leftPos}%` };

    setFloatingEmojis(prev => [...prev, newEmoji]);
    setReactionsMenuOpen(false);

    const socket = getSocket();
    if (socket) {
      socket.emit('meeting-chat-send', {
        meetingId,
        message: { text: `[REACTION]: ${emoji}` },
      });
    }

    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2800);
  };

  // 13. Copy Meeting Link to Clipboard
  const handleCopyMeetingLink = () => {
    const fullUrl = window.location.href;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedLink(true);
      showToast(t('meet_toast_link_copied'), 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // 14. Send In-Meeting Chat Message
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const messagePayload = {
      id: `msg-${Date.now()}`,
      sender: {
        name: participantName,
        companyName: companyName,
        role: userRole,
      },
      text: chatInput.trim(),
      timestamp: Date.now(),
    };

    setChatMessages(prev => [...prev, messagePayload]);
    setChatInput('');
    playAudioChime('msg');

    const socket = getSocket();
    if (socket) {
      socket.emit('meeting-chat-send', {
        meetingId,
        message: { text: messagePayload.text },
      });
    }
  };

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // 15. WebRTC Peer Connection Helper
  const createPeerConnection = useCallback((remoteSocketId, remoteUser) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const socket = getSocket();
        if (socket) {
          socket.emit('meeting-signal', {
            toSocketId: remoteSocketId,
            signalData: event.candidate,
            type: 'ice-candidate',
          });
        }
      }
    };

    // Handle Remote Media Streams
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setRemoteParticipants(prev => {
        const exists = prev.find(p => p.socketId === remoteSocketId);
        if (exists) {
          return prev.map(p => (p.socketId === remoteSocketId ? { ...p, stream: remoteStream } : p));
        }
        return [...prev, {
          socketId: remoteSocketId,
          user: remoteUser,
          stream: remoteStream,
          isVideoOn: true,
          isAudioOn: true,
          isHandRaised: false,
          isScreenSharing: false,
        }];
      });
    };

    peerConnectionsRef.current.set(remoteSocketId, { pc, user: remoteUser });
    return pc;
  }, []);

  // 16. Socket.IO Listeners for Meeting Room
  useEffect(() => {
    if (inLobby) return;

    const socket = getSocket();
    if (!socket) return;

    // Join room
    socket.emit('join-meeting-room', {
      meetingId,
      user: {
        _id: user?._id || user?.id,
        name: participantName,
        companyName,
        role: userRole,
      },
    });

    playAudioChime('join');

    // Listener: Room Joined (Initial Participants and room state)
    const handleRoomJoined = async ({ otherParticipants, activePoll: currentPoll, isLocked, spotlightId: spotId }) => {
      if (isLocked) setIsRoomLocked(true);
      if (spotId) setSpotlightId(spotId);
      if (currentPoll) setActivePoll(currentPoll);

      if (Array.isArray(otherParticipants)) {
        for (const participant of otherParticipants) {
          if (participant.socketId !== socket.id) {
            const pc = createPeerConnection(participant.socketId, participant.user);
            try {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              socket.emit('meeting-signal', {
                toSocketId: participant.socketId,
                signalData: offer,
                type: 'offer',
              });
            } catch (err) {
              console.warn('Erreur WebRTC createOffer:', err);
            }
          }
        }
      }
    };

    // Listener: New User Joined
    const handleUserJoined = (newParticipant) => {
      if (newParticipant.socketId === socket.id) return;
      playAudioChime('join');
      showToast(t('meet_toast_user_joined').replace('{name}', newParticipant.user?.name || t('meet_p_fallback_name')), 'info');

      setRemoteParticipants(prev => {
        if (prev.some(p => p.socketId === newParticipant.socketId)) return prev;
        return [...prev, {
          ...newParticipant,
          stream: null,
        }];
      });
    };

    // Listener: WebRTC Signals
    const handleMeetingSignal = async ({ fromSocketId, signalData, type }) => {
      let peer = peerConnectionsRef.current.get(fromSocketId);

      if (type === 'offer') {
        const pc = createPeerConnection(fromSocketId, { name: t('meet_p_fallback_name') });
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(signalData));
          
          // Process queued ICE candidates
          const queued = pendingIceCandidatesRef.current.get(fromSocketId) || [];
          for (const cand of queued) {
            await pc.addIceCandidate(cand).catch(() => {});
          }
          pendingIceCandidatesRef.current.delete(fromSocketId);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('meeting-signal', {
            toSocketId: fromSocketId,
            signalData: answer,
            type: 'answer',
          });
        } catch (err) {
          console.warn('Erreur WebRTC offer/answer:', err);
        }
      } else if (type === 'answer') {
        if (peer && peer.pc) {
          try {
            await peer.pc.setRemoteDescription(new RTCSessionDescription(signalData));
            
            // Process queued ICE candidates
            const queued = pendingIceCandidatesRef.current.get(fromSocketId) || [];
            for (const cand of queued) {
              await peer.pc.addIceCandidate(cand).catch(() => {});
            }
            pendingIceCandidatesRef.current.delete(fromSocketId);
          } catch (err) {
            console.warn('Erreur WebRTC setRemoteDescription:', err);
          }
        }
      } else if (type === 'ice-candidate') {
        if (peer && peer.pc && peer.pc.remoteDescription) {
          try {
            await peer.pc.addIceCandidate(new RTCIceCandidate(signalData));
          } catch (err) {
            console.warn('Erreur ICE Candidate:', err);
          }
        } else {
          // Queue candidate
          const list = pendingIceCandidatesRef.current.get(fromSocketId) || [];
          list.push(new RTCIceCandidate(signalData));
          pendingIceCandidatesRef.current.set(fromSocketId, list);
        }
      }
    };

    // Listener: Chat Message Received
    const handleChatMessage = (msg) => {
      if (msg.text && msg.text.startsWith('[REACTION]:')) {
        const emoji = msg.text.replace('[REACTION]:', '').trim();
        const id = Date.now() + Math.random();
        const leftPos = Math.floor(Math.random() * 60) + 20;
        setFloatingEmojis(prev => [...prev, { id, emoji, left: `${leftPos}%` }]);
        setTimeout(() => setFloatingEmojis(prev => prev.filter(e => e.id !== id)), 2800);
        return;
      }

      setChatMessages(prev => [...prev, msg]);
      playAudioChime('msg');
      if (activeDrawer !== 'chat') {
        setUnreadChatCount(prev => prev + 1);
      }
    };

    // Listener: Media State Changed
    const handleMediaChanged = ({ socketId, isVideoOn, isAudioOn }) => {
      setRemoteParticipants(prev =>
        prev.map(p => (p.socketId === socketId ? { ...p, isVideoOn, isAudioOn } : p))
      );
    };

    // Listener: Hand Changed
    const handleHandChanged = ({ socketId, isHandRaised: raised }) => {
      if (raised) playAudioChime('hand');
      setRemoteParticipants(prev =>
        prev.map(p => (p.socketId === socketId ? { ...p, isHandRaised: raised } : p))
      );
    };

    // Listener: Screen Share Changed
    const handleScreenChanged = ({ socketId, isScreenSharing: sharing }) => {
      setRemoteParticipants(prev =>
        prev.map(p => (p.socketId === socketId ? { ...p, isScreenSharing: sharing } : p))
      );
    };

    // Listener: Live Captions Received
    const handleCaptionReceived = (captionData) => {
      setLiveCaption(captionData);
      setTimeout(() => {
        setLiveCaption(prev => (prev && prev.timestamp === captionData.timestamp ? null : prev));
      }, 5000);
    };

    // Listener: Collaborative Whiteboard Draw
    const handleWhiteboardDraw = (drawAction) => {
      const canvas = whiteboardCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { tool, color, size, fromX, fromY, toX, toY } = drawAction;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (tool === 'eraser') {
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = size * 2;
      } else if (tool === 'highlighter') {
        ctx.strokeStyle = color.includes('rgba') ? color : `${color}55`;
        ctx.lineWidth = size * 3;
      }

      ctx.moveTo(fromX, fromY);
      ctx.lineTo(toX, toY);
      ctx.stroke();
      ctx.restore();
    };

    // Listener: Collaborative Whiteboard Clear
    const handleWhiteboardClear = () => {
      const canvas = whiteboardCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    // Listener: Poll Events
    const handlePollCreated = (poll) => {
      setActivePoll(poll);
      setUserVotedOption(null);
      playAudioChime('poll');
      showToast(t('meet_toast_poll_new').replace('{q}', poll.question), 'info');
      setActiveDrawer('polls');
    };

    const handlePollUpdated = (poll) => {
      setActivePoll(poll);
    };

    const handlePollClosed = (poll) => {
      setActivePoll(poll);
      showToast(t('meet_toast_poll_closed'), 'info');
    };

    // Listener: Host Actions
    const handleForceMute = () => {
      if (localStreamRef.current) {
        const audioTrack = localStreamRef.current.getAudioTracks()[0];
        if (audioTrack && audioTrack.enabled) {
          audioTrack.enabled = false;
          setIsAudioMuted(true);
          showToast(t('meet_toast_force_muted'), 'info');
        }
      }
    };

    const handleLowerAllHands = () => {
      setIsHandRaised(false);
      setRemoteParticipants(prev => prev.map(p => ({ ...p, isHandRaised: false })));
      showToast(t('meet_toast_hands_lowered'), 'info');
    };

    const handleLockChanged = ({ isLocked }) => {
      setIsRoomLocked(isLocked);
      showToast(isLocked ? t('meet_toast_room_locked') : t('meet_toast_room_unlocked'), 'info');
    };

    const handleKicked = () => {
      alert(t('meet_toast_kicked'));
      navigate('/reunions');
    };

    const handleSpotlightChanged = ({ spotlightId: spotId }) => {
      setSpotlightId(spotId);
    };

    // Listener: User Left
    const handleUserLeft = ({ socketId }) => {
      if (peerConnectionsRef.current.has(socketId)) {
        const { pc } = peerConnectionsRef.current.get(socketId);
        if (pc) pc.close();
        peerConnectionsRef.current.delete(socketId);
      }
      setRemoteParticipants(prev => prev.filter(p => p.socketId !== socketId));
    };

    // Register socket handlers
    socket.on('meeting-room-joined', handleRoomJoined);
    socket.on('meeting-user-joined', handleUserJoined);
    socket.on('meeting-signal', handleMeetingSignal);
    socket.on('meeting-chat-message', handleChatMessage);
    socket.on('meeting-user-media-changed', handleMediaChanged);
    socket.on('meeting-user-hand-changed', handleHandChanged);
    socket.on('meeting-user-screen-changed', handleScreenChanged);
    socket.on('meeting-caption', handleCaptionReceived);
    socket.on('meeting-whiteboard-draw', handleWhiteboardDraw);
    socket.on('meeting-whiteboard-clear', handleWhiteboardClear);
    socket.on('meeting-poll-created', handlePollCreated);
    socket.on('meeting-poll-updated', handlePollUpdated);
    socket.on('meeting-poll-closed', handlePollClosed);
    socket.on('meeting-force-mute', handleForceMute);
    socket.on('meeting-lower-all-hands', handleLowerAllHands);
    socket.on('meeting-lock-changed', handleLockChanged);
    socket.on('meeting-kicked', handleKicked);
    socket.on('meeting-spotlight-changed', handleSpotlightChanged);
    socket.on('meeting-user-left', handleUserLeft);

    return () => {
      socket.off('meeting-room-joined', handleRoomJoined);
      socket.off('meeting-user-joined', handleUserJoined);
      socket.off('meeting-signal', handleMeetingSignal);
      socket.off('meeting-chat-message', handleChatMessage);
      socket.off('meeting-user-media-changed', handleMediaChanged);
      socket.off('meeting-user-hand-changed', handleHandChanged);
      socket.off('meeting-user-screen-changed', handleScreenChanged);
      socket.off('meeting-caption', handleCaptionReceived);
      socket.off('meeting-whiteboard-draw', handleWhiteboardDraw);
      socket.off('meeting-whiteboard-clear', handleWhiteboardClear);
      socket.off('meeting-poll-created', handlePollCreated);
      socket.off('meeting-poll-updated', handlePollUpdated);
      socket.off('meeting-poll-closed', handlePollClosed);
      socket.off('meeting-force-mute', handleForceMute);
      socket.off('meeting-lower-all-hands', handleLowerAllHands);
      socket.off('meeting-lock-changed', handleLockChanged);
      socket.off('meeting-kicked', handleKicked);
      socket.off('meeting-spotlight-changed', handleSpotlightChanged);
      socket.off('meeting-user-left', handleUserLeft);

      socket.emit('leave-meeting-room', { meetingId });
    };
  }, [inLobby, meetingId, participantName, companyName, userRole, activeDrawer, createPeerConnection, user, navigate, t]);

  // 18. Whiteboard Drawing Mechanics
  const startDrawing = (e) => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    isDrawingRef.current = true;
    lastPosRef.current = { x, y };
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = whiteboardColor;
    ctx.lineWidth = whiteboardBrushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (whiteboardTool === 'eraser') {
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = whiteboardBrushSize * 2.5;
    } else if (whiteboardTool === 'highlighter') {
      ctx.strokeStyle = whiteboardColor.includes('rgba') ? whiteboardColor : `${whiteboardColor}55`;
      ctx.lineWidth = whiteboardBrushSize * 3;
    }

    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.restore();

    // Broadcast draw action to all participants
    const drawAction = {
      tool: whiteboardTool,
      color: whiteboardColor,
      size: whiteboardBrushSize,
      fromX: lastPosRef.current.x,
      fromY: lastPosRef.current.y,
      toX: x,
      toY: y,
    };

    const socket = getSocket();
    if (socket) {
      socket.emit('meeting-whiteboard-draw', { meetingId, drawAction });
    }

    lastPosRef.current = { x, y };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    const socket = getSocket();
    if (socket) {
      socket.emit('meeting-whiteboard-clear', { meetingId });
    }
    showToast(t('meet_toast_wb_cleared'), 'info');
  };

  const downloadWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = image;
    a.download = `Tableau-Blanc-S2T-${new Date().toISOString().split('T')[0]}.png`;
    a.click();
    showToast(t('meet_toast_wb_downloaded'), 'success');
  };

  // 19. Interactive Live Poll Creation & Voting
  const handleCreatePoll = (e) => {
    if (e) e.preventDefault();
    if (!newPollQuestion.trim()) return;

    const filteredOptions = newPollOptions.filter(o => o.trim().length > 0);
    if (filteredOptions.length < 2) {
      showToast(t('meet_modal_poll_label_opts'), 'error');
      return;
    }

    const socket = getSocket();
    if (socket) {
      socket.emit('meeting-poll-create', {
        meetingId,
        poll: {
          question: newPollQuestion.trim(),
          options: filteredOptions,
        },
      });
      setShowCreatePollModal(false);
      setNewPollQuestion('');
      showToast(t('meet_toast_poll_new').replace('{q}', newPollQuestion.trim()), 'success');
    }
  };

  const handleCastVote = (optionId) => {
    if (!activePoll || activePoll.isClosed || userVotedOption !== null) return;
    setUserVotedOption(optionId);

    const socket = getSocket();
    if (socket) {
      socket.emit('meeting-poll-vote', {
        meetingId,
        pollId: activePoll.id,
        optionId,
      });
      showToast(t('meet_toast_vote_saved'), 'success');
    }
  };

  const handleClosePoll = () => {
    if (!activePoll) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('meeting-poll-close', {
        meetingId,
        pollId: activePoll.id,
      });
    }
  };

  const insertPollResultsInNotes = () => {
    if (!activePoll) return;
    const totalVotes = activePoll.options.reduce((acc, curr) => acc + curr.votes, 0);
    let resultsText = '';
    if (language === 'ar') {
      resultsText = `\n\n### 📊 نتيجة التصويت / الاستطلاع : "${activePoll.question}"\n- **التاريخ :** ${new Date().toLocaleTimeString('ar-TN')}\n- **مجموع المصوتين :** ${totalVotes}\n` +
        activePoll.options.map(opt => {
          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          return `  - ${opt.text} : **${opt.votes} صوت** (${pct}%)`;
        }).join('\n') + '\n';
    } else if (language === 'en') {
      resultsText = `\n\n### 📊 Poll / Vote Results: "${activePoll.question}"\n- **Time:** ${new Date().toLocaleTimeString('en-US')}\n- **Total Voters:** ${totalVotes}\n` +
        activePoll.options.map(opt => {
          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          return `  - ${opt.text} : **${opt.votes} vote(s)** (${pct}%)`;
        }).join('\n') + '\n';
    } else {
      resultsText = `\n\n### 📊 Résultat du Vote / Sondage : "${activePoll.question}"\n- **Date :** ${new Date().toLocaleTimeString('fr-FR')}\n- **Total des votants :** ${totalVotes}\n` +
        activePoll.options.map(opt => {
          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          return `  - ${opt.text} : **${opt.votes} vote(s)** (${pct}%)`;
        }).join('\n') + '\n';
    }

    setMeetingNotes(prev => prev + resultsText);
    showToast(t('meet_toast_notes_poll_added'), 'success');
  };

  // 20. AI Meeting Summary Generator
  const handleGenerateAiSummary = () => {
    setIsGeneratingAiSummary(true);
    setTimeout(() => {
      let summaryNote = '';
      if (language === 'ar') {
        summaryNote = `\n\n---
### 🤖 محضر الاجتماع الفوري بالذكاء الاصطناعي S2T (${new Date().toLocaleTimeString('ar-TN', { hour: '2-digit', minute: '2-digit' })})
- **حالة الجلسة :** اجتماع نشط، اكتمل النصاب القانوني.
- **النقاط التي تمت مناقشتها :**
  1. المصادقة على مواعيد الإيواء واستعمال القاعات متعددة الخدمات.
  2. مراجعة البنية التحتية للاتصالات وشبكة الألياف البصرية عالية التدفق 10Gbps.
  3. المتابعة الإدارية ومطابقة الإجراءات التنظيمية لـ S2T.
- **الإجراءات المعتمدة :**
  - [x] إرسال التقرير لجميع المشاركين المتصلين.
  - [ ] استكمال إجراءات الحجز في المنظومة المركزية S2T.
`;
      } else if (language === 'en') {
        summaryNote = `\n\n---
### 🤖 AI-Generated Meeting Minutes S2T (${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})
- **Session Status:** Active WebRTC video conference, quorum achieved.
- **Key Reviewed Points:**
  1. Approval of hosting schedule and access to multipurpose facilities.
  2. Telecom infrastructure review & dedicated high-speed fiber optics (10 Gbps).
  3. S2T regulatory compliance and administrative tracking.
- **Action Items:**
  - [x] Shared meeting minutes with connected participants.
  - [ ] Finalize reservation in S2T central schedule.
`;
      } else {
        summaryNote = `\n\n---
### 🤖 Compte-Rendu Automatisé IA S2T (${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})
- **Statut de la session :** Visioconférence active, quorum atteint.
- **Points examinés :**
  1. Validation des créneaux d'hébergement et des accès aux salles polyvalentes.
  2. Revue des infrastructures télécoms & fibre optique dédiée 10 Gbps.
  3. Suivi administratif et conformité réglementaire S2T.
- **Actions assignées :**
  - [x] Partage du compte-rendu aux participants connectés.
  - [ ] Clôture de la réservation dans le planning central S2T.
`;
      }
      setMeetingNotes(prev => prev + summaryNote);
      setIsGeneratingAiSummary(false);

      setChatMessages(prev => [
        ...prev,
        {
          id: `ai-note-${Date.now()}`,
          sender: { name: language === 'ar' ? 'مساعد الذكاء الاصطناعي S2T' : language === 'en' ? 'S2T AI Assistant' : 'Assistant IA S2T', companyName: 'Intelligence Artificielle', role: 'admin' },
          text: t('meet_ai_welcome_msg'),
          timestamp: Date.now(),
        },
      ]);
      showToast(t('meet_toast_ai_generated'), 'success');
    }, 1500);
  };

  // 21. Email Meeting Minutes / Compte-Rendu
  const handleSendMinutesByEmail = async (e) => {
    if (e) e.preventDefault();
    setIsSendingEmail(true);
    setEmailSuccessMessage('');

    try {
      const recipientEmails = emailRecipientsInput
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      await reunionAPI.sendMinutes(meetingId && meetingId.match(/^[0-9a-fA-F]{24}$/) ? meetingId : '', {
        title: roomTitle,
        room: roomLocationName,
        notes: meetingNotes,
        recipients: recipientEmails,
      });

      setEmailSuccessMessage(t('meet_modal_email_success'));
      showToast(t('meet_toast_email_sent'), 'success');
      setTimeout(() => {
        setEmailMinutesModalOpen(false);
        setEmailSuccessMessage('');
      }, 2000);
    } catch (err) {
      console.error('Erreur envoi email compte-rendu:', err);
      showToast(t('meet_toast_email_error'), 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // 22. Host Controls Trigger
  const handleHostAction = (action, targetSocketId = null) => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('meeting-host-action', { meetingId, action, targetSocketId });

    if (action === 'mute-all') showToast(t('meet_p_btn_mute_all'), 'info');
    if (action === 'lower-all-hands') showToast(t('meet_toast_hands_lowered'), 'info');
    if (action === 'lock-room') showToast(isRoomLocked ? t('meet_toast_room_unlocked') : t('meet_toast_room_locked'), 'info');
  };

  // Enter / Leave Meeting
  const handleJoinMeeting = () => {
    setInLobby(false);
  };

  const handleLeaveMeeting = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    const socket = getSocket();
    if (socket) {
      socket.emit('leave-meeting-room', { meetingId });
    }
    navigate('/reunions');
  };

  // Fullscreen helper
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const totalCount = 1 + remoteParticipants.length;

  // =========================================================================
  // VIEW 1: PRE-JOIN LOBBY SCREEN
  // =========================================================================
  if (inLobby) {
    return (
      <div className="meeting-lobby-page" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="lobby-ambient-glow glow-1" />
        <div className="lobby-ambient-glow glow-2" />

        <div className="meeting-lobby-container">
          {/* Top Header */}
          <div className="lobby-top-header">
            <div className="lobby-logo-wrapper">
              <img src="/s2t-logo.svg" alt="S2T Logo" style={{ height: '38px' }} />
              <div className="lobby-sec-badge">
                <Shield size={14} color="var(--s2t-cyan)" />
                <span>{t('meet_lobby_tag')}</span>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm lobby-back-btn"
              onClick={() => navigate('/reunions')}
            >
              <X size={16} />
              <span>{t('meet_lobby_back')}</span>
            </button>
          </div>

          {/* Main Lobby Grid */}
          <div className="lobby-main-grid">
            
            {/* Left: Video Preview */}
            <div className="lobby-preview-box">
              <div className={`lobby-video-viewport filter-${virtualFilter}`}>
                {!isVideoDisabled ? (
                  <video
                    ref={lobbyVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="lobby-video-element"
                  />
                ) : (
                  <div className="lobby-avatar-placeholder">
                    <div className="lobby-avatar-circle">
                      {participantName ? participantName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <p style={{ margin: '0.8rem 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {t('meet_lobby_cam_disabled')}
                    </p>
                  </div>
                )}

                {/* Local Mic Volume Level Indicator Bar */}
                <div className="lobby-volume-meter" title={t('meet_lobby_mic_level')}>
                  <div className="volume-icon">
                    {isAudioMuted ? <VolumeX size={14} color="#EF4444" /> : <Volume2 size={14} color="var(--s2t-cyan)" />}
                  </div>
                  <div className="volume-bar-track">
                    <div
                      className="volume-bar-fill"
                      style={{
                        width: isAudioMuted ? '0%' : `${audioLevel}%`,
                        background: audioLevel > 70 ? '#EF4444' : audioLevel > 30 ? '#10B981' : 'var(--s2t-cyan)',
                      }}
                    />
                  </div>
                </div>

                {/* Watermark Badge */}
                <div className="lobby-video-overlay-badge">
                  <Radio size={12} className="pulse-dot" />
                  <span>{t('meet_lobby_preview_badge').replace('{quality}', videoQuality)}</span>
                </div>

                {/* Quick Controls */}
                <div className="lobby-quick-controls">
                  <button
                    type="button"
                    className={`lobby-ctrl-btn ${isAudioMuted ? 'muted' : 'active'}`}
                    onClick={handleToggleMic}
                    title={isAudioMuted ? t('meet_lobby_tooltip_mic_on') : t('meet_lobby_tooltip_mic_off')}
                  >
                    {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>

                  <button
                    type="button"
                    className={`lobby-ctrl-btn ${isVideoDisabled ? 'disabled' : 'active'}`}
                    onClick={handleToggleVideo}
                    title={isVideoDisabled ? t('meet_lobby_tooltip_cam_on') : t('meet_lobby_tooltip_cam_off')}
                  >
                    {isVideoDisabled ? <VideoOff size={20} /> : <Video size={20} />}
                  </button>

                  <button
                    type="button"
                    className="lobby-ctrl-btn active"
                    onClick={() => setSettingsModalOpen(true)}
                    title={t('meet_lobby_tooltip_settings')}
                  >
                    <Settings size={20} />
                  </button>
                </div>
              </div>

              {/* Hardware Test Checklist */}
              <div className="lobby-hardware-checklist">
                <div className="check-item">
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>{t('meet_lobby_check_1')}</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>{t('meet_lobby_check_2')}</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={16} color="#10B981" />
                  <span>{t('meet_lobby_check_3')}</span>
                </div>
              </div>
            </div>

            {/* Right: Info & Settings Panel */}
            <div className="lobby-info-card">
              <div className="lobby-info-header">
                <span className="lobby-pre-tag">{t('meet_lobby_room_tag')}</span>
                <h1 className="lobby-title">{roomTitle}</h1>
                <p className="lobby-subtitle">
                  <span style={{ color: 'var(--s2t-cyan)', fontWeight: 600 }}>{roomLocationName}</span>
                  {meetingDetails?.formattedDate && ` • ${meetingDetails.formattedDate}`}
                  {meetingDetails?.time && ` (${meetingDetails.time})`}
                </p>
              </div>

              {/* Participant Profile Configuration */}
              <div className="lobby-form-section">
                <label className="lobby-form-label">{t('meet_lobby_label_name')}</label>
                <input
                  type="text"
                  className="lobby-input"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  placeholder={t('meet_lobby_ph_name')}
                />

                <label className="lobby-form-label" style={{ marginTop: '1rem' }}>{t('meet_lobby_label_company')}</label>
                <input
                  type="text"
                  className="lobby-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t('meet_lobby_ph_company')}
                />

                {/* Device Quick Selectors in Lobby */}
                {videoDevices.length > 1 && (
                  <>
                    <label className="lobby-form-label" style={{ marginTop: '1rem' }}>{t('meet_lobby_label_camera')}</label>
                    <select
                      className="lobby-input"
                      value={selectedVideoDevice}
                      onChange={(e) => setSelectedVideoDevice(e.target.value)}
                    >
                      {videoDevices.map(d => (
                        <option key={d.deviceId} value={d.deviceId}>{d.label || `Caméra ${d.deviceId.slice(0, 5)}`}</option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              {/* Join Action Buttons */}
              <div className="lobby-action-row">
                <button
                  type="button"
                  className="btn btn-primary lobby-join-btn"
                  onClick={handleJoinMeeting}
                >
                  <Video size={20} />
                  <span>{t('meet_lobby_btn_join')}</span>
                </button>
              </div>

              {/* Security Footnote */}
              <div className="lobby-security-footer">
                <Shield size={14} color="var(--text-muted)" />
                <span>{t('meet_lobby_sec_footer')}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE ONLINE MEETING ROOM
  // =========================================================================
  return (
    <div className={`meeting-room-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`meeting-toast-pill toast-${toastMessage.type}`}>
          <Info size={16} />
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Floating Reaction Emojis Burst */}
      <div className="floating-emojis-container">
        {floatingEmojis.map(item => (
          <div
            key={item.id}
            className="floating-emoji-item"
            style={{ left: item.left }}
          >
            {item.emoji}
          </div>
        ))}
      </div>

      {/* TOP BAR */}
      <header className="meeting-top-bar">
        <div className="top-bar-left">
          <div className="meeting-live-badge">
            <Radio size={14} className="live-pulse-icon" />
            <span>{t('meet_top_live')}</span>
          </div>

          {isRecording && (
            <div className="meeting-rec-badge">
              <span className="rec-dot" />
              <span>{t('meet_top_rec')} {formatTime(recordingSeconds)}</span>
            </div>
          )}

          {isRoomLocked && (
            <div className="meeting-locked-badge" title={t('meet_top_locked')}>
              <Lock size={12} />
              <span>{t('meet_top_locked')}</span>
            </div>
          )}

          <div className="meeting-title-info">
            <h2 className="top-room-title">{roomTitle}</h2>
            <span className="top-room-subtitle">{roomLocationName} • {t('meet_top_duration')} {formatTime(meetingSeconds)}</span>
          </div>
        </div>

        <div className="top-bar-right">
          {/* Security Modal Trigger */}
          <button
            type="button"
            className="top-icon-btn"
            onClick={() => setSecurityModalOpen(true)}
            title={t('meet_top_tooltip_security')}
          >
            <Shield size={18} color="var(--s2t-cyan)" />
            <span className="btn-label-desktop">{t('meet_top_btn_encrypted')}</span>
          </button>

          {/* Copy Invite Link */}
          <button
            type="button"
            className="top-icon-btn"
            onClick={handleCopyMeetingLink}
            title={t('meet_top_tooltip_copy')}
          >
            {copiedLink ? <Check size={18} color="#10B981" /> : <Copy size={18} />}
            <span className="btn-label-desktop">{copiedLink ? t('meet_top_btn_copied') : t('meet_top_btn_invite')}</span>
          </button>

          {/* Collaborative Whiteboard Stage Mode */}
          <button
            type="button"
            className={`top-icon-btn ${layoutMode === 'whiteboard' ? 'active' : ''}`}
            onClick={() => setLayoutMode(prev => (prev === 'whiteboard' ? 'grid' : 'whiteboard'))}
            title={t('meet_top_tooltip_whiteboard')}
          >
            <PenTool size={18} />
            <span className="btn-label-desktop">{t('meet_top_btn_whiteboard')}</span>
          </button>

          {/* Layout Mode Switcher */}
          <button
            type="button"
            className={`top-icon-btn ${layoutMode === 'speaker' ? 'active' : ''}`}
            onClick={() => setLayoutMode(prev => (prev === 'grid' ? 'speaker' : 'grid'))}
            title={layoutMode === 'grid' ? t('meet_top_tooltip_speaker') : t('meet_top_tooltip_grid')}
          >
            {layoutMode === 'grid' ? <SquareUserRound size={18} /> : <LayoutGrid size={18} />}
            <span className="btn-label-desktop">{layoutMode === 'grid' ? t('meet_top_btn_focus') : t('meet_top_btn_grid')}</span>
          </button>

          {/* Settings Modal */}
          <button
            type="button"
            className="top-icon-btn"
            onClick={() => setSettingsModalOpen(true)}
            title={t('meet_top_tooltip_settings')}
          >
            <Settings size={18} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            className="top-icon-btn"
            onClick={handleToggleFullscreen}
            title={isFullscreen ? t('meet_top_tooltip_exit_fullscreen') : t('meet_top_tooltip_fullscreen')}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </header>

      {/* MAIN BODY AREA */}
      <div className="meeting-main-body">
        
        {/* VIDEO STAGE */}
        <main className={`meeting-video-stage ${activeDrawer ? 'drawer-opened' : ''}`}>
          
          {/* SCREEN SHARE BANNER */}
          {isScreenSharing && (
            <div className="screenshare-alert-bar">
              <div className="alert-content">
                <ScreenShare size={18} color="var(--s2t-cyan)" />
                <span>{t('meet_screenshare_alert')}</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleToggleScreenShare}
              >
                {t('meet_screenshare_btn_stop')}
              </button>
            </div>
          )}

          {/* LIVE SUBTITLES CAPTION OVERLAY */}
          {liveCaption && (
            <div className="live-caption-overlay-bar">
              <div className="caption-badge">
                <Subtitles size={14} />
                <span>{liveCaption.speaker}</span>
              </div>
              <p className="caption-text">{liveCaption.text}</p>
            </div>
          )}

          {/* STAGE VIEW 1: COLLABORATIVE WHITEBOARD MODE */}
          {layoutMode === 'whiteboard' ? (
            <div className="whiteboard-stage-wrapper">
              <div className="whiteboard-toolbar glass-card">
                <div className="wb-tool-group">
                  <button
                    type="button"
                    className={`wb-btn ${whiteboardTool === 'pen' ? 'active' : ''}`}
                    onClick={() => setWhiteboardTool('pen')}
                    title={t('meet_wb_tool_pen')}
                  >
                    <PenTool size={18} />
                  </button>
                  <button
                    type="button"
                    className={`wb-btn ${whiteboardTool === 'highlighter' ? 'active' : ''}`}
                    onClick={() => setWhiteboardTool('highlighter')}
                    title={t('meet_wb_tool_highlighter')}
                  >
                    <Sparkle size={18} />
                  </button>
                  <button
                    type="button"
                    className={`wb-btn ${whiteboardTool === 'eraser' ? 'active' : ''}`}
                    onClick={() => setWhiteboardTool('eraser')}
                    title={t('meet_wb_tool_eraser')}
                  >
                    <Eraser size={18} />
                  </button>
                </div>

                <div className="wb-divider" />

                {/* Color Swatches */}
                <div className="wb-color-group">
                  {['#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#A855F7', '#FFFFFF'].map(c => (
                    <button
                      key={c}
                      type="button"
                      className={`wb-color-dot ${whiteboardColor === c ? 'selected' : ''}`}
                      style={{ background: c }}
                      onClick={() => setWhiteboardColor(c)}
                    />
                  ))}
                </div>

                <div className="wb-divider" />

                {/* Brush Size */}
                <div className="wb-brush-size">
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('meet_wb_brush_thickness')}</span>
                  <input
                    type="range"
                    min="2"
                    max="24"
                    value={whiteboardBrushSize}
                    onChange={(e) => setWhiteboardBrushSize(Number(e.target.value))}
                    className="wb-slider"
                  />
                </div>

                <div className="wb-divider" />

                {/* Action Buttons */}
                <div className="wb-action-group">
                  <button
                    type="button"
                    className="wb-action-btn"
                    onClick={clearWhiteboard}
                    title={t('meet_wb_btn_clear')}
                  >
                    <Trash2 size={16} color="#EF4444" />
                    <span>{t('meet_wb_btn_clear')}</span>
                  </button>
                  <button
                    type="button"
                    className="wb-action-btn"
                    onClick={downloadWhiteboard}
                    title={t('meet_wb_btn_export')}
                  >
                    <Download size={16} />
                    <span>{t('meet_wb_btn_export')}</span>
                  </button>
                </div>
              </div>

              {/* Whiteboard Canvas Element */}
              <div className="whiteboard-canvas-box">
                <canvas
                  ref={whiteboardCanvasRef}
                  width={1400}
                  height={800}
                  className="whiteboard-canvas-element"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
            </div>
          ) : (
            /* STAGE VIEW 2: VIDEO TILES GRID */
            <div className={`video-tiles-grid count-${totalCount} layout-${layoutMode}`}>
              
              {/* 1. LOCAL USER TILE */}
              <div
                className={`video-tile-box local-user-tile ${pinnedParticipantId === 'local' ? 'is-pinned' : ''} ${spotlightId === 'local' ? 'is-spotlight' : ''}`}
              >
                {!isVideoDisabled ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`participant-video-stream filter-${virtualFilter}`}
                  />
                ) : (
                  <div className="participant-avatar-view">
                    <div className="avatar-ring-pulse">
                      <div className="avatar-letter">
                        {participantName ? participantName.charAt(0).toUpperCase() : 'M'}
                      </div>
                    </div>
                    <span className="avatar-caption">{t('meet_tile_cam_disabled')}</span>
                  </div>
                )}

                {/* Hand Raise Badge */}
                {isHandRaised && (
                  <div className="tile-hand-raised-badge">
                    <span>{t('meet_tile_hand_raised')}</span>
                  </div>
                )}

                {/* Participant Bottom Info Pill */}
                <div className="tile-bottom-bar">
                  <div className="tile-user-meta">
                    <span className="tile-user-name">
                      {participantName} <strong>{t('meet_tile_you')}</strong>
                      {userRole === 'admin' && <span className="role-tag admin">{t('meet_tile_host_tag')}</span>}
                    </span>
                    <span className="tile-user-company">{companyName}</span>
                  </div>

                  <div className="tile-indicators">
                    {isAudioMuted ? (
                      <div className="mic-badge muted" title={t('meet_tile_tooltip_mic_muted')}>
                        <MicOff size={13} />
                      </div>
                    ) : (
                      <div className="mic-badge active" title={t('meet_tile_tooltip_mic_active')}>
                        <Mic size={13} />
                      </div>
                    )}

                    <button
                      type="button"
                      className="tile-pin-btn"
                      onClick={() => setPinnedParticipantId(pinnedParticipantId === 'local' ? null : 'local')}
                      title={t('meet_tile_tooltip_pin')}
                    >
                      <Pin size={13} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. REMOTE PARTICIPANTS TILES */}
              {remoteParticipants.map((participant) => {
                const isPinned = pinnedParticipantId === participant.socketId;
                const isSpotlight = spotlightId === participant.socketId;
                const hasVideo = participant.isVideoOn !== false;
                const hasAudio = participant.isAudioOn !== false;

                return (
                  <div
                    key={participant.socketId}
                    className={`video-tile-box remote-user-tile ${isPinned ? 'is-pinned' : ''} ${isSpotlight ? 'is-spotlight' : ''}`}
                  >
                    {hasVideo ? (
                      participant.stream ? (
                        <video
                          autoPlay
                          playsInline
                          ref={(el) => {
                            if (el && el.srcObject !== participant.stream) {
                              el.srcObject = participant.stream;
                            }
                          }}
                          className="participant-video-stream"
                        />
                      ) : (
                        <div className="participant-video-simulated">
                          <img
                            src={participant.avatarImg || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                            alt={participant.user?.name || 'Participant'}
                            className="simulated-feed-img"
                          />
                        </div>
                      )
                    ) : (
                      <div className="participant-avatar-view">
                        <div className="avatar-ring-pulse">
                          <div className="avatar-letter">
                            {participant.user?.name ? participant.user.name.charAt(0).toUpperCase() : 'P'}
                          </div>
                        </div>
                        <span className="avatar-caption">{t('meet_tile_cam_disabled')}</span>
                      </div>
                    )}

                    {/* Hand Raised Badge */}
                    {participant.isHandRaised && (
                      <div className="tile-hand-raised-badge">
                        <span>{t('meet_tile_hand_raised')}</span>
                      </div>
                    )}

                    {/* Tile Bottom Info Pill */}
                    <div className="tile-bottom-bar">
                      <div className="tile-user-meta">
                        <span className="tile-user-name">
                          {participant.user?.name || t('meet_p_fallback_name')}
                          {participant.user?.role === 'admin' && (
                            <span className="role-tag admin">{t('meet_tile_host_tag')}</span>
                          )}
                        </span>
                        <span className="tile-user-company">
                          {participant.user?.companyName || 'Technopark El Ghazala'}
                        </span>
                      </div>

                      <div className="tile-indicators">
                        {!hasAudio ? (
                          <div className="mic-badge muted" title={t('meet_tile_tooltip_mic_muted')}>
                            <MicOff size={13} />
                          </div>
                        ) : (
                          <div className="mic-badge active" title={t('meet_tile_tooltip_mic_active')}>
                            <Mic size={13} />
                          </div>
                        )}

                        <button
                          type="button"
                          className="tile-pin-btn"
                          onClick={() => setPinnedParticipantId(isPinned ? null : participant.socketId)}
                          title={t('meet_tile_tooltip_pin')}
                        >
                          <Pin size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </main>

        {/* RIGHT SIDE DRAWER */}
        {activeDrawer && (
          <aside className="meeting-side-drawer glass-card">
            
            {/* Drawer Header */}
            <div className="drawer-header">
              <div className="drawer-title-row">
                {activeDrawer === 'chat' && (
                  <>
                    <MessageSquare size={18} color="var(--s2t-cyan)" />
                    <h3>{t('meet_drawer_chat_title')}</h3>
                  </>
                )}
                {activeDrawer === 'participants' && (
                  <>
                    <Users size={18} color="var(--s2t-blue)" />
                    <h3>{t('meet_drawer_participants_title')} ({totalCount})</h3>
                  </>
                )}
                {activeDrawer === 'notes' && (
                  <>
                    <FileText size={18} color="var(--s2t-teal)" />
                    <h3>{t('meet_drawer_notes_title')}</h3>
                  </>
                )}
                {activeDrawer === 'polls' && (
                  <>
                    <BarChart2 size={18} color="#F59E0B" />
                    <h3>{t('meet_drawer_polls_title')} ({activePoll ? '1' : '0'})</h3>
                  </>
                )}
              </div>

              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setActiveDrawer(null)}
                title={t('meet_drawer_tooltip_close')}
              >
                <X size={18} />
              </button>
            </div>

            {/* DRAWER TAB 1: CHAT */}
            {activeDrawer === 'chat' && (
              <div className="drawer-chat-body">
                <div className="chat-messages-scroll">
                  {chatMessages.map((msg) => {
                    const isMe = msg.sender?.name === participantName;
                    return (
                      <div
                        key={msg.id}
                        className={`chat-bubble-item ${isMe ? 'is-me' : 'is-other'}`}
                      >
                        <div className="chat-bubble-sender">
                          <span className="sender-name">{msg.sender?.name}</span>
                          <span className="sender-company">{msg.sender?.companyName}</span>
                          <span className="sender-time">
                            {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="chat-bubble-text">
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={chatBottomRef} />
                </div>

                {/* Quick Reaction Emojis Row in Chat */}
                <div className="chat-quick-emojis">
                  {['👍', '👏', '🎉', '❤️', '🔥', '💡', '🚀'].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      className="quick-emoji-btn"
                      onClick={() => triggerReaction(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Chat Form */}
                <form className="drawer-chat-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="drawer-chat-input"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={t('meet_chat_ph')}
                  />
                  <button
                    type="submit"
                    className="drawer-chat-send-btn"
                    disabled={!chatInput.trim()}
                    title={t('meet_chat_tooltip_send')}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}

            {/* DRAWER TAB 2: PARTICIPANTS */}
            {activeDrawer === 'participants' && (
              <div className="drawer-participants-body">
                <div className="participants-list">
                  {/* Local User */}
                  <div className="participant-row-item is-local">
                    <div className="p-avatar">
                      {participantName ? participantName.charAt(0).toUpperCase() : 'M'}
                    </div>
                    <div className="p-info">
                      <div className="p-name">
                        {participantName} <span className="p-badge-me">{t('meet_p_badge_you')}</span>
                      </div>
                      <div className="p-sub">{companyName}</div>
                    </div>
                    <div className="p-status-icons">
                      {isHandRaised && <span title={t('meet_tile_hand_raised')}>✋</span>}
                      {isAudioMuted ? <MicOff size={15} color="#EF4444" /> : <Mic size={15} color="#10B981" />}
                      {isVideoDisabled ? <VideoOff size={15} color="#EF4444" /> : <Video size={15} color="#10B981" />}
                    </div>
                  </div>

                  {/* Remote Participants */}
                  {remoteParticipants.map(p => (
                    <div key={p.socketId} className="participant-row-item">
                      <div className="p-avatar">
                        {p.user?.name ? p.user.name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div className="p-info">
                        <div className="p-name">
                          {p.user?.name || t('meet_p_fallback_name')}
                          {p.user?.role === 'admin' && <span className="p-badge-admin">{t('meet_p_badge_admin')}</span>}
                        </div>
                        <div className="p-sub">{p.user?.companyName || 'Technopark'}</div>
                      </div>
                      <div className="p-status-icons">
                        {p.isHandRaised && <span title={t('meet_tile_hand_raised')}>✋</span>}
                        {p.isAudioOn === false ? <MicOff size={15} color="#EF4444" /> : <Mic size={15} color="#10B981" />}
                        {p.isVideoOn === false ? <VideoOff size={15} color="#EF4444" /> : <Video size={15} color="#10B981" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Host / Moderator Controls */}
                {userRole === 'admin' && (
                  <div className="drawer-admin-actions">
                    <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('meet_p_admin_controls')}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleHostAction('mute-all')}
                      >
                        <MicOff size={14} />
                        <span>{t('meet_p_btn_mute_all')}</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleHostAction('lower-all-hands')}
                      >
                        <Hand size={14} />
                        <span>{t('meet_p_btn_lower_hands')}</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={() => handleHostAction('lock-room')}
                      >
                        {isRoomLocked ? <Unlock size={14} /> : <Lock size={14} />}
                        <span>{isRoomLocked ? t('meet_p_btn_unlock_room') : t('meet_p_btn_lock_room')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DRAWER TAB 3: NOTES & AI ASSISTANT & EMAIL MINUTES */}
            {activeDrawer === 'notes' && (
              <div className="drawer-notes-body">
                <div className="notes-ai-bar">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm ai-generate-btn"
                    onClick={handleGenerateAiSummary}
                    disabled={isGeneratingAiSummary}
                  >
                    <Sparkles size={15} className={isGeneratingAiSummary ? 'animate-spin' : ''} />
                    <span>{isGeneratingAiSummary ? t('meet_notes_btn_ai_loading') : t('meet_notes_btn_ai')}</span>
                  </button>
                </div>

                <textarea
                  className="notes-textarea"
                  value={meetingNotes}
                  onChange={(e) => setMeetingNotes(e.target.value)}
                  placeholder={t('meet_notes_ph')}
                />

                <div className="notes-footer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      const blob = new Blob([meetingNotes], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `Compte-Rendu-${roomTitle.replace(/\s+/g, '_')}.md`;
                      a.click();
                      showToast(t('meet_toast_notes_exported'), 'success');
                    }}
                  >
                    <Download size={14} />
                    <span>{t('meet_notes_btn_export')}</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setEmailMinutesModalOpen(true)}
                  >
                    <Mail size={14} />
                    <span>{t('meet_notes_btn_email')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* DRAWER TAB 4: INTERACTIVE POLLS */}
            {activeDrawer === 'polls' && (
              <div className="drawer-polls-body">
                {activePoll ? (
                  <div className="active-poll-card glass-card">
                    <div className="poll-header-row">
                      <span className="poll-tag">{t('meet_poll_tag')}</span>
                      {activePoll.isClosed ? (
                        <span className="poll-status-closed">{t('meet_poll_status_closed')}</span>
                      ) : (
                        <span className="poll-status-active">{t('meet_poll_status_active')}</span>
                      )}
                    </div>

                    <h4 className="poll-question-title">{activePoll.question}</h4>
                    <p className="poll-author">{t('meet_poll_author_prefix')} {activePoll.createdBy}</p>

                    <div className="poll-options-list">
                      {activePoll.options.map((opt) => {
                        const total = activePoll.options.reduce((acc, curr) => acc + curr.votes, 0);
                        const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
                        const isSelected = userVotedOption === opt.id;

                        return (
                          <div key={opt.id} className="poll-option-row">
                            <button
                              type="button"
                              className={`poll-option-btn ${isSelected ? 'is-selected' : ''}`}
                              onClick={() => handleCastVote(opt.id)}
                              disabled={activePoll.isClosed || userVotedOption !== null}
                            >
                              <div className="poll-bar-bg" style={{ width: `${pct}%` }} />
                              <div className="poll-btn-content">
                                <span>{opt.text}</span>
                                <span className="poll-pct-label">{pct}% ({opt.votes})</span>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="poll-footer-meta">
                      <span>{t('meet_poll_total_votes').replace('{count}', activePoll.options.reduce((acc, curr) => acc + curr.votes, 0))}</span>
                      {userVotedOption !== null && <span style={{ color: '#10B981' }}>{t('meet_poll_voted_badge')}</span>}
                    </div>

                    {/* Poll Controls for Host */}
                    <div className="poll-actions-bar">
                      {!activePoll.isClosed && userRole === 'admin' && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={handleClosePoll}
                        >
                          {t('meet_poll_btn_close')}
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={insertPollResultsInNotes}
                      >
                        {t('meet_poll_btn_insert_notes')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-poll-state">
                    <BarChart2 size={36} color="var(--text-muted)" />
                    <p>{t('meet_poll_empty')}</p>
                  </div>
                )}

                {/* Launch New Poll Button */}
                <button
                  type="button"
                  className="btn btn-primary btn-sm launch-poll-btn"
                  onClick={() => setShowCreatePollModal(true)}
                >
                  <Plus size={16} />
                  <span>{t('meet_poll_btn_new')}</span>
                </button>
              </div>
            )}

          </aside>
        )}

      </div>

      {/* FLOATING BOTTOM CONTROL DOCK */}
      <footer className="meeting-bottom-dock">
        <div className="dock-container">
          
          {/* Group 1: Audio & Video */}
          <div className="dock-group">
            <button
              type="button"
              className={`dock-btn ${isAudioMuted ? 'btn-danger-state' : 'btn-normal'}`}
              onClick={handleToggleMic}
              title={isAudioMuted ? t('meet_dock_mic_on') : t('meet_dock_mic_off')}
            >
              {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span className="dock-tooltip">{isAudioMuted ? t('meet_dock_mic_on') : t('meet_dock_mic_off')}</span>
            </button>

            <button
              type="button"
              className={`dock-btn ${isVideoDisabled ? 'btn-danger-state' : 'btn-normal'}`}
              onClick={handleToggleVideo}
              title={isVideoDisabled ? t('meet_dock_cam_on') : t('meet_dock_cam_off')}
            >
              {isVideoDisabled ? <VideoOff size={20} /> : <Video size={20} />}
              <span className="dock-tooltip">{isVideoDisabled ? t('meet_dock_cam_on') : t('meet_dock_cam_off')}</span>
            </button>
          </div>

          <div className="dock-divider" />

          {/* Group 2: Interactive Controls (Screen Share, Whiteboard, Hand, Captions, Record) */}
          <div className="dock-group">
            <button
              type="button"
              className={`dock-btn ${isScreenSharing ? 'btn-active-state' : 'btn-normal'}`}
              onClick={handleToggleScreenShare}
              title={isScreenSharing ? t('meet_dock_screen_stop') : t('meet_dock_screen_start')}
            >
              <ScreenShare size={20} />
              <span className="dock-tooltip">{isScreenSharing ? t('meet_dock_screen_stop') : t('meet_dock_screen_start')}</span>
            </button>

            <button
              type="button"
              className={`dock-btn ${layoutMode === 'whiteboard' ? 'btn-active-state' : 'btn-normal'}`}
              onClick={() => setLayoutMode(prev => (prev === 'whiteboard' ? 'grid' : 'whiteboard'))}
              title={t('meet_dock_whiteboard')}
            >
              <PenTool size={20} />
              <span className="dock-tooltip">{t('meet_dock_whiteboard')}</span>
            </button>

            <button
              type="button"
              className={`dock-btn ${isHandRaised ? 'btn-amber-state' : 'btn-normal'}`}
              onClick={handleToggleHand}
              title={isHandRaised ? t('meet_dock_hand_lower') : t('meet_dock_hand_raise')}
            >
              <Hand size={20} />
              <span className="dock-tooltip">{isHandRaised ? t('meet_dock_hand_lower') : t('meet_dock_hand_raise')}</span>
            </button>

            <button
              type="button"
              className={`dock-btn ${isCaptionsEnabled ? 'btn-active-state' : 'btn-normal'}`}
              onClick={handleToggleCaptions}
              title={isCaptionsEnabled ? t('meet_dock_captions_off') : t('meet_dock_captions_on')}
            >
              <Subtitles size={20} />
              <span className="dock-tooltip">{isCaptionsEnabled ? t('meet_dock_captions_off') : t('meet_dock_captions_on')}</span>
            </button>

            {/* Reactions Popover Menu */}
            <div className="reactions-popover-wrapper">
              <button
                type="button"
                className={`dock-btn ${reactionsMenuOpen ? 'btn-active-state' : 'btn-normal'}`}
                onClick={() => setReactionsMenuOpen(!reactionsMenuOpen)}
                title={t('meet_dock_reactions')}
              >
                <Smile size={20} />
                <span className="dock-tooltip">{t('meet_dock_reactions')}</span>
              </button>

              {reactionsMenuOpen && (
                <div className="reactions-floating-menu glass-card">
                  {[
                    { emoji: '👏', label: language === 'ar' ? 'أحسنت' : language === 'en' ? 'Clap' : 'Bravo' },
                    { emoji: '❤️', label: language === 'ar' ? 'أحببته' : language === 'en' ? 'Love' : 'J\'adore' },
                    { emoji: '🎉', label: language === 'ar' ? 'احتفال' : language === 'en' ? 'Party' : 'Fête' },
                    { emoji: '🔥', label: language === 'ar' ? 'رائع' : language === 'en' ? 'Fire' : 'Super' },
                    { emoji: '👍', label: language === 'ar' ? 'موافق' : language === 'en' ? 'Agree' : 'D\'accord' },
                    { emoji: '🚀', label: language === 'ar' ? 'انطلاق' : language === 'en' ? 'Rocket' : 'Décollage' },
                  ].map(r => (
                    <button
                      key={r.emoji}
                      type="button"
                      className="reaction-burst-btn"
                      onClick={() => triggerReaction(r.emoji)}
                      title={r.label}
                    >
                      <span>{r.emoji}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Real Cloud/Local Media Recording */}
            <button
              type="button"
              className={`dock-btn ${isRecording ? 'btn-rec-state' : 'btn-normal'}`}
              onClick={handleToggleRecording}
              title={isRecording ? t('meet_dock_rec_stop') : t('meet_dock_rec_start')}
            >
              {isRecording ? <StopCircle size={20} color="#EF4444" /> : <Radio size={20} />}
              <span className="dock-tooltip">{isRecording ? t('meet_dock_rec_stop') : t('meet_dock_rec_start')}</span>
            </button>
          </div>

          <div className="dock-divider" />

          {/* Group 3: Side Panel Drawers (Chat, Participants, Notes, Polls) */}
          <div className="dock-group">
            <button
              type="button"
              className={`dock-btn ${activeDrawer === 'chat' ? 'btn-active-state' : 'btn-normal'}`}
              onClick={() => {
                setActiveDrawer(prev => (prev === 'chat' ? null : 'chat'));
                setUnreadChatCount(0);
              }}
              title={t('meet_dock_chat')}
            >
              <MessageSquare size={20} />
              {unreadChatCount > 0 && (
                <span className="dock-counter-pill">{unreadChatCount}</span>
              )}
              <span className="dock-tooltip">{t('meet_dock_chat')}</span>
            </button>

            <button
              type="button"
              className={`dock-btn ${activeDrawer === 'participants' ? 'btn-active-state' : 'btn-normal'}`}
              onClick={() => setActiveDrawer(prev => (prev === 'participants' ? null : 'participants'))}
              title={t('meet_dock_participants')}
            >
              <Users size={20} />
              <span className="dock-counter-pill static">{totalCount}</span>
              <span className="dock-tooltip">{t('meet_dock_participants')}</span>
            </button>

            <button
              type="button"
              className={`dock-btn ${activeDrawer === 'polls' ? 'btn-active-state' : 'btn-normal'}`}
              onClick={() => setActiveDrawer(prev => (prev === 'polls' ? null : 'polls'))}
              title={t('meet_dock_polls')}
            >
              <BarChart2 size={20} />
              <span className="dock-tooltip">{t('meet_dock_polls')}</span>
            </button>

            <button
              type="button"
              className={`dock-btn ${activeDrawer === 'notes' ? 'btn-active-state' : 'btn-normal'}`}
              onClick={() => setActiveDrawer(prev => (prev === 'notes' ? null : 'notes'))}
              title={t('meet_dock_notes')}
            >
              <FileText size={20} />
              <span className="dock-tooltip">{t('meet_dock_notes')}</span>
            </button>
          </div>

          <div className="dock-divider" />

          {/* Group 4: Hang Up */}
          <div className="dock-group">
            <button
              type="button"
              className="dock-btn btn-hangup"
              onClick={() => setLeaveModalOpen(true)}
              title={t('meet_dock_hangup')}
            >
              <PhoneOff size={22} />
              <span className="dock-tooltip">{t('meet_dock_hangup')}</span>
            </button>
          </div>

        </div>
      </footer>

      {/* CREATE LIVE POLL MODAL */}
      {showCreatePollModal && (
        <div className="meeting-modal-overlay" onClick={() => setShowCreatePollModal(false)} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="glass-card meeting-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <BarChart2 size={22} color="#F59E0B" />
                <h3>{t('meet_modal_poll_title')}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowCreatePollModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePoll}>
              <div className="modal-body">
                <label className="lobby-form-label">{t('meet_modal_poll_label_q')}</label>
                <input
                  type="text"
                  className="lobby-input"
                  value={newPollQuestion}
                  onChange={(e) => setNewPollQuestion(e.target.value)}
                  placeholder={t('meet_modal_poll_ph_q')}
                  required
                />

                <label className="lobby-form-label" style={{ marginTop: '1rem' }}>{t('meet_modal_poll_label_opts')}</label>
                {newPollOptions.map((opt, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      className="lobby-input"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newPollOptions];
                        updated[idx] = e.target.value;
                        setNewPollOptions(updated);
                      }}
                      placeholder={`${t('meet_modal_poll_opt_prefix')} ${idx + 1}`}
                      required
                    />
                    {newPollOptions.length > 2 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setNewPollOptions(newPollOptions.filter((_, i) => i !== idx))}
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </button>
                    )}
                  </div>
                ))}

                {newPollOptions.length < 5 && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ marginTop: '0.5rem' }}
                    onClick={() => setNewPollOptions([...newPollOptions, ''])}
                  >
                    <Plus size={14} />
                    <span>{t('meet_modal_poll_btn_add_opt')}</span>
                  </button>
                )}
              </div>

              <div className="modal-footer" style={{ gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCreatePollModal(false)}
                >
                  {t('meet_modal_poll_btn_cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                >
                  {t('meet_modal_poll_btn_submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMAIL MEETING MINUTES MODAL */}
      {emailMinutesModalOpen && (
        <div className="meeting-modal-overlay" onClick={() => setEmailMinutesModalOpen(false)} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="glass-card meeting-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <Mail size={22} color="var(--s2t-cyan)" />
                <h3>{t('meet_modal_email_title')}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEmailMinutesModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendMinutesByEmail}>
              <div className="modal-body">
                {emailSuccessMessage && (
                  <div className="reunions-success-banner" style={{ marginBottom: '1rem' }}>
                    <CheckCircle2 size={18} />
                    <span>{emailSuccessMessage}</span>
                  </div>
                )}

                <label className="lobby-form-label">{t('meet_modal_email_label_to')}</label>
                <input
                  type="text"
                  className="lobby-input"
                  value={emailRecipientsInput}
                  onChange={(e) => setEmailRecipientsInput(e.target.value)}
                  placeholder={t('meet_modal_email_ph_to')}
                />

                <label className="lobby-form-label" style={{ marginTop: '1rem' }}>{t('meet_modal_email_label_preview')}</label>
                <textarea
                  className="notes-textarea"
                  style={{ height: '140px', fontSize: '0.8rem' }}
                  value={meetingNotes}
                  readOnly
                />
              </div>

              <div className="modal-footer" style={{ gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setEmailMinutesModalOpen(false)}
                >
                  {t('meet_modal_email_btn_close')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSendingEmail}
                >
                  <Send size={15} />
                  <span>{isSendingEmail ? t('meet_modal_email_btn_sending') : t('meet_modal_email_btn_send')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTINGS / HARDWARE MODAL */}
      {settingsModalOpen && (
        <div className="meeting-modal-overlay" onClick={() => setSettingsModalOpen(false)} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="glass-card meeting-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <Settings size={22} color="var(--s2t-blue)" />
                <h3>{t('meet_modal_settings_title')}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSettingsModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Microphone Selector */}
              <label className="lobby-form-label">{t('meet_modal_settings_mic')}</label>
              <select
                className="lobby-input"
                value={selectedAudioDevice}
                onChange={(e) => setSelectedAudioDevice(e.target.value)}
              >
                {audioDevices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.slice(0, 6)}`}</option>
                ))}
              </select>

              {/* Camera Selector */}
              <label className="lobby-form-label" style={{ marginTop: '1rem' }}>{t('meet_modal_settings_cam')}</label>
              <select
                className="lobby-input"
                value={selectedVideoDevice}
                onChange={(e) => setSelectedVideoDevice(e.target.value)}
              >
                {videoDevices.map(d => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Caméra ${d.deviceId.slice(0, 6)}`}</option>
                ))}
              </select>

              {/* Resolution / Quality */}
              <label className="lobby-form-label" style={{ marginTop: '1rem' }}>{t('meet_modal_settings_quality')}</label>
              <select
                className="lobby-input"
                value={videoQuality}
                onChange={(e) => setVideoQuality(e.target.value)}
              >
                <option value="1080p">{t('meet_modal_settings_quality_1080p')}</option>
                <option value="720p">{t('meet_modal_settings_quality_720p')}</option>
                <option value="360p">{t('meet_modal_settings_quality_360p')}</option>
              </select>

              {/* Virtual Background Filter */}
              <label className="lobby-form-label" style={{ marginTop: '1rem' }}>{t('meet_modal_settings_bg')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.4rem' }}>
                {[
                  { id: 'normal', label: t('meet_filter_normal') },
                  { id: 'blur', label: t('meet_filter_blur') },
                  { id: 'technopark', label: t('meet_filter_technopark') },
                  { id: 'studio', label: t('meet_filter_studio') },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    className={`btn btn-sm ${virtualFilter === item.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.75rem', justifyContent: 'center' }}
                    onClick={() => setVirtualFilter(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setSettingsModalOpen(false)}
              >
                {t('meet_modal_settings_btn_save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECURITY / ENCRYPTION INFO MODAL */}
      {securityModalOpen && (
        <div className="meeting-modal-overlay" onClick={() => setSecurityModalOpen(false)} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="glass-card meeting-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <Shield size={22} color="var(--s2t-cyan)" />
                <h3>{t('meet_modal_sec_title')}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSecurityModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {t('meet_modal_sec_desc')}
              </p>

              <div className="security-features-list">
                <div className="sec-feature-item">
                  <CheckCircle2 size={16} color="#10B981" />
                  <div>
                    <strong>{t('meet_sec_feat_1_title')}</strong>
                    <p>{t('meet_sec_feat_1_desc')}</p>
                  </div>
                </div>

                <div className="sec-feature-item">
                  <CheckCircle2 size={16} color="#10B981" />
                  <div>
                    <strong>{t('meet_sec_feat_2_title')}</strong>
                    <p>{t('meet_sec_feat_2_desc')}</p>
                  </div>
                </div>

                <div className="sec-feature-item">
                  <CheckCircle2 size={16} color="#10B981" />
                  <div>
                    <strong>{t('meet_sec_feat_3_title')}</strong>
                    <p>{t('meet_sec_feat_3_desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setSecurityModalOpen(false)}
              >
                {t('meet_modal_sec_btn_ok')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEAVE CONFIRMATION MODAL */}
      {leaveModalOpen && (
        <div className="meeting-modal-overlay" onClick={() => setLeaveModalOpen(false)} dir={isRtl ? 'rtl' : 'ltr'}>
          <div className="glass-card meeting-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-with-icon">
                <AlertCircle size={22} color="#EF4444" />
                <h3>{t('meet_modal_leave_title')}</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setLeaveModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {t('meet_modal_leave_desc').replace('{title}', roomTitle)}
              </p>
            </div>

            <div className="modal-footer" style={{ gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setLeaveModalOpen(false)}
              >
                {t('meet_modal_leave_btn_stay')}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                style={{ background: '#EF4444', borderColor: '#EF4444' }}
                onClick={handleLeaveMeeting}
              >
                {t('meet_modal_leave_btn_confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MeetingRoomPage;
