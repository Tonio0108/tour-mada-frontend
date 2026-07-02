import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { getAuthToken } from '../../lib/api';
import { notificationService as NotificationApi } from '@lib';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [transientUnreadMessagesCount, setTransientUnreadMessagesCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState({}); 

  const isAdmin = user?.type_utilisateur === 'ADMIN';

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await NotificationApi.getAll();
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.est_lu).length);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!user) {
      if (socket) socket.disconnect();
      setSocket(null);
      setOnlineUsers({});
      return;
    }

    let socketInstance = null;

    const initSocket = async () => {
      const token = await getAuthToken();
      if (!token) return;

      socketInstance = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 10000,
      });

      socketInstance.on('connect', () => {
        console.log('[SOCKET] Connecté au serveur');
      });

      socketInstance.on('online_users_list', (users) => {
        const map = {};
        users.forEach(id => { map[String(id)] = true; });
        setOnlineUsers(map);
      });

      socketInstance.on('user_status', ({ userId, online }) => {
        const sId = String(userId);
        setOnlineUsers(prev => ({
          ...prev,
          [sId]: online
        }));
      });

      socketInstance.on('notification', (notification) => {
        // --- JOUER LE SON ---
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
          audio.volume = 0.4;
          audio.play().catch(() => {}); // Ignorer si bloqué par autoplay policy
        } catch (e) {
          console.error("Erreur audio:", e);
        }
        // --------------------

        if (notification.isTransient) {
          setTransientUnreadMessagesCount(prev => prev + 1);
        } else {
          setNotifications(prev => {
            if (prev.some(n => n.id_notification === notification.id_notification)) return prev;
            return [notification, ...prev];
          });
          if (!notification.est_lu) setUnreadCount(prev => prev + 1);
        }
        
        toast.info(notification.titre || "Notification", {
          description: notification.message,
          action: notification.lien ? {
            label: 'Voir',
            onClick: () => {
              if (notification.lien.includes('chat')) {
                window.dispatchEvent(new CustomEvent('openChat'));
                setTransientUnreadMessagesCount(0);
              } else {
                window.location.href = notification.lien;
              }
            }
          } : null,
        });
      });

      setSocket(socketInstance);
    };

    initSocket();

    return () => {
      if (socketInstance) socketInstance.disconnect();
    };
  }, [user?.id_utilisateur]); 

  const markAsRead = async (id) => {
    try {
      await NotificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id_notification === id ? { ...n, est_lu: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    try {
      await NotificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, est_lu: true })));
      setUnreadCount(0);
    } catch (e) {}
  };

  const markChatNotificationsAsRead = async () => {
    setTransientUnreadMessagesCount(0);
    notifications.filter(n => !n.est_lu && (n.lien?.toLowerCase().includes('chat') || n.titre?.toLowerCase().includes('message')))
      .forEach(n => markAsRead(n.id_notification));
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications,
      unreadNotifications: notifications.filter(n => !n.est_lu),
      unreadMessagesCount: notifications.filter(n => !n.est_lu && (n.lien?.includes('chat') || n.titre?.includes('message'))).length + transientUnreadMessagesCount,
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      markChatNotificationsAsRead,
      loadNotifications,
      socket,
      onlineUsers
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
