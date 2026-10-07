import { GoogleGenerativeAI } from '@google/generative-ai';

// S2T Knowledge Base System Instructions for Gemini
const S2T_SYSTEM_INSTRUCTION = `
Vous êtes l'Assistant Réglementaire IA officiel de Smart Tunisian Technoparks (S2T), Pôle Technologique El Ghazala.
Votre mission est de répondre en temps réel avec précision, clarté et professionnalisme aux questions des entreprises résidentes et des startups hébergées dans le technopark.

=== CADRE JURIDIQUE & RÉGLEMENTAIRE (BASE DE CONNAISSANCES OFFICIELLE) ===
1. LOI RÉGISSANTE :
   - Loi n° 2001-50 du 3 mai 2001 modifiée par la Loi n° 2006-37 relative aux parcs technologiques en Tunisie.
   - Régime juridique : Contrat d'hébergement d'entreprises TIC / R&D (Article 4 de la Convention). Ce n'est PAS un bail commercial (Loi du 25 mai 1977 exclue).
   - Interdiction formelle de sous-location, cession ou mise à disposition de tiers (Article 12).

2. BARÈME OFFICIEL DES REDEVANCES LOCATIVES (ARTICLE 6) :
   - 1ère Année (Régime Pépinière / Startup) : 30,000 DT HTVA / m² / an
   - 2ème Année (Pépinière) : 55,000 DT HTVA / m² / an
   - 3ème Année & Régime Standard : 75,000 DT HTVA / m² / an
   - Fiscalité : TVA légale de 19% + Droit de timbre fiscal de 1.000 DT par facture.
   - Échéance de paiement : Exigible d'avance avant le cinquième (5ème) jour de chaque mois (Article 6.3).
   - Quittance libératoire : Délivrée automatiquement après règlement et rapprochement comptable (Article 6.6).

3. DÉPÔT DE GARANTIE / CAUTION (ARTICLE 7) :
   - Montant : Équivalent à deux (2) mois de redevance locative mensuelle TTC.
   - Versement : À la signature du contrat sur le compte officiel S2T :
     * Banque : STB (Société Tunisienne de Banque) - Agence Ariana Nord
     * RIB Officiel Caution : 08 026011 0830000062 89
   - Restitution : Remboursée intégralement sous 2 mois maximum après libération complète des locaux et inventaire contradictoire d'état des lieux (Article 7.2).

4. RÈGLEMENT DES FACTURES DE LOYER & CHARGES :
   - Modes acceptés : Virement bancaire STB (RIB Facturation : 10 005 0830000 000000 45), Carte bancaire en ligne, Ordre permanent de prélèvement, ou Espèces en régie (Bureau A-102 Bâtiment Administratif S2T).

5. AVENANTS & MODIFICATION DE SURFACE (ARTICLE 11) :
   - Toute demande d'extension ou de réduction de superficie de bureau nécessite un avenant contractuel écrit et signé par la Direction S2T et l'hébergé.
   - La demande s'effectue en ligne via l'espace "Contrats" du portail S2T.

6. RÉSILIATION & PRÉAVIS (ARTICLES 8 & 9) :
   - Résiliation par l'hébergé : Préavis écrit d'un (1) mois par Lettre Recommandée avec Accusé de Réception (LRAR).
   - Résiliation de plein droit : En cas d'impayé persistant ou d'abandon des locaux supérieur à 2 mois (Article 8.4).
   - Évacuation des locaux : Restitution en parfait état d'usage sous inventaire contradictoire (Article 9).

7. RÉSERVATION DES SALLES DE RÉUNION (ARTICLE 2.c) :
   - Salle Ibn Khaldoun (Amphithéâtre / Grandes conférences)
   - Salle Innovation & R&D (Réunions de travail et comités)
   - Salle de Formation Multimédia
   - Réservation directe en temps réel depuis le module "Réunions" du tableau de bord.

8. SERVICES INCLUS DANS LA REDEVANCE (ARTICLE 2) :
   - Connexion Internet Très Haut Débit Fibre Optique dédiée
   - Électricité, Climatisation / Chauffage centralisé, Eau
   - Accueil, secrétariat, boîte postale et réception des colis
   - Sécurité, surveillance vidéo et gardiennage 24/7
   - Badges d'accès biométriques RFID 24/7 pour les collaborateurs de l'entreprise résidente.

=== CONSIGNES DE RÉPONSE ===
- Répondez TOUJOURS en français soigné, professionnel, encourageant et structuré (avec des puces •, des titres en gras, et des émojis professionnels).
- Soyez précis sur les numéros d'articles du contrat et les montants légaux.
- Si une question concerne un sujet hors du cadre de S2T, du Pôle El Ghazala ou des contrats/services du technopark, recentrez poliment la discussion sur les démarches et services du Pôle S2T.
- Personnalisez la réponse en vous adressant courtoisement à l'entreprise résidente.
`;

// Initialize Google Gemini Client if GEMINI_API_KEY is available
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    return null;
  }
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    return genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: S2T_SYSTEM_INSTRUCTION,
    });
  } catch (err) {
    console.error('Erreur initialisation Google Gemini:', err.message);
    return null;
  }
};

/**
 * Enhanced Fallback Engine (S2T Expert Local Engine)
 */
const generateLocalExpertResponse = (userText, userName, companyName) => {
  const q = (userText || '').toLowerCase().trim();

  // 1. Tarifs, loyers, prix au m2, redevance
  if (q.includes('tarif') || q.includes('loyer') || q.includes('prix') || q.includes('redevance') || q.includes('montant') || q.includes('combien') || q.includes('barème') || q.includes('bareme') || q.includes('m²') || q.includes('metre')) {
    return `📌 **Barème officiel des Redevances Locatives S2T (Article 6 de la Convention)** :
• **1ère Année (Régime Pépinière / Startup)** : 30,000 DT HTVA / m² / an
• **2ème Année (Pépinière)** : 55,000 DT HTVA / m² / an
• **3ème Année / Régime Standard** : 75,000 DT HTVA / m² / an

⚖️ **Dispositions Fiscales & Modalités** :
• **TVA légale** : 19% applicable sur la redevance.
• **Droit de timbre fiscal** : 1.000 DT par facture émise.
• **Échéance** : Payable mensuellement d'avance avant le **cinquième (5ème) jour de chaque mois** (Art. 6.3).
• **Quittance libératoire** : Délivrée en téléchargement PDF certifié dès validation du paiement.`;
  }

  // 2. Caution, dépot de garantie, rib stb
  if (q.includes('caution') || q.includes('garantie') || q.includes('depot') || q.includes('dépôt') || q.includes('stb') || q.includes('ariana')) {
    return `🛡️ **Dépôt de Garantie & Caution (Article 7 de la Convention S2T)** :
Conformément à l'Article 7, l'entreprise hébergée verse à la signature un dépôt de garantie égal à **deux (2) mois de redevance mensuelle TTC**.

🏦 **Coordonnées Bancaires Officielles STB** :
• **Banque** : STB (Société Tunisienne de Banque) - Agence Ariana Nord
• **RIB Officiel Caution S2T** : \`08 026011 0830000062 89\`
• **Restitution** : Remboursement intégral garanti sous **deux (2) mois** après libération des locaux et inventaire contradictoire d'état des lieux (Art. 7.2).`;
  }

  // 3. Avenant, surface, agrandir, réduire, superficie
  if (q.includes('avenant') || q.includes('surface') || q.includes('agrandir') || q.includes('superficie') || q.includes('reduire') || q.includes('réduire') || q.includes('changer bureau') || q.includes('extension')) {
    return `📈 **Modification de Superficie & Demande d'Avenant (Article 11)** :
Toute modification de superficie (extension de bureau ou réduction) nécessite la conclusion d'un **avenant écrit signé par les deux parties** (Art. 11).

📝 **Procédure à suivre** :
1. Rendez-vous dans le menu **Contrats** de votre espace résident S2T.
2. Cliquez sur **Demande d'avenant de superficie**.
3. Choisissez le nouveau métrage souhaité et joignez votre note de motivation.
4. Dès approbation par la Direction S2T, le loyer au prorata temporis est automatiquement actualisé.`;
  }

  // 4. Résiliation, départ, préavis, fin de contrat
  if (q.includes('resiliation') || q.includes('résiliation') || q.includes('quitter') || q.includes('preavis') || q.includes('préavis') || q.includes('partir') || q.includes('fin contrat')) {
    return `⚖️ **Procédure de Résiliation & Préavis (Articles 8 & 9 du Contrat)** :
1. **Préavis d'un (1) mois** : L'hébergé peut résilier le contrat en observant un préavis d'un mois notifié par Lettre Recommandée avec Accusé de Réception (LRAR) adressée à la Direction S2T.
2. **Clause résolutoire** : En cas de manquement aux obligations ou d'abandon non justifié supérieur à 2 mois, la convention est résiliée de plein droit (Art. 8.4).
3. **Libération des locaux** : L'hébergé évacue tous ses équipements et restitue les badges d'accès lors de l'état des lieux contradictoire (Art. 9).`;
  }

  // 5. Cadre légal, Loi 2001-50, statut, bail commercial, sous-location
  if (q.includes('loi') || q.includes('reglement') || q.includes('règlement') || q.includes('statut') || q.includes('bail') || q.includes('2001') || q.includes('sous-location') || q.includes('juridique')) {
    return `🏛️ **Cadre Juridique Officiel (Loi n° 2001-50 & Article 4)** :
• **Législation** : Le Technopark S2T El Ghazala est régi par la **Loi n° 2001-50 du 3 mai 2001** (modifiée par la Loi n° 2006-37).
• **Nature du contrat** : Convention d'hébergement d'entreprises TIC / R&D. Les dispositions du décret-loi sur les baux commerciaux (Loi du 25 mai 1977) ne s'appliquent pas (Art. 4).
• **Exclusivité** : Toute cession, sous-location ou mise à disposition de locaux à des tiers est strictement interdite sous peine de résiliation immédiate (Art. 12).`;
  }

  // 6. Salles de réunion, réservation, Ibn Khaldoun, Innovation, formation
  if (q.includes('salle') || q.includes('reunion') || q.includes('réunion') || q.includes('formation') || q.includes('evenement') || q.includes('conférence') || q.includes('khaldoun') || q.includes('innovation')) {
    return `🤝 **Accès & Réservation des Salles de Réunion (Article 2.c)** :
Dans le cadre de votre hébergement S2T, vous bénéficiez d'un accès privilégié aux espaces mutualisés :
• **Salle Ibn Khaldoun** : Capacité 120 places (Conférences, Keynotes & Présentations)
• **Salle Innovation & R&D** : 25 places équipées visioconférence HD
• **Salle de Formation Multimédia** : Postes connectés et écran interactif

📅 **Réservation immédiate** : Vous pouvez vérifier les disponibilités et bloquer un créneau directement dans l'onglet **Réunions** du menu latéral.`;
  }

  // 7. Services inclus, fibre optique, internet, climatisation, badge rfid, gardiennage
  if (q.includes('fibre') || q.includes('internet') || q.includes('badge') || q.includes('clim') || q.includes('electricite') || q.includes('électricité') || q.includes('technique') || q.includes('gardiennage') || q.includes('service')) {
    return `🔌 **Services Inclus & Prestations Techniques S2T (Article 2)** :
Votre contrat d'hébergement comprend l'ensemble des commodités :
• **Fibre Optique Dédiée** : Connexion Très Haut Débit sécurisée par redondance.
• **Badges d'accès biométriques & RFID** : Accès sécurisé 24h/24 et 7j/7 aux bâtiments.
• **Fluides & Énergie** : Climatisation centrale réversible, éclairage et électricité inclus.
• **Sécurité & Accueil** : Gardiennage physique 24/7, vidéosurveillance et accueil postal.`;
  }

  // 8. Factures, paiement, quittances, RIB virement
  if (q.includes('facture') || q.includes('quittance') || q.includes('paiement') || q.includes('payer') || q.includes('rib') || q.includes('virement') || q.includes('reglement') || q.includes('règlement')) {
    return `💳 **Règlement des Factures & Quittances Libératoires S2T** :
Vous pouvez régler vos redevances en ligne ou par virement :
1. **Virement Bancaire STB** :
   • **Compte Facturation S2T** : RIB \`10 005 0830000 000000 45\`
2. **Paiement par Carte Bancaire** (Validation instantanée dans l'onglet Factures)
3. **Ordre Permanent de Prélèvement** bancaire
4. **Espèces en régie** (Bureau A-102 Bâtiment Direction S2T).

📄 Dès rapprochement bancaire, votre **quittance libératoire certifiée** est téléchargeable en format PDF sécurisé (Art. 6.6).`;
  }

  // 9. Réclamations, incident, maintenance, panne
  if (q.includes('reclamation') || q.includes('réclamation') || q.includes('incident') || q.includes('panne') || q.includes('maintenance') || q.includes('probleme') || q.includes('problème')) {
    return `🛠️ **Support Technique & Réclamations Résidents S2T** :
Pour toute demande d'intervention technique (climatisation, connectivité, badge d'accès ou éclairage) :
1. Créez un ticket dans l'onglet **Réclamations** avec le niveau d'urgence.
2. Une équipe technique d'astreinte S2T intervient sous **2 heures ouvrées**.
3. Vous pouvez également échanger en direct avec la Direction S2T via le canal de chat "Direction S2T".`;
  }

  // 10. Salutations
  if (q.includes('bonjour') || q.includes('salut') || q.includes('hello') || q.includes('bonsoir') || q.includes('aide') || q === '') {
    return `Bonjour ${userName || 'Cher Résident'} (${companyName || 'Entreprise S2T'}) ! 
Je suis votre **Assistant Réglementaire IA S2T**, disponible 24/7 pour vous renseigner en temps réel sur :
• Le barème officiel des redevances locatives au m² (Article 6)
• La caution et le RIB STB Ariana Nord (Article 7)
• Les démarches d'avenant de superficie (Article 11)
• La réservation des Salles Ibn Khaldoun & Innovation (Article 2.c)
• Le cadre juridique de la Loi n° 2001-50

Comment puis-je vous assister aujourd'hui ?`;
  }

  // 11. Hors-sujet ou question générale
  return `Bonjour ${userName || 'Cher Résident'}. En tant qu'**Assistant Réglementaire IA officiel de Smart Tunisian Technoparks (S2T)**, mon expertise est dédiée au Pôle Technologique El Ghazala, à la convention d'hébergement (16 Articles), à la Loi 2001-50, ainsi qu'aux services du technopark (loyers, cautions STB, avenants, réservation de salles et support technique).

N'hésitez pas à me poser une question précise sur vos contrats, tarifs locatifs, factures ou sur les services du Pôle S2T !`;
};

/**
 * Generate AI Response in Real-time using Gemini 1.5 Flash (with fallback)
 */
export const askGeminiAssistant = async (userText, userName = 'Résident', companyName = 'Entreprise S2T') => {
  const geminiModel = getGeminiModel();

  if (geminiModel) {
    try {
      const prompt = `L'entreprise résidente "${companyName}" (Contact: ${userName}) pose la question suivante concernant le Pôle Technologique S2T El Ghazala :\n\n"${userText}"\n\nRépondez avec précision et professionnalisme selon les règles et la base de connaissances de la Convention S2T.`;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (err) {
      console.warn('⚠️ Google Gemini API call fallback to local engine:', err.message);
    }
  }

  // Seamless fallback to ultra-precise S2T Knowledge Engine
  return generateLocalExpertResponse(userText, userName, companyName);
};
