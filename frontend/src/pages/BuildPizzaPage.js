import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { inventoryAPI, ordersAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Base', 'Sauce', 'Cheese', 'Veggies', 'Review & Pay'];
const CATEGORY_MAP = ['base', 'sauce', 'cheese', 'veggie'];

const BuildPizzaPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [selection, setSelection] = useState({
    base: null, sauce: null, cheese: null, veggies: [], meats: []
  });
  const [address, setAddress] = useState(user?.address || '');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await inventoryAPI.getAll({ available: 'true' });
      const grouped = {};
      res.data.items.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push(item);
      });
      setInventory(grouped);
    } catch (err) {
      toast.error('Failed to load ingredients');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    if (selection.base) total += selection.base.price;
    if (selection.sauce) total += selection.sauce.price;
    if (selection.cheese) total += selection.cheese.price;
    selection.veggies.forEach(v => total += v.price);
    selection.meats.forEach(m => total += m.price);
    return total;
  };

  const handleSelect = (category, item) => {
    if (category === 'base' || category === 'sauce' || category === 'cheese') {
      setSelection(prev => ({ ...prev, [category]: item }));
    }
  };

  const toggleVeggie = (item) => {
    setSelection(prev => ({
      ...prev,
      veggies: prev.veggies.find(v => v._id === item._id)
        ? prev.veggies.filter(v => v._id !== item._id)
        : [...prev.veggies, item]
    }));
  };

  const toggleMeat = (item) => {
    setSelection(prev => ({
      ...prev,
      meats: prev.meats.find(m => m._id === item._id)
        ? prev.meats.filter(m => m._id !== item._id)
        : [...prev.meats, item]
    }));
  };

  const canProceed = () => {
    if (step === 0) return !!selection.base;
    if (step === 1) return !!selection.sauce;
    if (step === 2) return !!selection.cheese;
    if (step === 3) return true; // veggies optional
    if (step === 4) return !!address.trim();
    return false;
  };

  const handlePayment = async () => {
    if (!address.trim()) return toast.error('Please enter a delivery address');
    setPlacing(true);

    try {
      const total = calculateTotal();
      const pizzaConfig = {
        base: selection.base._id,
        sauce: selection.sauce._id,
        cheese: selection.cheese._id,
        veggies: selection.veggies.map(v => v._id),
        meats: selection.meats.map(m => m._id)
      };

      // Try Razorpay first, fallback to simulation
      const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID;

      if (keyId && keyId !== 'rzp_test_YOUR_KEY_ID' && window.Razorpay) {
        // Real Razorpay
        const orderRes = await ordersAPI.createRazorpayOrder(total);
        const rzpOrder = orderRes.data.order;

        const options = {
          key: keyId,
          amount: rzpOrder.amount,
          currency: 'INR',
          name: 'Pizza Palace',
          description: 'Custom Pizza Order',
          order_id: rzpOrder.id,
          handler: async (response) => {
            const res = await ordersAPI.placeOrder({
              pizzaConfig,
              deliveryAddress: address,
              totalPrice: total,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            });
            toast.success('🎉 Order placed successfully!');
            navigate(`/orders/${res.data.order._id}`);
          },
          prefill: { name: user.name, email: user.email, contact: user.phone },
          theme: { color: '#e63946' }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Test mode simulation
        toast.loading('Processing test payment...', { id: 'payment' });
        await new Promise(r => setTimeout(r, 1500));
        const res = await ordersAPI.simulateSuccess({
          pizzaConfig,
          deliveryAddress: address,
          totalPrice: total
        });
        toast.dismiss('payment');
        toast.success('🎉 Test order placed successfully!');
        navigate(`/orders/${res.data.order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return (
    <div className="page-loading" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <div className="spinner" /><p style={{ color: '#aaa' }}>Loading ingredients...</p>
    </div>
  );

  const currentCategory = CATEGORY_MAP[step];
  const currentItems = inventory[currentCategory] || [];

  return (
    <div style={styles.page}>
      <div className="container">
        <div style={styles.header}>
          <h1 style={styles.title}>🍕 Build Your Pizza</h1>
          <p style={styles.sub}>Customize every layer of your perfect pie</p>
        </div>

        {/* Progress steps */}
        <div style={styles.stepBar}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <div style={styles.stepItem}>
                <div style={{
                  ...styles.stepCircle,
                  ...(i < step ? styles.stepDone : {}),
                  ...(i === step ? styles.stepActive : {})
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ ...styles.stepLabel, ...(i === step ? { color: '#e63946' } : {}) }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ ...styles.stepLine, ...(i < step ? { background: '#e63946' } : {}) }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={styles.layout}>
          {/* Main content */}
          <div style={styles.main}>
            {step < 4 ? (
              <>
                <h2 style={styles.stepTitle}>
                  Step {step + 1}: Choose Your {STEPS[step]}
                  {step === 3 && ' (Optional)'}
                </h2>

                {step === 3 && (
                  <>
                    <div style={styles.subSection}>
                      <h3 style={styles.subTitle}>🥦 Vegetables</h3>
                      <div style={styles.grid}>
                        {(inventory['veggie'] || []).map(item => {
                          const selected = selection.veggies.find(v => v._id === item._id);
                          return (
                            <div key={item._id} style={{ ...styles.ingredientCard, ...(selected ? styles.selectedCard : {}) }}
                              onClick={() => toggleVeggie(item)}>
                              <div style={styles.ingredientCheck}>{selected ? '✓' : ''}</div>
                              <div style={styles.ingredientEmoji}>🥦</div>
                              <div style={styles.ingredientName}>{item.name}</div>
                              <div style={styles.ingredientPrice}>+₹{item.price}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div style={styles.subSection}>
                      <h3 style={styles.subTitle}>🍗 Meats (Optional)</h3>
                      <div style={styles.grid}>
                        {(inventory['meat'] || []).map(item => {
                          const selected = selection.meats.find(m => m._id === item._id);
                          return (
                            <div key={item._id} style={{ ...styles.ingredientCard, ...(selected ? styles.selectedCard : {}) }}
                              onClick={() => toggleMeat(item)}>
                              <div style={styles.ingredientCheck}>{selected ? '✓' : ''}</div>
                              <div style={styles.ingredientEmoji}>🍗</div>
                              <div style={styles.ingredientName}>{item.name}</div>
                              <div style={styles.ingredientPrice}>+₹{item.price}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                {step < 3 && (
                  <div style={styles.grid}>
                    {currentItems.map(item => {
                      const selected = selection[currentCategory]?._id === item._id;
                      return (
                        <div key={item._id} style={{ ...styles.ingredientCard, ...(selected ? styles.selectedCard : {}) }}
                          onClick={() => handleSelect(currentCategory, item)}>
                          <div style={styles.ingredientCheck}>{selected ? '✓' : ''}</div>
                          <div style={styles.ingredientEmoji}>
                            {currentCategory === 'base' ? '🫓' : currentCategory === 'sauce' ? '🍅' : '🧀'}
                          </div>
                          <div style={styles.ingredientName}>{item.name}</div>
                          <div style={styles.ingredientDesc}>{item.description}</div>
                          <div style={styles.ingredientPrice}>₹{item.price}</div>
                          {item.stock <= item.threshold && <div style={styles.lowStock}>Low Stock</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              /* Review & Pay step */
              <div>
                <h2 style={styles.stepTitle}>Review Your Order</h2>
                <div style={styles.pizzaPreview}>
                  <div style={styles.previewLayer}>
                    <span>🫓</span>
                    <div>
                      <div style={styles.previewLabel}>Base</div>
                      <div style={styles.previewValue}>{selection.base?.name}</div>
                    </div>
                    <span style={styles.previewPrice}>₹{selection.base?.price}</span>
                  </div>
                  <div style={styles.previewLayer}>
                    <span>🍅</span>
                    <div>
                      <div style={styles.previewLabel}>Sauce</div>
                      <div style={styles.previewValue}>{selection.sauce?.name}</div>
                    </div>
                    <span style={styles.previewPrice}>₹{selection.sauce?.price}</span>
                  </div>
                  <div style={styles.previewLayer}>
                    <span>🧀</span>
                    <div>
                      <div style={styles.previewLabel}>Cheese</div>
                      <div style={styles.previewValue}>{selection.cheese?.name}</div>
                    </div>
                    <span style={styles.previewPrice}>₹{selection.cheese?.price}</span>
                  </div>
                  {selection.veggies.length > 0 && (
                    <div style={styles.previewLayer}>
                      <span>🥦</span>
                      <div>
                        <div style={styles.previewLabel}>Veggies</div>
                        <div style={styles.previewValue}>{selection.veggies.map(v => v.name).join(', ')}</div>
                      </div>
                      <span style={styles.previewPrice}>₹{selection.veggies.reduce((s, v) => s + v.price, 0)}</span>
                    </div>
                  )}
                  {selection.meats.length > 0 && (
                    <div style={styles.previewLayer}>
                      <span>🍗</span>
                      <div>
                        <div style={styles.previewLabel}>Meats</div>
                        <div style={styles.previewValue}>{selection.meats.map(m => m.name).join(', ')}</div>
                      </div>
                      <span style={styles.previewPrice}>₹{selection.meats.reduce((s, m) => s + m.price, 0)}</span>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 24 }}>
                  <label className="form-label">Delivery Address *</label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter your full delivery address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </div>

                <div style={styles.testNotice}>
                  <p>🧪 <strong>Test Mode:</strong> Click "Pay Now" to simulate a successful test payment and place the order.</p>
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={handlePayment}
                  disabled={placing || !address.trim()}
                  style={{ width: '100%', marginTop: 20 }}
                >
                  {placing ? 'Processing...' : `Pay ₹${calculateTotal()} & Place Order`}
                </button>
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarCard}>
              <h3 style={styles.sidebarTitle}>Your Pizza</h3>
              {['base', 'sauce', 'cheese'].map(cat => selection[cat] && (
                <div key={cat} style={styles.sidebarItem}>
                  <span style={styles.sidebarItemName}>{selection[cat].name}</span>
                  <span style={styles.sidebarItemPrice}>₹{selection[cat].price}</span>
                </div>
              ))}
              {selection.veggies.map(v => (
                <div key={v._id} style={styles.sidebarItem}>
                  <span style={styles.sidebarItemName}>{v.name}</span>
                  <span style={styles.sidebarItemPrice}>₹{v.price}</span>
                </div>
              ))}
              {selection.meats.map(m => (
                <div key={m._id} style={styles.sidebarItem}>
                  <span style={styles.sidebarItemName}>{m.name}</span>
                  <span style={styles.sidebarItemPrice}>₹{m.price}</span>
                </div>
              ))}
              <div style={styles.sidebarDivider} />
              <div style={styles.sidebarTotal}>
                <span>Total</span>
                <span style={{ color: '#e63946', fontSize: 20, fontWeight: 700 }}>₹{calculateTotal()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div style={styles.navRow}>
          <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            ← Back
          </button>
          {step < 4 && (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
              {step === 3 ? 'Review Order →' : 'Next →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { padding: '32px 0 60px', minHeight: 'calc(100vh - 64px)' },
  header: { marginBottom: 32, textAlign: 'center' },
  title: { fontFamily: "'Playfair Display', serif", fontSize: 36, marginBottom: 8 },
  sub: { color: '#aaa' },
  stepBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 40, gap: 0, overflowX: 'auto', padding: '0 0 8px'
  },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 },
  stepCircle: {
    width: 36, height: 36, borderRadius: '50%',
    background: '#1a1a1a', border: '2px solid #333',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, color: '#666'
  },
  stepActive: { background: 'rgba(230,57,70,0.15)', border: '2px solid #e63946', color: '#e63946' },
  stepDone: { background: '#e63946', border: '2px solid #e63946', color: 'white' },
  stepLabel: { fontSize: 12, color: '#666', whiteSpace: 'nowrap' },
  stepLine: { flex: 1, height: 2, background: '#2a2a2a', minWidth: 20, maxWidth: 60 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' },
  main: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 20, padding: 32 },
  stepTitle: { fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 24 },
  subSection: { marginBottom: 32 },
  subTitle: { fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#ccc' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 },
  ingredientCard: {
    background: '#222', border: '2px solid #2a2a2a', borderRadius: 14,
    padding: 16, cursor: 'pointer', transition: 'all 0.2s', position: 'relative',
    textAlign: 'center'
  },
  selectedCard: { border: '2px solid #e63946', background: 'rgba(230,57,70,0.08)' },
  ingredientCheck: {
    position: 'absolute', top: 8, right: 10, width: 20, height: 20,
    background: '#e63946', borderRadius: '50%', fontSize: 11,
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700
  },
  ingredientEmoji: { fontSize: 32, marginBottom: 8 },
  ingredientName: { fontWeight: 600, fontSize: 14, marginBottom: 4 },
  ingredientDesc: { color: '#666', fontSize: 12, lineHeight: 1.4, marginBottom: 8 },
  ingredientPrice: { color: '#e63946', fontWeight: 700, fontSize: 15 },
  lowStock: {
    position: 'absolute', top: 8, left: 8, background: 'rgba(239,68,68,0.9)',
    color: 'white', padding: '2px 7px', borderRadius: 50, fontSize: 10, fontWeight: 600
  },
  pizzaPreview: { background: '#222', borderRadius: 16, overflow: 'hidden' },
  previewLayer: {
    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
    borderBottom: '1px solid #2a2a2a', fontSize: 20
  },
  previewLabel: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 },
  previewValue: { fontSize: 15, fontWeight: 500 },
  previewPrice: { marginLeft: 'auto', color: '#e63946', fontWeight: 700, fontSize: 15 },
  testNotice: {
    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
    borderRadius: 12, padding: 16, marginTop: 20, color: '#f59e0b', fontSize: 14, lineHeight: 1.5
  },
  sidebar: { position: 'sticky', top: 88 },
  sidebarCard: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 16, padding: 20 },
  sidebarTitle: { fontFamily: "'Playfair Display', serif", fontSize: 18, marginBottom: 16 },
  sidebarItem: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  sidebarItemName: { color: '#aaa', fontSize: 14 },
  sidebarItemPrice: { color: '#ccc', fontWeight: 500, fontSize: 14 },
  sidebarDivider: { height: 1, background: '#2a2a2a', margin: '14px 0' },
  sidebarTotal: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 },
  navRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }
};

export default BuildPizzaPage;
