import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { contractAPI, invoiceAPI, authAPI } from '../services/api';
import LegalArticlesModal from '../components/LegalArticlesModal';
import { 
  Building2, 
  Receipt, 
  Scale, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Send, 
  FileText, 
  Download, 
  Eye, 
  Filter, 
  Search, 
  RefreshCw, 
  Bell, 
  Calendar, 
  X, 
  ShieldCheck, 
  CreditCard, 
  UserCheck, 
  UserX, 
  Check, 
  XCircle, 
  Users, 
  FileCheck, 
  ExternalLink, 
  Banknote, 
  Wallet, 
  LayoutGrid, 
  List, 
  Copy, 
  Sparkles, 
  ArrowUpRight, 
  SlidersHorizontal, 
  Tag, 
  Building,
  BookOpen
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const dateLocale = language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR';
  const isAdmin = user?.role === 'admin' || user?.role === 'juridique' || user?.role === 'finance';

  const [activeTab, setActiveTab] = useState('factures'); // 'factures' | 'contrats' | 'approbations'
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [uncontractedResidents, setUncontractedResidents] = useState([]);
  const [isCustomCompany, setIsCustomCompany] = useState(false);
  const [loading, setLoading] = useState(true);

  // Legal Articles Modal State
  const [showLegalArticlesModal, setShowLegalArticlesModal] = useState(false);
  const [articleContractContext, setArticleContractContext] = useState(null);

  // Filters, Search & View Mode
  const [invoiceFilter, setInvoiceFilter] = useState('all'); // 'all' | 'pending' | 'impayee' | 'payee'
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceViewMode, setInvoiceViewMode] = useState('table'); // 'table' | 'cards'
  const [copiedId, setCopiedId] = useState(null);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReasonPreset, setRejectionReasonPreset] = useState('Montant non concordant avec le relevé bancaire STB ou somme incomplète.');
  const [customRejectionText, setCustomRejectionText] = useState('');

  // Modals
  const [showContractModal, setShowContractModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedInvoiceToPay, setSelectedInvoiceToPay] = useState(null);
  const [selectedReceiptInvoice, setSelectedReceiptInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Forms
  const [paymentForm, setPaymentForm] = useState({
    method: 'carte', // 'carte' | 'virement' | 'especes' | 'ordre_permanent'
    cardNumber: '4532 9012 3456 7890',
    cardHolder: '',
    expiry: '12/28',
    cvv: '889',
    transferRef: 'VIR-S2T-2026-001',
    receiptFile: '',
    receiptFileName: '',
    cashPayerName: '',
    cashReceiptRef: '',
    cashNotes: '',
  });

  const [newContractData, setNewContractData] = useState({
    clientId: '',
    companyName: '',
    spaceNumber: 'Bureau B-204',
    surface: 40,
    ratePerM2: 55, // Art. 6
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [newInvoiceData, setNewInvoiceData] = useState({
    contractId: '',
    clientId: '',
    companyName: '',
    invoiceType: 'loyer_mensuel',
    description: '',
    amountHT: 220,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const [amendmentData, setAmendmentData] = useState({
    type: 'augmentation_superficie',
    newSurface: 50,
    description: 'Extension suite à recrutement de nouveaux ingénieurs',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const [statsRes, invoicesRes, contractsRes, pendingRes, uncontractedRes] = await Promise.all([
          invoiceAPI.getStats(),
          invoiceAPI.getAll(),
          contractAPI.getAll(),
          authAPI.getPendingUsers().catch(() => ({ data: [] })),
          contractAPI.getUncontractedResidents().catch(() => ({ data: [] })),
        ]);
        setStats(statsRes.data);
        setInvoices(invoicesRes.data);
        setContracts(contractsRes.data);
        setPendingUsers(pendingRes.data || []);
        setUncontractedResidents(uncontractedRes.data || []);
      } else {
        const [statsRes, invoicesRes, contractsRes] = await Promise.all([
          invoiceAPI.getStats(),
          invoiceAPI.getAll(),
          contractAPI.getAll(),
        ]);
        setStats(statsRes.data);
        setInvoices(invoicesRes.data);
        setContracts(contractsRes.data);
      }
    } catch (err) {
      console.error('Erreur chargement données', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenContractModal = async () => {
    try {
      const res = await contractAPI.getUncontractedResidents();
      const list = res.data || [];
      setUncontractedResidents(list);
      setIsCustomCompany(list.length === 0);
      setNewContractData({
        clientId: '',
        companyName: '',
        spaceNumber: 'Bureau B-204',
        surface: 40,
        ratePerM2: 55,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
    } catch (e) {
      console.error(e);
      setIsCustomCompany(true);
    }
    setShowContractModal(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveResident = async (userId, companyName) => {
    try {
      await authAPI.approveUser(userId);
      alert(`La candidature de l'entreprise "${companyName}" a été approuvée avec succès ! L'accès du résident est maintenant activé.`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'approbation du compte.');
    }
  };

  const handleRejectResident = async (userId, companyName) => {
    const reason = prompt(`Motif du refus pour la candidature de "${companyName}" :`, 'Dossier non conforme aux critères d\'éligibilité TIC (Loi n°2001-50).');
    if (reason === null) return;
    try {
      await authAPI.rejectUser(userId, reason);
      alert(`La candidature de l'entreprise "${companyName}" a été refusée.`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du rejet de la candidature.');
    }
  };

  const handleSendReminder = async (invoiceId, type) => {
    try {
      await invoiceAPI.sendReminder(invoiceId, type);
      alert(`Relance ${type} envoyée avec succès à l'entreprise.`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de l\'envoi de la relance');
    }
  };

  const handlePaymentRecord = async (invoiceId, totalAmount) => {
    try {
      await invoiceAPI.updatePayment(invoiceId, {
        amountPaid: totalAmount,
        paymentMethod: 'ordre_permanent',
        status: 'payee',
      });
      alert('Paiement enregistré avec succès !');
      fetchData();
    } catch (err) {
      alert('Erreur enregistrement paiement');
    }
  };

  const handleCreateContract = async (e) => {
    e.preventDefault();
    try {
      await contractAPI.create(newContractData);
      setShowContractModal(false);
      alert('Contrat d\'hébergement établi avec succès !');
      fetchData();
    } catch (err) {
      alert('Erreur création contrat');
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await invoiceAPI.create(newInvoiceData);
      setShowInvoiceModal(false);
      alert('Facture émise avec succès et transmise au résident !');
      fetchData();
    } catch (err) {
      alert('Erreur création facture');
    }
  };

  const handleOpenInvoiceModal = () => {
    const firstContract = contracts[0];
    setNewInvoiceData({
      contractId: firstContract?._id || '',
      clientId: firstContract?.client?._id || firstContract?.client || '',
      companyName: firstContract?.companyName || '',
      invoiceType: 'loyer_mensuel',
      description: firstContract ? `Loyer mensuel convention S2T — Contrat N° ${firstContract.contractNumber}` : 'Loyer mensuel hébergement S2T',
      amountHT: firstContract?.monthlyRentHT || 220,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setShowInvoiceModal(true);
  };

  const handleGenerateInvoiceForContract = async (contract) => {
    try {
      const res = await invoiceAPI.generateFromContract(contract._id);
      alert(res.data?.message || `Facture générée avec succès pour "${contract.companyName}" et envoyée au résident !`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la génération de la facture.');
    }
  };

  const handleOpenPaymentModal = (invoice) => {
    setSelectedInvoiceToPay(invoice);
    setPaymentForm({
      method: 'carte',
      cardNumber: '4532 9012 3456 7890',
      cardHolder: user?.name || user?.companyName || 'Représentant Entreprise',
      expiry: '12/28',
      cvv: '889',
      transferRef: `VIR-STB-${invoice.invoiceNumber}`,
      receiptFile: '',
      receiptFileName: '',
      cashPayerName: user?.name || '',
      cashReceiptRef: `REC-ESP-${invoice.invoiceNumber}`,
      cashNotes: '',
    });
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoiceToPay) return;
    try {
      setPaymentProcessing(true);
      if (paymentForm.method === 'virement') {
        // Bank transfer / versement: Send receipt to S2T Financial Administration for approval
        await invoiceAPI.updatePayment(selectedInvoiceToPay._id, {
          paymentMethod: 'virement',
          status: 'en_attente_validation',
          transferReference: paymentForm.transferRef || `VIR-${selectedInvoiceToPay.invoiceNumber}`,
          receiptFile: paymentForm.receiptFile || paymentForm.receiptFileName || 'recu_versement_stb.pdf',
        });
        setShowPaymentModal(false);
        alert(`Le reçu de versement pour la facture "${selectedInvoiceToPay.invoiceNumber}" a été transmis avec succès à l'administration financière S2T ! Votre règlement sera validé après vérification du compte bancaire.`);
      } else if (paymentForm.method === 'especes') {
        // Cash payment on-site at S2T revenue desk (Régie des recettes Bureau A-102)
        const payer = paymentForm.cashPayerName || user?.name || user?.companyName || 'Déposant Entreprise';
        const ref = paymentForm.cashReceiptRef || `ESP-${selectedInvoiceToPay.invoiceNumber}`;
        await invoiceAPI.updatePayment(selectedInvoiceToPay._id, {
          paymentMethod: 'especes',
          status: 'en_attente_validation',
          transferReference: `Paiement en espèces sur place par ${payer} (Réf: ${ref})`,
          receiptFile: paymentForm.receiptFile || paymentForm.receiptFileName || 'decharge_especes_s2t.pdf',
        });
        setShowPaymentModal(false);
        alert(`Votre demande de confirmation de paiement en espèces pour la facture "${selectedInvoiceToPay.invoiceNumber}" a été envoyée avec succès à l'administration financière S2T ! L'administrateur confirmera l'encaissement suite à votre passage à la Régie S2T.`);
      } else if (paymentForm.method === 'ordre_permanent') {
        // Direct debit / Ordre permanent confirmation request
        const ref = paymentForm.transferRef || `PRELEV-S2T-${selectedInvoiceToPay.invoiceNumber}`;
        await invoiceAPI.updatePayment(selectedInvoiceToPay._id, {
          paymentMethod: 'ordre_permanent',
          status: 'en_attente_validation',
          transferReference: `Ordre permanent conventionné S2T (Réf: ${ref})`,
          receiptFile: paymentForm.receiptFile || paymentForm.receiptFileName || 'ordre_permanent_s2t.pdf',
        });
        setShowPaymentModal(false);
        alert(`Votre demande de confirmation de prélèvement automatique pour la facture "${selectedInvoiceToPay.invoiceNumber}" a été transmise à la Direction Financière S2T !`);
      } else {
        // Instant Card payment
        await invoiceAPI.updatePayment(selectedInvoiceToPay._id, {
          amountPaid: selectedInvoiceToPay.amountTTC,
          paymentMethod: 'carte',
          status: 'payee',
        });
        setShowPaymentModal(false);
        alert(`Paiement de ${selectedInvoiceToPay.amountTTC.toFixed(3)} DT validé avec succès ! Votre quittance officielle de loyer est disponible.`);
      }
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du traitement du règlement.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleApprovePayment = async (invoiceId) => {
    try {
      const inv = invoices.find(i => i._id === invoiceId) || selectedReceiptInvoice;
      if (!inv) return;
      await invoiceAPI.updatePayment(invoiceId, {
        amountPaid: inv.amountTTC,
        status: 'payee',
      });
      setShowReceiptModal(false);
      alert(`Paiement de la facture "${inv.invoiceNumber}" (${inv.companyName}) validé avec succès par la Direction Financière S2T ! La quittance de loyer a été émise.`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la validation du paiement.');
    }
  };

  const handleRejectReceipt = async (invoiceId, explicitReason) => {
    let reason = explicitReason;
    if (!reason) {
      if (rejectionReasonPreset === 'autre') {
        reason = customRejectionText.trim() || 'Justificatif non conforme.';
      } else {
        reason = rejectionReasonPreset;
      }
    }
    try {
      await invoiceAPI.updatePayment(invoiceId, {
        status: 'impayee',
        rejectionReason: reason,
      });
      setShowReceiptModal(false);
      setIsRejecting(false);
      setCustomRejectionText('');
      alert(`Le justificatif a été rejeté. L'entreprise résidente a été notifiée du motif : "${reason}".`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du rejet du justificatif.');
    }
  };

  const handleRequestAmendment = async (e) => {
    e.preventDefault();
    try {
      if (!selectedContract) return;
      await contractAPI.requestAmendment(selectedContract._id, amendmentData);
      setShowAmendmentModal(false);
      alert('Demande d\'avenant transmise au service juridique S2T !');
      fetchData();
    } catch (err) {
      alert('Erreur soumission avenant');
    }
  };

  const handleApproveAmendment = async (contractId, amendmentId, action) => {
    try {
      await contractAPI.handleAmendment(contractId, amendmentId, action);
      alert(`Avenant ${action === 'approuve' ? 'validé et contrat recalculé' : 'rejeté'} !`);
      fetchData();
    } catch (err) {
      alert('Erreur traitement avenant');
    }
  };

  const getCompanyInitials = (name) => {
    if (!name) return 'S2T';
    const clean = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase() || 'S2T';
  };

  const getAvatarGradient = (name) => {
    const gradients = [
      'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
      'linear-gradient(135deg, #E11D48 0%, #F59E0B 100%)',
      'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
      'linear-gradient(135deg, #059669 0%, #06B6D4 100%)',
      'linear-gradient(135deg, #D97706 0%, #E11D48 100%)',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const handleCopyInvoiceNumber = (num, e) => {
    e?.stopPropagation();
    navigator.clipboard?.writeText(num);
    setCopiedId(num);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status, method) => {
    switch (status) {
      case 'payee':
        return (
          <span className="status-badge-modern payee">
            <span className="status-pulse-dot" style={{ color: '#10B981' }}></span>
            <span>{t('status_payee')}</span>
          </span>
        );
      case 'en_attente_validation':
        if (method === 'especes') {
          return (
            <span className="status-badge-modern" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <Banknote size={12} />
              <span>{t('status_cash_confirm')}</span>
            </span>
          );
        }
        if (method === 'ordre_permanent') {
          return (
            <span className="status-badge-modern" style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#2563EB', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <Scale size={12} />
              <span>{t('status_debit_pending')}</span>
            </span>
          );
        }
        return (
          <span className="status-badge-modern en_attente_validation">
            <span className="status-pulse-dot" style={{ color: '#D97706' }}></span>
            <span>{t('status_pending_validation')}</span>
          </span>
        );
      case 'payee_partiellement':
        return (
          <span className="status-badge-modern" style={{ background: 'rgba(245, 158, 11, 0.14)', color: '#D97706', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <span className="status-pulse-dot" style={{ color: '#D97706' }}></span>
            <span>{t('status_partial')}</span>
          </span>
        );
      case 'impayee':
        return (
          <span className="status-badge-modern impayee">
            <span className="status-pulse-dot" style={{ color: '#F43F5E' }}></span>
            <span>{t('status_unpaid')}</span>
          </span>
        );
      case 'envoyee':
        return (
          <span className="status-badge-modern envoyee">
            <span className="status-pulse-dot" style={{ color: '#0284C7' }}></span>
            <span>{t('status_sent')}</span>
          </span>
        );
      default:
        return <span className="badge badge-brouillon">{status}</span>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <div className="dashboard-header-banner">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className="badge" style={{ background: isAdmin ? 'var(--primary-light)' : 'var(--secondary-light)', color: isAdmin ? 'var(--s2t-red)' : 'var(--s2t-blue)' }}>
              {isAdmin ? t('dash_badge_admin') : t('dash_badge_client')}
            </span>
          </div>
          <h1 className="dashboard-header-title">
            {isAdmin ? t('dash_title_admin') : `${t('dash_title_client_prefix')}${user?.companyName || user?.name || ''}`}
          </h1>
          <p className="dashboard-header-subtitle">
            {isAdmin
              ? t('dash_sub_admin')
              : t('dash_sub_client')}
          </p>
        </div>

        <div className="dashboard-header-actions">
          {isAdmin && (
            <>
              <button onClick={handleOpenContractModal} className="btn btn-secondary btn-sm" style={{ gap: '0.4rem' }}>
                <Scale size={16} color="var(--s2t-red)" />
                <span>{t('dash_btn_new_contract')}</span>
              </button>
              <button onClick={handleOpenInvoiceModal} className="btn btn-primary btn-sm" style={{ gap: '0.4rem' }}>
                <Plus size={16} />
                <span>{t('dash_btn_issue_invoice')}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Financial KPIs Banner */}
      {stats && (
        <div className="dashboard-kpi-grid">
          {/* Prévisionnel Mensuel */}
          <div className="glass-card dashboard-kpi-card">
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                {t('dash_kpi_forecast')}
              </span>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--secondary-light)', color: 'var(--s2t-blue)' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div className="dashboard-kpi-val" style={{ color: 'var(--text-primary)' }}>
              {stats.monthlyForecast.toFixed(3)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('dash_kpi_currency_ttc')}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {t('dash_kpi_active_contracts').replace('{n}', stats.activeContractsCount)}
            </p>
          </div>

          {/* Renouvellements < 30j */}
          <div className="glass-card dashboard-kpi-card" style={{ border: stats.expiringContractsCount > 0 ? '1px solid var(--s2t-red)' : '1px solid var(--border-color)' }}>
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                {t('dash_kpi_renewals_30d')}
              </span>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--s2t-red)' }}>
                <Clock size={18} />
              </div>
            </div>
            <div className="dashboard-kpi-val" style={{ color: stats.expiringContractsCount > 0 ? 'var(--s2t-red)' : 'var(--text-primary)' }}>
              {stats.expiringContractsCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('dash_kpi_contracts_unit')}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {t('dash_kpi_expiring_soon')}
            </p>
          </div>

          {/* Reste à payer / Impayés */}
          <div className="glass-card dashboard-kpi-card">
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                {t('dash_kpi_unpaid')}
              </span>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: 'var(--s2t-red)' }}>
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="dashboard-kpi-val" style={{ color: 'var(--s2t-red)' }}>
              {stats.totalUnpaid.toFixed(3)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('dash_kpi_currency')}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {t('dash_kpi_pending_reminders').replace('{n}', stats.pendingRemindersCount)}
            </p>
          </div>

          {/* Total Encaissé */}
          <div className="glass-card dashboard-kpi-card">
            <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                {t('dash_kpi_collected')}
              </span>
              <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--accent-light)', color: 'var(--s2t-teal)' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="dashboard-kpi-val" style={{ color: 'var(--s2t-teal)' }}>
              {stats.totalCollected.toFixed(3)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t('dash_kpi_currency')}</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              {t('dash_kpi_total_invoiced').replace('{n}', stats.totalInvoiced.toFixed(3))}
            </p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="dashboard-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab('factures')}
          className={`btn dashboard-tab-btn ${activeTab === 'factures' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ gap: '0.5rem' }}
        >
          <Receipt size={17} />
          <span>{t('dash_tab_invoices').replace('{n}', invoices.length)}</span>
          {isAdmin && invoices.filter(i => i.status === 'en_attente_validation').length > 0 && (
            <span className="badge" style={{ background: '#D97706', color: '#fff', fontSize: '0.72rem', padding: '0.15rem 0.5rem', fontWeight: 800 }}>
              {t('dash_tab_receipts_to_validate').replace('{n}', invoices.filter(i => i.status === 'en_attente_validation').length)}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contrats')}
          className={`btn dashboard-tab-btn ${activeTab === 'contrats' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ gap: '0.5rem' }}
        >
          <Scale size={17} />
          <span>{t('dash_tab_contracts').replace('{n}', contracts.length)}</span>
        </button>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('approbations')}
            className={`btn dashboard-tab-btn ${activeTab === 'approbations' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ gap: '0.5rem' }}
          >
            <UserCheck size={17} />
            <span>{t('dash_tab_approvals')}</span>
            {pendingUsers.length > 0 && (
              <span className="badge badge-impayee" style={{ padding: '0.15rem 0.5rem', fontSize: '0.72rem' }}>
                {t('dash_tab_pending_count').replace('{n}', pendingUsers.length)}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          <RefreshCw className="spin" size={32} color="var(--s2t-red)" style={{ margin: '0 auto 1rem' }} />
          <p>{t('dash_loading_data')}</p>
          <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : activeTab === 'factures' ? (
        /* Invoices Table & Receipt Verification Section */
        <div className="modern-table-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
          {/* Header Title */}
          <div className="flex-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.15)', color: 'var(--s2t-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={16} />
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{t('dash_inv_section_title')}</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                {isAdmin
                  ? t('dash_inv_section_sub_admin')
                  : t('dash_inv_section_sub_client')}
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(255, 255, 255, 0.04)', padding: '0.3rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <Clock size={13} />
              <span>{t('dash_inv_due_legal_note')}</span>
            </span>
          </div>

          {/* Admin Alert Banner when Receipts are Pending */}
          {isAdmin && invoices.filter(i => i.status === 'en_attente_validation').length > 0 && (
            <div style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(217, 119, 6, 0.08) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
              gap: '0.75rem',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.22)',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileCheck size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{t('dash_inv_alert_receipts_title').replace('{n}', invoices.filter(i => i.status === 'en_attente_validation').length)}</span>
                    <span className="badge" style={{ background: '#D97706', color: '#fff', fontSize: '0.7rem', padding: '0.15rem 0.45rem', fontWeight: 800 }}>{t('dash_inv_alert_action_req')}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {t('dash_inv_alert_desc')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setInvoiceFilter('pending');
                  const firstPending = invoices.find(i => i.status === 'en_attente_validation');
                  if (firstPending) {
                    setSelectedReceiptInvoice(firstPending);
                    setShowReceiptModal(true);
                  }
                }}
                className="btn btn-primary btn-sm"
                style={{
                  background: '#D97706',
                  borderColor: '#D97706',
                  gap: '0.45rem',
                  fontWeight: 700,
                  padding: '0.5rem 1rem',
                  boxShadow: '0 0 12px rgba(217, 119, 6, 0.3)'
                }}
              >
                <Eye size={15} />
                <span>{t('dash_inv_btn_examine_receipts').replace('{n}', invoices.filter(i => i.status === 'en_attente_validation').length)}</span>
              </button>
            </div>
          )}

          {/* Filters & Search Toolbar */}
          <div className="dashboard-filter-toolbar" style={{ paddingBottom: '1.1rem', borderBottom: '1px solid var(--border-color)' }}>
            {/* Status Pills */}
            <div className="dashboard-filter-group">
              <button
                type="button"
                onClick={() => setInvoiceFilter('all')}
                className={`btn btn-sm ${invoiceFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: '8px' }}
              >
                {t('dash_filter_all').replace('{n}', invoices.length)}
              </button>
              <button
                type="button"
                onClick={() => setInvoiceFilter('pending')}
                className={`btn btn-sm ${invoiceFilter === 'pending' ? 'btn-primary' : 'btn-ghost'}`}
                style={{
                  fontSize: '0.78rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '8px',
                  color: invoiceFilter === 'pending' ? '#fff' : invoices.filter(i => i.status === 'en_attente_validation').length > 0 ? '#D97706' : undefined,
                  borderColor: invoiceFilter === 'pending' ? '#D97706' : undefined,
                  background: invoiceFilter === 'pending' ? '#D97706' : invoices.filter(i => i.status === 'en_attente_validation').length > 0 ? 'rgba(245, 158, 11, 0.12)' : undefined,
                  fontWeight: invoices.filter(i => i.status === 'en_attente_validation').length > 0 ? 700 : 500
                }}
              >
                <span>{t('dash_filter_pending_receipts')}</span>
                {invoices.filter(i => i.status === 'en_attente_validation').length > 0 && (
                  <span style={{
                    marginLeft: '0.4rem',
                    padding: '0.1rem 0.45rem',
                    borderRadius: '10px',
                    background: invoiceFilter === 'pending' ? '#fff' : '#D97706',
                    color: invoiceFilter === 'pending' ? '#D97706' : '#fff',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}>
                    {invoices.filter(i => i.status === 'en_attente_validation').length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setInvoiceFilter('impayee')}
                className={`btn btn-sm ${invoiceFilter === 'impayee' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: '8px' }}
              >
                {t('dash_filter_unpaid').replace('{n}', invoices.filter(i => ['impayee', 'envoyee'].includes(i.status)).length)}
              </button>
              <button
                type="button"
                onClick={() => setInvoiceFilter('payee')}
                className={`btn btn-sm ${invoiceFilter === 'payee' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', borderRadius: '8px' }}
              >
                {t('dash_filter_paid').replace('{n}', invoices.filter(i => i.status === 'payee').length)}
              </button>
            </div>

            {/* Search Input */}
            <div className="dashboard-search-wrapper">
              <Search size={14} style={{ position: 'absolute', left: isRtl ? 'auto' : '0.85rem', right: isRtl ? '0.85rem' : 'auto', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={t('dash_search_placeholder')}
                className="form-input"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                style={{
                  paddingLeft: isRtl ? '0.85rem' : '2.3rem',
                  paddingRight: isRtl ? (invoiceSearch ? '2rem' : '2.3rem') : (invoiceSearch ? '2rem' : '0.85rem'),
                  height: '38px',
                  fontSize: '0.84rem',
                  borderRadius: '10px'
                }}
              />
              {invoiceSearch && (
                <button
                  onClick={() => setInvoiceSearch('')}
                  style={{ position: 'absolute', right: isRtl ? 'auto' : '0.6rem', left: isRtl ? '0.6rem' : 'auto', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  title={t('dash_search_clear')}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Render Invoices Cards Grid */}
          {(() => {
            const filteredInvoices = invoices.filter((inv) => {
              if (invoiceFilter === 'pending' && inv.status !== 'en_attente_validation') return false;
              if (invoiceFilter === 'impayee' && !['impayee', 'envoyee'].includes(inv.status)) return false;
              if (invoiceFilter === 'payee' && inv.status !== 'payee') return false;

              if (invoiceSearch.trim()) {
                const q = invoiceSearch.toLowerCase();
                const matchNum = inv.invoiceNumber?.toLowerCase().includes(q);
                const matchComp = inv.companyName?.toLowerCase().includes(q);
                const matchDesc = inv.description?.toLowerCase().includes(q);
                const matchRef = inv.transferReference?.toLowerCase().includes(q);
                const matchMonth = inv.periodMonth?.toLowerCase().includes(q);
                if (!matchNum && !matchComp && !matchDesc && !matchRef && !matchMonth) return false;
              }

              return true;
            });

            if (filteredInvoices.length === 0) {
              return (
                <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.04)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', border: '1px solid var(--border-color)' }}>
                    <Receipt size={28} />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    {t('dash_no_inv_found')}
                  </h4>
                  <p style={{ fontSize: '0.85rem', maxWidth: '420px', margin: '0 auto 1.25rem' }}>
                    {invoiceSearch ? t('dash_no_inv_search_res').replace('{q}', invoiceSearch) : t('dash_no_inv_category')}
                  </p>
                  {(invoiceSearch || invoiceFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setInvoiceSearch('');
                        setInvoiceFilter('all');
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ borderRadius: '8px' }}
                    >
                      {t('dash_btn_reset_filters')}
                    </button>
                  )}
                </div>
              );
            }

            return (
              <div className="responsive-cards-grid">
                {filteredInvoices.map((inv) => {
                  const isPendingReceipt = inv.status === 'en_attente_validation';
                  const isOverdue = inv.remainingAmount > 0 && new Date(inv.dueDate) < new Date();
                  const initials = getCompanyInitials(inv.companyName);
                  const avatarGrad = getAvatarGradient(inv.companyName);

                  return (
                    <div
                      key={inv._id}
                      className={`invoice-mobile-card ${isPendingReceipt ? 'card-pending' : ''}`}
                    >
                      {/* Header: Company Avatar + Name + N° + Status Badge */}
                      <div className="invoice-mobile-card-header">
                        <div className="company-cell">
                          <div className="company-avatar" style={{ background: avatarGrad }}>
                            {initials}
                          </div>
                          <div className="company-meta">
                            <span className="company-name">{inv.companyName || t('sidebar_role_client')}</span>
                            <div
                              className="invoice-tag"
                              onClick={(e) => handleCopyInvoiceNumber(inv.invoiceNumber, e)}
                              title={t('dash_inv_copy_tooltip')}
                              style={{ cursor: 'pointer', padding: '0.15rem 0.5rem', fontSize: '0.74rem' }}
                            >
                              <Receipt size={12} />
                              <span>{inv.invoiceNumber}</span>
                              {copiedId === inv.invoiceNumber ? (
                                <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 800 }}>{t('dash_inv_copied')}</span>
                              ) : (
                                <Copy size={10} style={{ opacity: 0.6 }} />
                              )}
                            </div>
                          </div>
                        </div>
                        <div>{getStatusBadge(inv.status, inv.paymentMethod)}</div>
                      </div>

                      {/* Body: Description + Reference + Metrics Grid + Due Date */}
                      <div className="invoice-mobile-card-body">
                        <div>
                          <div style={{ fontSize: '0.86rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.35 }}>
                            {inv.description || t('dash_inv_default_desc')}
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                            <div className="period-pill">
                              <Calendar size={11} />
                              <span>{inv.periodMonth}</span>
                            </div>

                            {inv.transferReference && (
                              <span className="company-ref-chip" title={`Réf: ${inv.transferReference}`}>
                                Réf: {inv.transferReference}
                              </span>
                            )}
                          </div>

                          {inv.rejectionReason && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--s2t-red)', background: 'rgba(244, 63, 94, 0.1)', padding: '0.35rem 0.6rem', borderRadius: '6px', marginTop: '0.45rem', fontWeight: 600, border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                              {t('dash_inv_refused_prefix')}{inv.rejectionReason}
                            </div>
                          )}
                        </div>

                        {/* Financial Metrics Box */}
                        <div className="invoice-metrics-box">
                          <div className="invoice-metric-item">
                            <span className="invoice-metric-label">{t('dash_inv_amount_ttc_label')}</span>
                            <span className="amount-ttc" style={{ fontSize: '1.05rem' }}>
                              {inv.amountTTC?.toFixed(3)} <span className="amount-currency">{t('dash_kpi_currency')}</span>
                            </span>
                          </div>

                          <div className="invoice-metric-item">
                            <span className="invoice-metric-label">{t('dash_inv_remaining_label')}</span>
                            {inv.remainingAmount > 0 ? (
                              <span className="due-badge-unpaid" style={{ width: 'fit-content', marginTop: '0.1rem' }}>
                                {inv.remainingAmount?.toFixed(3)} {t('dash_kpi_currency')}
                              </span>
                            ) : (
                              <span className="due-badge-zero" style={{ width: 'fit-content', marginTop: '0.1rem' }}>
                                <CheckCircle2 size={12} />
                                <span>{t('dash_inv_settled_zero')}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Due Date Row */}
                        <div className="invoice-mobile-stat-row">
                          <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Clock size={13} />
                            <span>{t('dash_inv_legal_due_label')}</span>
                          </span>
                          <span style={{ fontSize: '0.82rem', color: isOverdue ? 'var(--s2t-red)' : 'var(--text-primary)', fontWeight: isOverdue ? 700 : 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span>{new Date(inv.dueDate).toLocaleDateString(dateLocale)}</span>
                            {isOverdue && (
                              <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(244, 63, 94, 0.15)', color: '#F43F5E', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                {t('dash_inv_overdue')}
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="invoice-mobile-card-footer">
                        <button
                          onClick={() => setPreviewInvoice(inv)}
                          className="btn btn-secondary btn-sm"
                          title={t('dash_inv_btn_pdf')}
                          style={{ padding: '0.38rem 0.75rem', fontSize: '0.78rem', gap: '0.35rem', borderRadius: '8px' }}
                        >
                          <Eye size={14} />
                          <span>{t('dash_inv_btn_pdf')}</span>
                        </button>

                        {/* Resident Client Actions */}
                        {!isAdmin && (
                          inv.status === 'en_attente_validation' ? (
                            <button
                              onClick={() => {
                                setSelectedReceiptInvoice(inv);
                                setShowReceiptModal(true);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{
                                fontSize: '0.74rem',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '8px',
                                color: inv.paymentMethod === 'especes' ? '#059669' : inv.paymentMethod === 'ordre_permanent' ? '#2563EB' : '#D97706',
                                borderColor: inv.paymentMethod === 'especes' ? 'rgba(16, 185, 129, 0.3)' : inv.paymentMethod === 'ordre_permanent' ? 'rgba(37, 99, 235, 0.3)' : 'rgba(217, 119, 6, 0.3)',
                                background: inv.paymentMethod === 'especes' ? 'rgba(16, 185, 129, 0.08)' : inv.paymentMethod === 'ordre_permanent' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                                gap: '0.35rem'
                              }}
                            >
                              {inv.paymentMethod === 'especes' ? <Banknote size={13} /> : inv.paymentMethod === 'ordre_permanent' ? <Scale size={13} /> : <Clock size={13} />}
                              <span>{inv.paymentMethod === 'especes' ? t('dash_inv_badge_cash_pending') : inv.paymentMethod === 'ordre_permanent' ? t('dash_inv_badge_debit_pending') : t('dash_inv_badge_receipt_review')}</span>
                            </button>
                          ) : inv.status === 'payee' ? (
                            <span className="due-badge-zero" style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}>
                              <CheckCircle2 size={13} />
                              <span>{t('dash_inv_badge_receipt_settled')}</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenPaymentModal(inv)}
                              className="btn btn-primary btn-sm"
                              style={{
                                fontSize: '0.76rem',
                                padding: '0.38rem 0.85rem',
                                borderRadius: '8px',
                                gap: '0.4rem',
                                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                                borderColor: '#10B981',
                                boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                              }}
                            >
                              <CreditCard size={14} />
                              <span>{t('dash_inv_btn_pay_online')}</span>
                            </button>
                          )
                        )}

                        {/* Admin Actions */}
                        {isAdmin && (
                          inv.status === 'en_attente_validation' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <button
                                onClick={() => {
                                  setSelectedReceiptInvoice(inv);
                                  setIsRejecting(false);
                                  setShowReceiptModal(true);
                                }}
                                className="btn btn-primary btn-sm"
                                style={{
                                  fontSize: '0.75rem',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '8px',
                                  background: inv.paymentMethod === 'especes' ? '#059669' : inv.paymentMethod === 'ordre_permanent' ? '#2563EB' : '#D97706',
                                  borderColor: inv.paymentMethod === 'especes' ? '#059669' : inv.paymentMethod === 'ordre_permanent' ? '#2563EB' : '#D97706',
                                  gap: '0.35rem',
                                  fontWeight: 700
                                }}
                                title={t('dash_inv_btn_verify_receipt')}
                              >
                                {inv.paymentMethod === 'especes' ? <Banknote size={14} /> : inv.paymentMethod === 'ordre_permanent' ? <Scale size={14} /> : <FileCheck size={14} />}
                                <span>{inv.paymentMethod === 'especes' ? t('dash_inv_btn_verify_cash') : inv.paymentMethod === 'ordre_permanent' ? t('dash_inv_btn_verify_debit') : t('dash_inv_btn_verify_receipt')}</span>
                              </button>
                              <button
                                onClick={() => handleApprovePayment(inv._id)}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderRadius: '8px', background: '#10B981', borderColor: '#10B981', gap: '0.3rem' }}
                                title={t('dash_inv_btn_approve')}
                              >
                                <Check size={14} />
                                <span>{t('dash_inv_btn_approve')}</span>
                              </button>
                            </div>
                          ) : inv.remainingAmount > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <button
                                onClick={() => handleSendReminder(inv._id, 'J+15')}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderRadius: '8px', color: 'var(--s2t-red)', borderColor: 'rgba(244, 63, 94, 0.3)' }}
                              >
                                {t('dash_inv_btn_reminder_15')}
                              </button>
                              <button
                                onClick={() => handlePaymentRecord(inv._id, inv.amountTTC)}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', borderRadius: '8px' }}
                              >
                                {t('dash_inv_btn_settle')}
                              </button>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      ) : activeTab === 'contrats' ? (
        /* Contracts Table & Management */
        <div className="modern-table-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(225, 29, 72, 0.15)', color: 'var(--s2t-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scale size={16} />
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{t('dash_contracts_title')}</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                {t('dash_contracts_sub')}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  setArticleContractContext(null);
                  setShowLegalArticlesModal(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{
                  gap: '0.4rem',
                  borderRadius: '8px',
                  color: 'var(--s2t-blue)',
                  borderColor: 'rgba(37, 99, 235, 0.3)',
                  background: 'rgba(37, 99, 235, 0.06)',
                  fontWeight: 600
                }}
                title={t('dash_contracts_btn_articles')}
              >
                <BookOpen size={15} />
                <span>{t('dash_contracts_btn_articles')}</span>
              </button>

              {isAdmin && (
                <button onClick={handleOpenContractModal} className="btn btn-primary btn-sm" style={{ gap: '0.4rem', borderRadius: '8px' }}>
                  <Plus size={16} />
                  <span>{t('dash_contracts_btn_new')}</span>
                </button>
              )}
            </div>
          </div>

          {contracts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
              <Scale size={42} color="var(--s2t-blue)" style={{ margin: '0 auto 0.85rem', opacity: 0.8 }} />
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {isAdmin ? t('dash_contracts_empty_admin_title') : t('dash_contracts_empty_client_title')}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 1.25rem' }}>
                {isAdmin 
                  ? t('dash_contracts_empty_admin_desc')
                  : t('dash_contracts_empty_client_desc')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setArticleContractContext(null);
                  setShowLegalArticlesModal(true);
                }}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.4rem', borderRadius: '8px', margin: '0 auto' }}
              >
                <BookOpen size={14} />
                <span>{t('dash_contracts_btn_consult_articles')}</span>
              </button>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Scale size={14} />
                        <span>{t('dash_th_contract_num')}</span>
                      </div>
                    </th>
                    <th>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building2 size={14} />
                        <span>{t('dash_th_resident_comp')}</span>
                      </div>
                    </th>
                    <th>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Building size={14} />
                        <span>{t('dash_th_space')}</span>
                      </div>
                    </th>
                    <th>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Tag size={14} />
                        <span>{t('dash_th_surface')}</span>
                      </div>
                    </th>
                    <th>{t('dash_th_rate_art6')}</th>
                    <th>{t('dash_th_rent_ttc')}</th>
                    <th>{t('dash_th_deposit_art7')}</th>
                    <th>{t('dash_th_expiry')}</th>
                    <th style={{ textAlign: isRtl ? 'left' : 'right' }}>{t('dash_th_actions_billing')}</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.map((c) => {
                    const contractInvoices = invoices.filter(inv =>
                      (inv.contract && (inv.contract === c._id || inv.contract?._id === c._id)) ||
                      (inv.companyName && inv.companyName.trim().toLowerCase() === c.companyName?.trim().toLowerCase())
                    );
                    const hasInvoice = contractInvoices.length > 0;
                    const initials = getCompanyInitials(c.companyName);
                    const avatarGrad = getAvatarGradient(c.companyName);

                    return (
                      <tr key={c._id}>
                        <td>
                          <div className="invoice-tag" style={{ color: 'var(--s2t-red)', background: 'rgba(225, 29, 72, 0.08)', borderColor: 'rgba(225, 29, 72, 0.2)' }}>
                            <Scale size={12} />
                            <span>{c.contractNumber}</span>
                          </div>
                        </td>
                        <td>
                          <div className="company-cell">
                            <div className="company-avatar" style={{ background: avatarGrad }}>
                              {initials}
                            </div>
                            <span className="company-name">{c.companyName}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.spaceNumber}</span>
                        </td>
                        <td>
                          <span className="badge badge-brouillon" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                            {c.surface} m²
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{c.ratePerM2} {t('dash_rate_unit')}</span>
                        </td>
                        <td>
                          <strong className="amount-ttc">{c.monthlyRentTTC?.toFixed(3)} <span className="amount-currency">{t('dash_kpi_currency')}</span></strong>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{c.depositAmount?.toFixed(3)} {t('dash_kpi_currency')}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Calendar size={12} />
                            <span>{new Date(c.endDate).toLocaleDateString(dateLocale)}</span>
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isRtl ? 'flex-start' : 'flex-end', gap: '0.45rem', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => {
                                setArticleContractContext({
                                  companyName: c.companyName,
                                  spaceNumber: c.spaceNumber,
                                  surface: c.surface,
                                  ratePerM2: c.ratePerM2,
                                  depositAmount: c.depositAmount,
                                  startDate: c.startDate,
                                  endDate: c.endDate
                                });
                                setShowLegalArticlesModal(true);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.3rem 0.6rem',
                                borderRadius: '8px',
                                color: 'var(--s2t-blue)',
                                borderColor: 'rgba(37, 99, 235, 0.3)',
                                background: 'rgba(37, 99, 235, 0.05)',
                                gap: '0.3rem'
                              }}
                              title={t('dash_contract_btn_articles')}
                            >
                              <BookOpen size={13} />
                              <span>{t('dash_contract_btn_articles')}</span>
                            </button>

                            {isAdmin && (
                              !hasInvoice ? (
                                <button
                                  onClick={() => handleGenerateInvoiceForContract(c)}
                                  className="btn btn-primary btn-sm"
                                  style={{
                                    fontSize: '0.75rem',
                                    padding: '0.32rem 0.65rem',
                                    borderRadius: '8px',
                                    gap: '0.35rem',
                                    background: 'var(--s2t-blue)',
                                    borderColor: 'var(--s2t-blue)',
                                    whiteSpace: 'nowrap',
                                    boxShadow: '0 0 10px rgba(37, 99, 235, 0.25)'
                                  }}
                                  title={t('dash_contract_btn_issue_inv')}
                                >
                                  <Send size={13} />
                                  <span>{t('dash_contract_btn_issue_inv')}</span>
                                </button>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <span
                                    className="due-badge-zero"
                                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                                    onClick={() => setActiveTab('factures')}
                                    title={t('dash_contract_invoiced_count').replace('{n}', contractInvoices.length)}
                                  >
                                    {t('dash_contract_invoiced_count').replace('{n}', contractInvoices.length)}
                                  </span>
                                  <button
                                    onClick={() => handleGenerateInvoiceForContract(c)}
                                    className="btn btn-ghost btn-sm"
                                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                                    title={t('dash_contract_btn_add_inv')}
                                  >
                                    {t('dash_contract_btn_add_inv')}
                                  </button>
                                </div>
                              )
                            )}

                            <button
                              onClick={() => {
                                setSelectedContract(c);
                                setShowAmendmentModal(true);
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', borderRadius: '8px' }}
                            >
                              {t('dash_contract_btn_amendment')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Display active amendments for validation if Admin */}
          {isAdmin && (
            <div style={{ marginTop: '2.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--s2t-red)' }}>
                {t('dash_amendments_pending_title')}
              </h4>
              {contracts.flatMap(c => c.amendments.filter(a => a.status === 'en_attente').map(a => ({ ...a, contractId: c._id, contractNumber: c.contractNumber }))).length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('dash_amendments_empty')}</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {contracts.flatMap(c => c.amendments.filter(a => a.status === 'en_attente').map(a => ({ ...a, contractId: c._id, contractNumber: c.contractNumber }))).map(amend => (
                    <div key={amend._id} className="modern-table-card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{amend.amendmentNumber}</strong> — {amend.description}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {t('dash_amendment_surface_label')}{amend.oldSurface} m² ➔ <strong style={{ color: 'var(--s2t-teal)' }}>{amend.newSurface} m²</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleApproveAmendment(amend.contractId, amend._id, 'approuve')}
                          className="btn btn-primary btn-sm"
                          style={{ borderRadius: '8px' }}
                        >
                          {t('dash_amendment_btn_approve')}
                        </button>
                        <button
                          onClick={() => handleApproveAmendment(amend.contractId, amend._id, 'rejete')}
                          className="btn btn-secondary btn-sm"
                          style={{ borderRadius: '8px' }}
                        >
                          {t('dash_amendment_btn_reject')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : activeTab === 'approbations' && isAdmin ? (
        /* Pending Resident Registrations Table */
        <div className="modern-table-card" style={{ padding: '1.5rem', overflow: 'hidden' }}>
          <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(225, 29, 72, 0.15)', color: 'var(--s2t-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={16} />
                </div>
                <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{t('dash_approvals_title')}</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                {t('dash_approvals_sub')}
              </p>
            </div>

            {pendingUsers.length > 0 && (
              <span className="due-badge-unpaid" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                {t('dash_approvals_pending_badge').replace('{n}', pendingUsers.length)}
              </span>
            )}
          </div>

          {pendingUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={42} color="#10B981" style={{ margin: '0 auto 0.75rem', opacity: 0.8 }} />
              <h4 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {t('dash_approvals_empty_title')}
              </h4>
              <p style={{ fontSize: '0.85rem' }}>
                {t('dash_approvals_empty_desc')}
              </p>
            </div>
          ) : (
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('dash_th_appr_company')}</th>
                    <th>{t('dash_th_appr_rep')}</th>
                    <th>{t('dash_th_appr_contact')}</th>
                    <th>{t('dash_th_appr_sector')}</th>
                    <th>{t('dash_th_appr_surface')}</th>
                    <th>{t('dash_th_appr_date')}</th>
                    <th>{t('dash_th_appr_status')}</th>
                    <th style={{ textAlign: isRtl ? 'left' : 'right' }}>{t('dash_th_appr_decision')}</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((candidate) => {
                    const initials = getCompanyInitials(candidate.companyName || candidate.name);
                    const avatarGrad = getAvatarGradient(candidate.companyName || candidate.name);

                    return (
                      <tr key={candidate._id}>
                        <td>
                          <div className="company-cell">
                            <div className="company-avatar" style={{ background: avatarGrad }}>
                              {initials}
                            </div>
                            <div className="company-meta">
                              <span className="company-name">{candidate.companyName || t('dash_appr_not_specified')}</span>
                              <span className="company-ref-chip">
                                {candidate.fiscalId ? `MF: ${candidate.fiscalId}` : t('dash_appr_no_mf')}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-primary)' }}>{candidate.name}</strong>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.86rem' }}>{candidate.email}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{candidate.phone || t('dash_appr_not_specified')}</div>
                        </td>
                        <td>
                          <span className="badge badge-brouillon" style={{ fontSize: '0.75rem' }}>
                            {candidate.activityType || t('dash_appr_default_sector')}
                          </span>
                        </td>
                        <td>
                          <strong>{candidate.surfaceArea || 35} m²</strong>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            {new Date(candidate.createdAt || Date.now()).toLocaleDateString(dateLocale)}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge-modern en_attente_validation">
                            <span className="status-pulse-dot" style={{ color: '#D97706' }}></span>
                            <span>{t('dash_appr_status_pending')}</span>
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isRtl ? 'flex-start' : 'flex-end', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => handleApproveResident(candidate._id, candidate.companyName || candidate.name)}
                              className="btn btn-primary btn-sm"
                              style={{ gap: '0.35rem', fontSize: '0.78rem', background: '#10B981', borderColor: '#10B981', borderRadius: '8px' }}
                              title={t('dash_appr_btn_approve')}
                            >
                              <Check size={14} />
                              <span>{t('dash_appr_btn_approve')}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRejectResident(candidate._id, candidate.companyName || candidate.name)}
                              className="btn btn-secondary btn-sm"
                              style={{ gap: '0.35rem', fontSize: '0.78rem', color: 'var(--s2t-red)', borderRadius: '8px' }}
                              title={t('dash_appr_btn_reject')}
                            >
                              <XCircle size={14} />
                              <span>{t('dash_appr_btn_reject')}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}

      {/* Modal: Create Contract */}
      {showContractModal && (
        <div className="modal-overlay" onClick={() => setShowContractModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(225, 29, 72, 0.1)', color: 'var(--s2t-red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Scale size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.18rem', margin: 0 }}>{t('modal_contract_title')}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t('modal_contract_sub')}</span>
                </div>
              </div>
              <button onClick={() => setShowContractModal(false)} className="btn btn-ghost"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateContract} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    {t('modal_contract_comp_label')}
                  </label>
                  {uncontractedResidents.length > 0 && !isCustomCompany && (
                    <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-full)' }}>
                      {t('modal_contract_without_contract').replace('{n}', uncontractedResidents.length)}
                    </span>
                  )}
                </div>

                {!isCustomCompany && uncontractedResidents.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <select
                      className="form-select"
                      value={newContractData.clientId || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '__custom__') {
                          setIsCustomCompany(true);
                          setNewContractData({
                            ...newContractData,
                            clientId: '',
                            companyName: '',
                          });
                        } else {
                          const selectedRes = uncontractedResidents.find((r) => r._id === val);
                          if (selectedRes) {
                            setNewContractData({
                              ...newContractData,
                              clientId: selectedRes._id,
                              companyName: selectedRes.companyName || selectedRes.name,
                              spaceNumber: selectedRes.officeNumber || newContractData.spaceNumber || 'Bureau B-204',
                              surface: selectedRes.surfaceArea && selectedRes.surfaceArea > 0 ? selectedRes.surfaceArea : (newContractData.surface || 40),
                            });
                          } else {
                            setNewContractData({
                              ...newContractData,
                              clientId: '',
                              companyName: '',
                            });
                          }
                        }
                      }}
                      required
                    >
                      <option value="">{t('modal_contract_select_resident_ph')}</option>
                      {uncontractedResidents.map((res) => (
                        <option key={res._id} value={res._id}>
                          🏢 {res.companyName || res.name} {res.activityType ? `(${res.activityType})` : ''} — Resp: {res.name} ({res.email})
                        </option>
                      ))}
                      <option value="__custom__">{t('modal_contract_custom_entry')}</option>
                    </select>

                    {newContractData.clientId && (
                      <div style={{
                        padding: '0.75rem 0.9rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(37, 99, 235, 0.06)',
                        border: '1px solid rgba(37, 99, 235, 0.18)',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--s2t-blue)' }}>
                          <CheckCircle2 size={16} />
                          <span>{t('modal_receipt_field_company')} : <strong>{newContractData.companyName}</strong></span>
                        </div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                          {t('modal_contract_auto_filled')}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={t('modal_contract_custom_ph')}
                        value={newContractData.companyName}
                        onChange={(e) => setNewContractData({ ...newContractData, companyName: e.target.value, clientId: '' })}
                        required
                      />
                      {uncontractedResidents.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomCompany(false);
                            setNewContractData({ ...newContractData, companyName: '', clientId: '' });
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}
                        >
                          {t('modal_contract_btn_list')}
                        </button>
                      )}
                    </div>
                    {uncontractedResidents.length === 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', color: '#D97706', fontSize: '0.78rem' }}>
                        <AlertTriangle size={14} />
                        <span>{t('modal_contract_all_active_note')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-form-grid-2">
                <div className="form-group">
                  <label className="form-label">{t('modal_contract_space_num')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newContractData.spaceNumber}
                    onChange={(e) => setNewContractData({ ...newContractData, spaceNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('modal_contract_surface_label')}</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={newContractData.surface}
                    onChange={(e) => setNewContractData({ ...newContractData, surface: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('modal_contract_fee_art6')}</label>
                <select
                  className="form-select"
                  value={newContractData.ratePerM2}
                  onChange={(e) => setNewContractData({ ...newContractData, ratePerM2: Number(e.target.value) })}
                >
                  <option value={30}>{t('modal_contract_rate_opt_1')}</option>
                  <option value={55}>{t('modal_contract_rate_opt_2')}</option>
                  <option value={75}>{t('modal_contract_rate_opt_3')}</option>
                </select>
              </div>

              <div className="modal-form-grid-2">
                <div className="form-group">
                  <label className="form-label">{t('modal_contract_start_date')}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newContractData.startDate}
                    onChange={(e) => setNewContractData({ ...newContractData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('modal_contract_end_date')}</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newContractData.endDate}
                    onChange={(e) => setNewContractData({ ...newContractData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Estimation financière automatique */}
              <div style={{
                marginTop: '1.25rem',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.75rem',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>{t('modal_contract_est_rent_ht')}</span>
                  <strong style={{ fontSize: '0.92rem' }}>
                    {((Number(newContractData.surface || 0) * Number(newContractData.ratePerM2 || 0)) / 12).toFixed(3)} DT
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>{t('modal_contract_est_tva')}</span>
                  <strong style={{ fontSize: '0.92rem' }}>
                    {(((Number(newContractData.surface || 0) * Number(newContractData.ratePerM2 || 0)) / 12) * 0.19).toFixed(3)} DT
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--s2t-blue)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>{t('modal_contract_est_rent_ttc')}</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--s2t-blue)' }}>
                    {(((Number(newContractData.surface || 0) * Number(newContractData.ratePerM2 || 0)) / 12) * 1.19).toFixed(3)} DT
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--s2t-red)', display: 'block', fontSize: '0.72rem', fontWeight: 600 }}>{t('modal_contract_est_deposit')}</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--s2t-red)' }}>
                    {((((Number(newContractData.surface || 0) * Number(newContractData.ratePerM2 || 0)) / 12) * 1.19) * 2).toFixed(3)} DT
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-start' : 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowContractModal(false)} className="btn btn-secondary">{t('modal_contract_btn_cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem' }}>
                  <Check size={16} />
                  <span>{t('modal_contract_btn_validate')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Request Amendment */}
      {showAmendmentModal && (
        <div className="modal-overlay" onClick={() => setShowAmendmentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.25rem' }}>{t('modal_amend_title')}</h3>
              <button onClick={() => setShowAmendmentModal(false)} className="btn btn-ghost"><X size={18} /></button>
            </div>
            <form onSubmit={handleRequestAmendment} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">{t('modal_amend_type_label')}</label>
                <select
                  className="form-select"
                  value={amendmentData.type}
                  onChange={(e) => setAmendmentData({ ...amendmentData, type: e.target.value })}
                >
                  <option value="augmentation_superficie">{t('modal_amend_opt_increase')}</option>
                  <option value="reduction_superficie">{t('modal_amend_opt_decrease')}</option>
                  <option value="prolongation">{t('modal_amend_opt_extend')}</option>
                  <option value="autre">{t('modal_amend_opt_other')}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t('modal_amend_new_surface')}</label>
                <input
                  type="number"
                  className="form-input"
                  value={amendmentData.newSurface}
                  onChange={(e) => setAmendmentData({ ...amendmentData, newSurface: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('modal_amend_reason_label')}</label>
                <textarea
                  className="form-textarea"
                  value={amendmentData.description}
                  onChange={(e) => setAmendmentData({ ...amendmentData, description: e.target.value })}
                  placeholder={t('modal_amend_reason_ph')}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-start' : 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowAmendmentModal(false)} className="btn btn-secondary">{t('modal_contract_btn_cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('modal_amend_btn_submit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Preview Printable Invoice */}
      {previewInvoice && (
        <div className="modal-overlay" onClick={() => setPreviewInvoice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', background: '#fff', color: '#0F172A' }}>
            <div style={{ padding: '2rem', borderBottom: '2px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <img src="/s2t-logo.svg" alt="S2T" style={{ height: '36px', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  Smart Tunisian Technoparks — Pôle El Ghazala<br />
                  Route de Raoued Km 3.5, 2088 Ariana<br />
                  MF : 0830000/M/A/000
                </p>
              </div>
              <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#E11D48', marginBottom: '0.2rem' }}>{t('modal_preview_inv_title')}</h3>
                <strong style={{ fontSize: '0.95rem' }}>{previewInvoice.invoiceNumber}</strong>
                <p style={{ fontSize: '0.8rem', color: '#64748B' }}>
                  {t('modal_preview_date')}{new Date(previewInvoice.issueDate).toLocaleDateString(dateLocale)}
                </p>
              </div>
            </div>

            <div style={{ padding: '1.5rem 2rem' }}>
              <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>{t('modal_preview_client_header')}</span>
                <h4 style={{ fontSize: '1.1rem', marginTop: '0.2rem' }}>{previewInvoice.companyName}</h4>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #CBD5E1', textAlign: isRtl ? 'right' : 'left' }}>
                    <th style={{ padding: '0.5rem 0' }}>{t('modal_preview_th_desig')}</th>
                    <th style={{ padding: '0.5rem 0', textAlign: isRtl ? 'left' : 'right' }}>{t('modal_preview_th_amount_ht')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.75rem 0' }}>{previewInvoice.description}</td>
                    <td style={{ padding: '0.75rem 0', textAlign: isRtl ? 'left' : 'right' }}>{previewInvoice.amountHT?.toFixed(3)} DT</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem 0', color: '#64748B' }}>{t('modal_preview_tva')}</td>
                    <td style={{ padding: '0.4rem 0', textAlign: isRtl ? 'left' : 'right' }}>{previewInvoice.tvaAmount?.toFixed(3)} DT</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.4rem 0', color: '#64748B' }}>{t('modal_preview_stamp')}</td>
                    <td style={{ padding: '0.4rem 0', textAlign: isRtl ? 'left' : 'right' }}>1.000 DT</td>
                  </tr>
                  <tr style={{ borderTop: '2px solid #0F172A', fontWeight: 800, fontSize: '1.1rem' }}>
                    <td style={{ padding: '0.75rem 0' }}>{t('modal_preview_total_ttc')}</td>
                    <td style={{ padding: '0.75rem 0', textAlign: isRtl ? 'left' : 'right', color: '#E11D48' }}>
                      {previewInvoice.amountTTC?.toFixed(3)} DT
                    </td>
                  </tr>
                </tbody>
              </table>

              {previewInvoice.status === 'payee' ? (
                <div style={{ background: '#ECFDF5', border: '2px solid #10B981', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.82rem', color: '#065F46', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <CheckCircle2 size={22} color="#10B981" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.88rem' }}>{t('modal_preview_receipt_title')}</strong>
                      <span>{t('modal_preview_receipt_desc').replace('{date}', previewInvoice.paymentDate ? new Date(previewInvoice.paymentDate).toLocaleDateString(dateLocale) : '')}</span>
                      {previewInvoice.transferReference && (
                        <span style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.75rem', marginTop: '0.15rem', color: '#047857' }}>
                          {t('modal_preview_receipt_ref_prefix')}{previewInvoice.transferReference}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="badge" style={{ background: '#10B981', color: '#fff', fontSize: '0.72rem', padding: '0.25rem 0.6rem', fontWeight: 800 }}>
                    {t('modal_preview_badge_settled')}
                  </span>
                </div>
              ) : (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECDD3', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.8rem', color: '#9F1239' }}>
                  {t('modal_preview_unpaid_notice')}
                </div>
              )}
            </div>

            <div style={{ padding: '1rem 2rem', background: '#F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" onClick={() => window.print()} className="btn btn-sm" style={{ background: '#0F172A', color: '#fff', gap: '0.4rem' }}>
                <Download size={14} /> {t('modal_preview_btn_print')}
              </button>
              <button type="button" onClick={() => setPreviewInvoice(null)} className="btn btn-sm" style={{ background: '#CBD5E1', color: '#0F172A' }}>
                {t('modal_preview_btn_close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create / Emit Custom Invoice (Admin) */}
      {showInvoiceModal && (
        <div className="modal-overlay" onClick={() => setShowInvoiceModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', background: 'rgba(37, 99, 235, 0.1)', color: 'var(--s2t-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.18rem', margin: 0 }}>{t('modal_inv_title')}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t('modal_inv_sub')}</span>
                </div>
              </div>
              <button onClick={() => setShowInvoiceModal(false)} className="btn btn-ghost"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateInvoice} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">{t('modal_inv_contract_label')}</label>
                {contracts.length > 0 ? (
                  <select
                    className="form-select"
                    value={newInvoiceData.contractId || ''}
                    onChange={(e) => {
                      const selectedContractId = e.target.value;
                      const c = contracts.find((item) => item._id === selectedContractId);
                      if (c) {
                        setNewInvoiceData({
                          ...newInvoiceData,
                          contractId: c._id,
                          clientId: c.client?._id || c.client,
                          companyName: c.companyName,
                          amountHT: c.monthlyRentHT || 220,
                          description: `Loyer mensuel d'hébergement S2T — Contrat N° ${c.contractNumber}`,
                        });
                      }
                    }}
                    required
                  >
                    <option value="">{t('modal_inv_select_contract_ph')}</option>
                    {contracts.map((c) => (
                      <option key={c._id} value={c._id}>
                        📄 {c.contractNumber} — {c.companyName} ({c.spaceNumber}, {c.surface} m²)
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="form-input"
                    placeholder={t('modal_receipt_field_company')}
                    value={newInvoiceData.companyName}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, companyName: e.target.value })}
                    required
                  />
                )}
              </div>

              <div className="modal-form-grid-2">
                <div className="form-group">
                  <label className="form-label">{t('modal_inv_type_label')}</label>
                  <select
                    className="form-select"
                    value={newInvoiceData.invoiceType}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, invoiceType: e.target.value })}
                  >
                    <option value="loyer_mensuel">{t('modal_inv_type_loyer')}</option>
                    <option value="charges">{t('modal_inv_type_charges')}</option>
                    <option value="caution">{t('modal_inv_type_caution')}</option>
                    <option value="prestation_ponctuelle">{t('modal_inv_type_prestation')}</option>
                    <option value="regularisation">{t('modal_inv_type_regularisation')}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('modal_inv_amount_ht')}</label>
                  <input
                    type="number"
                    step="0.001"
                    min="1"
                    className="form-input"
                    value={newInvoiceData.amountHT}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amountHT: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('modal_inv_desc_label')}</label>
                <input
                  type="text"
                  className="form-input"
                  value={newInvoiceData.description}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, description: e.target.value })}
                  placeholder={t('modal_inv_desc_ph')}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('modal_inv_due_label')}</label>
                <input
                  type="date"
                  className="form-input"
                  value={newInvoiceData.dueDate}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                  required
                />
              </div>

              {/* Total Summary */}
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>{t('modal_inv_total_ttc_note')}</span>
                  <strong style={{ fontSize: '1.15rem', color: 'var(--s2t-red)' }}>
                    {(Number(newInvoiceData.amountHT || 0) * 1.19 + 1.0).toFixed(3)} DT
                  </strong>
                </div>
                <span className="badge badge-envoyee" style={{ fontSize: '0.75rem' }}>
                  {t('modal_inv_status_sent')}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-start' : 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowInvoiceModal(false)} className="btn btn-secondary">{t('modal_contract_btn_cancel')}</button>
                <button type="submit" className="btn btn-primary" style={{ gap: '0.4rem' }}>
                  <Send size={15} />
                  <span>{t('modal_inv_btn_emit')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resident Online Payment Gateway */}
      {showPaymentModal && selectedInvoiceToPay && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', margin: 0 }}>{t('modal_pay_title')}</h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t('modal_pay_sub')}</span>
                </div>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="btn btn-ghost"><X size={18} /></button>
            </div>

            <form onSubmit={handleConfirmPayment} style={{ padding: '1.5rem' }}>
              {/* Invoice Summary Pill */}
              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(37, 99, 235, 0.05)',
                border: '1px solid rgba(37, 99, 235, 0.18)',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    {selectedInvoiceToPay.invoiceNumber}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {selectedInvoiceToPay.description}
                  </div>
                </div>
                <div style={{ textAlign: isRtl ? 'left' : 'right' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--s2t-red)' }}>
                    {selectedInvoiceToPay.amountTTC?.toFixed(3)} DT
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t('dash_inv_amount_ttc_label')}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="form-group">
                <label className="form-label">{t('modal_pay_method_label')}</label>
                <div className="modal-payment-methods-grid">
                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: 'carte' })}
                    style={{
                      padding: '0.75rem 0.35rem',
                      borderRadius: 'var(--radius-md)',
                      border: paymentForm.method === 'carte' ? '2px solid var(--s2t-blue)' : '1px solid var(--border-color)',
                      background: paymentForm.method === 'carte' ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CreditCard size={18} color="var(--s2t-blue)" />
                    <span>{t('modal_pay_method_card')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: 'virement' })}
                    style={{
                      padding: '0.75rem 0.35rem',
                      borderRadius: 'var(--radius-md)',
                      border: paymentForm.method === 'virement' ? '2px solid var(--s2t-teal)' : '1px solid var(--border-color)',
                      background: paymentForm.method === 'virement' ? 'rgba(13, 148, 136, 0.08)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Building2 size={18} color="var(--s2t-teal)" />
                    <span>{t('modal_pay_method_transfer')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: 'especes' })}
                    style={{
                      padding: '0.75rem 0.35rem',
                      borderRadius: 'var(--radius-md)',
                      border: paymentForm.method === 'especes' ? '2px solid #10B981' : '1px solid var(--border-color)',
                      background: paymentForm.method === 'especes' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Banknote size={18} color="#10B981" />
                    <span>{t('modal_pay_method_cash')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentForm({ ...paymentForm, method: 'ordre_permanent' })}
                    style={{
                      padding: '0.75rem 0.35rem',
                      borderRadius: 'var(--radius-md)',
                      border: paymentForm.method === 'ordre_permanent' ? '2px solid var(--s2t-red)' : '1px solid var(--border-color)',
                      background: paymentForm.method === 'ordre_permanent' ? 'rgba(225, 29, 72, 0.08)' : 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Scale size={18} color="var(--s2t-red)" />
                    <span>{t('modal_pay_method_debit')}</span>
                  </button>
                </div>
              </div>

              {/* Conditional Payment Fields */}
              {paymentForm.method === 'carte' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('modal_pay_card_holder')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paymentForm.cardHolder}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardHolder: e.target.value })}
                      placeholder="Nom & Prénom"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t('modal_pay_card_number')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                      placeholder="•••• •••• •••• ••••"
                      required
                    />
                  </div>

                  <div className="modal-form-grid-2">
                    <div className="form-group">
                      <label className="form-label">{t('modal_pay_card_expiry')}</label>
                      <input
                        type="text"
                        className="form-input"
                        value={paymentForm.expiry}
                        onChange={(e) => setPaymentForm({ ...paymentForm, expiry: e.target.value })}
                        placeholder="MM/AA"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('modal_pay_card_cvv')}</label>
                      <input
                        type="password"
                        maxLength="4"
                        className="form-input"
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                        placeholder="•••"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : paymentForm.method === 'virement' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.45rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Building2 size={16} color="var(--s2t-teal)" />
                      <span>{t('modal_pay_stb_bank_coords')}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('modal_pay_bank_name')}</span>
                      <strong>{t('modal_pay_bank_val')}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>{t('modal_pay_rib_label')}</span>
                      <strong style={{ fontFamily: 'monospace', letterSpacing: '0.04em', color: 'var(--s2t-blue)' }}>10 005 0830000 000000 45</strong>
                      <span style={{ color: 'var(--text-muted)' }}>{t('modal_pay_beneficiary_label')}</span>
                      <strong>{t('modal_pay_beneficiary_val')}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>{t('modal_pay_swift_label')}</span>
                      <span style={{ fontFamily: 'monospace' }}>STBK TNTT</span>
                    </div>
                  </div>

                  {/* Transaction / Transfer Reference */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t('modal_pay_transfer_ref_label')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paymentForm.transferRef}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transferRef: e.target.value })}
                      placeholder={t('modal_pay_transfer_ref_ph')}
                      required
                    />
                  </div>

                  {/* Receipt / Proof Upload */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t('modal_pay_upload_receipt_label')}</label>
                    <div style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      textAlign: 'center',
                      background: paymentForm.receiptFile ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)',
                      borderColor: paymentForm.receiptFile ? '#10B981' : 'var(--border-color)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setPaymentForm(prev => ({
                                ...prev,
                                receiptFile: event.target.result,
                                receiptFileName: file.name,
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {paymentForm.receiptFileName || paymentForm.receiptFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#10B981' }}>
                          <CheckCircle2 size={18} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {t('modal_pay_receipt_attached')}{paymentForm.receiptFileName || 'Justificatif bancaire'}
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                          <FileText size={24} color="var(--s2t-blue)" />
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {t('modal_pay_upload_click')}
                          </span>
                          <span style={{ fontSize: '0.72rem' }}>{t('modal_pay_upload_formats')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : paymentForm.method === 'especes' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(16, 185, 129, 0.06)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.45rem', color: '#065F46', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Banknote size={16} color="#10B981" />
                      <span>{t('modal_pay_cash_desk_coords')}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{t('modal_pay_cash_desk_loc')}</span>
                      <strong>{t('modal_pay_cash_desk_loc_val')}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>{t('modal_pay_cash_hours')}</span>
                      <strong>{t('modal_pay_cash_hours_val')}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>{t('modal_pay_cash_amount_label')}</span>
                      <strong style={{ color: 'var(--s2t-red)' }}>{selectedInvoiceToPay.amountTTC?.toFixed(3)} DT TTC</strong>
                    </div>
                  </div>

                  {/* Cash Depositor Name */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t('modal_pay_cash_payer_label')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paymentForm.cashPayerName}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cashPayerName: e.target.value })}
                      placeholder="ex: Samia Mansour"
                      required
                    />
                  </div>

                  {/* Cash Receipt / Décharge Ref */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t('modal_pay_cash_receipt_ref_label')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paymentForm.cashReceiptRef}
                      onChange={(e) => setPaymentForm({ ...paymentForm, cashReceiptRef: e.target.value })}
                      placeholder="ex: REC-ESP-2026-0089"
                    />
                  </div>

                  {/* Optional File Upload for Cash Proof / Signed Voucher */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t('modal_pay_cash_proof_label')}</label>
                    <div style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      textAlign: 'center',
                      background: paymentForm.receiptFile ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-secondary)',
                      borderColor: paymentForm.receiptFile ? '#10B981' : 'var(--border-color)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setPaymentForm(prev => ({
                                ...prev,
                                receiptFile: event.target.result,
                                receiptFileName: file.name,
                              }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {paymentForm.receiptFileName || paymentForm.receiptFile ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#10B981' }}>
                          <CheckCircle2 size={18} />
                          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            {t('modal_pay_receipt_attached')}{paymentForm.receiptFileName || 'Justificatif de caisse'}
                          </span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                          <FileText size={24} color="#10B981" />
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {t('modal_pay_cash_upload_click')}
                          </span>
                          <span style={{ fontSize: '0.72rem' }}>{t('modal_pay_cash_upload_formats')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.82rem'
                  }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Scale size={16} color="var(--s2t-red)" />
                      <span>{t('modal_pay_debit_title')}</span>
                    </div>
                    <div>
                      {t('modal_pay_debit_desc_prefix')}<strong style={{ color: 'var(--s2t-red)' }}>{selectedInvoiceToPay.amountTTC?.toFixed(3)} DT</strong>{t('modal_pay_debit_desc_suffix')}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t('modal_pay_debit_mandate_label')}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={paymentForm.transferRef}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transferRef: e.target.value })}
                      placeholder="ex: MANDAT-S2T-2026-0004"
                    />
                  </div>
                </div>
              )}

              {/* Security guarantee footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.74rem',
                color: 'var(--text-muted)',
                marginTop: '0.5rem'
              }}>
                <ShieldCheck size={16} color="#10B981" />
                <span>{t('modal_pay_security_note')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-start' : 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="btn btn-secondary">
                  {t('modal_contract_btn_cancel')}
                </button>
                <button
                  type="submit"
                  disabled={paymentProcessing}
                  className="btn btn-primary"
                  style={{
                    gap: '0.45rem',
                    background: paymentForm.method === 'virement' ? 'var(--s2t-teal)' : paymentForm.method === 'especes' ? '#10B981' : paymentForm.method === 'ordre_permanent' ? 'var(--s2t-blue)' : '#10B981',
                    borderColor: paymentForm.method === 'virement' ? 'var(--s2t-teal)' : paymentForm.method === 'especes' ? '#10B981' : paymentForm.method === 'ordre_permanent' ? 'var(--s2t-blue)' : '#10B981',
                    padding: '0.65rem 1.15rem'
                  }}
                >
                  {paymentProcessing ? (
                    <>
                      <RefreshCw className="spin" size={14} />
                      <span>{t('modal_pay_btn_processing')}</span>
                    </>
                  ) : paymentForm.method === 'virement' ? (
                    <>
                      <Send size={15} />
                      <span>{t('modal_pay_btn_send_transfer')}</span>
                    </>
                  ) : paymentForm.method === 'especes' ? (
                    <>
                      <Send size={15} />
                      <span>{t('modal_pay_btn_send_cash')}</span>
                    </>
                  ) : paymentForm.method === 'ordre_permanent' ? (
                    <>
                      <Send size={15} />
                      <span>{t('modal_pay_btn_send_debit')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>{t('modal_pay_btn_confirm_card').replace('{amount}', selectedInvoiceToPay.amountTTC?.toFixed(3) || '0.000')}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Admin Receipt Inspection & Verification */}
      {showReceiptModal && selectedReceiptInvoice && (
        <div className="modal-overlay" onClick={() => { setShowReceiptModal(false); setIsRejecting(false); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-sm)',
                  background: selectedReceiptInvoice.status === 'payee'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : selectedReceiptInvoice.paymentMethod === 'especes'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : selectedReceiptInvoice.paymentMethod === 'ordre_permanent'
                    ? 'rgba(37, 99, 235, 0.12)'
                    : 'rgba(217, 119, 6, 0.12)',
                  color: selectedReceiptInvoice.status === 'payee'
                    ? '#10B981'
                    : selectedReceiptInvoice.paymentMethod === 'especes'
                    ? '#059669'
                    : selectedReceiptInvoice.paymentMethod === 'ordre_permanent'
                    ? '#2563EB'
                    : '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {selectedReceiptInvoice.paymentMethod === 'especes' ? <Banknote size={24} /> : selectedReceiptInvoice.paymentMethod === 'ordre_permanent' ? <Scale size={24} /> : <FileCheck size={24} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.18rem', margin: 0 }}>
                      {selectedReceiptInvoice.paymentMethod === 'especes'
                        ? t('modal_receipt_title_cash')
                        : selectedReceiptInvoice.paymentMethod === 'ordre_permanent'
                        ? t('modal_receipt_title_debit')
                        : t('modal_receipt_title_transfer')}
                    </h3>
                    {getStatusBadge(selectedReceiptInvoice.status, selectedReceiptInvoice.paymentMethod)}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    {selectedReceiptInvoice.paymentMethod === 'especes'
                      ? t('modal_receipt_sub_cash')
                      : t('modal_receipt_sub_transfer')}
                  </span>
                </div>
              </div>
              <button onClick={() => { setShowReceiptModal(false); setIsRejecting(false); }} className="btn btn-ghost">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Status Alert Banner */}
              {selectedReceiptInvoice.status === 'en_attente_validation' ? (
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: selectedReceiptInvoice.paymentMethod === 'especes'
                    ? 'rgba(16, 185, 129, 0.08)'
                    : selectedReceiptInvoice.paymentMethod === 'ordre_permanent'
                    ? 'rgba(37, 99, 235, 0.08)'
                    : 'rgba(245, 158, 11, 0.1)',
                  border: selectedReceiptInvoice.paymentMethod === 'especes'
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : selectedReceiptInvoice.paymentMethod === 'ordre_permanent'
                    ? '1px solid rgba(37, 99, 235, 0.3)'
                    : '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)'
                }}>
                  {selectedReceiptInvoice.paymentMethod === 'especes' ? (
                    <>
                      <Banknote size={20} color="#059669" style={{ flexShrink: 0 }} />
                      <div>{t('modal_receipt_banner_cash')}</div>
                    </>
                  ) : selectedReceiptInvoice.paymentMethod === 'ordre_permanent' ? (
                    <>
                      <Scale size={20} color="#2563EB" style={{ flexShrink: 0 }} />
                      <div>{t('modal_receipt_banner_debit')}</div>
                    </>
                  ) : (
                    <>
                      <Clock size={18} color="#D97706" style={{ flexShrink: 0 }} />
                      <div>{t('modal_receipt_banner_transfer')}</div>
                    </>
                  )}
                </div>
              ) : selectedReceiptInvoice.status === 'payee' ? (
                <div style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  fontSize: '0.82rem',
                  color: 'var(--text-primary)'
                }}>
                  <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />
                  <div>{t('modal_receipt_banner_paid')}</div>
                </div>
              ) : null}

              {/* Transaction Key Data Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.75rem'
              }}>
                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{t('modal_receipt_field_company')}</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{selectedReceiptInvoice.companyName}</strong>
                </div>

                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{t('modal_receipt_field_inv_num')}</span>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--s2t-blue)' }}>{selectedReceiptInvoice.invoiceNumber}</strong>
                </div>

                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>{t('modal_receipt_field_amount_ttc')}</span>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--s2t-red)' }}>{selectedReceiptInvoice.amountTTC?.toFixed(3)} DT</strong>
                </div>

                <div style={{ padding: '0.85rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                    {selectedReceiptInvoice.paymentMethod === 'especes'
                      ? t('modal_receipt_field_mode_cash')
                      : selectedReceiptInvoice.paymentMethod === 'ordre_permanent'
                      ? t('modal_receipt_field_mode_debit')
                      : t('modal_receipt_field_mode_transfer')}
                  </span>
                  <strong style={{ fontSize: '0.82rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                    {selectedReceiptInvoice.paymentMethod === 'especes'
                      ? (selectedReceiptInvoice.transferReference || 'Espèces / Régie Bureau A-102')
                      : (selectedReceiptInvoice.transferReference || 'Non spécifiée')}
                  </strong>
                </div>
              </div>

              {/* Scanned Receipt / Official S2T Voucher Box */}
              <div>
                <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                    <FileText size={15} color="var(--s2t-blue)" />
                    <span>
                      {selectedReceiptInvoice.paymentMethod === 'especes'
                        ? t('modal_receipt_proof_label_cash')
                        : selectedReceiptInvoice.paymentMethod === 'ordre_permanent'
                        ? t('modal_receipt_proof_label_debit')
                        : t('modal_receipt_proof_label_transfer')}
                    </span>
                  </label>

                  {selectedReceiptInvoice.receiptFile && selectedReceiptInvoice.receiptFile.startsWith('data:') && (
                    <button
                      type="button"
                      onClick={() => {
                        const win = window.open();
                        if (win) {
                          if (selectedReceiptInvoice.receiptFile.startsWith('data:image')) {
                            win.document.write(`<title>Reçu S2T - ${selectedReceiptInvoice.invoiceNumber}</title><body style="margin:0;background:#111;display:flex;justify-content:center;align-items:center;min-height:100vh;"><img src="${selectedReceiptInvoice.receiptFile}" style="max-width:95vw;max-height:95vh;object-fit:contain;box-shadow:0 0 20px rgba(0,0,0,0.8);" /></body>`);
                          } else {
                            win.document.write(`<iframe src="${selectedReceiptInvoice.receiptFile}" style="width:100%;height:100vh;border:none;"></iframe>`);
                          }
                        }
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.75rem', gap: '0.35rem', padding: '0.2rem 0.5rem', color: 'var(--s2t-blue)' }}
                      title="Ouvrir le justificatif dans un nouvel onglet"
                    >
                      <ExternalLink size={13} />
                      <span>{t('modal_receipt_open_fullscreen')}</span>
                    </button>
                  )}
                </div>

                {selectedReceiptInvoice.receiptFile && selectedReceiptInvoice.receiptFile.startsWith('data:image') ? (
                  <div style={{
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: '1px solid var(--border-color)',
                    background: '#0B0F19',
                    textAlign: 'center',
                    padding: '0.75rem',
                    position: 'relative'
                  }}>
                    <img
                      src={selectedReceiptInvoice.receiptFile}
                      alt="Justificatif de versement"
                      style={{ maxHeight: '340px', maxWidth: '100%', objectFit: 'contain', margin: '0 auto', display: 'block', borderRadius: '4px' }}
                    />
                    <div style={{ marginTop: '0.5rem', fontSize: '0.74rem', color: '#94A3B8' }}>
                      Justificatif téléversé par l'entreprise : <strong>{selectedReceiptInvoice.companyName}</strong>
                    </div>
                  </div>
                ) : selectedReceiptInvoice.receiptFile && selectedReceiptInvoice.receiptFile.startsWith('data:application/pdf') ? (
                  <iframe
                    src={selectedReceiptInvoice.receiptFile}
                    title="Aperçu PDF Reçu"
                    style={{ width: '100%', height: '340px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}
                  />
                ) : selectedReceiptInvoice.paymentMethod === 'especes' ? (
                  /* Stylized S2T Cash Desk Voucher (Régie des recettes Bureau A-102) */
                  <div style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#F0FDF4',
                    color: '#064E3B',
                    border: '2px dashed #86EFAC',
                    fontFamily: 'sans-serif',
                    boxShadow: 'inset 0 0 10px rgba(16,185,129,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #BBF7D0', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                          S2T
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: '#064E3B', display: 'block' }}>SMART TUNISIAN TECHNOPARKS — RÉGIE DES RECETTES</strong>
                          <span style={{ fontSize: '0.72rem', color: '#047857' }}>Récépissé Provisoire de Paiement en Espèces (Guichet A-102)</span>
                        </div>
                      </div>
                      <span className="badge" style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', fontSize: '0.72rem', fontWeight: 700 }}>
                        💵 En Attente d'Émargement Caisse
                      </span>
                    </div>

                    <div className="modal-form-grid-2" style={{ gap: '0.65rem', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: '#047857', display: 'block', fontSize: '0.72rem' }}>Lieu d'Encaissement :</span>
                        <strong>Bâtiment Administratif S2T, Bureau A-102</strong>
                      </div>
                      <div>
                        <span style={{ color: '#047857', display: 'block', fontSize: '0.72rem' }}>Date & Heure Déclaration :</span>
                        <strong>{new Date(selectedReceiptInvoice.receiptSubmittedAt || selectedReceiptInvoice.updatedAt || Date.now()).toLocaleString(dateLocale)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#047857', display: 'block', fontSize: '0.72rem' }}>Entreprise Résidente :</span>
                        <strong>{selectedReceiptInvoice.companyName}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#047857', display: 'block', fontSize: '0.72rem' }}>N° Facture Concernée :</span>
                        <strong style={{ color: '#059669' }}>{selectedReceiptInvoice.invoiceNumber}</strong>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <span style={{ color: '#047857', display: 'block', fontSize: '0.72rem' }}>Détails Déposant & Réf :</span>
                        <strong style={{ fontFamily: 'monospace', color: '#065F46' }}>
                          {selectedReceiptInvoice.transferReference || 'Paiement en espèces sur place'}
                        </strong>
                      </div>
                      <div style={{ gridColumn: '1 / -1', background: '#DCFCE7', padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534' }}>Montant Total en Espèces :</span>
                        <strong style={{ color: '#E11D48', fontSize: '1.15rem', fontWeight: 800 }}>
                          {selectedReceiptInvoice.amountTTC?.toFixed(3)} DT TTC
                        </strong>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#047857' }}>
                      <span>Régisseur : <em>Direction Financière S2T</em></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#166534', fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> Prêt pour validation & émission de quittance
                      </span>
                    </div>
                  </div>
                ) : selectedReceiptInvoice.paymentMethod === 'ordre_permanent' ? (
                  /* Stylized S2T Direct Debit Voucher */
                  <div style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#EFF6FF',
                    color: '#1E3A8A',
                    border: '2px dashed #93C5FD',
                    fontFamily: 'sans-serif',
                    boxShadow: 'inset 0 0 10px rgba(37,99,235,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #BFDBFE', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                          S2T
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: '#1E3A8A', display: 'block' }}>SMART TUNISIAN TECHNOPARKS — DIRECTION FINANCIÈRE</strong>
                          <span style={{ fontSize: '0.72rem', color: '#1D4ED8' }}>Avis d'Ordre Permanent & Prélèvement Interbancaire S2T</span>
                        </div>
                      </div>
                      <span className="badge" style={{ background: '#DBEAFE', color: '#1E40AF', border: '1px solid #93C5FD', fontSize: '0.72rem', fontWeight: 700 }}>
                        ⚖️ Mandat Art. 6.3
                      </span>
                    </div>

                    <div className="modal-form-grid-2" style={{ gap: '0.65rem', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: '#1D4ED8', display: 'block', fontSize: '0.72rem' }}>Entreprise Résidente :</span>
                        <strong>{selectedReceiptInvoice.companyName}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#1D4ED8', display: 'block', fontSize: '0.72rem' }}>Banque Partenaire S2T :</span>
                        <strong>Société Tunisienne de Banque (STB)</strong>
                      </div>
                      <div>
                        <span style={{ color: '#1D4ED8', display: 'block', fontSize: '0.72rem' }}>N° Facture Débitée :</span>
                        <strong style={{ color: '#2563EB' }}>{selectedReceiptInvoice.invoiceNumber}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#1D4ED8', display: 'block', fontSize: '0.72rem' }}>Référence Mandat :</span>
                        <strong style={{ fontFamily: 'monospace', color: '#1E3A8A' }}>
                          {selectedReceiptInvoice.transferReference || `MANDAT-${selectedReceiptInvoice.invoiceNumber}`}
                        </strong>
                      </div>
                      <div style={{ gridColumn: '1 / -1', background: '#DBEAFE', padding: '0.5rem 0.75rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1E40AF' }}>Montant Prélèvement :</span>
                        <strong style={{ color: '#E11D48', fontSize: '1.15rem', fontWeight: 800 }}>
                          {selectedReceiptInvoice.amountTTC?.toFixed(3)} DT TTC
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Stylized S2T Official Bank Transfer Proof Voucher */
                  <div style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    background: '#F8FAFC',
                    color: '#0F172A',
                    border: '2px dashed #CBD5E1',
                    fontFamily: 'sans-serif',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#0284C7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem' }}>
                          STB
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: '#0F172A', display: 'block' }}>SOCIÉTÉ TUNISIENNE DE BANQUE</strong>
                          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Avis d'Opération de Virement / Versement Bancaire</span>
                        </div>
                      </div>
                      <span className="badge" style={{ background: '#DCFCE7', color: '#166534', border: '1px solid #86EFAC', fontSize: '0.72rem' }}>
                        Bordereau Enregistré
                      </span>
                    </div>

                    <div className="modal-form-grid-2" style={{ gap: '0.65rem', fontSize: '0.82rem' }}>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Bénéficiaire :</span>
                        <strong>Smart Tunisian Technoparks (S2T)</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>RIB Crédité S2T :</span>
                        <strong style={{ fontFamily: 'monospace', color: '#0284C7' }}>10 005 0830000 000000 45</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Donneur d'Ordre :</span>
                        <strong>{selectedReceiptInvoice.companyName}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Date & Heure Déclaration :</span>
                        <strong>{new Date(selectedReceiptInvoice.receiptSubmittedAt || selectedReceiptInvoice.updatedAt || Date.now()).toLocaleString(dateLocale)}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Référence / N° Bordereau :</span>
                        <strong style={{ color: '#0284C7', fontFamily: 'monospace', letterSpacing: '0.03em' }}>
                          {selectedReceiptInvoice.transferReference || `VIR-${selectedReceiptInvoice.invoiceNumber}`}
                        </strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748B', display: 'block', fontSize: '0.72rem' }}>Montant Versé :</span>
                        <strong style={{ color: '#E11D48', fontSize: '1rem' }}>
                          {selectedReceiptInvoice.amountTTC?.toFixed(3)} DT
                        </strong>
                      </div>
                    </div>

                    <div style={{ marginTop: '0.85rem', paddingTop: '0.65rem', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748B' }}>
                      <span>Fichier : <em>{selectedReceiptInvoice.receiptFile || 'recu_versement_stb.pdf'}</em></span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#166534', fontWeight: 600 }}>
                        <CheckCircle2 size={13} /> Justificatif prêt pour validation
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reconciliation Checklist Box */}
              <div style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                fontSize: '0.8rem'
              }}>
                {selectedReceiptInvoice.paymentMethod === 'especes' ? (
                  <>
                    <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Banknote size={15} color="#059669" />
                      <span>Régie des Recettes S2T (Caisse Centrale Pôle El Ghazala) :</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.2rem 0.65rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <span>Bureau de Caisse :</span>
                      <strong>Bâtiment Administratif S2T, Bureau A-102</strong>
                      <span>Responsable Recettes :</span>
                      <strong>Régisseur Financier S2T</strong>
                      <span>Montant Espèces à Pointer :</span>
                      <strong style={{ color: 'var(--s2t-red)' }}>{selectedReceiptInvoice.amountTTC?.toFixed(3)} DT TTC</strong>
                    </div>
                  </>
                ) : selectedReceiptInvoice.paymentMethod === 'ordre_permanent' ? (
                  <>
                    <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Scale size={15} color="var(--s2t-blue)" />
                      <span>Convention de Prélèvement S2T (Article 6.3) :</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.2rem 0.65rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <span>Banque Partenaire :</span>
                      <strong>Société Tunisienne de Banque (STB)</strong>
                      <span>Compte Crédité S2T :</span>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--s2t-blue)' }}>10 005 0830000 000000 45</strong>
                      <span>Montant du débit :</span>
                      <strong style={{ color: 'var(--s2t-red)' }}>{selectedReceiptInvoice.amountTTC?.toFixed(3)} DT TTC</strong>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Building2 size={15} color="var(--s2t-blue)" />
                      <span>Rapprochement Bancaire S2T (STB Technopole El Ghazala) :</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.2rem 0.65rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <span>Banque S2T :</span>
                      <strong>Société Tunisienne de Banque (STB)</strong>
                      <span>RIB de destination :</span>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--s2t-blue)' }}>10 005 0830000 000000 45</strong>
                      <span>Montant attendu :</span>
                      <strong style={{ color: 'var(--s2t-red)' }}>{selectedReceiptInvoice.amountTTC?.toFixed(3)} DT TTC</strong>
                    </div>
                  </>
                )}
              </div>

              {/* Interactive Rejection Reason Form (when Admin clicks Rejeter) */}
              {isRejecting && (
                <div style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(225, 29, 72, 0.06)',
                  border: '1px solid rgba(225, 29, 72, 0.25)',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--s2t-red)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <XCircle size={16} />
                    <span>{t('modal_receipt_reject_title')}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '0.75rem', fontSize: '0.82rem' }}>
                    {(selectedReceiptInvoice.paymentMethod === 'especes' ? [
                      'Non-présentation du représentant à la Régie des recettes S2T (Bureau A-102).',
                      'Montant en espèces déposé incomplet par rapport au montant TTC exigible.',
                      'Reçu de caisse ou décharge non conforme.',
                      'autre'
                    ] : [
                      'Montant non concordant avec le relevé bancaire STB ou somme incomplète.',
                      'Numéro de virement ou bordereau introuvable sur le compte bancaire STB.',
                      'Document / Reçu téléversé illisible ou non valide.',
                      'autre'
                    ]).map((preset) => (
                      <label key={preset} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="rejectionPreset"
                          checked={rejectionReasonPreset === preset}
                          onChange={() => setRejectionReasonPreset(preset)}
                        />
                        <span>{preset === 'autre' ? 'Autre motif personnalisé...' : preset}</span>
                      </label>
                    ))}
                  </div>

                  {rejectionReasonPreset === 'autre' && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <textarea
                        className="form-input"
                        rows="2"
                        placeholder="Précisez la raison exacte du refus..."
                        value={customRejectionText}
                        onChange={(e) => setCustomRejectionText(e.target.value)}
                        style={{ fontSize: '0.82rem' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: isRtl ? 'flex-start' : 'flex-end', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="btn btn-secondary btn-sm"
                    >
                      {t('modal_contract_btn_cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectReceipt(selectedReceiptInvoice._id)}
                      className="btn btn-primary btn-sm"
                      style={{ background: 'var(--s2t-red)', borderColor: 'var(--s2t-red)', gap: '0.35rem' }}
                    >
                      <XCircle size={14} />
                      <span>{t('modal_receipt_btn_confirm_rejection')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', background: 'var(--bg-secondary)' }}>
              <button
                type="button"
                onClick={() => { setShowReceiptModal(false); setIsRejecting(false); }}
                className="btn btn-secondary"
              >
                {t('modal_preview_btn_close')}
              </button>

              {isAdmin && selectedReceiptInvoice.status === 'en_attente_validation' && !isRejecting && (
                <div style={{ display: 'flex', gap: '0.65rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsRejecting(true)}
                    className="btn btn-secondary"
                    style={{ color: 'var(--s2t-red)', borderColor: 'rgba(225, 29, 72, 0.35)', gap: '0.35rem' }}
                  >
                    <XCircle size={15} />
                    <span>{t('modal_receipt_btn_reject_req')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApprovePayment(selectedReceiptInvoice._id)}
                    className="btn btn-primary"
                    style={{
                      background: selectedReceiptInvoice.paymentMethod === 'especes' ? '#059669' : '#10B981',
                      borderColor: selectedReceiptInvoice.paymentMethod === 'especes' ? '#059669' : '#10B981',
                      gap: '0.45rem',
                      fontWeight: 700
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>
                      {selectedReceiptInvoice.paymentMethod === 'especes'
                        ? t('modal_receipt_btn_confirm_cash').replace('{amount}', selectedReceiptInvoice.amountTTC?.toFixed(3) || '0.000')
                        : selectedReceiptInvoice.paymentMethod === 'ordre_permanent'
                        ? t('modal_receipt_btn_confirm_debit').replace('{amount}', selectedReceiptInvoice.amountTTC?.toFixed(3) || '0.000')
                        : t('modal_receipt_btn_confirm_transfer').replace('{amount}', selectedReceiptInvoice.amountTTC?.toFixed(3) || '0.000')}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Convention S2T 16 Articles */}
      <LegalArticlesModal
        isOpen={showLegalArticlesModal}
        onClose={() => setShowLegalArticlesModal(false)}
        contractInfo={articleContractContext}
        title={articleContractContext ? `Convention d'Hébergement — ${articleContractContext.companyName}` : "Convention d'Hébergement S2T — 16 Articles Réglementaires"}
      />
    </div>
  );
};

export default Dashboard;
