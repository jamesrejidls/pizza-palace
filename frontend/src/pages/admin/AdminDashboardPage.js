import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventoryAPI, ordersAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const AdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [summaryRes, ordersRes] = await Promise.all([
        inventoryAPI.getSummary(),
        ordersAPI.getAllOrders()
      ]);
      setSummary(summaryRes.data);
      setOrders(ordersRes.data.orders.slice(0, 5));
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="page-loading" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div className="spinner" />
    </div>
  );

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ['order_received', 'in_kitchen'].includes(o.status)).length;
  const lowStockCount = summary?.lowStockItems?.length || 0;

  const statusColors = {
    order_received: '#818cf8', in_kitchen: '#22c55e', sent_to_delivery: '#38bdf8',
    delivered: '#22c55e', cancelled: '#ef4444', pending: '#f59e0b'
  };
  const statusLabels = {
    order_received: 'Received', in_kitchen: 'In Kitchen', sent_to_delivery: 'Delivering',
    delivered: 'Delivered', cancelled: 'Cancelled'
  };

  return (
    <div style={{ padding: '32px 0 60px', minHeight: 'calc(100vh - 64px)' }}>
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, marginBottom: 8 }}>Admin Dashboard</h1>
          <p style={{ color: '#aaa' }}>Monitor your Pizza Palace operations</p>
        </div>

        {/* Stat cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📦</div>
            <div style={styles.statValue}>{summary?.summary?.reduce((s, c) => s + c.totalItems, 0) || 0}</div>
            <div style={styles.statLabel}>Total Ingredients</div>
            <Link to="/admin/inventory" style={styles.statLink}>Manage →</Link>
          </div>
          <div style={{ ...styles.statCard, ...(lowStockCount > 0 ? styles.alertCard : {}) }}>
            <div style={styles.statIcon}>⚠️</div>
            <div style={{ ...styles.statValue, color: lowStockCount > 0 ? '#ef4444' : '#f5f5f0' }}>{lowStockCount}</div>
            <div style={styles.statLabel}>Low Stock Items</div>
            <Link to="/admin/inventory" style={styles.statLink}>Restock →</Link>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>🛒</div>
            <div style={styles.statValue}>{pendingOrders}</div>
            <div style={styles.statLabel}>Active Orders</div>
            <Link to="/admin/orders" style={styles.statLink}>View →</Link>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>💰</div>
            <div style={styles.statValue}>
              ₹{orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalPrice, 0).toLocaleString('en-IN')}
            </div>
            <div style={styles.statLabel}>Total Revenue (shown)</div>
            <Link to="/admin/orders" style={styles.statLink}>Details →</Link>
          </div>
        </div>

        {/* Low stock alert */}
        {lowStockCount > 0 && (
          <div style={styles.alertBanner}>
            <span>⚠️</span>
            <div>
              <strong>Low Stock Alert!</strong>
              <p style={{ color: '#aaa', margin: '4px 0 0', fontSize: 14 }}>
                {summary?.lowStockItems?.map(i => i.name).join(', ')} are running low.
              </p>
            </div>
            <Link to="/admin/inventory" className="btn btn-sm" style={{ background: '#ef4444', color: 'white', borderRadius: 50 }}>
              Restock Now
            </Link>
          </div>
        )}

        <div style={styles.grid2}>
          {/* Inventory summary */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Inventory by Category</h3>
              <Link to="/admin/inventory" style={styles.viewAll}>View All</Link>
            </div>
            {summary?.summary?.map(cat => (
              <div key={cat._id} style={styles.catRow}>
                <div>
                  <div style={styles.catName}>{cat._id}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>{cat.totalItems} items · {cat.totalStock} in stock</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {cat.lowStockItems > 0 && (
                    <span style={styles.lowBadge}>{cat.lowStockItems} low</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recent orders */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Recent Orders</h3>
              <Link to="/admin/orders" style={styles.viewAll}>View All</Link>
            </div>
            {orders.length === 0 ? (
              <p style={{ color: '#555', textAlign: 'center', padding: 20 }}>No orders yet</p>
            ) : orders.map(order => (
              <div key={order._id} style={styles.orderRow}>
                <div>
                  <div style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</div>
                  <div style={{ color: '#666', fontSize: 13 }}>{order.user?.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ ...styles.statusDot, color: statusColors[order.status] }}>
                    ● {statusLabels[order.status] || order.status}
                  </span>
                  <div style={{ color: '#e63946', fontWeight: 700, fontSize: 15 }}>₹{order.totalPrice}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div style={styles.actionsGrid}>
          <Link to="/admin/inventory" style={styles.actionCard}>
            <span style={{ fontSize: 32 }}>📦</span>
            <h3>Manage Inventory</h3>
            <p>Add, edit, restock ingredients</p>
          </Link>
          <Link to="/admin/orders" style={styles.actionCard}>
            <span style={{ fontSize: 32 }}>🛒</span>
            <h3>Manage Orders</h3>
            <p>Update order statuses</p>
          </Link>
          <Link to="/admin/orders?status=in_kitchen" style={styles.actionCard}>
            <span style={{ fontSize: 32 }}>👨‍🍳</span>
            <h3>Kitchen View</h3>
            <p>Orders being prepared</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: {
    background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 24,
    display: 'flex', flexDirection: 'column', gap: 4
  },
  alertCard: { borderColor: '#ef4444', background: 'rgba(239,68,68,0.05)' },
  statIcon: { fontSize: 28, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display', serif" },
  statLabel: { color: '#666', fontSize: 13 },
  statLink: { color: '#e63946', fontSize: 13, textDecoration: 'none', marginTop: 4 },
  alertBanner: {
    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 12, padding: '16px 24px', display: 'flex', alignItems: 'center',
    gap: 16, marginBottom: 24, fontSize: 20
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 24 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18 },
  viewAll: { color: '#e63946', fontSize: 13, textDecoration: 'none' },
  catRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid #222'
  },
  catName: { fontWeight: 600, textTransform: 'capitalize', marginBottom: 2 },
  lowBadge: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', padding: '2px 10px', borderRadius: 50, fontSize: 12 },
  orderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #222' },
  orderId: { fontWeight: 700, fontFamily: "'Playfair Display', serif" },
  statusDot: { fontSize: 13, display: 'block', marginBottom: 2 },
  actionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
  actionCard: {
    background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: '28px 24px',
    textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column', gap: 8,
    transition: 'all 0.2s', cursor: 'pointer'
  }
};

export default AdminDashboardPage;
