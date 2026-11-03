import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CATEGORY_EMOJIS = { base: '🫓', sauce: '🍅', cheese: '🧀', veggie: '🥦', meat: '🍗' };

const DashboardPage = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await inventoryAPI.getAll({ available: 'true' });
      setInventory(res.data.items);
    } catch (err) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'base', 'sauce', 'cheese', 'veggie', 'meat'];
  const filtered = activeCategory === 'all' ? inventory : inventory.filter(i => i.category === activeCategory);

  const getCategoryCount = (cat) => inventory.filter(i => i.category === cat).length;

  if (loading) return (
    <div className="page-loading" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)' }}>Loading menu...</p>
    </div>
  );

  return (
    <div style={styles.page}>
      <div className="container">
        {/* Hero banner */}
        <div style={styles.hero}>
          <div>
            <h1 style={styles.heroTitle}>Hello, {user?.name?.split(' ')[0]}! 👋</h1>
            <p style={styles.heroSub}>What are you craving today?</p>
          </div>
          <Link to="/build-pizza" className="btn btn-primary btn-lg">
            ✨ Build Your Pizza
          </Link>
        </div>

        {/* Stats */}
        <div style={styles.stats}>
          {['base', 'sauce', 'cheese', 'veggie', 'meat'].map(cat => (
            <div key={cat} style={styles.statCard}>
              <span style={styles.statEmoji}>{CATEGORY_EMOJIS[cat]}</span>
              <span style={styles.statCount}>{getCategoryCount(cat)}</span>
              <span style={styles.statLabel}>{cat}s</span>
            </div>
          ))}
        </div>

        {/* Section */}
        <div style={styles.sectionHeader}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28 }}>Our Ingredients</h2>
          <p style={{ color: '#aaa', marginTop: 6 }}>Mix and match to create your perfect pizza</p>
        </div>

        {/* Category filter */}
        <div style={styles.filterRow}>
          {categories.map(cat => (
            <button
              key={cat}
              style={{ ...styles.filterBtn, ...(activeCategory === cat ? styles.filterBtnActive : {}) }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat !== 'all' && CATEGORY_EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              {cat !== 'all' && <span style={styles.filterCount}>{getCategoryCount(cat)}</span>}
            </button>
          ))}
        </div>

        {/* Ingredient grid */}
        <div style={styles.grid}>
          {filtered.map(item => (
            <div key={item._id} style={styles.itemCard}>
              <div style={styles.itemEmoji}>{CATEGORY_EMOJIS[item.category]}</div>
              <div style={styles.itemInfo}>
                <h3 style={styles.itemName}>{item.name}</h3>
                <p style={styles.itemDesc}>{item.description}</p>
                <div style={styles.itemFooter}>
                  <span style={styles.itemCategory}>{item.category}</span>
                  <span style={styles.itemPrice}>₹{item.price}</span>
                </div>
              </div>
              {item.stock <= item.threshold && (
                <div style={styles.lowStockBadge}>Low Stock</div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={styles.empty}>
            <p style={{ fontSize: 40 }}>🫙</p>
            <p style={{ color: '#aaa', marginTop: 12 }}>No items in this category</p>
          </div>
        )}

        {/* CTA */}
        <div style={styles.cta}>
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 8 }}>Ready to Order?</h3>
            <p style={{ color: '#aaa' }}>Build your custom pizza with your favorite ingredients</p>
          </div>
          <Link to="/build-pizza" className="btn btn-primary btn-lg">
            Start Building 🍕
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '32px 0 60px', minHeight: 'calc(100vh - 64px)' },
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, #1a0a0a, #2d1010)',
    border: '1px solid #3d1515',
    borderRadius: 20,
    padding: '36px 40px',
    marginBottom: 32
  },
  heroTitle: { fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 8 },
  heroSub: { color: '#aaa', fontSize: 16 },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 12,
    marginBottom: 40
  },
  statCard: {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: 14,
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4
  },
  statEmoji: { fontSize: 28 },
  statCount: { fontSize: 24, fontWeight: 700 },
  statLabel: { fontSize: 12, color: '#666', textTransform: 'capitalize' },
  sectionHeader: { marginBottom: 20 },
  filterRow: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  filterBtn: {
    padding: '8px 18px',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: 50,
    color: '#aaa',
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  filterBtnActive: { background: 'rgba(230,57,70,0.15)', border: '1px solid #e63946', color: '#e63946' },
  filterCount: {
    background: '#333',
    padding: '2px 7px',
    borderRadius: 50,
    fontSize: 11,
    color: '#aaa'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 16,
    marginBottom: 40
  },
  itemCard: {
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.2s',
    cursor: 'default'
  },
  itemEmoji: {
    fontSize: 48,
    background: 'linear-gradient(135deg, #1a0a0a, #2d1010)',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  itemInfo: { padding: '16px' },
  itemName: { fontFamily: "'Playfair Display', serif", fontSize: 16, marginBottom: 6 },
  itemDesc: { color: '#666', fontSize: 13, lineHeight: 1.5, marginBottom: 12 },
  itemFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemCategory: {
    background: '#222',
    color: '#888',
    padding: '3px 10px',
    borderRadius: 50,
    fontSize: 11,
    textTransform: 'capitalize'
  },
  itemPrice: { color: '#e63946', fontWeight: 700, fontSize: 16 },
  lowStockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    background: 'rgba(239,68,68,0.9)',
    color: 'white',
    padding: '3px 8px',
    borderRadius: 50,
    fontSize: 11,
    fontWeight: 600
  },
  empty: { textAlign: 'center', padding: '60px 0' },
  cta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(135deg, rgba(230,57,70,0.1), rgba(255,107,53,0.1))',
    border: '1px solid rgba(230,57,70,0.2)',
    borderRadius: 20,
    padding: '32px 40px'
  }
};

export default DashboardPage;
