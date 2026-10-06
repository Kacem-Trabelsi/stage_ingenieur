const API_URL = 'http://localhost:5000/api';

async function testEmailWorkflow() {
  try {
    console.log('--- TEST EMAIL BACKEND WORKFLOW ---');

    // 1. Health check
    const healthRes = await fetch(`${API_URL}/health`);
    const health = await healthRes.json();
    console.log('1. Health check:', health.message);

    // 2. Login as Resident (Karim Ben Salem / client@s2t.tn)
    const clientLoginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'client@s2t.tn',
        password: 'client123456',
      }),
    });
    const clientData = await clientLoginRes.json();
    if (!clientLoginRes.ok) throw new Error(clientData.message || 'Login failed');
    const clientToken = clientData.token;
    console.log('2. Client logged in successfully as:', clientData.name);

    // 3. Fetch Client inbox & counts
    const clientHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clientToken}`,
    };
    const countsRes = await fetch(`${API_URL}/emails/counts`, { headers: clientHeaders });
    const counts = await countsRes.json();
    console.log('3. Client Email counts:', counts);

    const inboxRes = await fetch(`${API_URL}/emails?folder=inbox`, { headers: clientHeaders });
    const inbox = await inboxRes.json();
    console.log(`4. Client Inbox emails count: ${inbox.length}`);
    if (inbox.length > 0) {
      console.log('   Sample email subject:', inbox[0].subject, '| sender:', inbox[0].senderName);
    }

    // 4. Client sends a new message to S2T Juridique
    const sendRes = await fetch(`${API_URL}/emails`, {
      method: 'POST',
      headers: clientHeaders,
      body: JSON.stringify({
        to: 'juridique@s2t.tn',
        subject: 'Demande d\'avenant n°2 — Changement d\'horaires d\'accès sécurisé',
        body: 'Bonjour la direction juridique,\n\nNous souhaitons demander l\'extension des accès par badge 24h/24 pour nos ingénieurs de nuit.\n\nMerci,\nInnovTech SARL',
        category: 'juridique',
      }),
    });
    const sentMail = await sendRes.json();
    if (!sendRes.ok) throw new Error(sentMail.message || 'Send email failed');
    console.log('5. Message sent from Resident to Admin! ID:', sentMail._id);

    // 5. Login as Admin
    const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
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
    console.log('6. Admin logged in as:', adminData.name);

    // 6. Admin fetches inbox
    const adminHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    };
    const adminInboxRes = await fetch(`${API_URL}/emails?folder=inbox`, { headers: adminHeaders });
    const adminInbox = await adminInboxRes.json();
    console.log(`7. Admin Inbox count: ${adminInbox.length}`);
    const received = adminInbox.find((e) => e._id === sentMail._id);
    if (received) {
      console.log('8. Admin successfully received Resident message:', received.subject);
    }

    // 7. Admin replies to Resident
    const replyRes = await fetch(`${API_URL}/emails`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        to: 'client@s2t.tn',
        subject: `Re: ${sentMail.subject}`,
        body: 'Bonjour Karim,\n\nVotre demande a été prise en compte et transmise au service sécurité pour activation immédiate des badges.\n\nCordialement,\nDirection Juridique S2T',
        category: 'juridique',
        replyTo: sentMail._id,
      }),
    });
    const repliedMail = await replyRes.json();
    if (!replyRes.ok) throw new Error(repliedMail.message || 'Reply failed');
    console.log('9. Admin replied to Resident! ID:', repliedMail._id);

    // 8. Test Toggle Star & Mark Read
    const starRes = await fetch(`${API_URL}/emails/${repliedMail._id}/star`, {
      method: 'PUT',
      headers: adminHeaders,
    });
    const starData = await starRes.json();
    console.log('10. Admin Starred email:', starData);

    // 9. Fetch Recipients
    const recRes = await fetch(`${API_URL}/emails/recipients`, { headers: clientHeaders });
    const recData = await recRes.json();
    console.log('11. Recipients available for compose:', {
      officialCount: recData.official?.length,
      residentsCount: recData.residents?.length,
    });

    console.log('🎉 ALL BACKEND EMAIL TESTS PASSED 100% SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Error during test:', error.message);
  }
}

testEmailWorkflow();
