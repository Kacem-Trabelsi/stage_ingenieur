import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Calendar, 
  Clock, 
  Tag, 
  Search, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  Share2, 
  X,
  BookOpen
} from 'lucide-react';

const Blog = () => {
  const { t, language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [activeArticle, setActiveArticle] = useState(null);

  const categories = [
    { id: 'all', label: t('blog_cat_all') },
    { id: 'incubation', label: t('blog_cat_incubation') },
    { id: 'juridique', label: t('blog_cat_juridique') },
    { id: 'evenements', label: t('blog_cat_evenements') },
    { id: 'finance', label: t('blog_cat_finance') },
  ];

  const articles = [
    {
      id: 1,
      title: t('blog_art1_title'),
      category: 'incubation',
      categoryLabel: t('blog_cat_incubation'),
      date: t('blog_art1_date'),
      readTime: t('blog_art1_read_time'),
      author: t('blog_art1_author'),
      imageGradient: 'linear-gradient(135deg, #E11D48 0%, #2563EB 100%)',
      excerpt: t('blog_art1_excerpt'),
      content: t('blog_art1_content'),
    },
    {
      id: 2,
      title: t('blog_art2_title'),
      category: 'juridique',
      categoryLabel: t('blog_cat_juridique'),
      date: t('blog_art2_date'),
      readTime: t('blog_art2_read_time'),
      author: t('blog_art2_author'),
      imageGradient: 'linear-gradient(135deg, #2563EB 0%, #0D9488 100%)',
      excerpt: t('blog_art2_excerpt'),
      content: t('blog_art2_content'),
    },
    {
      id: 3,
      title: t('blog_art3_title'),
      category: 'finance',
      categoryLabel: t('blog_cat_finance'),
      date: t('blog_art3_date'),
      readTime: t('blog_art3_read_time'),
      author: t('blog_art3_author'),
      imageGradient: 'linear-gradient(135deg, #0D9488 0%, #E11D48 100%)',
      excerpt: t('blog_art3_excerpt'),
      content: t('blog_art3_content'),
    },
    {
      id: 4,
      title: t('blog_art4_title'),
      category: 'evenements',
      categoryLabel: t('blog_cat_evenements'),
      date: t('blog_art4_date'),
      readTime: t('blog_art4_read_time'),
      author: t('blog_art4_author'),
      imageGradient: 'linear-gradient(135deg, #8B5CF6 0%, #2563EB 100%)',
      excerpt: t('blog_art4_excerpt'),
      content: t('blog_art4_content'),
    },
  ];

  const filteredArticles = articles.filter((art) => {
    const matchCat = selectedCategory === 'all' || art.category === selectedCategory;
    const matchSearch =
      art.title.toLowerCase().includes(search.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ paddingBottom: '6rem' }}>
      {/* Header Banner */}
      <section style={{
        padding: '5rem 0 3.5rem',
        textAlign: 'center',
        background: 'var(--grad-hero)',
        borderBottom: '1px solid var(--border-color)',
      }}>
        <div className="container" style={{ maxWidth: '850px' }}>
          <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--s2t-red)', marginBottom: '1.25rem' }}>
            {t('blog_badge')}
          </span>
          <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', marginBottom: '1.25rem' }}>
            {t('blog_title')} <span className="gradient-text">{t('blog_title_sub')}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
            {t('blog_desc')}
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="container" style={{ padding: '3rem 1.5rem 2rem' }}>
        <div className="glass-card" style={{
          padding: '1.25rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2.5rem',
        }}>
          {/* Categories */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn btn-sm ${selectedCategory === cat.id ? 'btn-primary' : 'btn-ghost'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '340px' }}>
            <Search size={16} style={{
              position: 'absolute',
              [language === 'ar' ? 'right' : 'left']: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              className="form-input"
              style={{
                [language === 'ar' ? 'paddingRight' : 'paddingLeft']: '2.5rem',
                height: '38px',
                fontSize: '0.875rem'
              }}
              placeholder={t('blog_search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Articles Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '2rem',
        }}>
          {filteredArticles.map((art) => (
            <article
              key={art.id}
              className="glass-card glass-card-hover"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => setActiveArticle(art)}
            >
              {/* Header Color Banner */}
              <div style={{
                height: '140px',
                background: art.imageGradient,
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <span className="badge" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', alignSelf: 'flex-start' }}>
                  {art.categoryLabel}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Calendar size={13} /> {art.date}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={13} /> {art.readTime}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>
                  {art.title}
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '1.5rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {art.excerpt}
                </p>

                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-color)',
                  fontSize: '0.825rem',
                  color: 'var(--s2t-red)',
                  fontWeight: 600,
                }}>
                  <span>{t('blog_read_more')}</span>
                  <ArrowRight size={16} style={{ transform: language === 'ar' ? 'rotate(180deg)' : 'none' }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="modal-overlay" onClick={() => setActiveArticle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div style={{
              padding: '2rem',
              background: activeArticle.imageGradient,
              color: '#fff',
              position: 'relative',
            }}>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  [language === 'ar' ? 'left' : 'right']: '1rem',
                  background: 'rgba(0,0,0,0.5)',
                  border: 'none',
                  color: '#fff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>

              <span className="badge" style={{ background: 'rgba(0,0,0,0.4)', color: '#fff', marginBottom: '1rem' }}>
                {activeArticle.categoryLabel}
              </span>
              <h2 style={{ fontSize: '1.6rem', lineHeight: 1.3, marginBottom: '0.75rem' }}>
                {activeArticle.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', opacity: 0.9 }}>
                <span>{t('blog_by_author')} {activeArticle.author}</span>
                <span>•</span>
                <span>{activeArticle.date}</span>
              </div>
            </div>

            <div style={{ padding: '2rem' }}>
              <div style={{ whiteSpace: 'pre-line', lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                {activeArticle.content}
              </div>

              <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveArticle(null)}
                >
                  {t('blog_close_modal')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;

