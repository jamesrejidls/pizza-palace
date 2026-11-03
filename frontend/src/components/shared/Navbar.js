import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const userLinks = [
    { to: '/dashboard', label: '🍕 Menu' },
    { to: '/build-pizza', label: '✨ Build Pizza' },
    { to: '/my-orders', label: '📦 My Orders' },
    { to: '/profile', label: '👤 Profile' }
  ];

  const adminLinks = [
    { to: '/admin', label: '📊 Dashboard' },
    { to: '/admin/inventory', label: '📦 Inventory' },
    { to: '/admin/orders', label: '🛒 Orders' }
  ];

  const links = user?.role === 'admin' ? adminLinks : userLinks;

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} style={styles.logo}>
          🍕 <span style={styles.logoText}>Pizza Palace</span>
          {user?.role === 'admin' && <span style={styles.adminBadge}>ADMIN</span>}
        </Link>

        {/* Desktop links */}
        <div style={styles.links}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...styles.link,
                ...(isActive(link.to) ? styles.activeLink : {})
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div style={styles.right}>
          <span style={styles.userName}>Hi, {user?.name?.split(' ')[0]}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          <button style={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={styles.mobileLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    background: 'rgba(13,13,13,0.95)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid #1a1a1a',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px',
    height: 64,
    display: 'flex',
    alignItems: 'center',
    gap: 32
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none',
    fontSize: 22,
    fontFamily: "'Playfair Display', serif",
    fontWeight: 700,
    color: 'white',
    flexShrink: 0
  },
  logoText: { color: 'white' },
  adminBadge: {
    background: 'linear-gradient(135deg, #e63946, #ff6b35)',
    color: 'white',
    fontSize: 10,
    padding: '2px 8px',
    borderRadius: 50,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    letterSpacing: 1
  },
  links: {
    display: 'flex',
    gap: 4,
    flex: 1,
    '@media (max-width: 768px)': { display: 'none' }
  },
  link: {
    padding: '8px 16px',
    borderRadius: 8,
    textDecoration: 'none',
    color: '#aaa',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s'
  },
  activeLink: {
    background: 'rgba(230,57,70,0.15)',
    color: '#e63946'
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto'
  },
  userName: {
    color: '#aaa',
    fontSize: 14,
    '@media (max-width: 480px)': { display: 'none' }
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid #2a2a2a',
    color: '#aaa',
    padding: '8px 18px',
    borderRadius: 50,
    cursor: 'pointer',
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.2s'
  },
  menuBtn: {
    display: 'none',
    background: 'transparent',
    border: '1px solid #2a2a2a',
    color: '#aaa',
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 18
  },
  mobileMenu: {
    background: '#111',
    borderTop: '1px solid #1a1a1a',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  mobileLink: {
    padding: '12px 16px',
    textDecoration: 'none',
    color: '#ccc',
    borderRadius: 8,
    fontSize: 15
  },
  mobileLogout: {
    margin: '8px 0 0',
    padding: '12px 16px',
    background: 'transparent',
    border: '1px solid #2a2a2a',
    color: '#e63946',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 15,
    textAlign: 'left',
    fontFamily: "'DM Sans', sans-serif"
  }
};

export default Navbar;
