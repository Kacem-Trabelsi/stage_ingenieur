const API_BASE = 'http://localhost:5000/api';

async function testCompleteChatMultimediaWorkflow() {
  console.log('🚀 Démarrage des tests Multimédia Chat S2T (Documents, Photos, Emojis & Vocaux)...');

  try {
    // -------------------------------------------------------------
    // 1. Session Entreprise (Karim Ben Salem / InnovTech Solutions)
    // -------------------------------------------------------------
    const clientLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'client@s2t.tn',
        password: 'client123456',
      }),
    });
    const clientData = await clientLoginRes.json();
    if (!clientLoginRes.ok) throw new Error(clientData.message || 'Client login failed');
    const clientToken = clientData.token;
    console.log('✅ 1. Connexion Entreprise réussie :', clientData.name, `(${clientData.companyName})`);

    const clientHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clientToken}`,
    };

    // 2. Envoi d'un Document PDF
    console.log('📄 Envoi d\'un document PDF (Attestation d\'assurance)...');
    const docRes = await fetch(`${API_BASE}/chat/messages`, {
      method: 'POST',
      headers: clientHeaders,
      body: JSON.stringify({
        channelId: 'direction',
        text: 'Veuillez trouver ci-joint notre attestation d\'assurance locaux 2026 mise à jour.',
        attachments: [
          {
            name: 'Attestation_Assurance_RC_InnovTech_2026.pdf',
            size: '245.8 KB',
            type: 'application/pdf',
            url: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZw...',
            isImage: false,
          },
        ],
      }),
    });
    const docData = await docRes.json();
    if (!docRes.ok) throw new Error(docData.message || 'Doc message failed');
    console.log('✅ 2. Document PDF envoyé avec succès ID :', docData.userMessage.id || docData.userMessage._id);

    // 3. Envoi d'une Photo / Image
    console.log('🖼️ Envoi d\'une Photo (Plan d\'aménagement bureau B-204)...');
    const photoRes = await fetch(`${API_BASE}/chat/messages`, {
      method: 'POST',
      headers: clientHeaders,
      body: JSON.stringify({
        channelId: 'direction',
        text: 'Voici le plan d\'aménagement pour l\'extension de notre bureau B-204 📐',
        attachments: [
          {
            name: 'Plan_Amenagement_Bureau_B204.png',
            size: '1.2 MB',
            type: 'image/png',
            url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            isImage: true,
          },
        ],
      }),
    });
    const photoData = await photoRes.json();
    if (!photoRes.ok) throw new Error(photoData.message || 'Photo message failed');
    console.log('✅ 3. Photo envoyée avec succès (type: image) ID :', photoData.userMessage.id || photoData.userMessage._id);

    // 4. Envoi d'un Message Vocal (Voice Note)
    console.log('🎤 Envoi d\'un Message Vocal (Voice Note)...');
    const voiceRes = await fetch(`${API_BASE}/chat/messages`, {
      method: 'POST',
      headers: clientHeaders,
      body: JSON.stringify({
        channelId: 'direction',
        text: '',
        audio: {
          url: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
          duration: 6,
          waveform: [35, 60, 85, 50, 95, 70, 45, 90, 60, 75, 100, 55, 80, 40, 30],
        },
        attachments: [],
      }),
    });
    const voiceData = await voiceRes.json();
    if (!voiceRes.ok) throw new Error(voiceData.message || 'Voice message failed');
    console.log('✅ 4. Message vocal envoyé avec succès (durée: 6s) ID :', voiceData.userMessage.id || voiceData.userMessage._id);

    // 5. Envoi d'un Message avec Emojis
    console.log('😊 Envoi d\'un Message avec Emojis...');
    const emojiRes = await fetch(`${API_BASE}/chat/messages`, {
      method: 'POST',
      headers: clientHeaders,
      body: JSON.stringify({
        channelId: 'direction',
        text: 'Merci pour votre réactivité ! 🚀🏢💼👍✨',
        attachments: [],
      }),
    });
    const emojiData = await emojiRes.json();
    if (!emojiRes.ok) throw new Error(emojiData.message || 'Emoji message failed');
    console.log('✅ 5. Message Emojis envoyé avec succès !');

    // 5b. Journalisation d'un Appel Vocal (Voice Call Log)
    console.log('📞 Journalisation d\'un Appel Vocal (VoIP / WebRTC)...');
    const callRes = await fetch(`${API_BASE}/chat/messages`, {
      method: 'POST',
      headers: clientHeaders,
      body: JSON.stringify({
        channelId: 'direction',
        text: '📞 Appel vocal S2T terminé (00:45)',
        messageType: 'call',
        callDuration: 45,
        attachments: [],
      }),
    });
    const callData = await callRes.json();
    if (!callRes.ok) throw new Error(callData.message || 'Call message failed');
    console.log('✅ 5b. Appel vocal enregistré avec succès (durée: 45s) ID :', callData.userMessage.id || callData.userMessage._id);

    // -------------------------------------------------------------
    // 6. Session Direction / Admin S2T (admin@s2t.tn)
    // -------------------------------------------------------------
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@s2t.tn',
        password: 'admin123456',
      }),
    });
    const adminData = await adminLoginRes.json();
    if (!adminLoginRes.ok) throw new Error(adminData.message || 'Admin login failed');
    const adminToken = adminData.token;
    console.log('\n✅ 6. Connexion Direction S2T réussie :', adminData.name);

    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };

    // 7. L'Admin récupère le fil de discussion d'InnovTech et vérifie tous les formats
    const adminMessagesRes = await fetch(`${API_BASE}/chat/messages/client@s2t.tn`, { headers: adminHeaders });
    const adminMessages = await adminMessagesRes.json();
    console.log('✅ 7. Historique multimédia récupéré par la Direction (Total :', adminMessages.length, 'messages) :');

    const last5 = adminMessages.slice(-5);
    last5.forEach((m, idx) => {
      const typeStr = m.messageType === 'call' 
        ? `📞 APPEL VOCAL (${m.callDuration}s)`
        : m.audio 
        ? '🎤 VOCAL (6s)' 
        : (m.attachments?.[0]?.isImage ? '🖼️ PHOTO' : (m.attachments?.length > 0 ? '📄 DOCUMENT' : '💬 TEXTE'));
      console.log(`   [${idx + 1}] Type: ${typeStr} | De: ${m.senderName} | Contenu: "${(m.text || (m.audio ? 'Audio clip' : m.attachments?.[0]?.name))}"`);
    });

    // 8. L'Admin répond avec un document validé et une confirmation
    console.log('💬 Réponse de la Direction avec validation...');
    const adminReplyRes = await fetch(`${API_BASE}/chat/messages`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        channelId: 'client@s2t.tn',
        recipientEmail: 'client@s2t.tn',
        text: 'Attestation bien reçue et validée par la Direction S2T. Avenant disponible au téléchargement. ✅📜',
        attachments: [
          {
            name: 'Avenant_Extension_Signe_Direction_S2T.pdf',
            size: '310.4 KB',
            type: 'application/pdf',
            url: 'data:application/pdf;base64,JVBERi0xLjQKJcfsj6IKMSAwIG9iago8PA...',
            isImage: false,
          },
        ],
      }),
    });
    const adminReplyData = await adminReplyRes.json();
    if (!adminReplyRes.ok) throw new Error(adminReplyData.message || 'Admin reply failed');
    console.log('✅ 8. Réponse Direction avec document envoyée avec succès !');

    console.log('\n🎉 TOUS LES TESTS D\'ÉCHANGE MULTIMÉDIA & APPELS VOCAUX SONT RÉUSSIS À 100% !');
  } catch (err) {
    console.error('❌ Erreur lors du test multimédia :', err.message);
    process.exit(1);
  }
}

testCompleteChatMultimediaWorkflow();
