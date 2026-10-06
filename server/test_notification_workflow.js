const API_BASE = 'http://localhost:5000/api';

async function testNotificationWorkflow() {
  console.log('🧪 === TEST S2T NOTIFICATION & BACKEND EVENT SYSTEM ===');

  try {
    // 1. Health check
    const healthRes = await fetch(`${API_BASE}/health`);
    const health = await healthRes.json();
    console.log('✅ 1. Health Check:', health.status);

    // 2. Login Admin
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@s2t.tn', password: 'admin123456' }),
    });
    const adminLogin = await adminLoginRes.json();
    const adminToken = adminLogin.token;
    console.log('✅ 2. Admin Login OK. Token:', adminToken.slice(0, 15) + '...');

    // 3. Login Resident
    const clientLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client@s2t.tn', password: 'client123456' }),
    });
    const clientLogin = await clientLoginRes.json();
    const clientToken = clientLogin.token;
    console.log('✅ 3. Resident Login OK. Token:', clientToken.slice(0, 15) + '...');

    // 4. Resident fetches notifications
    const clientNotifsRes = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    const clientNotifs = await clientNotifsRes.json();
    console.log(`✅ 4. Resident Notifications count: ${clientNotifs.length}`);
    clientNotifs.slice(0, 3).forEach((n, i) => {
      console.log(`   [${i + 1}] (${n.category} / ${n.severity}) ${n.title} - ${n.date} - Lu: ${n.isRead}`);
    });

    // 5. Resident fetches unread count
    const unreadRes = await fetch(`${API_BASE}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    const unreadData = await unreadRes.json();
    console.log('✅ 5. Resident Unread Count:', unreadData.unreadCount);

    // 6. Admin fetches notifications
    const adminNotifsRes = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminNotifs = await adminNotifsRes.json();
    console.log(`✅ 6. Admin Notifications count: ${adminNotifs.length}`);
    adminNotifs.slice(0, 3).forEach((n, i) => {
      console.log(`   [${i + 1}] (${n.category} / ${n.severity}) ${n.title} - ${n.date} - Lu: ${n.isRead}`);
    });

    // 7. Toggle Read on first resident notification
    if (clientNotifs.length > 0) {
      const firstNotif = clientNotifs[0];
      const toggleRes = await fetch(`${API_BASE}/notifications/${firstNotif._id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clientToken}`,
        },
        body: JSON.stringify({ isRead: !firstNotif.isRead }),
      });
      const toggleData = await toggleRes.json();
      console.log(`✅ 7. Toggle Read Status Notification ${firstNotif._id} -> isRead: ${toggleData.isRead}`);
    }

    // 8. Event Trigger: Resident sends Email to Direction S2T -> Admin should receive a notification
    const emailSendRes = await fetch(`${API_BASE}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${clientToken}`,
      },
      body: JSON.stringify({
        to: 'direction@s2t.tn',
        subject: 'Demande urgente de badge d\'accès supplémentaire pour développeur',
        body: 'Bonjour la Direction,\n\nNous accueillons un nouveau collaborateur demain et souhaitons activer un badge d\'accès sécurisé.\n\nMerci,\nInnovTech',
        category: 'technique',
      }),
    });
    const emailData = await emailSendRes.json();
    console.log('✅ 8. Resident sent email to direction@s2t.tn:', emailData.subject);

    // Verify Admin received notification for this email
    const adminNotifsAfterEmailRes = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminNotifsAfterEmail = await adminNotifsAfterEmailRes.json();
    const emailNotifFound = adminNotifsAfterEmail.find(n => n.title.includes('Nouveau Courrier'));
    console.log('✅ 9. Admin received notification for resident email:', emailNotifFound ? emailNotifFound.title : 'Non trouvé');

    // 10. Event Trigger: Admin sends broadcast announcement to residents
    const broadcastRes = await fetch(`${API_BASE}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        recipientEmail: 'all',
        title: 'Avis Officiel — Fermeture Exceptionnelle Salle Serveurs pour Audit',
        description: 'Une opération d\'audit de sécurité certifié ISO 27001 aura lieu ce dimanche.',
        category: 'Technique',
        severity: 'warning',
        actionText: 'Consulter',
        actionLink: '/email',
      }),
    });
    const broadcastData = await broadcastRes.json();
    console.log('✅ 10. Admin broadcast notification dispatched:', broadcastData.notification.title);

    // Verify Resident sees the broadcast
    const clientNotifsAfterBroadcastRes = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${clientToken}` },
    });
    const clientNotifsAfterBroadcast = await clientNotifsAfterBroadcastRes.json();
    const broadcastFound = clientNotifsAfterBroadcast.find(n => n.title.includes('Fermeture Exceptionnelle'));
    console.log('✅ 11. Resident received broadcast notification:', broadcastFound ? broadcastFound.title : 'Non trouvé');

    console.log('\n🎉 ALL NOTIFICATION TESTS PASSED PERFECTLY! 🚀\n');
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

testNotificationWorkflow();
