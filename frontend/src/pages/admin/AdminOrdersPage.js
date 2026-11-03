import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const STATUS_FLOW = ['order_received', 'in_kitchen', 'sent_to_delivery', 'delivered'];
const STATUS_LABELS = {
  order_received: 'Order Received', in_kitchen: 'In Kitchen',
  sent_to_delivery: 'Out for Delivery', delivered: 'Delivered',
  cancelled: 'Cancelled', pending: 'Pending'
};
const STATUS_COLORS = {
  order_received: '#818cf8', in_kitchen: '#22c55e',
  sent_to_delivery: '#38bdf8', delivered: '#22c55e',
  cancelled: '#ef4444', pending: '#f59e0b'
};
const STATUS_EMOJIS = {
  order_received: '✅', in_kitchen: '👨‍🍳', sent_to_delivery: '🛵', delivered: '🎉',
  cancelled: '❌', pending: '⏳'
};

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await ordersAPI.getAllOrders();
      setOrders(res.data.orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(true);
    try {
      await ordersAPI.updateStatus(orderId, newStatus, statusNote);
      toast.success(`Status updated to: ${STATUS_LABELS[newStatus]}`);
      setSelectedOrder(null);
      setStatusNote('');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (current) => {
    const idx = STATUS_FLOW.indexOf(current);
    if (idx === -1 || idx === STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[idx + 1];
  };

  const filtered = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter);

  if (loading) return <div className="page-loading" style={{ minHeight: 'calc(100vh - 64px)' }}><div className="spinner" /></div>;

  return (
    <div style={{ padding: '32px 0 60px', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 8 }}>Order Management</h1>
          <p style={{ color: '#aaa' }}>{orders.length} total orders · {orders.filter(o => ['order_received', 'in_kitchen'].includes(o.status)).length} active</p>
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', ...STATUS_FLOW, 'cancelled'].map(s => {
            const count = s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
            return (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '8px 16px', background: statusFilter === s ? 'rgba(230,57,70,0.15)' : '#1a1a1a',
                border: `1px solid ${statusFilter === s ? '#e63946' : '#2a2a2a'}`,
                color: statusFilter === s ? '#e63946' : '#aaa', borderRadius: 50,
                cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                {s !== 'all' && STATUS_EMOJIS[s]}
                {s === 'all' ? 'All Orders' : STATUS_LABELS[s]}
                <span style={{ background: '#333', padding: '1px 7px', borderRadius: 50, fontSize: 11 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Orders list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(order => {
            const nextStatus = getNextStatus(order.status);
            return (
              <div key={order._id} style={styles.orderCard}>
                <div style={styles.orderTop}>
                  <div>
                    <span style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</span>
                    <span style={{ color: '#555', fontSize: 13, marginLeft: 12 }}>
                      {new Date(order.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ ...styles.statusBadge, color: STATUS_COLORS[order.status] }}>
                      {STATUS_EMOJIS[order.status]} {STATUS_LABELS[order.status]}
                    </span>
                    <span style={styles.totalPrice}>₹{order.totalPrice}</span>
                  </div>
                </div>

                <div style={styles.orderMid}>
                  <div style={styles.customerInfo}>
                    <strong>{order.user?.name}</strong>
                    <span style={{ color: '#666' }}> · {order.user?.email}</span>
                    {order.user?.phone && <span style={{ color: '#666' }}> · {order.user?.phone}</span>}
                  </div>
                  <div style={{ color: '#555', fontSize: 13, marginTop: 6 }}>📍 {order.deliveryAddress}</div>
                </div>

                {/* Pizza summary */}
                <div style={styles.pizzaRow}>
                  <span>🫓 {order.pizzaSnapshot?.base?.name}</span>
                  <span>🍅 {order.pizzaSnapshot?.sauce?.name}</span>
                  <span>🧀 {order.pizzaSnapshot?.cheese?.name}</span>
                  {order.pizzaSnapshot?.veggies?.length > 0 && (
                    <span>🥦 {order.pizzaSnapshot.veggies.map(v => v.name).join(', ')}</span>
                  )}
                  {order.pizzaSnapshot?.meats?.length > 0 && (
                    <span>🍗 {order.pizzaSnapshot.meats.map(m => m.name).join(', ')}</span>
                  )}
                </div>

                {/* Action buttons */}
                <div style={styles.orderActions}>
                  <button style={styles.detailsBtn} onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}>
                    {selectedOrder?._id === order._id ? 'Close' : 'View Details'}
                  </button>
                  {nextStatus && order.status !== 'cancelled' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => updateStatus(order._id, nextStatus)}
                      disabled={updating}
                    >
                      {updating ? '...' : `→ Mark as ${STATUS_LABELS[nextStatus]}`}
                    </button>
                  )}
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button
                      className="btn btn-sm"
                      style={{ background: '#ef4444', color: 'white', borderRadius: 50, padding: '8px 16px', fontSize: 13, border: 'none', cursor: 'pointer' }}
                      onClick={() => updateStatus(order._id, 'cancelled')}
                      disabled={updating}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>

                {/* Expanded details */}
                {selectedOrder?._id === order._id && (
                  <div style={styles.expandedDetails}>
                    <div style={styles.detailGrid}>
                      <div>
                        <h4 style={styles.detailTitle}>Status History</h4>
                        {order.statusHistory?.map((h, i) => (
                          <div key={i} style={styles.historyItem}>
                            <span style={{ color: STATUS_COLORS[h.status] }}>● {STATUS_LABELS[h.status]}</span>
                            <span style={{ color: '#555', fontSize: 12 }}>{new Date(h.timestamp).toLocaleString('en-IN')}</span>
                            {h.note && <span style={{ color: '#666', fontSize: 12 }}> — {h.note}</span>}
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 style={styles.detailTitle}>Update with Note</h4>
                        <textarea
                          className="form-input"
                          rows={2}
                          placeholder="Optional note for customer..."
                          value={statusNote}
                          onChange={e => setStatusNote(e.target.value)}
                          style={{ resize: 'none', marginBottom: 10 }}
                        />
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {STATUS_FLOW.map(s => (
                            s !== order.status && (
                              <button key={s} className="btn btn-sm btn-secondary"
                                onClick={() => updateStatus(order._id, s)} disabled={updating}>
                                {STATUS_EMOJIS[s]} {STATUS_LABELS[s]}
                              </button>
                            )
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <p style={{ color: '#555', fontSize: 13 }}>Payment ID: {order.paymentId || 'N/A'}</p>
                      <p style={{ color: '#555', fontSize: 13 }}>Payment: <span style={{ color: order.paymentStatus === 'paid' ? '#22c55e' : '#f59e0b' }}>{order.paymentStatus}</span></p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🍕</p>
              <p>No orders found for this filter</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  orderCard: {
    background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 20,
    transition: 'border-color 0.2s'
  },
  orderTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontWeight: 700, fontFamily: "'Playfair Display', serif", fontSize: 15 },
  statusBadge: { fontWeight: 600, fontSize: 13, background: 'rgba(255,255,255,0.04)', padding: '5px 12px', borderRadius: 50 },
  totalPrice: { fontSize: 18, fontWeight: 700, color: '#e63946' },
  orderMid: { marginBottom: 12 },
  customerInfo: { fontSize: 14 },
  pizzaRow: {
    display: 'flex', gap: 12, flexWrap: 'wrap', padding: '12px 0',
    borderTop: '1px solid #222', borderBottom: '1px solid #222',
    marginBottom: 12, color: '#666', fontSize: 13
  },
  orderActions: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  detailsBtn: {
    background: 'transparent', border: '1px solid #333', color: '#aaa',
    padding: '8px 16px', borderRadius: 50, cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif", fontSize: 13
  },
  expandedDetails: { marginTop: 16, background: '#111', borderRadius: 12, padding: 20 },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 },
  detailTitle: { fontFamily: "'Playfair Display', serif", fontSize: 15, marginBottom: 12 },
  historyItem: { marginBottom: 8, display: 'flex', flexDirection: 'column', gap: 2, fontSize: 14 }
};

export default AdminOrdersPage;
