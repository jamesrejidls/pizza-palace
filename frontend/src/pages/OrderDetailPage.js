import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersAPI } from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_LABELS = {
  pending: 'Pending', order_received: 'Order Received', in_kitchen: 'In Kitchen',
  sent_to_delivery: 'Out for Delivery', delivered: 'Delivered', cancelled: 'Cancelled'
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await ordersAPI.getOrder(id);
      setOrder(res.data.order);
    } catch {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loading" style={{ minHeight: 'calc(100vh - 64px)' }}><div className="spinner" /></div>;
  if (!order) return <div style={{ padding: 40, textAlign: 'center' }}><p>Order not found</p></div>;

  const subtotal = (order.pizzaSnapshot?.veggies || []).reduce((s, v) => s + v.price, 0) +
    (order.pizzaSnapshot?.meats || []).reduce((s, m) => s + m.price, 0);

  return (
    <div style={{ padding: '32px 0 60px', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/my-orders" style={{ color: '#aaa', textDecoration: 'none', fontSize: 14 }}>← Back to Orders</Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 6 }}>
              Order #{order._id.slice(-8).toUpperCase()}
            </h1>
            <p style={{ color: '#666', fontSize: 14 }}>
              Placed {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'full' })}
            </p>
          </div>
          <div style={styles.statusBadge}>
            {STATUS_LABELS[order.status]}
          </div>
        </div>

        {/* Order timeline */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Order Timeline</h3>
          {order.statusHistory?.map((h, i) => (
            <div key={i} style={styles.timelineItem}>
              <div style={styles.timelineDot} />
              <div>
                <div style={styles.timelineStatus}>{STATUS_LABELS[h.status]}</div>
                {h.note && <div style={{ color: '#666', fontSize: 13 }}>{h.note}</div>}
                <div style={{ color: '#444', fontSize: 12, marginTop: 2 }}>
                  {new Date(h.timestamp).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pizza details */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Your Pizza 🍕</h3>
          <div style={styles.ingredientRow}>
            <span style={styles.ingredientLabel}>🫓 Base</span>
            <span>{order.pizzaSnapshot?.base?.name}</span>
            <span style={styles.price}>₹{order.pizzaSnapshot?.base?.price}</span>
          </div>
          <div style={styles.ingredientRow}>
            <span style={styles.ingredientLabel}>🍅 Sauce</span>
            <span>{order.pizzaSnapshot?.sauce?.name}</span>
            <span style={styles.price}>₹{order.pizzaSnapshot?.sauce?.price}</span>
          </div>
          <div style={styles.ingredientRow}>
            <span style={styles.ingredientLabel}>🧀 Cheese</span>
            <span>{order.pizzaSnapshot?.cheese?.name}</span>
            <span style={styles.price}>₹{order.pizzaSnapshot?.cheese?.price}</span>
          </div>
          {(order.pizzaSnapshot?.veggies || []).map((v, i) => (
            <div key={i} style={styles.ingredientRow}>
              <span style={styles.ingredientLabel}>🥦 Veggie</span>
              <span>{v.name}</span>
              <span style={styles.price}>₹{v.price}</span>
            </div>
          ))}
          {(order.pizzaSnapshot?.meats || []).map((m, i) => (
            <div key={i} style={styles.ingredientRow}>
              <span style={styles.ingredientLabel}>🍗 Meat</span>
              <span>{m.name}</span>
              <span style={styles.price}>₹{m.price}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #2a2a2a', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: '#e63946', fontSize: 20 }}>₹{order.totalPrice}</span>
          </div>
        </div>

        {/* Delivery */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Delivery Details</h3>
          <p style={{ color: '#aaa' }}>📍 {order.deliveryAddress}</p>
          {order.paymentId && (
            <p style={{ color: '#555', fontSize: 13, marginTop: 8 }}>Payment ID: {order.paymentId}</p>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/build-pizza" className="btn btn-primary">Order Another Pizza 🍕</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 24, marginBottom: 16 },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 20 },
  statusBadge: {
    background: 'rgba(230,57,70,0.15)', color: '#e63946', border: '1px solid rgba(230,57,70,0.3)',
    padding: '8px 20px', borderRadius: 50, fontWeight: 600, fontSize: 14
  },
  timelineItem: { display: 'flex', gap: 16, marginBottom: 20, position: 'relative', paddingLeft: 8 },
  timelineDot: {
    width: 12, height: 12, background: '#e63946', borderRadius: '50%', flexShrink: 0, marginTop: 4
  },
  timelineStatus: { fontWeight: 600, marginBottom: 2 },
  ingredientRow: {
    display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 16,
    alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #222'
  },
  ingredientLabel: { color: '#666', fontSize: 13 },
  price: { color: '#e63946', fontWeight: 600 }
};

export default OrderDetailPage;
