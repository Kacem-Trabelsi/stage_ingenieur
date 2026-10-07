import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import { createNotification } from '../services/notificationService.js';
import { askGeminiAssistant } from '../services/geminiAiService.js';

// @desc    Get all chat channels with latest activity
// @route   GET /api/chat/channels
// @access  Private
export const getChannels = async (req, res) => {
  try {
    const user = req.user;
    const isClient = user.role === 'client';

    if (isClient) {
      // For Enterprise Residents: Direction S2T + Assistant IA
      const directionChannelIds = ['direction', 'direction_s2t', 'juridique', 'facturation', 'technique'];
      
      const latestDirectionMsg = await ChatMessage.findOne({
        channelId: { $in: directionChannelIds },
        $or: [
          { senderEmail: user.email },
          { recipientEmail: user.email },
          { companyName: user.companyName },
        ],
      })
        .sort({ createdAt: -1 })
        .lean();

      const unreadDirectionCount = await ChatMessage.countDocuments({
        channelId: { $in: directionChannelIds },
        isRead: false,
        senderRole: { $ne: 'client' },
        $or: [
          { recipientEmail: user.email },
          { companyName: user.companyName },
        ],
      });

      const latestAiMsg = await ChatMessage.findOne({
        channelId: 'ia_assistant',
        $or: [{ senderEmail: user.email }, { recipientEmail: user.email }],
      })
        .sort({ createdAt: -1 })
        .lean();

      return res.json([
        {
          id: 'direction',
          name: 'Direction S2T',
          role: 'Administration, Contrats & Support Pôle El Ghazala',
          avatarText: 'D',
          avatarBg: 'var(--s2t-blue)',
          online: true,
          department: 'Direction S2T',
          defaultWelcome: 'Bonjour ! Bienvenue sur le canal direct de la Direction S2T Pôle El Ghazala. Comment pouvons-nous vous assister aujourd\'hui ?',
          lastMessage: latestDirectionMsg ? (latestDirectionMsg.text || (latestDirectionMsg.audio ? '🎤 Message vocal' : '📎 Pièce jointe')) : 'Bienvenue sur le canal direct de la Direction S2T.',
          lastTime: latestDirectionMsg ? new Date(latestDirectionMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'En ligne',
          unreadCount: unreadDirectionCount,
        },
        {
          id: 'ia_assistant',
          name: 'Assistant Réglementaire IA S2T',
          role: 'Expert Loi 2001-50 & Convention 16 Articles (24/7)',
          avatarText: 'IA',
          avatarBg: 'var(--s2t-red)',
          online: true,
          department: 'Assistant Réglementaire IA S2T',
          defaultWelcome: 'Bonjour ! Je suis l\'Assistant IA officiel de Smart Tunisian Technoparks (S2T). Posez-moi vos questions sur les 16 articles de la convention, les tarifs au m² (Art. 6), les cautions (Art. 7) ou les avenants de superficie.',
          lastMessage: latestAiMsg ? latestAiMsg.text : 'Posez-moi vos questions sur le barème locatif ou les avenants.',
          lastTime: latestAiMsg ? new Date(latestAiMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '24/7',
          unreadCount: 0,
        },
      ]);
    }

    // For Admin / Staff session:
    // 1. Assistant IA
    // 2. Each resident enterprise has its OWN separate channel / conversation!
    const residents = await User.find({ role: 'client' })
      .select('name email companyName officeNumber avatar status phone')
      .sort({ companyName: 1, name: 1 })
      .lean();

    const residentChannels = await Promise.all(
      residents.map(async (resUser, idx) => {
        const query = {
          $or: [
            { senderEmail: resUser.email },
            { recipientEmail: resUser.email },
            { companyName: resUser.companyName },
          ],
          channelId: { $ne: 'ia_assistant' },
        };

        const latestMsg = await ChatMessage.findOne(query)
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await ChatMessage.countDocuments({
          ...query,
          isRead: false,
          senderRole: 'client',
        });

        // Compute clean initials
        const namePart = resUser.companyName || resUser.name || 'Resident';
        const initials = namePart
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || 'R';

        const colorPalette = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
        const avatarBg = colorPalette[idx % colorPalette.length];

        return {
          id: resUser.email,
          residentEmail: resUser.email,
          name: resUser.companyName || resUser.name,
          contactName: resUser.name,
          companyName: resUser.companyName || '',
          phone: resUser.phone || '',
          role: `${resUser.name} • ${resUser.officeNumber ? resUser.officeNumber.split('(')[0].trim() : 'Résident S2T'}`,
          avatarText: initials,
          avatarBg,
          online: true,
          isResidentChannel: true,
          lastMessage: latestMsg ? (latestMsg.text || (latestMsg.audio ? '🎤 Message vocal' : '📎 Pièce jointe')) : 'Aucun message échangé pour le moment.',
          lastTime: latestMsg ? new Date(latestMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Nouveau',
          lastTimestamp: latestMsg ? new Date(latestMsg.createdAt).getTime() : 0,
          unreadCount,
        };
      })
    );

    // Sort resident channels by last activity / unread count
    residentChannels.sort((a, b) => {
      if (a.unreadCount !== b.unreadCount) return b.unreadCount - a.unreadCount;
      return b.lastTimestamp - a.lastTimestamp;
    });

    const aiChannel = {
      id: 'ia_assistant',
      name: 'Assistant Réglementaire IA S2T',
      role: 'Expert Loi 2001-50 & Convention 16 Articles (24/7)',
      avatarText: 'IA',
      avatarBg: 'var(--s2t-red)',
      online: true,
      department: 'Assistant Réglementaire IA S2T',
      lastMessage: 'Assistant IA réglementaire S2T disponible.',
      lastTime: '24/7',
      unreadCount: 0,
    };

    res.json([aiChannel, ...residentChannels]);
  } catch (error) {
    console.error('Erreur getChannels:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des canaux de discussion' });
  }
};

// @desc    Get message history for a specific channel
// @route   GET /api/chat/messages/:channelId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const user = req.user;
    const isClient = user.role === 'client';

    if (channelId === 'ia_assistant') {
      const messages = await ChatMessage.find({
        channelId: 'ia_assistant',
        $or: [{ senderEmail: user.email }, { recipientEmail: user.email }],
      })
        .sort({ createdAt: 1 })
        .lean();

      const formatted = messages.map((m) => {
        const isMe = m.sender && String(m.sender) === String(user._id);
        return {
          id: m._id,
          _id: m._id,
          sender: isMe ? 'me' : 'other',
          senderName: m.senderName,
          senderRole: m.senderRole,
          text: m.text || '',
          attachments: m.attachments || [],
          audio: m.audio || null,
          callDuration: m.callDuration || 0,
          messageType: m.messageType || (m.audio ? 'audio' : m.attachments?.length > 0 ? 'document' : 'text'),
          isRead: m.isRead,
          isAi: m.isAi,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fullDate: new Date(m.createdAt).toLocaleString('fr-FR'),
        };
      });

      return res.json(formatted);
    }

    if (isClient) {
      // Enterprise Resident reading their conversation with Direction S2T
      const messages = await ChatMessage.find({
        channelId: { $ne: 'ia_assistant' },
        $or: [
          { senderEmail: user.email },
          { recipientEmail: user.email },
          { companyName: user.companyName },
          { sender: user._id },
        ],
      })
        .sort({ createdAt: 1 })
        .lean();

      const formattedMessages = messages.map((m) => {
        const isMe = m.sender && String(m.sender) === String(user._id);
        return {
          id: m._id,
          _id: m._id,
          sender: isMe ? 'me' : 'other',
          senderName: isMe ? (user.name + (user.companyName ? ` (${user.companyName})` : '')) : (m.senderName || 'Direction S2T'),
          senderRole: m.senderRole,
          text: m.text || '',
          attachments: m.attachments || [],
          audio: m.audio || null,
          callDuration: m.callDuration || 0,
          messageType: m.messageType || (m.audio ? 'audio' : m.attachments?.length > 0 ? 'document' : 'text'),
          isRead: m.isRead,
          isAi: m.isAi,
          time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fullDate: new Date(m.createdAt).toLocaleString('fr-FR'),
        };
      });

      if (formattedMessages.length === 0) {
        formattedMessages.push({
          id: 'welcome-direction',
          _id: 'welcome-direction',
          sender: 'other',
          senderName: 'Direction S2T',
          senderRole: 'admin',
          text: 'Bonjour ! Bienvenue sur le canal direct de la Direction S2T Pôle El Ghazala. Comment pouvons-nous vous assister aujourd\'hui ?',
          attachments: [],
          audio: null,
          callDuration: 0,
          messageType: 'text',
          isRead: true,
          isAi: false,
          time: 'À l\'instant',
          fullDate: new Date().toLocaleString('fr-FR'),
        });
      }

      return res.json(formattedMessages);
    }

    // Admin reading a specific resident's chat
    const targetEmail = (channelId.includes('@')) 
      ? channelId 
      : (req.query.residentEmail || channelId);

    const resident = await User.findOne({ email: targetEmail });

    const messages = await ChatMessage.find({
      channelId: { $ne: 'ia_assistant' },
      $or: [
        { senderEmail: targetEmail },
        { recipientEmail: targetEmail },
        ...(resident?.companyName ? [{ companyName: resident.companyName }] : []),
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    const formattedMessages = messages.map((m) => {
      const isMe = m.senderRole === 'admin' || (m.sender && String(m.sender) === String(user._id));
      return {
        id: m._id,
        _id: m._id,
        sender: isMe ? 'me' : 'other',
        senderName: isMe ? 'Direction S2T' : (m.senderName || resident?.name || 'Résident'),
        senderRole: m.senderRole,
        text: m.text || '',
        attachments: m.attachments || [],
        audio: m.audio || null,
        callDuration: m.callDuration || 0,
        messageType: m.messageType || (m.audio ? 'audio' : m.attachments?.length > 0 ? 'document' : 'text'),
        isRead: m.isRead,
        isAi: m.isAi,
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullDate: new Date(m.createdAt).toLocaleString('fr-FR'),
      };
    });

    if (formattedMessages.length === 0) {
      formattedMessages.push({
        id: `welcome-${targetEmail}`,
        _id: `welcome-${targetEmail}`,
        sender: 'other',
        senderName: resident ? (resident.companyName || resident.name) : 'Résident',
        senderRole: 'client',
        text: 'Historique des échanges avec cette entreprise résidente.',
        attachments: [],
        audio: null,
        messageType: 'text',
        isRead: true,
        isAi: false,
        time: 'À l\'instant',
        fullDate: new Date().toLocaleString('fr-FR'),
      });
    }

    res.json(formattedMessages);
  } catch (error) {
    console.error('Erreur getMessages:', error);
    res.status(500).json({ message: 'Erreur lors du chargement de l\'historique des messages' });
  }
};

// @desc    Send a message in a channel (with automated AI or Direction S2T handling)
// @route   POST /api/chat/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { channelId, text = '', attachments = [], audio = null, recipientEmail, callDuration = 0 } = req.body;
    const reqMessageType = req.body.messageType;
    const user = req.user;

    const hasText = text && text.trim().length > 0;
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    const hasAudio = audio && (audio.url || audio.dataUrl);
    const isCall = reqMessageType === 'call';

    if (!hasText && !hasAttachments && !hasAudio && !isCall) {
      return res.status(400).json({ message: 'Le message ne peut pas être vide' });
    }

    // Process attachments to detect images
    const processedAttachments = attachments.map((att) => {
      const isImg = (att.type && att.type.startsWith('image/')) || 
                    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(att.name || '');
      return {
        name: att.name,
        size: att.size || '0 KB',
        type: att.type || (isImg ? 'image/jpeg' : 'application/pdf'),
        url: att.url || att.dataUrl || '',
        dataUrl: att.dataUrl || att.url || '',
        isImage: isImg,
      };
    });

    // Determine message type
    let messageType = reqMessageType || 'text';
    if (!isCall) {
      if (hasAudio) {
        messageType = 'audio';
      } else if (hasAttachments && processedAttachments.some((a) => a.isImage)) {
        messageType = hasText ? 'mixed' : 'image';
      } else if (hasAttachments) {
        messageType = hasText ? 'mixed' : 'document';
      }
    }

    const isClient = user.role === 'client';

    // 1. AI Assistant Channel
    if (channelId === 'ia_assistant') {
      const userMessage = await ChatMessage.create({
        channelId: 'ia_assistant',
        channelType: 'ia',
        department: 'Assistant Réglementaire IA S2T',
        sender: user._id,
        senderName: user.name + (user.companyName ? ` (${user.companyName})` : ''),
        senderRole: user.role,
        senderEmail: user.email,
        recipientEmail: 'ai@s2t.tn',
        companyName: user.companyName || '',
        text: (text || '').trim(),
        attachments: processedAttachments,
        audio: hasAudio ? audio : undefined,
        callDuration: Number(callDuration) || 0,
        messageType,
        isRead: true,
        isAi: false,
      });

      const aiReplyText = await askGeminiAssistant((text || 'aide').trim(), user.name, user.companyName);

      const aiMessage = await ChatMessage.create({
        channelId: 'ia_assistant',
        channelType: 'ia',
        department: 'Assistant Réglementaire IA S2T',
        senderName: 'Assistant IA S2T',
        senderRole: 'ai',
        senderEmail: 'ai@s2t.tn',
        recipient: user._id,
        recipientEmail: user.email,
        companyName: user.companyName || '',
        text: aiReplyText,
        attachments: [],
        audio: null,
        callDuration: 0,
        messageType: 'text',
        isRead: true,
        isAi: true,
      });

      return res.status(201).json({
        success: true,
        userMessage: {
          id: userMessage._id,
          _id: userMessage._id,
          sender: 'me',
          senderName: userMessage.senderName,
          senderRole: userMessage.senderRole,
          text: userMessage.text,
          attachments: userMessage.attachments,
          audio: userMessage.audio,
          callDuration: userMessage.callDuration,
          messageType: userMessage.messageType,
          isRead: userMessage.isRead,
          isAi: false,
          time: new Date(userMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fullDate: new Date(userMessage.createdAt).toLocaleString('fr-FR'),
        },
        aiMessage: {
          id: aiMessage._id,
          _id: aiMessage._id,
          sender: 'other',
          senderName: aiMessage.senderName,
          senderRole: 'ai',
          text: aiMessage.text,
          attachments: [],
          audio: null,
          callDuration: 0,
          messageType: 'text',
          isRead: true,
          isAi: true,
          time: new Date(aiMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          fullDate: new Date(aiMessage.createdAt).toLocaleString('fr-FR'),
        },
      });
    }

    // 2. Client sending message to Direction S2T
    if (isClient) {
      const userMessage = await ChatMessage.create({
        channelId: 'direction',
        channelType: 'direct',
        department: 'Direction S2T',
        sender: user._id,
        senderName: user.name + (user.companyName ? ` (${user.companyName})` : ''),
        senderRole: 'client',
        senderEmail: user.email,
        recipientEmail: 'direction@s2t.tn',
        companyName: user.companyName || '',
        text: (text || '').trim(),
        attachments: processedAttachments,
        audio: hasAudio ? audio : undefined,
        callDuration: Number(callDuration) || 0,
        messageType,
        isRead: false,
        isAi: false,
      });

      const notificationSnippet = isCall
        ? `📞 Appel vocal terminé (${callDuration}s)`
        : hasAudio
        ? '🎤 Message vocal reçu'
        : hasAttachments
        ? `📎 Document : ${processedAttachments[0]?.name || 'Fichier'}`
        : `"${text.slice(0, 90)}${text.length > 90 ? '...' : ''}"`;

      await createNotification({
        recipientEmail: 'admin@s2t.tn',
        title: isCall
          ? `📞 Appel vocal — ${user.companyName || user.name}`
          : `Nouveau message Chat — ${user.companyName || user.name}`,
        description: notificationSnippet,
        category: 'Direction',
        type: 'email',
        severity: 'info',
        actionLink: '/chat',
        actionText: 'Voir la conversation',
      });

      const userMessageData = {
        id: userMessage._id,
        _id: userMessage._id,
        sender: 'me',
        senderName: userMessage.senderName,
        senderRole: 'client',
        text: userMessage.text,
        attachments: userMessage.attachments,
        audio: userMessage.audio,
        callDuration: userMessage.callDuration,
        messageType: userMessage.messageType,
        isRead: false,
        isAi: false,
        time: new Date(userMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullDate: new Date(userMessage.createdAt).toLocaleString('fr-FR'),
      };

      // Broadcast to socket clients in real-time
      const io = req.app.get('io');
      if (io) {
        io.emit('message-received', {
          ...userMessageData,
          sender: 'other',
        });
      }

      return res.status(201).json({
        success: true,
        userMessage: userMessageData,
        aiMessage: null,
      });
    }

    // 3. Admin sending message to a specific resident
    const targetEmail = (channelId && channelId.includes('@'))
      ? channelId
      : (recipientEmail || req.body.residentEmail);

    if (!targetEmail) {
      return res.status(400).json({ message: 'Veuillez spécifier l\'entreprise destinataire' });
    }

    const resident = await User.findOne({ email: targetEmail });

    const adminMessage = await ChatMessage.create({
      channelId: 'direction',
      channelType: 'direct',
      department: 'Direction S2T',
      sender: user._id,
      senderName: 'Direction S2T',
      senderRole: 'admin',
      senderEmail: user.email || 'direction@s2t.tn',
      recipient: resident ? resident._id : undefined,
      recipientEmail: targetEmail,
      companyName: resident ? resident.companyName : '',
      text: (text || '').trim(),
      attachments: processedAttachments,
      audio: hasAudio ? audio : undefined,
      callDuration: Number(callDuration) || 0,
      messageType,
      isRead: false,
      isAi: false,
    });

    const notificationSnippet = isCall
      ? `📞 Appel vocal de la Direction S2T (${callDuration}s)`
      : hasAudio
      ? '🎤 Message vocal de la Direction S2T'
      : hasAttachments
      ? `📎 Document Direction S2T : ${processedAttachments[0]?.name || 'Fichier'}`
      : `"${text.slice(0, 90)}${text.length > 90 ? '...' : ''}"`;

    if (resident) {
      await createNotification({
        recipientEmail: targetEmail,
        title: isCall 
          ? '📞 Appel vocal de la Direction S2T'
          : 'Nouveau message de la Direction S2T',
        description: notificationSnippet,
        category: 'Direction',
        type: 'email',
        severity: 'info',
        actionLink: '/chat',
        actionText: 'Voir la conversation',
      });
    }

    const adminMessageData = {
      id: adminMessage._id,
      _id: adminMessage._id,
      sender: 'me',
      senderName: 'Direction S2T',
      senderRole: 'admin',
      text: adminMessage.text,
      attachments: adminMessage.attachments,
      audio: adminMessage.audio,
      callDuration: adminMessage.callDuration,
      messageType: adminMessage.messageType,
      isRead: false,
      isAi: false,
      time: new Date(adminMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fullDate: new Date(adminMessage.createdAt).toLocaleString('fr-FR'),
    };

    // Broadcast to socket clients in real-time
    const io = req.app.get('io');
    if (io) {
      io.emit('message-received', {
        ...adminMessageData,
        sender: 'other',
      });
    }

    res.status(201).json({
      success: true,
      userMessage: adminMessageData,
      aiMessage: null,
    });
  } catch (error) {
    console.error('Erreur sendMessage:', error);
    res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
  }
};

// @desc    Mark all messages in a channel as read
// @route   PUT /api/chat/read/:channelId
// @access  Private
export const markChannelAsRead = async (req, res) => {
  try {
    const { channelId } = req.params;
    const user = req.user;
    const isClient = user.role === 'client';

    if (channelId === 'ia_assistant') {
      await ChatMessage.updateMany(
        { channelId: 'ia_assistant', recipientEmail: user.email, isRead: false },
        { $set: { isRead: true } }
      );
    } else if (isClient) {
      await ChatMessage.updateMany(
        {
          channelId: { $ne: 'ia_assistant' },
          senderRole: { $ne: 'client' },
          $or: [{ recipientEmail: user.email }, { companyName: user.companyName }],
          isRead: false,
        },
        { $set: { isRead: true } }
      );
    } else {
      // Admin marking messages from a specific resident as read
      const targetEmail = channelId.includes('@') ? channelId : req.query.residentEmail;
      if (targetEmail) {
        await ChatMessage.updateMany(
          {
            channelId: { $ne: 'ia_assistant' },
            senderEmail: targetEmail,
            senderRole: 'client',
            isRead: false,
          },
          { $set: { isRead: true } }
        );
      }
    }

    res.json({ success: true, message: 'Messages marqués comme lus' });
  } catch (error) {
    console.error('Erreur markChannelAsRead:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour des messages' });
  }
};

// @desc    Clear channel message history for current user
// @route   DELETE /api/chat/clear/:channelId
// @access  Private
export const clearChannelHistory = async (req, res) => {
  try {
    const { channelId } = req.params;
    const user = req.user;
    const isClient = user.role === 'client';

    if (channelId === 'ia_assistant') {
      await ChatMessage.deleteMany({
        channelId: 'ia_assistant',
        $or: [{ senderEmail: user.email }, { recipientEmail: user.email }],
      });
    } else if (isClient) {
      await ChatMessage.deleteMany({
        channelId: { $ne: 'ia_assistant' },
        $or: [
          { senderEmail: user.email },
          { recipientEmail: user.email },
          { companyName: user.companyName },
        ],
      });
    } else {
      const targetEmail = channelId.includes('@') ? channelId : req.query.residentEmail;
      if (targetEmail) {
        await ChatMessage.deleteMany({
          channelId: { $ne: 'ia_assistant' },
          $or: [{ senderEmail: targetEmail }, { recipientEmail: targetEmail }],
        });
      }
    }

    res.json({ success: true, message: 'Historique effacé avec succès' });
  } catch (error) {
    console.error('Erreur clearChannelHistory:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'historique' });
  }
};

// @desc    Get list of resident companies for chat filtering (Admin only)
// @route   GET /api/chat/residents
// @access  Private
export const getResidents = async (req, res) => {
  try {
    const residents = await User.find({ role: 'client' })
      .select('name email companyName officeNumber phone')
      .sort({ companyName: 1, name: 1 })
      .lean();

    res.json(residents);
  } catch (error) {
    console.error('Erreur getResidents:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des résidents' });
  }
};
