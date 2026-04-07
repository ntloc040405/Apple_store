import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, X } from 'lucide-react';

export default function NotificationCenter() {
  const { notifications, clearNotification } = useSocket();

  // Auto-remove notification after 6 seconds
  useEffect(() => {
    if (notifications.length === 0) return;
    const timer = setTimeout(() => {
      clearNotification(notifications[0].id);
    }, 6000);
    return () => clearTimeout(timer);
  }, [notifications, clearNotification]);

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      maxWidth: 400,
    }}>
      {notifications.map(notif => (
        <div
          key={notif.id}
          style={{
            background: notif.type === 'order' ? '#fff' : '#f5f5f7',
            border: notif.type === 'order' ? '2px solid #34c759' : '2px solid #0071e3',
            borderRadius: 12,
            padding: 16,
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 14,
                fontWeight: 600,
                color: notif.type === 'order' ? '#34c759' : '#0071e3',
                marginBottom: 4,
              }}>
                {notif.title}
              </div>
              <div style={{
                fontSize: 13,
                color: '#86868b',
                marginBottom: 8,
              }}>
                {notif.message}
              </div>
              {notif.type === 'order' && (
                <div style={{
                  fontSize: 12,
                  color: '#1d1d1f',
                  background: '#f5f5f7',
                  padding: '8px 12px',
                  borderRadius: 8,
                  marginTop: 8,
                }}>
                  📍 {notif.data.shippingAddress?.city}, {notif.data.shippingAddress?.district}
                </div>
              )}
            </div>
            <button
              onClick={() => clearNotification(notif.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#86868b',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(450px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
