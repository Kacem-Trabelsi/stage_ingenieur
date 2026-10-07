import User from '../models/User.js';
import Contract from '../models/Contract.js';
import Invoice from '../models/Invoice.js';
import Email from '../models/Email.js';
import Notification from '../models/Notification.js';
import ChatMessage from '../models/ChatMessage.js';
import Reunion from '../models/Reunion.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    let adminUser, client1, client2;

    if (userCount === 0) {
      console.log('🌱 Initialisation des données de démonstration S2T...');

      // 1. Create Admin & Financial Officers
      adminUser = await User.create({
        name: 'Direction Financière & Juridique',
        email: 'admin@s2t.tn',
        password: 'admin123456',
        role: 'admin',
        companyName: 'Smart Tunisian Technoparks (S2T)',
        phone: '+216 71 857 000',
      });

      // 2. Create Resident Enterprises
      client1 = await User.create({
        name: 'Karim Ben Salem',
        email: 'client@s2t.tn',
        password: 'client123456',
        role: 'client',
        companyName: 'InnovTech Solutions SARL',
        fiscalId: '1428571/A/M/000',
        phone: '+216 98 123 456',
        activityType: 'Édition Logiciels & IA',
        officeNumber: 'Bureau B-204 (Bâtiment El Ghazala 1)',
        surfaceArea: 45,
        status: 'approved',
      });

      client2 = await User.create({
        name: 'Sarra Trabelsi',
        email: 'startup@s2t.tn',
        password: 'startup123456',
        role: 'client',
        companyName: 'CloudTunisia SAS',
        fiscalId: '0987654/B/P/000',
        phone: '+216 22 987 654',
        activityType: 'Cybersécurité & Cloud Computing',
        officeNumber: 'Bureau A-102 (Pépinière TIC)',
        surfaceArea: 30,
        status: 'approved',
      });

      // 3. Create Contracts (based on Articles 2, 6, 7)
      // Contract 1: 45m² at 55 DT/m²/an
      const annualRent1 = 45 * 55; // 2475 DT HT
      const monthlyRent1HT = annualRent1 / 12; // 206.25 DT
      const monthlyRent1TTC = monthlyRent1HT * 1.19; // 245.437 DT
      const deposit1 = monthlyRent1TTC * 2; // 490.875 DT

      const contract1 = await Contract.create({
        contractNumber: 'CT-S2T-2026-0042',
        client: client1._id,
        companyName: client1.companyName,
        spaceNumber: 'Bureau B-204',
        surface: 45,
        ratePerM2: 55, // Art. 6
        annualRentHT: annualRent1,
        monthlyRentHT: Math.round(monthlyRent1HT * 1000) / 1000,
        monthlyRentTTC: Math.round(monthlyRent1TTC * 1000) / 1000,
        depositAmount: Math.round(deposit1 * 1000) / 1000,
        depositPaid: true,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2026-05-31'), // renewal in ~2 months
        status: 'actif',
        amendments: [
          {
            amendmentNumber: 'AV-CT-S2T-2026-0042-1',
            type: 'augmentation_superficie',
            description: 'Avenant suite à extension de surface de 35m² à 45m²',
            oldSurface: 35,
            newSurface: 45,
            status: 'approuve',
            effectiveDate: new Date('2026-01-01'),
          },
        ],
      });

      // Contract 2: 30m² at 30 DT/m²/an (Tarif 1ère année pépinière Art. 6)
      const annualRent2 = 30 * 30; // 900 DT HT
      const monthlyRent2HT = annualRent2 / 12; // 75 DT
      const monthlyRent2TTC = monthlyRent2HT * 1.19; // 89.25 DT
      const deposit2 = monthlyRent2TTC * 2;

      const contract2 = await Contract.create({
        contractNumber: 'CT-S2T-2026-0089',
        client: client2._id,
        companyName: client2.companyName,
        spaceNumber: 'Bureau A-102 (Pépinière)',
        surface: 30,
        ratePerM2: 30,
        annualRentHT: annualRent2,
        monthlyRentHT: monthlyRent2HT,
        monthlyRentTTC: Math.round(monthlyRent2TTC * 1000) / 1000,
        depositAmount: Math.round(deposit2 * 1000) / 1000,
        depositPaid: true,
        startDate: new Date('2026-01-15'),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // In 20 days -> triggers renewal alert (< 30j)!
        status: 'actif',
      });

      // 4. Create Invoices with various statuses & reminders
      // Invoice 1: Paid (InnovTech)
      await Invoice.create({
        invoiceNumber: 'FAC-S2T-2026-0101',
        client: client1._id,
        contract: contract1._id,
        companyName: client1.companyName,
        invoiceType: 'loyer_mensuel',
        description: 'Loyer & charges locatives d\'hébergement - Janvier 2026',
        periodMonth: 'Janvier 2026',
        amountHT: 206.25,
        tvaRate: 19,
        tvaAmount: 39.188,
        timbreFiscal: 1.0,
        amountTTC: 246.438,
        amountPaid: 246.438,
        remainingAmount: 0,
        status: 'payee',
        issueDate: new Date('2026-01-01'),
        dueDate: new Date('2026-01-05'),
        paymentDate: new Date('2026-01-04'),
        paymentMethod: 'ordre_permanent',
      });

      // Invoice 2: Unpaid with J+15 reminder (InnovTech)
      await Invoice.create({
        invoiceNumber: 'FAC-S2T-2026-0145',
        client: client1._id,
        contract: contract1._id,
        companyName: client1.companyName,
        invoiceType: 'loyer_mensuel',
        description: 'Loyer & charges locatives d\'hébergement - Février 2026',
        periodMonth: 'Février 2026',
        amountHT: 206.25,
        tvaRate: 19,
        tvaAmount: 39.188,
        timbreFiscal: 1.0,
        amountTTC: 246.438,
        amountPaid: 0,
        remainingAmount: 246.438,
        status: 'impayee',
        issueDate: new Date('2026-02-01'),
        dueDate: new Date('2026-02-05'),
        reminders: [
          {
            type: 'J+15',
            sentDate: new Date('2026-02-20'),
            message: 'Première relance automatique à J+15 (Échéance dépassée)',
            status: 'envoye',
          },
        ],
      });

      // Invoice 3: Sent (CloudTunisia)
      await Invoice.create({
        invoiceNumber: 'FAC-S2T-2026-0188',
        client: client2._id,
        contract: contract2._id,
        companyName: client2.companyName,
        invoiceType: 'loyer_mensuel',
        description: 'Loyer hébergement Pépinière TIC - Mars 2026',
        periodMonth: 'Mars 2026',
        amountHT: 75.0,
        tvaRate: 19,
        tvaAmount: 14.25,
        timbreFiscal: 1.0,
        amountTTC: 90.25,
        amountPaid: 0,
        remainingAmount: 90.25,
        status: 'envoyee',
        issueDate: new Date('2026-03-01'),
        dueDate: new Date('2026-03-05'),
      });

      console.log('✅ Démonstration S2T initialisée avec succès !');
    } else {
      adminUser = await User.findOne({ role: 'admin' });
      client1 = await User.findOne({ email: 'client@s2t.tn' });
      client2 = await User.findOne({ email: 'startup@s2t.tn' });

      // Auto-approve demo clients if they were pending
      if (client1 && client1.status !== 'approved') {
        client1.status = 'approved';
        await client1.save();
      }
      if (client2 && client2.status !== 'approved') {
        client2.status = 'approved';
        await client2.save();
      }
    }

    // 5. Check and seed Emails if none exist
    const emailCount = await Email.countDocuments();
    if (emailCount === 0 && adminUser && client1) {
      console.log('📬 Initialisation de la messagerie officielle S2T...');

      await Email.create([
        {
          sender: adminUser._id,
          senderName: 'Direction Juridique S2T',
          senderEmail: 'juridique@s2t.tn',
          senderRole: 'admin',
          recipient: client1._id,
          recipientName: `${client1.name} (${client1.companyName})`,
          recipientEmail: client1.email,
          subject: 'Avenant n°1 au Contrat d\'Hébergement — Validation & Prise d\'effet',
          body: `Cher Résident,\n\nNous avons le plaisir de vous informer que la Direction Juridique et Financière de Smart Tunisian Technoparks (S2T) a validé votre demande d'avenant n° AV-CT-S2T-2026-0042-1 relative à l'augmentation de la superficie de votre espace hébergé (passage de 35 m² à 45 m²).\n\nConformément à l'Article 6 du Règlement Intérieur du Pôle Technologique El Ghazala, le nouveau barème locatif prendra effet à compter de la prochaine échéance mensuelle.\n\nVous trouverez en pièce jointe l'exemplaire numérique certifié de votre avenant.\n\nCordialement,\nService Juridique & Relations Entreprises\nSociété de Gestion du Pôle Technologique El Ghazala`,
          category: 'juridique',
          tag: 'Juridique',
          tagColor: '#2563EB',
          readBy: [adminUser._id],
          starredBy: [client1._id],
          deletedBy: [],
          attachments: [
            {
              name: 'Avenant_AV-CT-S2T-2026-0042-1_Signe.pdf',
              size: '420 Ko',
              fileType: 'application/pdf',
            },
          ],
          threadId: 'th-juridique-001',
          createdAt: new Date(Date.now() - 3 * 3600 * 1000), // 3 hours ago
        },
        {
          sender: adminUser._id,
          senderName: 'Service Facturation & Recouvrement S2T',
          senderEmail: 'facturation@s2t.tn',
          senderRole: 'admin',
          recipient: client1._id,
          recipientName: `${client1.name} (${client1.companyName})`,
          recipientEmail: client1.email,
          subject: 'Quittance de Paiement & Facture Mensuelle — Réf: FAC-S2T-2026-0101',
          body: `Madame, Monsieur,\n\nNous accusons bonne réception du règlement de votre redevance locative pour le Bureau B-204 au titre du mois écoulé d'un montant total de 246,438 DT TTC (virement permanent exécuté).\n\nVotre quittance libératoire est désormais disponible dans votre dossier d'hébergement et téléchargeable ci-dessous.\n\nBien à vous,\nDirection Financière S2T`,
          category: 'facturation',
          tag: 'Facturation',
          tagColor: '#10B981',
          readBy: [adminUser._id],
          starredBy: [],
          deletedBy: [],
          attachments: [
            {
              name: 'Quittance_Officielle_FAC-2026-0101.pdf',
              size: '280 Ko',
              fileType: 'application/pdf',
            },
          ],
          threadId: 'th-facturation-001',
          createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000), // 2 days ago
        },
        {
          sender: adminUser._id,
          senderName: 'Direction Technique & Infrastructure S2T',
          senderEmail: 'support-tech@s2t.tn',
          senderRole: 'admin',
          recipient: client1._id,
          recipientName: `${client1.name} (${client1.companyName})`,
          recipientEmail: client1.email,
          subject: 'Maintenance préventive réseau Fibre Optique & 5G Pôle El Ghazala',
          body: `Chers résidents du Pôle Technologique El Ghazala,\n\nDans le cadre de l'optimisation continue de l'infrastructure Très Haut Débit du technopark, une intervention technique est prévue ce samedi de 02h00 à 04h00 du matin.\n\nUne bascule automatique vers notre boucle de secours optique garantira la continuité de service pour l'ensemble des serveurs et accès cloud.\n\nMerci de votre compréhension,\nL'équipe Infrastructure Réseau S2T`,
          category: 'technique',
          tag: 'Technique',
          tagColor: '#F59E0B',
          readBy: [adminUser._id, client1._id],
          starredBy: [client1._id],
          deletedBy: [],
          attachments: [],
          threadId: 'th-tech-001',
          createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000), // 5 days ago
        },
        {
          sender: client1._id,
          senderName: `${client1.name} (${client1.companyName})`,
          senderEmail: client1.email,
          senderRole: 'client',
          recipient: adminUser._id,
          recipientName: 'Direction Juridique S2T',
          recipientEmail: 'juridique@s2t.tn',
          subject: 'Demande de réservation — Salle Polyvalente Ibn Khaldoun',
          body: `Bonjour,\n\nNous sollicitons la mise à disposition de la Salle Polyvalente Ibn Khaldoun pour la matinée du 15 Octobre 2026 (de 09h00 à 13h00) avec équipement de visioconférence.\n\nMerci de nous confirmer la disponibilité du créneau.\n\nCordialement,\nÉquipe InnovTech Solutions`,
          category: 'reservation',
          tag: 'Réservation',
          tagColor: '#06B6D4',
          readBy: [client1._id, adminUser._id],
          starredBy: [],
          deletedBy: [],
          attachments: [],
          threadId: 'th-reservation-001',
          createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
        },
      ]);

      console.log('✅ Emails officiels S2T créés avec succès !');
    }

    // 6. Seed Notifications if empty
    const notifCount = await Notification.countDocuments();
    if (notifCount === 0 && adminUser && client1) {
      console.log('🌱 Initialisation des notifications système S2T...');

      // Resident notifications
      await Notification.create([
        {
          recipient: client1._id,
          recipientEmail: client1.email,
          recipientRole: 'client',
          type: 'redevance',
          category: 'Réglementaire',
          severity: 'warning',
          title: 'Alerte Échéance de Redevance Locative (Article 6.3)',
          description: 'La redevance locative pour le Bureau B-204 (246,438 DT TTC) arrive à échéance le 05/10/2026.',
          actionText: 'Consulter la facture',
          actionLink: '/dashboard',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 3600 * 1000),
        },
        {
          recipient: client1._id,
          recipientEmail: client1.email,
          recipientRole: 'client',
          type: 'avenant',
          category: 'Juridique',
          severity: 'success',
          title: 'Avenant n°1 Validé par la Direction Juridique S2T',
          description: 'Votre demande d\'augmentation de surface locative (35 m² ➔ 45 m²) a été scellée et approuvée.',
          actionText: 'Voir mon contrat',
          actionLink: '/dashboard',
          isRead: false,
          createdAt: new Date(Date.now() - 24 * 3600 * 1000),
        },
        {
          recipient: client1._id,
          recipientEmail: client1.email,
          recipientRole: 'client',
          type: 'contrat',
          category: 'Contrat',
          severity: 'info',
          title: 'Préavis de Renouvellement de Contrat d\'Hébergement (Article 2)',
          description: 'Votre contrat d\'hébergement arrive à son terme dans 58 jours. Pensez à confirmer votre reconduction tacite.',
          actionText: 'Détails du contrat',
          actionLink: '/dashboard',
          isRead: true,
          createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        },
        {
          recipient: client1._id,
          recipientEmail: client1.email,
          recipientRole: 'client',
          type: 'relance',
          category: 'Recouvrement',
          severity: 'danger',
          title: 'Rappel de Relance J+15 sur Facture FAC-S2T-2026-0145',
          description: 'Relance automatique enregistrée pour la redevance de Février 2026. Veuillez régulariser le solde.',
          actionText: 'Régulariser paiement',
          actionLink: '/dashboard',
          isRead: true,
          createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000),
        },
        {
          recipient: client1._id,
          recipientEmail: client1.email,
          recipientRole: 'client',
          type: 'technique',
          category: 'Technique',
          severity: 'info',
          title: 'Optimisation de la Boucle Fibre Optique 5G S2T',
          description: 'Déploiement des nouvelles bornes Wi-Fi 6E dans le bâtiment El Ghazala 1 ce vendredi à 18h00.',
          actionText: 'Consulter le courrier',
          actionLink: '/email',
          isRead: true,
          createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000),
        },
      ]);

      // Admin notifications
      await Notification.create([
        {
          recipient: adminUser._id,
          recipientEmail: adminUser.email,
          recipientRole: 'admin',
          type: 'avenant',
          category: 'Juridique',
          severity: 'warning',
          title: 'Nouvelle Demande d\'Avenant Déposée',
          description: 'InnovTech Solutions SARL a déposé une demande d\'avenant (Extension de surface 35m² ➔ 45m²).',
          actionText: 'Examiner l\'avenant',
          actionLink: '/dashboard',
          isRead: false,
          createdAt: new Date(Date.now() - 3 * 3600 * 1000),
        },
        {
          recipient: adminUser._id,
          recipientEmail: adminUser.email,
          recipientRole: 'admin',
          type: 'email',
          category: 'Correspondance',
          severity: 'info',
          title: 'Nouveau Courrier Résident Reçu',
          description: 'Karim Ben Salem (InnovTech Solutions) a transmis une demande de réservation de la Salle Polyvalente.',
          actionText: 'Lire le courrier',
          actionLink: '/email',
          isRead: false,
          createdAt: new Date(Date.now() - 6 * 3600 * 1000),
        },
        {
          recipient: adminUser._id,
          recipientEmail: adminUser.email,
          recipientRole: 'admin',
          type: 'paiement',
          category: 'Facturation',
          severity: 'info',
          title: 'Justificatif de Règlement Transmis',
          description: 'InnovTech Solutions SARL a transmis un avis d\'ordre de virement pour la facture FAC-S2T-2026-0101.',
          actionText: 'Valider paiement',
          actionLink: '/dashboard',
          isRead: true,
          createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        },
        {
          recipient: adminUser._id,
          recipientEmail: adminUser.email,
          recipientRole: 'admin',
          type: 'contrat',
          category: 'Contrat',
          severity: 'danger',
          title: 'Alerte Expiration Contrat (< 30 jours)',
          description: 'La convention d\'hébergement de CloudTunisia SAS (CT-S2T-2026-0089) arrive à échéance dans 20 jours.',
          actionText: 'Consulter contrat',
          actionLink: '/dashboard',
          isRead: false,
          createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
        },
      ]);

      console.log('✅ Notifications système S2T créées avec succès !');
    }

    // Seed Chat Messages if none exist
    const chatCount = await ChatMessage.countDocuments();
    if (chatCount === 0) {
      const clientUser = await User.findOne({ email: 'client@s2t.tn' });
      const adminUsr = await User.findOne({ email: 'admin@s2t.tn' });

      if (clientUser && adminUsr) {
        await ChatMessage.create([
          // Juridique
          {
            channelId: 'juridique',
            channelType: 'department',
            department: 'Direction Juridique S2T',
            sender: adminUsr._id,
            senderName: 'Direction Juridique S2T',
            senderRole: 'admin',
            senderEmail: adminUsr.email,
            recipient: clientUser._id,
            recipientEmail: clientUser.email,
            companyName: clientUser.companyName,
            text: 'Bonjour ! Bienvenue sur le canal direct de la Direction Juridique S2T Pôle El Ghazala. Comment pouvons-nous vous assister aujourd\'hui ?',
            isRead: true,
            createdAt: new Date(Date.now() - 25 * 60 * 1000),
          },
          {
            channelId: 'juridique',
            channelType: 'department',
            department: 'Direction Juridique S2T',
            sender: clientUser._id,
            senderName: `${clientUser.name} (${clientUser.companyName})`,
            senderRole: 'client',
            senderEmail: clientUser.email,
            recipient: adminUsr._id,
            recipientEmail: adminUsr.email,
            companyName: clientUser.companyName,
            text: 'Bonjour Maître, nous avons déposé une demande d\'avenant pour agrandir notre bureau à 45m². Pouvez-vous nous confirmer la prise d\'effet ?',
            isRead: true,
            createdAt: new Date(Date.now() - 20 * 60 * 1000),
          },
          {
            channelId: 'juridique',
            channelType: 'department',
            department: 'Direction Juridique S2T',
            sender: adminUsr._id,
            senderName: 'Direction Juridique S2T',
            senderRole: 'admin',
            senderEmail: adminUsr.email,
            recipient: clientUser._id,
            recipientEmail: clientUser.email,
            companyName: clientUser.companyName,
            text: 'Votre avenant a bien été validé et scellé par notre direction ! La nouvelle superficie est effective pour la prochaine facture mensuelle.',
            isRead: true,
            createdAt: new Date(Date.now() - 15 * 60 * 1000),
          },

          // Facturation
          {
            channelId: 'facturation',
            channelType: 'department',
            department: 'Service Facturation & Recouvrement',
            sender: adminUsr._id,
            senderName: 'Service Facturation & Recouvrement',
            senderRole: 'admin',
            senderEmail: adminUsr.email,
            recipient: clientUser._id,
            recipientEmail: clientUser.email,
            companyName: clientUser.companyName,
            text: 'Bonjour, Service Comptabilité et Recouvrement S2T à votre écoute pour toute question relative aux redevances, virements STB et quittances de loyer.',
            isRead: true,
            createdAt: new Date(Date.now() - 24 * 3600 * 1000),
          },
          {
            channelId: 'facturation',
            channelType: 'department',
            department: 'Service Facturation & Recouvrement',
            sender: clientUser._id,
            senderName: `${clientUser.name} (${clientUser.companyName})`,
            senderRole: 'client',
            senderEmail: clientUser.email,
            recipient: adminUsr._id,
            recipientEmail: adminUsr.email,
            companyName: clientUser.companyName,
            text: 'Merci Leila, notre virement de 245,437 DT a bien été exécuté ce matin.',
            isRead: true,
            createdAt: new Date(Date.now() - 22 * 3600 * 1000),
          },
          {
            channelId: 'facturation',
            channelType: 'department',
            department: 'Service Facturation & Recouvrement',
            sender: adminUsr._id,
            senderName: 'Service Facturation & Recouvrement',
            senderRole: 'admin',
            senderEmail: adminUsr.email,
            recipient: clientUser._id,
            recipientEmail: clientUser.email,
            companyName: clientUser.companyName,
            text: 'Paiement rapproché avec succès ! Votre quittance libératoire certifiée est téléchargeable dans l\'espace Facturation.',
            isRead: true,
            createdAt: new Date(Date.now() - 20 * 3600 * 1000),
          },

          // Technique
          {
            channelId: 'technique',
            channelType: 'department',
            department: 'Support Technique & Bâtiment',
            sender: adminUsr._id,
            senderName: 'Support Technique & Bâtiment',
            senderRole: 'admin',
            senderEmail: adminUsr.email,
            recipient: clientUser._id,
            recipientEmail: clientUser.email,
            companyName: clientUser.companyName,
            text: 'Support Infrastructure Pôle El Ghazala : nous traitons les demandes d\'accès réseau, fibre optique, badges RFID et maintenance des espaces.',
            isRead: true,
            createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
          },

          // IA Assistant
          {
            channelId: 'ia_assistant',
            channelType: 'ia',
            department: 'Assistant Réglementaire IA S2T',
            senderName: 'Assistant IA S2T',
            senderRole: 'ai',
            senderEmail: 'ai@s2t.tn',
            recipient: clientUser._id,
            recipientEmail: clientUser.email,
            companyName: clientUser.companyName,
            text: 'Bonjour ! Je suis l\'Assistant IA officiel de Smart Tunisian Technoparks (S2T). Je peux vous renseigner instantanément sur les 16 articles de la convention, les tarifs au m² (Art. 6), les cautions STB (Art. 7) ou les réservations de salles.',
            isRead: true,
            isAi: true,
            createdAt: new Date(Date.now() - 10 * 60 * 1000),
          },
        ]);
        console.log('✅ Messages Chat S2T initialisés avec succès !');
      }
    }

    // 8. Seed Initial Meeting Bookings (Reunions & Salles S2T)
    const reunionCount = await Reunion.countDocuments();
    if (reunionCount === 0) {
      const clientUser = await User.findOne({ email: 'client@s2t.tn' });
      const adminUsr = await User.findOne({ email: 'admin@s2t.tn' });

      const today = new Date();
      const nextWeekDate1 = new Date(today.getTime() + 3 * 24 * 3600 * 1000);
      const nextWeekDate2 = new Date(today.getTime() + 8 * 24 * 3600 * 1000);
      const nextWeekDate3 = new Date(today.getTime() + 12 * 24 * 3600 * 1000);

      const d1Str = nextWeekDate1.toISOString().split('T')[0];
      const d2Str = nextWeekDate2.toISOString().split('T')[0];
      const d3Str = nextWeekDate3.toISOString().split('T')[0];

      const fmt = (d) =>
        new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(d);

      await Reunion.create([
        {
          title: "Comité de Pilotage & Revue d'Hébergement Q4",
          room: 'Salle Innovation & Pitch B-101',
          roomId: 'room-2',
          date: d1Str,
          formattedDate: fmt(nextWeekDate1),
          startTime: '10:00',
          endTime: '11:30',
          organizer: 'Direction S2T & InnovTech Solutions',
          organizerEmail: clientUser ? clientUser.email : 'client@s2t.tn',
          organizerCompany: 'InnovTech Solutions SARL',
          organizerUser: clientUser ? clientUser._id : undefined,
          participants: 6,
          isVisio: true,
          visioLink: 'https://meet.s2t.tn/el-ghazala-copil-q4',
          needCoffee: true,
          equipment: ['Double Écran Visio', 'Tableau Interactif', 'Caméra Cadrage Auto 4K', 'Connexion Fibre'],
          notes: 'Revue contractuelle trimestrielle et suivi des indicateurs R&D.',
          status: 'confirme',
        },
        {
          title: 'Session Technique Partenaires & Démo Produit IA',
          room: 'Salle Polyvalente Ibn Khaldoun',
          roomId: 'room-1',
          date: d2Str,
          formattedDate: fmt(nextWeekDate2),
          startTime: '14:00',
          endTime: '16:30',
          organizer: 'InnovTech Solutions (Résident)',
          organizerEmail: clientUser ? clientUser.email : 'client@s2t.tn',
          organizerCompany: 'InnovTech Solutions SARL',
          organizerUser: clientUser ? clientUser._id : undefined,
          participants: 28,
          isVisio: true,
          visioLink: 'https://meet.s2t.tn/demo-innovtech-2026',
          needCoffee: true,
          equipment: ['Écran 4K 85"', 'Réseau Fibre 5G Dédié', 'Système Son & Micros', 'Visioconférence Teams/Zoom'],
          notes: 'Présentation de la solution IA aux grands comptes et investisseurs.',
          status: 'confirme',
        },
        {
          title: 'Atelier Brainstorming & Architecture Cloud Microservices',
          room: 'Espace Brainstorming Pépinière TIC',
          roomId: 'room-3',
          date: d3Str,
          formattedDate: fmt(nextWeekDate3),
          startTime: '09:30',
          endTime: '12:00',
          organizer: 'Équipe R&D & Direction Technique S2T',
          organizerEmail: adminUsr ? adminUsr.email : 'admin@s2t.tn',
          organizerCompany: 'Smart Tunisian Technoparks (S2T)',
          organizerUser: adminUsr ? adminUsr._id : undefined,
          participants: 8,
          isVisio: false,
          visioLink: '',
          needCoffee: false,
          equipment: ['Écran Collaboratif', 'Paperboard Numérique', 'Wi-Fi 6 Haut Débit'],
          notes: 'Session de conception des architectures de données hébergées.',
          status: 'confirme',
        },
      ]);
      console.log('✅ Salles de réunion et réservations S2T initialisées avec succès !');
    }
  } catch (err) {
    console.error('❌ Erreur lors du peuplement de la base :', err.message);
  }
};

