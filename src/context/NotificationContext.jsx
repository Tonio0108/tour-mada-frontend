import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'sonner';
import { getAuthToken, NotificationApi } from '../../lib/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Charger les notifications initiales
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const data = await NotificationApi.getAll();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.est_lu).length);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Gérer la connexion Socket
  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const initSocket = async () => {
      const token = await getAuthToken();
      if (!token) return;

      const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
        auth: { token }
      });

      newSocket.on('connect', () => {
        console.log('DEBUG: Connecté au serveur de notifications avec socket ID:', newSocket.id);
      });

      newSocket.on('notification', (notification) => {
        console.log('DEBUG: Notification reçue en temps réel:', notification);
        // Ajouter la nouvelle notification en haut de la liste
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Afficher le toast
        toast.info(notification.titre, {
          description: notification.message,
          action: notification.lien ? {
            label: 'Voir',
            onClick: () => window.location.href = notification.lien
          } : null,
        });
      });

      newSocket.on('connect_error', (err) => {
        console.error('Erreur de connexion Socket:', err.message);
      });

      setSocket(newSocket);
    };

    initSocket();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [user]);

  const markAsRead = async (id) => {
    try {
      await NotificationApi.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id_notification === id ? { ...n, est_lu: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur markAsRead:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, est_lu: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur markAllAsRead:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications,
      unreadNotifications: notifications.filter(n => !n.est_lu),
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      loadNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications doit être utilisé au sein d\'un NotificationProvider');
  }
  return context;
};
