import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getNotificationService, NotificationService } from '../services/notificationService';
import { AppNotification } from '../types/communications';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  showNotification: (title: string, body: string, options?: any) => Promise<boolean>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
  isPermissionGranted: boolean;
  isPushEnabled: boolean;
  enablePush: () => Promise<boolean>;
  disablePush: () => Promise<boolean>;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [notificationService] = useState<NotificationService>(getNotificationService());
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      checkPermission();
      
      // Polling per nuove notifiche
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const userNotifications = await notificationService.getNotifications(user.id);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Errore nel caricamento notifiche:', error);
    }
  };

  const checkPermission = async () => {
    if ('Notification' in window) {
      setIsPermissionGranted(Notification.permission === 'granted');
      
      // Verifica se il push è abilitato
      if (navigator.serviceWorker && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration) {
            const subscription = await registration.pushManager.getSubscription();
            setIsPushEnabled(!!subscription);
          }
        } catch (error) {
          console.error('Errore nella verifica sottoscrizione push:', error);
        }
      }
    }
  };

  const showNotification = async (title: string, body: string, options?: any): Promise<boolean> => {
    return await notificationService.showNotification(title, {
      body,
      ...options
    });
  };

  const markAsRead = async (notificationId: string): Promise<boolean> => {
    const success = await notificationService.markAsRead(notificationId);
    if (success) {
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return success;
  };

  const markAllAsRead = async (): Promise<boolean> => {
    if (!user) return false;
    
    const success = await notificationService.markAllAsRead(user.id);
    if (success) {
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    }
    return success;
  };

  const requestPermission = async (): Promise<boolean> => {
    const granted = await notificationService.requestPermission();
    setIsPermissionGranted(granted);
    return granted;
  };

  const enablePush = async (): Promise<boolean> => {
    if (!user) return false;
    
    const success = await notificationService.subscribeToPush(user.id);
    if (success) {
      setIsPushEnabled(true);
    }
    return success;
  };

  const disablePush = async (): Promise<boolean> => {
    if (!user) return false;
    
    const success = await notificationService.unsubscribeFromPush(user.id);
    if (success) {
      setIsPushEnabled(false);
    }
    return success;
  };

  const refreshNotifications = async (): Promise<void> => {
    await loadNotifications();
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      showNotification,
      markAsRead,
      markAllAsRead,
      requestPermission,
      isPermissionGranted,
      isPushEnabled,
      enablePush,
      disablePush,
      refreshNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};