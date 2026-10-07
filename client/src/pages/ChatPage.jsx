import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatAPI } from '../services/api';
import { getSocket, registerSocketUser } from '../services/socket';
import { startIncomingRingtone, startOutgoingRingtone, stopRingtone } from '../services/ringtone';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Search, 
  Phone, 
  Video, 
  Circle, 
  CheckCheck, 
  Bot, 
  Building2, 
  ShieldCheck,
  Sparkles,
  Trash2,
  FileText,
  X,
  ArrowLeft,
  RefreshCw,
  Download,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  Info,
  Smile,
  Image as ImageIcon,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  Maximize2,
  PhoneCall,
  Lock,
  Wifi,
  Radio,
  Activity
} from 'lucide-react';

const EMOJI_CATEGORIES = [
  {
    id: 'popular',
    name: '🌟 Favoris',
    emojis: ['👍', '❤️', '😊', '🎉', '🚀', '💡', '🔥', '⭐', '🤝', '✅', '👏', '🙏', '👌', '💯', '✨', '😍', '🙌', '😎', '🥳', '🤩']
  },
  {
    id: 'faces',
    name: '😀 Visages',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😋', '😛', '😜', '🤪', '😎', '🤓', '🧐', '🥳', '😏', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😌', '😴', '😷']
  },
  {
    id: 'pro',
    name: '🏢 S2T & Pro',
    emojis: ['🏢', '🏛️', '💼', '📄', '⚖️', '💳', '📊', '🛡️', '📅', '📍', '📞', '💻', '🖥️', '📁', '🔑', '🏷️', '📬', '✉️', '🔒', '🔔', '📐', '📝', '🏗️', '🖨️', '📡', '🎯', '🌐', '💾', '⚙️', '📈', '📦']
  },
  {
    id: 'gestures',
    name: '👉 Gestes',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💪', '👊', '🤜', '🤛', '✊', '🤳']
  }
];

const AI_PROMPTS = [
  { label: '💳 Barème Loyers (Art. 6)', prompt: 'Quel est le barème officiel des redevances locatives au m² selon l\'Article 6 ?' },
  { label: '🛡️ Caution STB (Art. 7)', prompt: 'Quel est le montant de la caution et le RIB officiel STB (Article 7) ?' },
  { label: '📈 Avenant de Surface (Art. 11)', prompt: 'Comment faire une demande d\'avenant pour modifier la superficie du bureau ?' },
  { label: '⚖️ Résiliation & Préavis (Art. 8)', prompt: 'Quelle est la procédure de résiliation et la durée du préavis (Article 8) ?' },
  { label: '🤝 Salles de Réunion (Art. 2.c)', prompt: 'Comment réserver la Salle Ibn Khaldoun ou la Salle Innovation ?' },
  { label: '🏛️ Cadre Légal (Loi 2001-50)', prompt: 'Quel est le cadre juridique et la loi régissant les technoparcs en Tunisie ?' },
  { label: '🔌 Services Inclus & Fibre', prompt: 'Quels sont les services techniques et télécoms inclus dans la redevance ?' },
  { label: '📄 Factures & Quittances', prompt: 'Comment régler une facture et obtenir ma quittance libératoire STB ?' },
];

const DEFAULT_CHANNELS = [
  {
    id: 'direction',
    name: 'Direction S2T',
    role: 'Administration, Contrats & Support Pôle El Ghazala',
    avatarText: 'D',
    avatarBg: 'var(--s2t-blue)',
    online: true,
    lastMessage: 'Bienvenue sur le canal direct de la Direction S2T Pôle El Ghazala.',
    lastTime: 'En ligne',
    unreadCount: 0,
  },
  {
    id: 'ia_assistant',
    name: 'Assistant Réglementaire IA S2T',
    role: 'Expert Loi 2001-50 & Convention 16 Articles (24/7)',
    avatarText: 'IA',
    avatarBg: 'var(--s2t-red)',
    online: true,
    lastMessage: 'Posez-moi vos questions sur le barème locatif (Art. 6) ou les avenants.',
    lastTime: '24/7',
    unreadCount: 0,
  }
];

// Voice Note Player Component
const VoiceMessagePlayer = ({ audio, isMe }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        // Fallback simulation playback
        setIsPlaying(true);
        let sec = 0;
        const dur = audio.duration || 4;
        const t = setInterval(() => {
          sec += 0.5;
          setCurrentTime(sec);
          if (sec >= dur) {
            clearInterval(t);
            setIsPlaying(false);
            setCurrentTime(0);
          }
        }, 500);
      });
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const duration = audio?.duration || 4;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatSecs = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const bars = audio?.waveform && audio.waveform.length > 0 
    ? audio.waveform 
    : [35, 60, 85, 50, 95, 70, 45, 90, 60, 75, 100, 55, 80, 40, 30];

  return (
    <div className={`chat-voice-player ${isMe ? 'me' : 'other'}`}>
      {audio?.url && (
        <audio
          ref={audioRef}
          src={audio.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
        />
      )}
      
      <button
        type="button"
        onClick={togglePlay}
        className="chat-voice-play-btn"
        title={isPlaying ? 'Mettre en pause' : 'Écouter le message vocal'}
      >
        {isPlaying ? <Pause size={15} /> : <Play size={15} style={{ marginLeft: '2px' }} />}
      </button>

      <div className="chat-voice-waveform-col">
        <div className="chat-voice-waveform-bars">
          {bars.map((h, idx) => {
            const barProg = (idx / bars.length) * 100;
            const isPlayed = progress >= barProg;
            return (
              <span
                key={idx}
                className={`voice-bar ${isPlayed ? 'played' : ''}`}
                style={{ height: `${Math.max(22, Math.min(100, h))}%` }}
              />
            );
          })}
        </div>
        <div className="chat-voice-meta-row">
          <span>{formatSecs(isPlaying ? currentTime : duration)}</span>
          <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>Message vocal</span>
        </div>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const { user } = useAuth();
  const isClient = user?.role === 'client';

  // Component states
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [activeChannelId, setActiveChannelId] = useState(isClient ? 'direction' : '');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Emojis popover
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('popular');
  const emojiPickerRef = useRef(null);
  const emojiTriggerBtnRef = useRef(null);

  // Attachments (Docs & Photos)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Lightbox Image Modal
  const [previewImage, setPreviewImage] = useState(null);

  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Mobile responsive view toggle
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Audio / Video call modal state & WebRTC
  const [callModal, setCallModal] = useState(null); // 'audio' | 'video' | null
  const [callState, setCallState] = useState('ringing'); // 'ringing' | 'connected' | 'ended'
  const [callTimer, setCallTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null); // { caller, signalData, isVideo, channelId }
  const [activeCallTarget, setActiveCallTarget] = useState(null); // { name, email, socketId }

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const targetSocketIdRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const remoteAudioRef = useRef(null);
  const localAudioRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0] || DEFAULT_CHANNELS[0];

  // Helper to cleanup all WebRTC tracks and peer connections
  const cleanupWebRTC = () => {
    stopRingtone();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      localStreamRef.current = null;
    }
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          // ignore
        }
      });
      remoteStreamRef.current = new MediaStream();
    }
    targetSocketIdRef.current = null;
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {
        // ignore
      }
      peerConnectionRef.current = null;
    }
    pendingCandidatesRef.current = [];
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
    if (localAudioRef.current) {
      localAudioRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  // Real-time Socket.IO signaling for WebRTC calls & chat sync
  useEffect(() => {
    const socket = getSocket();
    if (user) {
      registerSocketUser(user);
    }

    const handleIncomingCall = (payload) => {
      // Ignore if user called self
      if (payload?.caller?.email && user?.email && payload.caller.email.toLowerCase() === user.email.toLowerCase()) {
        return;
      }
      // If user is already in a call, notify busy
      if (callModal || incomingCall) {
        socket.emit('reject-call', {
          toSocketId: payload?.caller?.socketId,
          toEmail: payload?.caller?.email,
          reason: 'busy',
        });
        return;
      }

      setIncomingCall(payload);
      startIncomingRingtone();
    };

    const handleCallAccepted = async (payload) => {
      stopRingtone();
      if (payload.answerer?.socketId) {
        targetSocketIdRef.current = payload.answerer.socketId;
      }
      if (peerConnectionRef.current && payload.signalData) {
        try {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(payload.signalData)
          );
          // Flush any buffered ICE candidates received before answer
          while (pendingCandidatesRef.current.length > 0) {
            const cand = pendingCandidatesRef.current.shift();
            try {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {
              console.warn('Erreur addIceCandidate bufferisé caller:', e);
            }
          }
        } catch (e) {
          console.error('Erreur setRemoteDescription (caller):', e);
        }
      }
      setCallState('connected');
      if (payload.answerer) {
        setActiveCallTarget((prev) => ({
          ...prev,
          ...payload.answerer,
        }));
      }
      // Immediately bind remote stream to video element
      if (remoteVideoRef.current && remoteStreamRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(() => {});
      }
      if (remoteAudioRef.current && remoteStreamRef.current) {
        remoteAudioRef.current.srcObject = remoteStreamRef.current;
        remoteAudioRef.current.play().catch(() => {});
      }
    };

    const handleCallRejected = (payload) => {
      stopRingtone();
      alert(
        `Appel non abouti : ${
          payload.reason === 'busy'
            ? 'Le correspondant est actuellement en communication.'
            : 'Le correspondant a décliné l\'appel.'
        }`
      );
      cleanupWebRTC();
      setCallModal(null);
      setCallState('ringing');
      setCallTimer(0);
      setActiveCallTarget(null);
    };

    const handleCallEnded = () => {
      stopRingtone();
      cleanupWebRTC();
      setCallState('ended');
      setTimeout(() => {
        setCallModal(null);
        setCallState('ringing');
        setCallTimer(0);
        setActiveCallTarget(null);
      }, 700);
    };

    const handleIceCandidate = async (payload) => {
      if (payload.candidate) {
        if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(payload.candidate)
            );
          } catch (e) {
            console.error('Erreur addIceCandidate:', e);
          }
        } else {
          pendingCandidatesRef.current.push(payload.candidate);
        }
      }
    };

    const handleMessageReceived = (newMsg) => {
      if (newMsg) {
        setMessages((prev) => {
          if (prev.some((m) => String(m.id || m._id) === String(newMsg.id || newMsg._id))) {
            return prev;
          }
          return [...prev, newMsg];
        });
        fetchChannels();
      }
    };

    socket.on('incoming-call', handleIncomingCall);
    socket.on('call-accepted', handleCallAccepted);
    socket.on('call-rejected', handleCallRejected);
    socket.on('call-ended', handleCallEnded);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('message-received', handleMessageReceived);

    return () => {
      socket.off('incoming-call', handleIncomingCall);
      socket.off('call-accepted', handleCallAccepted);
      socket.off('call-rejected', handleCallRejected);
      socket.off('call-ended', handleCallEnded);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('message-received', handleMessageReceived);
    };
  }, [user, activeChannelId, callModal, incomingCall]);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Call timer simulation (only ticks when connected)
  useEffect(() => {
    let interval = null;
    if (callModal && callState === 'connected') {
      interval = setInterval(() => {
        setCallTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callModal, callState]);

  // Voice recording duration timer
  useEffect(() => {
    if (isRecordingVoice) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingDuration(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecordingVoice]);

  // 1. Fetch channels on mount
  useEffect(() => {
    fetchChannels();
  }, [isClient]);

  // Ensure video streams are attached when video call modal opens or updates
  useEffect(() => {
    if (callModal === 'video') {
      if (localStreamRef.current && localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
        localVideoRef.current.play().catch(() => {});
      }
      if (remoteStreamRef.current && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
        remoteVideoRef.current.play().catch(() => {});
      }
      if (remoteStreamRef.current && remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStreamRef.current;
        remoteAudioRef.current.play().catch(() => {});
      }
    }
  }, [callModal, callState, activeCallTarget]);

  // 2. Fetch messages whenever activeChannelId changes
  useEffect(() => {
    if (activeChannelId) {
      loadMessages(activeChannelId);
      markChannelAsRead(activeChannelId);
      setShowEmojiPicker(false);
    }
  }, [activeChannelId]);

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target) &&
        emojiTriggerBtnRef.current &&
        !emojiTriggerBtnRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // 3. Periodic refresh of messages & channels (every 6s)
  useEffect(() => {
    const syncInterval = setInterval(() => {
      syncBackground();
    }, 6000);

    return () => clearInterval(syncInterval);
  }, [activeChannelId]);

  const fetchChannels = async () => {
    try {
      const res = await chatAPI.getChannels();
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setChannels(res.data);
        // Automatically select first channel if none selected
        if (!activeChannelId || !res.data.some((c) => c.id === activeChannelId)) {
          if (!isClient) {
            const firstResident = res.data.find((c) => c.id !== 'ia_assistant');
            setActiveChannelId(firstResident ? firstResident.id : res.data[0]?.id);
          } else {
            setActiveChannelId('direction');
          }
        }
      }
    } catch (err) {
      console.warn('Utilisation des canaux par défaut:', err.message);
    }
  };

  const loadMessages = async (channelId) => {
    try {
      setIsLoadingMessages(true);
      const res = await chatAPI.getMessages(channelId);
      if (res.data && Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Erreur chargement messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const syncBackground = async () => {
    if (!activeChannelId) return;
    try {
      const [chanRes, msgRes] = await Promise.all([
        chatAPI.getChannels(),
        chatAPI.getMessages(activeChannelId),
      ]);
      if (chanRes.data && Array.isArray(chanRes.data)) {
        setChannels(chanRes.data);
      }
      if (msgRes.data && Array.isArray(msgRes.data)) {
        setMessages(msgRes.data);
      }
    } catch (err) {
      // Background sync fail silent
    }
  };

  const markChannelAsRead = async (channelId) => {
    try {
      await chatAPI.markAsRead(channelId);
      setChannels((prev) =>
        prev.map((c) => (c.id === channelId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      // Silent error
    }
  };

  const handleSelectChannel = (channelId) => {
    setActiveChannelId(channelId);
    setShowMobileChat(true);
  };

  const handleFileChange = (e, isImage = false) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      const isImgFile = isImage || file.type.startsWith('image/');
      reader.onload = () => {
        setSelectedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            type: file.type || (isImgFile ? 'image/jpeg' : 'application/pdf'),
            url: reader.result,
            dataUrl: reader.result,
            isImage: isImgFile,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removeAttachment = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInsertEmoji = (emoji) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Voice recording triggers
  const startVoiceRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64Audio = reader.result;
            const waveform = Array.from({ length: 15 }, () => Math.floor(Math.random() * 65) + 35);
            sendVoiceMessage(base64Audio, recordingDuration || 3, waveform);
          };
          reader.readAsDataURL(audioBlob);

          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecordingVoice(true);
      } else {
        setIsRecordingVoice(true);
      }
    } catch (err) {
      console.warn('Microphone access simulation:', err.message);
      setIsRecordingVoice(true);
    }
  };

  const stopAndSendVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    } else {
      // Simulation voice note
      const waveform = Array.from({ length: 15 }, () => Math.floor(Math.random() * 65) + 35);
      sendVoiceMessage('https://actions.google.com/sounds/v1/alarms/beep_short.ogg', recordingDuration || 4, waveform);
    }
    setIsRecordingVoice(false);
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
    setRecordingDuration(0);
  };

  const sendVoiceMessage = async (audioUrl, duration, waveform) => {
    const payload = {
      channelId: activeChannelId,
      text: '',
      audio: {
        url: audioUrl,
        duration: duration || 4,
        waveform: waveform || [],
      },
      attachments: [],
      recipientEmail: !isClient ? (activeChannel?.residentEmail || activeChannelId) : undefined,
    };

    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: optimisticId,
      _id: optimisticId,
      sender: 'me',
      senderName: isClient ? (user?.name || 'Moi') : 'Direction S2T',
      senderRole: user?.role || (isClient ? 'client' : 'admin'),
      text: '',
      audio: payload.audio,
      messageType: 'audio',
      attachments: [],
      isRead: false,
      isAi: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setIsSending(true);

    try {
      const res = await chatAPI.sendMessage(payload);
      if (res.data?.success) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? res.data.userMessage : m))
        );
        fetchChannels();
      }
    } catch (err) {
      console.error('Erreur envoi audio:', err);
      const errorMsg = err.response?.data?.message || (err.response?.status === 401
        ? 'Votre session a expiré. Veuillez vous reconnecter.'
        : 'Impossible d\'envoyer le message vocal. Veuillez vérifier que le serveur est accessible.');
      alert(errorMsg);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e, textOverride = null) => {
    if (e) e.preventDefault();
    const textToSend = (textOverride || inputText).trim();
    if (!textToSend && selectedFiles.length === 0) return;

    const payload = {
      channelId: activeChannelId,
      text: textToSend,
      attachments: selectedFiles,
      recipientEmail: !isClient ? (activeChannel?.residentEmail || activeChannelId) : undefined,
    };

    // Optimistic UI update
    const optimisticId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: optimisticId,
      _id: optimisticId,
      sender: 'me',
      senderName: isClient ? (user?.name || 'Moi') : 'Direction S2T',
      senderRole: user?.role || (isClient ? 'client' : 'admin'),
      text: payload.text,
      attachments: selectedFiles,
      messageType: selectedFiles.some(f => f.isImage) ? (payload.text ? 'mixed' : 'image') : (selectedFiles.length > 0 ? 'document' : 'text'),
      isRead: false,
      isAi: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setSelectedFiles([]);
    setShowEmojiPicker(false);
    setIsSending(true);

    if (activeChannelId === 'ia_assistant') {
      setIsTyping(true);
    }

    try {
      const res = await chatAPI.sendMessage(payload);
      if (res.data?.success) {
        // Replace temp message with server confirmed message
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? res.data.userMessage : m))
        );

        // If AI replied
        if (res.data.aiMessage) {
          setTimeout(() => {
            setIsTyping(false);
            setMessages((prev) => [...prev, res.data.aiMessage]);
          }, 600);
        }

        fetchChannels();
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
      const errorMsg = err.response?.data?.message || (err.response?.status === 401
        ? 'Votre session a expiré. Veuillez vous reconnecter.'
        : 'Impossible d\'envoyer le message. Veuillez vérifier que le serveur backend est connecté.');
      alert(errorMsg);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    } finally {
      setIsSending(false);
      if (activeChannelId !== 'ia_assistant') {
        setIsTyping(false);
      }
    }
  };

  const handlePromptClick = (promptText) => {
    handleSendMessage(null, promptText);
  };

  const handleClearHistory = async () => {
    if (!window.confirm(`Êtes-vous certain de vouloir effacer l'historique des échanges avec ${activeChannel.name} ?`)) {
      return;
    }
    try {
      await chatAPI.clearHistory(activeChannelId);
      loadMessages(activeChannelId);
      fetchChannels();
    } catch (err) {
      console.error('Erreur suppression historique:', err);
      alert('Erreur lors de l\'effacement de l\'historique.');
    }
  };

  // Start Voice / Video Call (WebRTC Caller)
  const handleStartCall = async (type = 'audio') => {
    if (activeChannelId === 'ia_assistant') {
      alert("L'Assistant IA ne prend pas en charge les appels en direct. Veuillez lui poser vos questions par message texte.");
      return;
    }

    const targetEmail = !isClient ? (activeChannel?.residentEmail || activeChannelId) : 'direction@s2t.tn';
    const targetRole = isClient ? 'admin' : undefined;

    setCallModal(type);
    setCallState('ringing');
    setCallTimer(0);
    setIsMuted(false);
    setIsSpeakerOn(true);
    setIsVideoOff(false);
    setActiveCallTarget({
      name: activeChannel?.name || 'Direction S2T',
      email: targetEmail,
    });

    startOutgoingRingtone();

    try {
      // 1. Capture local audio (and video if video call)
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: type === 'video' ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          } : false,
        });
      } catch (mediaErr) {
        if (type === 'video') {
          console.warn('Webcam inaccessible, repli sur appel audio:', mediaErr);
          // Fallback to audio if video camera is unavailable/denied
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
            video: false,
          });
          setCallModal('audio');
          type = 'audio';
        } else {
          throw mediaErr;
        }
      }

      localStreamRef.current = stream;

      if (type === 'video' && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // 2. Create RTCPeerConnection
      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionRef.current = pc;
      pendingCandidatesRef.current = [];

      // 3. Add tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // 4. Remote track listener
      pc.ontrack = (event) => {
        console.log('[WebRTC Caller] ontrack reçu:', event.track?.kind, event.streams);
        const incomingStream = (event.streams && event.streams[0]) ? event.streams[0] : null;
        if (incomingStream) {
          remoteStreamRef.current = incomingStream;
        } else if (event.track) {
          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
          }
          if (!remoteStreamRef.current.getTracks().find((t) => t.id === event.track.id)) {
            remoteStreamRef.current.addTrack(event.track);
          }
        }

        const streamToPlay = incomingStream || remoteStreamRef.current;
        if (remoteVideoRef.current && streamToPlay) {
          remoteVideoRef.current.srcObject = streamToPlay;
          remoteVideoRef.current.play().catch(() => {});
        }
        if (remoteAudioRef.current && streamToPlay) {
          remoteAudioRef.current.srcObject = streamToPlay;
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      // 5. ICE candidate listener
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = getSocket();
          socket.emit('ice-candidate', {
            toEmail: targetEmail,
            toRole: targetRole,
            toSocketId: targetSocketIdRef.current || activeCallTarget?.socketId,
            candidate: event.candidate,
          });
        }
      };

      // 6. Create offer & set local description
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video',
      });
      await pc.setLocalDescription(offer);

      // 7. Emit 'call-user' to socket server
      const socket = getSocket();
      socket.emit('call-user', {
        toEmail: targetEmail,
        toRole: targetRole,
        signalData: offer,
        isVideo: type === 'video',
        channelId: activeChannelId,
      });

    } catch (err) {
      console.error('Erreur démarrage appel WebRTC:', err);
      stopRingtone();
      cleanupWebRTC();
      setCallModal(null);
      alert("Impossible d'accéder au microphone ou à la caméra. Veuillez autoriser l'accès dans les paramètres de votre navigateur.");
    }
  };

  // Accept Incoming Call (WebRTC Receiver)
  const handleAcceptIncomingCall = async () => {
    if (!incomingCall) return;

    stopRingtone();
    const callData = incomingCall;
    let isVideo = !!callData.isVideo;

    setIncomingCall(null);
    setCallModal(isVideo ? 'video' : 'audio');
    setCallState('connected');
    setCallTimer(0);
    setIsMuted(false);
    setIsSpeakerOn(true);
    setIsVideoOff(false);
    setActiveCallTarget(callData.caller);
    targetSocketIdRef.current = callData.caller?.socketId || null;

    try {
      // 1. Get microphone (and camera if video)
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: isVideo ? {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          } : false,
        });
      } catch (mediaErr) {
        if (isVideo) {
          console.warn('Caméra non disponible, bascule en audio:', mediaErr);
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
            video: false,
          });
          isVideo = false;
          setCallModal('audio');
        } else {
          throw mediaErr;
        }
      }

      localStreamRef.current = stream;

      if (isVideo && localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }

      // 2. Create RTCPeerConnection
      const pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionRef.current = pc;

      // 3. Add tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // 4. Remote track listener
      pc.ontrack = (event) => {
        console.log('[WebRTC Receiver] ontrack reçu:', event.track?.kind, event.streams);
        const incomingStream = (event.streams && event.streams[0]) ? event.streams[0] : null;
        if (incomingStream) {
          remoteStreamRef.current = incomingStream;
        } else if (event.track) {
          if (!remoteStreamRef.current) {
            remoteStreamRef.current = new MediaStream();
          }
          if (!remoteStreamRef.current.getTracks().find((t) => t.id === event.track.id)) {
            remoteStreamRef.current.addTrack(event.track);
          }
        }

        const streamToPlay = incomingStream || remoteStreamRef.current;
        if (remoteVideoRef.current && streamToPlay) {
          remoteVideoRef.current.srcObject = streamToPlay;
          remoteVideoRef.current.play().catch(() => {});
        }
        if (remoteAudioRef.current && streamToPlay) {
          remoteAudioRef.current.srcObject = streamToPlay;
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      // 5. ICE candidate listener
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = getSocket();
          socket.emit('ice-candidate', {
            toSocketId: callData.caller?.socketId,
            toEmail: callData.caller?.email,
            candidate: event.candidate,
          });
        }
      };

      // 6. Set remote description from caller's offer
      await pc.setRemoteDescription(new RTCSessionDescription(callData.signalData));

      // 7. Process any pending ICE candidates
      while (pendingCandidatesRef.current.length > 0) {
        const cand = pendingCandidatesRef.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand));
        } catch (e) {
          console.warn('Pending candidate err:', e);
        }
      }

      // 8. Create answer & set local description
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // 9. Send 'accept-call'
      const socket = getSocket();
      socket.emit('accept-call', {
        toSocketId: callData.caller?.socketId,
        toEmail: callData.caller?.email,
        signalData: answer,
      });

    } catch (err) {
      console.error('Erreur acceptation appel WebRTC:', err);
      stopRingtone();
      cleanupWebRTC();
      setCallModal(null);
      alert("Impossible d'accéder au microphone ou à la caméra pour établir la visioconférence.");
    }
  };

  // Reject Incoming Call
  const handleRejectIncomingCall = () => {
    stopRingtone();
    if (incomingCall) {
      const socket = getSocket();
      socket.emit('reject-call', {
        toSocketId: incomingCall.caller?.socketId,
        toEmail: incomingCall.caller?.email,
        reason: 'declined',
      });
    }
    setIncomingCall(null);
  };

  // End Voice / Video Call (Hangup)
  const handleEndCall = async () => {
    stopRingtone();
    const isVideoCall = callModal === 'video';
    const targetSocket = activeCallTarget?.socketId;
    const targetEmail = activeCallTarget?.email || (!isClient ? activeChannel?.residentEmail : 'direction@s2t.tn');

    const socket = getSocket();
    socket.emit('end-call', {
      toSocketId: targetSocket,
      toEmail: targetEmail,
      duration: callTimer,
    });

    const duration = callTimer;
    cleanupWebRTC();
    setCallState('ended');

    if (activeChannel && activeChannel.id !== 'ia_assistant') {
      try {
        const payload = {
          channelId: activeChannel.id,
          text: isVideoCall
            ? `📹 Visioconférence S2T terminée (${formatCallTime(duration || 1)})`
            : `📞 Appel vocal S2T terminé (${formatCallTime(duration || 1)})`,
          messageType: 'call',
          callDuration: duration || 1,
          recipientEmail: !isClient ? activeChannel.residentEmail || activeChannel.id : undefined,
        };
        const res = await chatAPI.sendMessage(payload);
        if (res.data?.userMessage) {
          setMessages((prev) => [...prev, res.data.userMessage]);
        }
      } catch (err) {
        console.error('Erreur enregistrement appel:', err);
      }
    }

    setTimeout(() => {
      setCallModal(null);
      setCallState('ringing');
      setCallTimer(0);
      setActiveCallTarget(null);
    }, 700);
  };

  // Toggle Mute Microphone
  const handleToggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  };

  // Toggle Camera Video
  const handleToggleVideo = () => {
    setIsVideoOff((prev) => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = !next;
        });
      }
      return next;
    });
  };

  // Toggle Speaker / Sound
  const handleToggleSpeaker = () => {
    setIsSpeakerOn((prev) => {
      const next = !prev;
      if (remoteAudioRef.current) {
        remoteAudioRef.current.muted = !next;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.muted = !next;
      }
      return next;
    });
  };

  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to render bold markdown and bullet points
  const renderFormattedText = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const cleanLine = isBullet ? line.replace(/^[•-]\s*/, '') : line;

      const parts = cleanLine.split(/(\*\*.*?\*\*|`.*?`)/g);

      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: 'var(--text-primary)', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code key={pIdx} style={{ 
              background: 'rgba(37, 99, 235, 0.12)', 
              color: 'var(--s2t-blue)', 
              padding: '0.1rem 0.35rem', 
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '0.85em'
            }}>
              {part.slice(1, -1)}
            </code>
          );
        }
        return part;
      });

      return (
        <div key={idx} style={{ marginBottom: line === '' ? '0.4rem' : '0.2rem', paddingLeft: isBullet ? '0.75rem' : 0 }}>
          {isBullet && <span style={{ color: 'var(--s2t-blue)', marginRight: '0.35rem' }}>•</span>}
          {formattedLine}
        </div>
      );
    });
  };

  const filteredChannels = channels.filter((c) =>
    (c.name || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (c.role || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (c.contactName || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="chat-page-container">
      {/* Top Banner Header */}
      <div className="page-header-row" style={{ marginBottom: '1rem' }}>
        <div>
          <div className="page-breadcrumb">
            <MessageSquare size={16} color="var(--s2t-blue)" />
            <span>{isClient ? 'Espace Résident S2T' : 'Administration S2T'} / Chat & Support Direct</span>
          </div>
          <h1 className="page-main-title">
            {isClient ? 'Assistance & Messagerie Instantanée S2T' : 'Messagerie Direction S2T & Entreprises Résidentes'}
          </h1>
          <p className="page-subtitle">
            {isClient
              ? 'Échangez en direct avec la Direction S2T (documents, photos, vocaux) et l\'Assistant IA Réglementaire.'
              : 'Gérez les échanges multimédias (documents, photos, notes vocales) avec chaque entreprise résidente.'}
          </p>
        </div>

        {/* Action button bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              fetchChannels();
              if (activeChannelId) loadMessages(activeChannelId);
            }}
            title="Actualiser la messagerie"
          >
            <RefreshCw size={14} />
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      {/* Main Chat Layout Grid */}
      <div className={`chat-grid-container ${showMobileChat ? 'mobile-show-chat' : 'mobile-show-channels'}`}>
        
        {/* Left Sidebar: Channels List */}
        <div className="chat-channels-sidebar">
          {/* Search channel */}
          <div className="chat-search-wrapper">
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              placeholder={isClient ? 'Rechercher un service S2T...' : 'Rechercher une entreprise ou contact...'}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="chat-search-input"
            />
          </div>

          {/* Channels Header (for Admin) */}
          {!isClient && (
            <div style={{ padding: '0.5rem 1rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Conversations Entreprises</span>
              <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>{channels.length - 1} résidents</span>
            </div>
          )}

          {/* Channel list */}
          <div className="chat-channels-list">
            {filteredChannels.map((chan) => {
              const isSelected = chan.id === activeChannelId;
              return (
                <div
                  key={chan.id}
                  onClick={() => handleSelectChannel(chan.id)}
                  className={`chat-channel-item ${isSelected ? 'active' : ''}`}
                >
                  <div className="channel-avatar-circle" style={{ background: chan.avatarBg || 'var(--s2t-blue)' }}>
                    {chan.id === 'ia_assistant' ? <Bot size={20} /> : (chan.avatarText || chan.name.charAt(0))}
                    {chan.online && <span className="channel-online-dot" />}
                  </div>

                  <div className="channel-info-col">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.3rem' }}>
                      <span className="channel-name-label">{chan.name}</span>
                      <span className="channel-time-label">{chan.lastTime || 'En ligne'}</span>
                    </div>
                    <span className="channel-role-label">{chan.role}</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
                      <span className="channel-last-msg">{chan.lastMessage}</span>
                      {chan.unreadCount > 0 && (
                        <span className="channel-unread-badge">{chan.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* S2T Compliance Banner */}
          <div className="chat-sidebar-footer-note">
            <ShieldCheck size={16} color="var(--s2t-teal)" />
            <span>Échanges officiels sécurisés SSL 256-bit (Loi 2001-50)</span>
          </div>
        </div>

        {/* Right Active Chat Window */}
        <div className="chat-window-card">
          
          {/* Window Header */}
          <div className="chat-window-header">
            <div className="chat-window-header-left">
              {/* Mobile Back Button */}
              <button
                type="button"
                className="chat-mobile-back-btn"
                onClick={() => setShowMobileChat(false)}
                title="Retour aux canaux"
              >
                <ArrowLeft size={18} />
              </button>

              <div
                className="channel-avatar-circle"
                style={{
                  background: activeChannel.avatarBg || 'var(--s2t-blue)',
                }}
              >
                {activeChannel.id === 'ia_assistant' ? <Bot size={22} /> : (activeChannel.avatarText || activeChannel.name?.charAt(0))}
              </div>

              <div className="chat-window-header-info">
                <div className="chat-header-name-row">
                  <h3 className="chat-header-title">
                    {activeChannel.name}
                  </h3>
                  {activeChannel.online && (
                    <span className="chat-status-pill">
                      <Circle size={6} fill="#10B981" color="#10B981" />
                      <span>{activeChannel.id === 'ia_assistant' ? 'IA Active 24/7' : (!isClient ? 'Résident' : 'En ligne')}</span>
                    </span>
                  )}
                </div>
                <span className="chat-header-subtitle">
                  {activeChannel.role}
                </span>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="chat-window-header-actions">
              {activeChannel.id !== 'ia_assistant' && (
                <>
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-sm chat-header-action-btn" 
                    title={!isClient ? `Appel vocal direct avec ${activeChannel.name}` : "Lancer un appel vocal sécurisé"}
                    onClick={() => handleStartCall('audio')}
                  >
                    <Phone size={17} />
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-ghost btn-sm chat-header-action-btn" 
                    title={!isClient ? `Visioconférence sécurisée avec ${activeChannel.name}` : "Lancer une visioconférence avec la Direction"}
                    onClick={() => handleStartCall('video')}
                  >
                    <Video size={17} />
                  </button>
                </>
              )}

              <button
                type="button"
                className="btn btn-ghost btn-sm chat-header-action-btn"
                title="Effacer l'historique de cette conversation"
                onClick={handleClearHistory}
                style={{ color: 'var(--text-muted)' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* AI Quick Prompts Bar (when IA Assistant is active) */}
          {activeChannel.id === 'ia_assistant' && (
            <div className="chat-ai-prompts-bar">
              <div className="chat-ai-prompts-label">
                <Sparkles size={14} color="var(--s2t-red)" />
                <span>Suggestions rapides :</span>
              </div>
              <div className="chat-ai-prompts-scroll">
                {AI_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="chat-ai-prompt-chip"
                    onClick={() => handlePromptClick(p.prompt)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Feed Area */}
          <div className="chat-messages-area">
            {isLoadingMessages ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={20} className="animate-spin" />
                <span>Chargement de la conversation sécurisée...</span>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <MessageSquare size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Aucun message dans cette conversation</p>
                <p style={{ fontSize: '0.8rem' }}>
                  {!isClient
                    ? `Envoyez le premier message à l'entreprise ${activeChannel.name}.`
                    : `Envoyez votre message à la ${activeChannel.name}.`}
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender === 'me';
                const isAi = msg.isAi || msg.senderRole === 'ai';
                const hasImages = msg.attachments && msg.attachments.some(a => a.isImage);
                const docAttachments = msg.attachments ? msg.attachments.filter(a => !a.isImage) : [];

                return (
                  <div key={msg.id || msg._id} className={`chat-message-bubble-row ${isMe ? 'me' : 'other'}`}>
                    {!isMe && (
                      <div
                        className="message-avatar-small"
                        style={{ background: isAi ? 'var(--s2t-red)' : (activeChannel.avatarBg || 'var(--s2t-blue)') }}
                      >
                        {isAi ? <Bot size={15} /> : (activeChannel.avatarText || 'S')}
                      </div>
                    )}

                    <div className={`chat-message-bubble ${isMe ? 'me' : isAi ? 'ai-bubble' : 'other'}`}>
                      {/* Sender Name for AI or other party */}
                      {!isMe && (
                        <div className="chat-bubble-sender-name">
                          <span>{msg.senderName || activeChannel.name}</span>
                          {isAi && (
                            <span className="chat-ai-badge">
                              <Sparkles size={11} /> IA 24/7
                            </span>
                          )}
                        </div>
                      )}

                      {/* Photo / Image gallery inside message */}
                      {hasImages && (
                        <div className="chat-images-grid">
                          {msg.attachments.filter(a => a.isImage).map((img, imgIdx) => (
                            <div key={imgIdx} className="chat-image-card" onClick={() => setPreviewImage(img.url || img.dataUrl)}>
                              <img src={img.url || img.dataUrl} alt={img.name} className="chat-inline-photo" />
                              <div className="chat-image-overlay">
                                <Maximize2 size={16} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Call Log Card */}
                      {msg.messageType === 'call' && (
                        <div className={`chat-call-log-card ${isMe ? 'me' : 'other'}`}>
                          <div className={`chat-call-log-icon ${isMe ? 'outgoing' : 'incoming'}`}>
                            <Phone size={16} />
                          </div>
                          <div className="chat-call-log-info">
                            <span className="chat-call-log-title">
                              {isMe ? 'Appel vocal sortant' : 'Appel vocal entrant'}
                            </span>
                            <span className="chat-call-log-dur">
                              {msg.callDuration > 0 ? `Durée : ${formatCallTime(msg.callDuration)}` : 'Appel vocal terminé'}
                            </span>
                          </div>
                          {activeChannel.id !== 'ia_assistant' && (
                            <button
                              type="button"
                              className="chat-call-again-btn"
                              onClick={() => handleStartCall('audio')}
                              title="Rappeler"
                            >
                              <Phone size={12} />
                              <span>Rappeler</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Voice Note Player */}
                      {msg.audio && (
                        <VoiceMessagePlayer audio={msg.audio} isMe={isMe} />
                      )}

                      {/* Message text with formatting */}
                      {msg.text && (
                        <div className="chat-message-text">
                          {renderFormattedText(msg.text)}
                        </div>
                      )}

                      {/* Document Attachments (PDF, DOCX) */}
                      {docAttachments.length > 0 && (
                        <div className="chat-message-attachments-list">
                          {docAttachments.map((att, attIdx) => (
                            <div key={attIdx} className="chat-attachment-chip">
                              <FileText size={16} color="var(--s2t-blue)" />
                              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <span className="chat-att-name">{att.name}</span>
                                <span className="chat-att-size">{att.size}</span>
                              </div>
                              {att.url && (
                                <a
                                  href={att.url}
                                  download={att.name}
                                  className="chat-att-dl"
                                  title="Télécharger le document"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Download size={14} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Message metadata */}
                      <div className="chat-message-meta">
                        <span>{msg.time || 'À l\'instant'}</span>
                        {isMe && <CheckCheck size={14} color="#60A5FA" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-message-bubble-row other">
                <div
                  className="message-avatar-small"
                  style={{ background: activeChannel.id === 'ia_assistant' ? 'var(--s2t-red)' : activeChannel.avatarBg }}
                >
                  {activeChannel.id === 'ia_assistant' ? <Bot size={15} /> : (activeChannel.avatarText || 'S')}
                </div>
                <div className="chat-typing-indicator">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Attachments Pending Upload Bar */}
          {selectedFiles.length > 0 && (
            <div className="chat-pending-files-bar">
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Éléments prêts à l'envoi ({selectedFiles.length}) :
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="chat-pending-file-pill">
                    {file.isImage ? <ImageIcon size={13} color="var(--s2t-teal)" /> : <FileText size={13} color="var(--s2t-blue)" />}
                    <span className="pending-file-name">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="chat-remove-file-btn"
                      title="Supprimer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="chat-emoji-popover">
              <div className="chat-emoji-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Smile size={16} color="var(--s2t-blue)" />
                  <span>Émojis & Réactions</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(false)}
                  className="chat-emoji-close-btn"
                  title="Fermer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Categories Navigation Tabs */}
              <div className="chat-emoji-tabs">
                {EMOJI_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`chat-emoji-tab-btn ${activeEmojiCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveEmojiCategory(cat.id)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Grid of Emojis */}
              <div className="chat-emoji-grid">
                {(EMOJI_CATEGORIES.find((c) => c.id === activeEmojiCategory)?.emojis || []).map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="chat-emoji-btn"
                    onClick={() => handleInsertEmoji(emoji)}
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message Input Bar & Voice Recording Bar */}
          {isRecordingVoice ? (
            <div className="chat-recording-bar">
              <div className="chat-recording-pulse">
                <Circle size={10} fill="#EF4444" color="#EF4444" className="animate-ping" />
                <span className="chat-recording-timer">Enregistrement vocal : {formatCallTime(recordingDuration)}</span>
              </div>
              
              <div className="chat-recording-waves">
                <span className="recording-wave-bar" />
                <span className="recording-wave-bar" />
                <span className="recording-wave-bar" />
                <span className="recording-wave-bar" />
                <span className="recording-wave-bar" />
              </div>

              <div className="chat-recording-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={cancelVoiceRecording}
                  style={{ color: 'var(--text-muted)' }}
                  title="Annuler le message vocal"
                >
                  <Trash2 size={16} />
                  <span>Annuler</span>
                </button>

                <button
                  type="button"
                  className="chat-send-btn voice-send"
                  onClick={stopAndSendVoiceRecording}
                  title="Envoyer le message vocal"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => handleSendMessage(e)} className="chat-input-bar">
              {/* Hidden File Input for Documents */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                multiple
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={(e) => handleFileChange(e, false)}
              />

              {/* Hidden File Input for Photos */}
              <input
                type="file"
                ref={imageInputRef}
                style={{ display: 'none' }}
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={(e) => handleFileChange(e, true)}
              />

              {/* Attach Document Button */}
              <button
                type="button"
                className="chat-attach-btn"
                title="Joindre un document (PDF, Word, Excel)"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={18} />
              </button>

              {/* Attach Photo Button */}
              <button
                type="button"
                className="chat-attach-btn"
                title="Joindre une photo ou image (PNG, JPG)"
                onClick={() => imageInputRef.current?.click()}
              >
                <ImageIcon size={18} />
              </button>

              {/* Emoji Picker Button */}
              <button
                ref={emojiTriggerBtnRef}
                type="button"
                className={`chat-attach-btn ${showEmojiPicker ? 'active' : ''}`}
                title="Ajouter un emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={18} />
              </button>

              <input
                type="text"
                placeholder={
                  !isClient 
                    ? `Écrire un message à ${activeChannel.name}...` 
                    : `Poser une question à ${activeChannel.name}...`
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="chat-text-input"
                disabled={isSending}
              />

              {/* Mic / Voice Recording Button */}
              <button
                type="button"
                className="chat-mic-btn"
                title="Enregistrer un message vocal"
                onClick={startVoiceRecording}
              >
                <Mic size={17} />
              </button>

              {/* Send Button */}
              <button
                type="submit"
                disabled={(!inputText.trim() && selectedFiles.length === 0) || isSending}
                className="chat-send-btn"
                title="Envoyer le message"
              >
                <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Lightbox / Full-size Photo Preview Modal */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="chat-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <div className="chat-lightbox-header">
              <span>Aperçu de l'image</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={previewImage}
                  download="image-s2t.png"
                  className="btn btn-secondary btn-sm"
                  title="Télécharger l'image"
                >
                  <Download size={14} />
                  <span>Télécharger</span>
                </a>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPreviewImage(null)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="chat-lightbox-body">
              <img src={previewImage} alt="Aperçu agrandi" className="chat-lightbox-img" />
            </div>
          </div>
        </div>
      )}

      {/* Real-time WebRTC Audio Streams */}
      <audio ref={remoteAudioRef} autoPlay playsInline style={{ display: 'none' }} />
      <audio ref={localAudioRef} muted autoPlay playsInline style={{ display: 'none' }} />

      {/* Incoming Call Interactive Popup Modal */}
      {incomingCall && (
        <div className="incoming-call-overlay">
          <div className="chat-incoming-call-card">
            {/* Top ambient glowing line */}
            <div className={`incoming-call-top-glow ${incomingCall.isVideo ? 'video' : 'audio'}`} />

            <div className="incoming-call-pulse-ring">
              <span className={`sonar-wave sonar-wave-1 ${incomingCall.isVideo ? 'video' : 'audio'}`} />
              <span className={`sonar-wave sonar-wave-2 ${incomingCall.isVideo ? 'video' : 'audio'}`} />
              <span className={`sonar-wave sonar-wave-3 ${incomingCall.isVideo ? 'video' : 'audio'}`} />
              
              <div
                className="channel-avatar-circle incoming-avatar-circle"
                style={{ background: incomingCall.caller?.avatarBg || 'var(--s2t-blue)' }}
              >
                {incomingCall.caller?.avatarText || incomingCall.caller?.name?.charAt(0) || 'D'}
                <span className="incoming-avatar-status-badge">
                  {incomingCall.isVideo ? <Video size={11} /> : <PhoneCall size={11} />}
                </span>
              </div>
            </div>

            <div className="incoming-call-details">
              <div className={`incoming-badge-pill ${incomingCall.isVideo ? 'video' : 'audio'}`}>
                <span className="live-ping-dot" />
                {incomingCall.isVideo ? <Video size={13} className="animate-pulse" /> : <Radio size={13} className="animate-bounce" />}
                <span>{incomingCall.isVideo ? 'VISIOCONFÉRENCE HD ENTRANTE' : 'APPEL VOCAL S2T ENTRANT'}</span>
              </div>

              <h3 className="incoming-caller-title">
                {incomingCall.caller?.name || 'Direction S2T'}
              </h3>
              
              <p className="incoming-caller-company">
                {incomingCall.caller?.companyName
                  ? `${incomingCall.caller.companyName} • Pôle El Ghazala`
                  : incomingCall.caller?.role === 'admin'
                  ? 'Direction Générale S2T • Administration & Support'
                  : 'Résident Entreprise S2T'}
              </p>

              <div className="incoming-secure-tag">
                <ShieldCheck size={14} color="#10B981" />
                <span>Liaison Chiffrée TLS 256-bit • Réseau S2T</span>
              </div>
            </div>

            <div className="incoming-actions-row">
              <button
                type="button"
                className="btn-incoming-reject"
                onClick={handleRejectIncomingCall}
                title="Décliner l'appel"
              >
                <div className="btn-call-icon-wrap">
                  <PhoneOff size={22} />
                </div>
                <span>Refuser</span>
              </button>

              <button
                type="button"
                className={`btn-incoming-accept ${incomingCall.isVideo ? 'video' : 'audio'}`}
                onClick={handleAcceptIncomingCall}
                title={incomingCall.isVideo ? 'Accepter la visioconférence' : "Accepter l'appel"}
              >
                <div className="btn-call-icon-wrap">
                  {incomingCall.isVideo ? <Video size={22} className="animate-pulse" /> : <Phone size={22} className="animate-pulse" />}
                </div>
                <span>{incomingCall.isVideo ? 'Accepter Visio' : 'Répondre'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audio / Video Call Modal */}
      {callModal && (
        <div className="modal-overlay">
          <div className={`chat-call-modal-card ${callModal === 'video' ? 'video-mode' : 'audio-mode'}`}>
            {/* Top ambient glowing line */}
            <div className={`chat-call-card-top-bar ${callModal === 'video' ? 'video' : 'audio'} ${callState}`} />

            {/* Call Header & Animated Avatar */}
            <div className="chat-call-header">
              <div className="chat-call-avatar-wrapper">
                {callState === 'ringing' && (
                  <>
                    <span className={`sonar-wave sonar-wave-1 ${callModal === 'video' ? 'video' : 'audio'}`} />
                    <span className={`sonar-wave sonar-wave-2 ${callModal === 'video' ? 'video' : 'audio'}`} />
                    <span className={`sonar-wave sonar-wave-3 ${callModal === 'video' ? 'video' : 'audio'}`} />
                  </>
                )}
                <div
                  className="channel-avatar-circle chat-call-avatar"
                  style={{
                    background: activeCallTarget?.avatarBg || activeChannel.avatarBg || 'var(--s2t-blue)',
                  }}
                >
                  {activeCallTarget?.avatarText || activeCallTarget?.name?.charAt(0) || activeChannel.avatarText || activeChannel.name.charAt(0)}
                </div>
              </div>

              <h3 className="chat-call-contact-name">
                {activeCallTarget?.name || activeChannel.name}
              </h3>
              
              <span className="chat-call-subtext">
                {callState === 'ringing' 
                  ? (callModal === 'video' ? 'Visioconférence en cours • Sonnerie chez le correspondant...' : 'Appel vocal direct • Sonnerie en cours...') 
                  : callState === 'ended' 
                  ? (callModal === 'video' ? 'Visioconférence terminée' : 'Appel terminé')
                  : (callModal === 'video' ? `Visioconférence HD sécurisée avec ${activeCallTarget?.name || activeChannel.name}` : `Liaison audio sécurisée avec ${activeCallTarget?.name || activeChannel.name}`)}
              </span>

              {/* Status & Timer Badge */}
              <div className={`chat-call-timer-badge ${callState}`}>
                {callState === 'ringing' ? (
                  <>
                    {callModal === 'video' ? <Video size={13} className="animate-pulse" /> : <PhoneCall size={13} className="animate-bounce" />}
                    <span>Appel en cours d'établissement...</span>
                  </>
                ) : callState === 'ended' ? (
                  <>
                    <PhoneOff size={13} />
                    <span>{callModal === 'video' ? 'Visio terminée' : 'Appel terminé'} • {formatCallTime(callTimer)}</span>
                  </>
                ) : (
                  <>
                    <span className="live-ping-dot green" />
                    <span>En direct : {formatCallTime(callTimer)} • {callModal === 'video' ? 'Visio HD WebRTC' : 'Voix HD WebRTC'}</span>
                  </>
                )}
              </div>
            </div>

            {/* Equalizer Sound Waves when Connected (Audio Only) */}
            {callModal === 'audio' && callState === 'connected' && (
              <div className="chat-call-equalizer-container">
                <div className="chat-equalizer-header">
                  <Activity size={13} color="#10B981" />
                  <span className="chat-equalizer-label">Liaison Audio HD Active (Micro & Haut-Parleur)</span>
                </div>
                <div className="chat-call-equalizer-bars">
                  <span className="eq-bar eq-1" />
                  <span className="eq-bar eq-2" />
                  <span className="eq-bar eq-3" />
                  <span className="eq-bar eq-4" />
                  <span className="eq-bar eq-5" />
                  <span className="eq-bar eq-6" />
                  <span className="eq-bar eq-7" />
                  <span className="eq-bar eq-8" />
                  <span className="eq-bar eq-9" />
                  <span className="eq-bar eq-10" />
                  <span className="eq-bar eq-11" />
                  <span className="eq-bar eq-12" />
                  <span className="eq-bar eq-13" />
                  <span className="eq-bar eq-14" />
                  <span className="eq-bar eq-15" />
                  <span className="eq-bar eq-16" />
                </div>
              </div>
            )}

            {/* Video Box if Video Call */}
            {callModal === 'video' && (
              <div className="chat-video-preview-box">
                {/* Remote Video Element - ALWAYS in DOM */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="chat-remote-video"
                  style={{
                    display: callState === 'connected' ? 'block' : 'none',
                  }}
                />

                {/* Waiting placeholder avatar when ringing or connecting */}
                {callState !== 'connected' && (
                  <div className="chat-video-waiting-placeholder">
                    <div className="chat-video-waiting-portal">
                      <div className="channel-avatar-circle" style={{ width: '72px', height: '72px', fontSize: '1.75rem', background: activeCallTarget?.avatarBg || 'var(--s2t-blue)' }}>
                        {activeCallTarget?.avatarText || activeCallTarget?.name?.charAt(0) || 'D'}
                      </div>
                    </div>
                    <span className="chat-video-waiting-name">{activeCallTarget?.name || activeChannel.name}</span>
                    <span className="chat-video-waiting-sub">Établissement du flux vidéo sécurisé WebRTC...</span>
                  </div>
                )}

                {/* Local Video Picture-In-Picture */}
                <div className="chat-pip-container">
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="chat-local-video-pip"
                  />
                  <span className="chat-pip-badge">Moi</span>
                </div>

                {isVideoOff && (
                  <div className="chat-video-disabled-overlay">
                    <VideoOff size={36} color="var(--s2t-red)" />
                    <span>Caméra locale désactivée</span>
                  </div>
                )}
              </div>
            )}

            {/* Direct Line / Contact Info */}
            <div className="chat-call-info-note">
              <Lock size={15} color="var(--s2t-blue)" />
              <span>
                {!isClient ? (
                  <>Ligne directe Résident : <strong>{activeCallTarget?.email || activeChannel.residentEmail || 'Contact Entreprise'}</strong></>
                ) : (
                  <>Standard Direction S2T : <strong>+216 71 857 000</strong> (Pôle El Ghazala)</>
                )}
              </span>
            </div>

            {/* Call Controls Dock */}
            <div className="chat-call-controls-row">
              {/* Mic Mute Toggle */}
              <button
                type="button"
                className={`chat-call-control-btn ${isMuted ? 'active-mute' : ''}`}
                onClick={handleToggleMute}
                title={isMuted ? 'Activer le micro' : 'Couper le micro'}
                disabled={callState === 'ended'}
              >
                <div className="control-btn-icon-wrap">
                  {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </div>
                <span className="control-btn-caption">{isMuted ? 'Coupé' : 'Micro'}</span>
              </button>

              {/* Speaker Toggle */}
              <button
                type="button"
                className={`chat-call-control-btn ${!isSpeakerOn ? 'active-mute' : ''}`}
                onClick={handleToggleSpeaker}
                title={isSpeakerOn ? 'Couper le haut-parleur' : 'Activer le haut-parleur'}
                disabled={callState === 'ended'}
              >
                <div className="control-btn-icon-wrap">
                  {isSpeakerOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </div>
                <span className="control-btn-caption">{isSpeakerOn ? 'HP Actif' : 'HP Coupé'}</span>
              </button>

              {/* Video Toggle if video call */}
              {callModal === 'video' && (
                <button
                  type="button"
                  className={`chat-call-control-btn ${isVideoOff ? 'active-mute' : ''}`}
                  onClick={handleToggleVideo}
                  title={isVideoOff ? 'Activer la caméra' : 'Couper la caméra'}
                  disabled={callState === 'ended'}
                >
                  <div className="control-btn-icon-wrap">
                    {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                  </div>
                  <span className="control-btn-caption">{isVideoOff ? 'Cam Off' : 'Caméra'}</span>
                </button>
              )}

              {/* Hangup Button */}
              <button
                type="button"
                className="chat-call-hangup-btn"
                onClick={handleEndCall}
                title="Raccrocher"
              >
                <div className="hangup-icon-wrap">
                  <PhoneOff size={22} />
                </div>
                <span className="control-btn-caption">Raccrocher</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
