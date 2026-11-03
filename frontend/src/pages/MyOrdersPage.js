import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['order_received', 'in_kitchen', 'sent_to_delivery', 'delivered'];
const STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
  order_received: 'Order Received',
  in_kitchen: 'In Kitchen',
  sent_to_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled'
};
const STATUS_EMOJIS = {
  pending: '⏳', order_received: '✅', in_kitchen: '👨‍🍳',
  sent_to_delivery: '🛵', delivered: '🎉', cancelled: '❌'
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await ordersAPI.getMyOrders();
      setOrders(res.data.orders);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const map = {
      order_received: 'badge-received', in_kitchen: 'badge-kitchen',
      sent_to_delivery: 'badge-delivery', delivered: 'badge-delivered',
      cancelled: 'badge-cancelled', pending: 'badge-pending'
    };
    return map[status] || 'badge-pending';
  };

  const getProgressWidth = (status) => {
    const idx = STATUS_STEPS.indexOf(status);
    if (idx === -1) return status === 'cancelled' ? '100%' : '0%';
    return `${((idx + 1) / STATUS_STEPS.length) * 100}%`;
  };

  if (loading) return (
    <div className="page-loading" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div className="spinner" /><p style={{ color: '#aaa' }}>Loading orders...</p>
    </div>
  );

  return (
    <div style={{ padding: '32px 0 60px', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 8 }}>My Orders</h1>
            <p style={{ color: '#aaa' }}>Track your pizza deliveries in real time</p>
          </div>
          <Link to="/build-pizza" className="btn btn-primary">+ Order New Pizza</Link>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 64 }}>🍕</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginTop: 16, marginBottom: 8 }}>No orders yet!</h3>
            <p style={{ color: '#aaa', marginBottom: 24 }}>Build your first custom pizza</p>
            <Link to="/build-pizza" className="btn btn-primary btn-lg">Order Now</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {orders.map(order => (
              <div key={order._id} style={styles.orderCard}>
                <div style={styles.orderHeader}>
                  <div>
                    <span style={styles.orderId}>Order #{order._id.slice(-8).toUpperCase()}</span>
                    <span style={{ color: '#555', fontSize: 13, marginLeft: 12 }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className={`badge ${getStatusClass(order.status)}`}>
                      {STATUS_EMOJIS[order.status]} {STATUS_LABELS[order.status]}
                    </span>
                    <span style={styles.price}>₹{order.totalPrice}</span>
                  </div>
                </div>

                {/* Progress bar */}
                {order.status !== 'cancelled' && (
                  <div style={styles.progressSection}>
                    <div style={styles.progressTrack}>
                      <div style={{
                        ...styles.progressFill,
                        width: getProgressWidth(order.status),
                        background: order.status === 'delivered' ? '#22c55e' : 'linear-gradient(90deg, #e63946, #ff6b35)'
                      }} />
                    </div>
                    <div style={styles.progressSteps}>
                      {STATUS_STEPS.map((s, i) => {
                        const currentIdx = STATUS_STEPS.indexOf(order.status);
                        const done = i <= currentIdx;
                        return (
                          <div key={s} style={styles.progressStep}>
                            <div style={{
                              ...styles.progressDot,
                              ...(done ? styles.progressDotDone : {})
                            }}>{done ? '✓' : ''}</div>
                            <span style={{ ...styles.progressLabel, ...(done ? { color: '#ccc' } : {}) }}>
                              {STATUS_LABELS[s]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pizza summary */}
                <div style={styles.pizzaSummary}>
                  <span style={{ color: '#666', fontSize: 13 }}>
                    🫓 {order.pizzaSnapshot?.base?.name} &bull; 🍅 {order.pizzaSnapshot?.sauce?.name} &bull; 🧀 {order.pizzaSnapshot?.cheese?.name}
                    {order.pizzaSnapshot?.veggies?.length > 0 && ` • 🥦 ${order.pizzaSnapshot.veggies.map(v => v.name).join(', ')}`}
                  </span>
                </div>

                <div style={styles.orderFooter}>
                  <span style={{ color: '#555', fontSize: 13 }}>📍 {order.deliveryAddress}</span>
                  <Link to={`/orders/${order._id}`} style={{ color: '#e63946', fontSize: 14, textDecoration: 'none', fontWeight: 500 }}>
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  orderCard: {
    background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 24,
    transition: 'border-color 0.2s'
  },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  orderId: { fontWeight: 700, fontFamily: "'Playfair Display', serif", fontSize: 16 },
  price: { fontSize: 18, fontWeight: 700, color: '#e63946' },
  progressSection: { marginBottom: 20 },
  progressTrack: { height: 4, background: '#2a2a2a', borderRadius: 2, marginBottom: 16, position: 'relative' },
  progressFill: { height: '100%', borderRadius: 2, transition: 'width 0.5s ease' },
  progressSteps: { display: 'flex', justifyContent: 'space-between' },
  progressStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  progressDot: {
    width: 20, height: 20, borderRadius: '50%', background: '#2a2a2a',
    border: '2px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, color: 'white', fontWeight: 700
  },
  progressDotDone: { background: '#e63946', border: '2px solid #e63946' },
  progressLabel: { fontSize: 11, color: '#555', textAlign: 'center', maxWidth: 70 },
  pizzaSummary: { padding: '12px 0', borderTop: '1px solid #2a2a2a', borderBottom: '1px solid #2a2a2a', marginBottom: 16 },
  orderFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
};

export default MyOrdersPage;
