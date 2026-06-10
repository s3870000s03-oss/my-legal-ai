import { useNavigate, useLocation } from 'react-router-dom';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { path: '/', icon: '⚖️', label: '상담' },
    { path: '/info', icon: '📖', label: '안내' },
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#fff',
      borderTop: '1px solid #E2E8F0',
      display: 'flex',
      zIndex: 100,
      boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
    }}>
      {items.map(item => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          style={{
            flex: 1,
            padding: '12px 0',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            color: location.pathname === item.path ? '#2E75B6' : '#94A3B8',
            fontSize: 12,
            fontWeight: location.pathname === item.path ? 'bold' : 'normal',
          }}
        >
          <span style={{ fontSize: 22 }}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}