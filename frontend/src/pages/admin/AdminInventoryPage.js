import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { inventoryAPI } from '../../utils/api';

const CATEGORIES = ['base', 'sauce', 'cheese', 'veggie', 'meat'];
const EMOJIS = { base: '🫓', sauce: '🍅', cheese: '🧀', veggie: '🥦', meat: '🍗' };

const emptyForm = { name: '', category: 'base', description: '', price: '', stock: '', threshold: 20, unit: 'units' };

const AdminInventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [restockModal, setRestockModal] = useState(null);
  const [restockQty, setRestockQty] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await inventoryAPI.getAll();
      setItems(res.data.items);
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await inventoryAPI.update(editItem._id, form);
        toast.success('Item updated!');
      } else {
        await inventoryAPI.create(form);
        toast.success('Item created!');
      }
      setShowModal(false);
      setEditItem(null);
      setForm(emptyForm);
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, category: item.category, description: item.description,
      price: item.price, stock: item.stock, threshold: item.threshold, unit: item.unit
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await inventoryAPI.delete(id);
      toast.success('Item deleted');
      fetchItems();
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const handleRestock = async () => {
    if (!restockQty || restockQty < 1) return toast.error('Enter a valid quantity');
    try {
      await inventoryAPI.restock(restockModal._id, parseInt(restockQty));
      toast.success(`Restocked ${restockQty} units!`);
      setRestockModal(null);
      setRestockQty('');
      fetchItems();
    } catch {
      toast.error('Failed to restock');
    }
  };

  const filtered = activeCategory === 'all' ? items : items.filter(i => i.category === activeCategory);

  if (loading) return <div className="page-loading" style={{ minHeight: 'calc(100vh - 64px)' }}><div className="spinner" /></div>;

  return (
    <div style={{ padding: '32px 0 60px', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 8 }}>Inventory Management</h1>
            <p style={{ color: '#aaa' }}>{items.length} ingredients · {items.filter(i => i.stock <= i.threshold).length} low stock</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditItem(null); setForm(emptyForm); setShowModal(true); }}>
            + Add Ingredient
          </button>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', ...CATEGORIES].map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{
                padding: '8px 18px', background: activeCategory === cat ? 'rgba(230,57,70,0.15)' : '#1a1a1a',
                border: `1px solid ${activeCategory === cat ? '#e63946' : '#2a2a2a'}`,
                color: activeCategory === cat ? '#e63946' : '#aaa', borderRadius: 50,
                cursor: 'pointer', fontSize: 14, fontFamily: "'DM Sans', sans-serif"
              }}>
              {cat !== 'all' && EMOJIS[cat]} {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={styles.table}>
          <div style={styles.tableHeader}>
            <span>Item</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filtered.map(item => {
            const isLow = item.stock <= item.threshold;
            return (
              <div key={item._id} style={{ ...styles.tableRow, ...(isLow ? styles.lowRow : {}) }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{EMOJIS[item.category]} {item.name}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>{item.description}</div>
                </div>
                <span style={{ textTransform: 'capitalize', color: '#aaa', fontSize: 14 }}>{item.category}</span>
                <span style={{ fontWeight: 700 }}>₹{item.price}</span>
                <div>
                  <span style={{ fontWeight: 700, color: isLow ? '#ef4444' : '#f5f5f0' }}>{item.stock}</span>
                  <span style={{ color: '#555', fontSize: 12 }}> / {item.unit}</span>
                  <div style={{ fontSize: 11, color: '#555' }}>threshold: {item.threshold}</div>
                </div>
                <div>
                  {isLow ? (
                    <span className="badge badge-low">⚠ Low</span>
                  ) : (
                    <span className="badge badge-paid">● OK</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="btn btn-sm" style={{ background: '#22c55e', color: 'white', borderRadius: 50, padding: '7px 16px', fontSize: 13, border: 'none', cursor: 'pointer' }}
                    onClick={() => { setRestockModal(item); setRestockQty(''); }}>
                    +Stock
                  </button>
                  <button className="btn btn-sm btn-danger" style={{ borderRadius: 50 }} onClick={() => handleDelete(item._id)}>✕</button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#555' }}>No items found</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editItem ? 'Edit Ingredient' : 'Add Ingredient'}</h3>
              <button style={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input className="form-input" type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Threshold</label>
                  <input className="form-input" type="number" min="0" value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <input className="form-input" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="units" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModal && (
        <div style={styles.overlay} onClick={() => setRestockModal(null)}>
          <div style={{ ...styles.modal, maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Restock: {restockModal.name}</h3>
              <button style={styles.closeBtn} onClick={() => setRestockModal(null)}>✕</button>
            </div>
            <p style={{ color: '#aaa', marginBottom: 20 }}>Current stock: <strong>{restockModal.stock}</strong> {restockModal.unit}</p>
            <div className="form-group">
              <label className="form-label">Quantity to Add</label>
              <input className="form-input" type="number" min="1" placeholder="e.g. 50"
                value={restockQty} onChange={e => setRestockQty(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setRestockModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRestock}>Add Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  table: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, overflow: 'hidden' },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 80px 120px 100px 180px',
    gap: 16, padding: '14px 20px', background: '#111',
    fontSize: 12, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '2fr 1fr 80px 120px 100px 180px',
    gap: 16, padding: '16px 20px', alignItems: 'center',
    borderTop: '1px solid #222', transition: 'background 0.15s'
  },
  lowRow: { background: 'rgba(239,68,68,0.04)' },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
  },
  modal: {
    background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 20,
    padding: 32, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto'
  },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22 },
  closeBtn: { background: 'none', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer' }
};

export default AdminInventoryPage;
