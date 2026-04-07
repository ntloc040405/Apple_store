/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Determine the socket URL:
    // 1. Check if VITE_API_URL exists and strip '/api'
    // 2. Fallback to localhost:5001
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    const socketUrl = apiUrl.replace('/api', '');

    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
    });

    newSocket.on('NEW_ORDER', (data) => {
      console.log('🔔 New order received:', data);
      setNotifications(prev => [{
        id: Date.now(),
        type: 'order',
        title: `📦 Đơn hàng mới #${data.orderNumber}`,
        message: `${data.user?.name || 'Khách'} vừa đặt hàng $${data.total?.toLocaleString()}`,
        data,
        timestamp: new Date(),
      }, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    newSocket.on('ORDER_STATUS_UPDATED', (data) => {
      console.log('🔄 Order status updated:', data);
      setNotifications(prev => [{
        id: Date.now(),
        type: 'status',
        title: `🔄 Cập nhật trạng thái #${data.orderNumber}`,
        message: `Trạng thái: ${data.status}`,
        data,
        timestamp: new Date(),
      }, ...prev]);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket');
    });

    // Fixed cascading setState by wrapping in timeout
    setTimeout(() => setSocket(newSocket), 0);

    return () => {
      newSocket.close();
    };
  }, []);

  const clearNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const resetUnreadCount = () => setUnreadCount(0);

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, clearNotification, resetUnreadCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
