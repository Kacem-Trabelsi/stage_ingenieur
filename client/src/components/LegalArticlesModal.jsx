import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  X, 
  Search, 
  Printer, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  FileText, 
  ChevronRight, 
  AlertCircle,
  ExternalLink,
  BookOpen,
  Sparkles,
  Info,
  Calendar,
  Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { getS2TArticles } from '../data/s2tArticlesData';

const LegalArticlesModal = ({ 
  isOpen, 
  onClose, 
  onAccept = null, 
  hasAccepted = false,
  contractInfo = null, // Optional { companyName, spaceNumber, surface, ratePerM2, depositAmount, startDate, endDate }
  title = null
}) => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';

  const articlesList = useMemo(() => {
    return getS2TArticles(language);
  }, [language]);

  const modalTitle = title || (contractInfo?.companyName 
    ? t('articles_modal_title_company').replace('{company}', contractInfo.companyName) 
    : t('articles_modal_default_title'));

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [expandedArticleId, setExpandedArticleId] = useState(null);

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    articlesList.forEach(a => {
      if (a.tag) tags.add(a.tag);
    });
    return ['ALL', ...Array.from(tags)];
  }, [articlesList]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return articlesList.filter(art => {
      const matchSearch = !term || 
        art.number.toLowerCase().includes(term) ||
        art.title.toLowerCase().includes(term) ||
        art.content.toLowerCase().includes(term) ||
        art.summary.toLowerCase().includes(term) ||
        (art.tag && art.tag.toLowerCase().includes(term)) ||
        (art.highlights && art.highlights.some(h => h.toLowerCase().includes(term)));

      const matchTag = selectedTag === 'ALL' || art.tag === selectedTag;

      return matchSearch && matchTag;
    });
  }, [articlesList, searchTerm, selectedTag]);

  const handlePrint = () => {
    window.print();
  };

  const handleJumpToArticle = (id) => {
    const el = document.getElementById(`article-card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setExpandedArticleId(id);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000, padding: '1rem' }} dir={isRtl ? 'rtl' : 'ltr'}>
      <div 
        className="modal-content legal-articles-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '920px',
          width: '100%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(225, 29, 72, 0.05) 100%)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--s2t-blue) 0%, #1D4ED8 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              flexShrink: 0
            }}>
              <Scale size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {modalTitle}
                </h3>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.15rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(37, 99, 235, 0.12)',
                  color: 'var(--s2t-blue)',
                  border: '1px solid rgba(37, 99, 235, 0.25)',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase'
                }}>
                  {t('articles_law_badge')}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                {t('articles_sub_header')}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={handlePrint}
              className="btn btn-secondary btn-sm no-print"
              style={{ gap: '0.35rem', fontSize: '0.78rem', borderRadius: '8px' }}
              title={t('articles_print_tooltip')}
            >
              <Printer size={14} />
              <span className="hide-on-mobile">{t('articles_print')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              style={{ borderRadius: '8px', padding: '0.4rem' }}
              title={t('articles_close')}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Contract Specifics (if passed) */}
        {contractInfo && (
          <div style={{
            padding: '0.85rem 1.75rem',
            background: 'rgba(16, 185, 129, 0.06)',
            borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.82rem',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={16} color="#10B981" />
              <span>{t('articles_company_label')} <strong>{contractInfo.companyName || t('articles_resident_default')}</strong></span>
              {contractInfo.spaceNumber && (
                <span style={{ color: 'var(--text-secondary)' }}>• {t('articles_space_label')} <strong>{contractInfo.spaceNumber}</strong></span>
              )}
              {contractInfo.surface && (
                <span style={{ color: 'var(--text-secondary)' }}>• {t('articles_surface_label')} <strong>{contractInfo.surface} m²</strong></span>
              )}
            </div>
            {contractInfo.ratePerM2 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--s2t-blue)', fontWeight: 600 }}>
                <Scale size={14} />
                <span>{t('articles_rate_label')} {contractInfo.ratePerM2} DT HT/m²/an</span>
              </div>
            )}
          </div>
        )}

        {/* Search & Quick Navigator Bar */}
        <div style={{
          padding: '0.85rem 1.75rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', [isRtl ? 'right' : 'left']: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder={t('articles_search_ph')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ [isRtl ? 'paddingRight' : 'paddingLeft']: '2rem', height: '36px', fontSize: '0.82rem', borderRadius: '8px' }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ position: 'absolute', [isRtl ? 'left' : 'right']: '8px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Quick jump dropdown on mobile / small screens */}
            <select
              className="form-select"
              style={{ width: 'auto', height: '36px', fontSize: '0.8rem', borderRadius: '8px', paddingRight: isRtl ? '2rem' : '1rem', paddingLeft: isRtl ? '1rem' : '2rem' }}
              onChange={(e) => {
                if (e.target.value) handleJumpToArticle(e.target.value);
              }}
              defaultValue=""
            >
              <option value="" disabled>{t('articles_quick_jump')}</option>
              {articlesList.map(art => (
                <option key={art.id} value={art.id}>
                  {art.number} : {art.title}
                </option>
              ))}
            </select>
          </div>

          {/* Quick jump pills */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            overflowX: 'auto',
            paddingBottom: '2px',
            scrollbarWidth: 'none'
          }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, [isRtl ? 'marginLeft' : 'marginRight']: '0.25rem', whiteSpace: 'nowrap' }}>
              {t('articles_articles_nav')}
            </span>
            {articlesList.map(art => (
              <button
                key={art.id}
                type="button"
                onClick={() => handleJumpToArticle(art.id)}
                style={{
                  padding: '0.2rem 0.5rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: expandedArticleId === art.id ? 'var(--s2t-blue)' : 'var(--bg-tertiary)',
                  color: expandedArticleId === art.id ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
                title={art.title}
              >
                {isRtl ? `فصل ${art.id}` : `Art. ${art.id}`}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Articles Content */}
        <div style={{
          padding: '1.5rem 1.75rem',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* Introductory Notice Card */}
          <div style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(37, 99, 235, 0.05)',
            border: '1px solid rgba(37, 99, 235, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            fontSize: '0.84rem',
            lineHeight: 1.5,
            color: 'var(--text-secondary)'
          }}>
            <Info size={20} color="var(--s2t-blue)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.2rem' }}>
                {t('articles_note_title')}
              </strong>
              {t('articles_note_p1')} <strong>{t('articles_note_p2')}</strong> {t('articles_note_p3')} <strong>{t('articles_note_p4')}</strong>{t('articles_note_p5')}
            </div>
          </div>

          {filteredArticles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <AlertCircle size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.6 }} />
              <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {t('articles_no_results')}
              </h4>
              <p style={{ fontSize: '0.82rem' }}>
                {t('articles_no_results_sub')}
              </p>
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setSelectedTag('ALL'); }}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: '0.75rem' }}
              >
                {t('articles_reset_filter')}
              </button>
            </div>
          ) : (
            filteredArticles.map((article) => {
              const isExpanded = expandedArticleId === article.id;
              return (
                <div
                  key={article.id}
                  id={`article-card-${article.id}`}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: isExpanded ? '2px solid var(--s2t-blue)' : '1px solid var(--border-color)',
                    background: isExpanded ? 'rgba(37, 99, 235, 0.03)' : 'var(--bg-secondary)',
                    padding: '1.25rem',
                    transition: 'all 0.2s ease',
                    boxShadow: isExpanded ? '0 4px 16px rgba(37, 99, 235, 0.12)' : 'none',
                  }}
                >
                  {/* Article Card Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.65rem',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        color: '#ffffff',
                        background: 'var(--s2t-red)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '6px',
                        letterSpacing: '0.02em',
                        display: 'inline-block'
                      }}>
                        {article.number}
                      </span>
                      <h4 style={{
                        margin: 0,
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)'
                      }}>
                        {article.title}
                      </h4>
                    </div>

                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.55rem',
                      borderRadius: 'var(--radius-full)',
                      background: 'rgba(37, 99, 235, 0.08)',
                      color: 'var(--s2t-blue)',
                      border: '1px solid rgba(37, 99, 235, 0.2)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em'
                    }}>
                      {article.tag}
                    </span>
                  </div>

                  {/* Summary Callout */}
                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    fontStyle: 'italic',
                    marginBottom: '0.85rem',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: isRtl ? 'none' : '3px solid var(--s2t-blue)',
                    borderRight: isRtl ? '3px solid var(--s2t-blue)' : 'none',
                  }}>
                    💡 {article.summary}
                  </div>

                  {/* Full Legal Text */}
                  <div style={{
                    fontSize: '0.875rem',
                    lineHeight: 1.65,
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-line',
                    marginBottom: '0.85rem',
                    paddingLeft: isRtl ? 0 : '0.25rem',
                    paddingRight: isRtl ? '0.25rem' : 0,
                  }}>
                    {article.content}
                  </div>

                  {/* Key Highlights / Bullets */}
                  {article.highlights && article.highlights.length > 0 && (
                    <div style={{
                      marginTop: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(16, 185, 129, 0.05)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ fontWeight: 700, color: '#059669', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CheckCircle2 size={14} />
                        <span>{t('articles_key_points')}</span>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: isRtl ? 0 : '1.25rem', paddingRight: isRtl ? '1.25rem' : 0, color: 'var(--text-secondary)' }}>
                        {article.highlights.map((hl, idx) => (
                          <li key={idx} style={{ marginBottom: '0.2rem' }}>{hl}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer / Acceptance Action */}
        <div style={{
          padding: '1.1rem 1.75rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <ShieldCheck size={18} color="#10B981" />
            <span>{t('articles_official_doc')}</span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
            >
              {t('articles_close')}
            </button>

            {onAccept && (
              <button
                type="button"
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="btn btn-primary"
                style={{
                  fontSize: '0.85rem',
                  padding: '0.5rem 1.25rem',
                  gap: '0.45rem',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  borderColor: '#10B981',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                }}
              >
                <CheckCircle2 size={16} />
                <span>{hasAccepted ? t('articles_btn_validated') : t('articles_btn_accept')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalArticlesModal;
