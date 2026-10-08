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
  const isRtl = language === 'ar';
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
    <div className="blog-page-wrapper">
      {/* Header Banner */}
      <section className="blog-header-section">
        <div className="container blog-header-container">
          <span className="badge blog-badge-pill">
            {t('blog_badge')}
          </span>
          <h1 className="blog-header-title">
            {t('blog_title')} <span className="gradient-text">{t('blog_title_sub')}</span>
          </h1>
          <p className="blog-header-desc">
            {t('blog_desc')}
          </p>
        </div>
      </section>

      {/* Filter & Search Bar + Articles Grid */}
      <section className="container blog-main-section">
        {/* Filter Card with Search and Categories */}
        <div className="glass-card blog-filter-card">
          {/* Categories Pills Container */}
          <div className="blog-categories-scroll-container">
            <div className="blog-categories-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`blog-cat-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Box */}
          <div className="blog-search-box">
            <Search size={16} className="blog-search-icon" />
            <input
              type="text"
              className="form-input blog-search-input"
              placeholder={t('blog_search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="blog-search-clear"
                onClick={() => setSearch('')}
                aria-label="Effacer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="blog-articles-grid">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((art) => (
              <article
                key={art.id}
                className="glass-card glass-card-hover blog-card"
                onClick={() => setActiveArticle(art)}
              >
                {/* Header Color Banner */}
                <div
                  className="blog-card-banner"
                  style={{ background: art.imageGradient }}
                >
                  <div className="blog-card-banner-top">
                    <span className="blog-card-badge">
                      {art.categoryLabel}
                    </span>
                  </div>
                  <div className="blog-card-meta">
                    <span className="blog-meta-item">
                      <Calendar size={13} /> {art.date}
                    </span>
                    <span className="blog-meta-item">
                      <Clock size={13} /> {art.readTime}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="blog-card-body">
                  <h3 className="blog-card-title">
                    {art.title}
                  </h3>
                  <p className="blog-card-excerpt">
                    {art.excerpt}
                  </p>

                  <div className="blog-card-footer">
                    <span>{t('blog_read_more')}</span>
                    <ArrowRight size={16} className="blog-card-arrow" style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="glass-card blog-empty-state">
              <BookOpen size={44} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>Aucun article trouvé</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Essayez d'ajuster votre recherche ou filtre de catégorie.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="modal-overlay" onClick={() => setActiveArticle(null)}>
          <div
            className="modal-content blog-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="blog-modal-header"
              style={{ background: activeArticle.imageGradient }}
            >
              <button
                type="button"
                className="blog-modal-close-btn"
                onClick={() => setActiveArticle(null)}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>

              <span className="blog-card-badge" style={{ marginBottom: '0.85rem' }}>
                {activeArticle.categoryLabel}
              </span>
              <h2 className="blog-modal-title">
                {activeArticle.title}
              </h2>
              <div className="blog-modal-meta">
                <span>{t('blog_by_author')} {activeArticle.author}</span>
                <span>•</span>
                <span>{activeArticle.date}</span>
                <span>•</span>
                <span>{activeArticle.readTime}</span>
              </div>
            </div>

            <div className="blog-modal-body">
              <div className="blog-modal-content-text">
                {activeArticle.content}
              </div>

              <div className="blog-modal-footer">
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
