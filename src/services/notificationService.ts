import { getSupabaseService } from './supabaseService';
import { shouldUseSupabase } from '../utils/supabaseUtils';
import { AppNotification } from '../types/communications';

export interface PushSubscription {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationConfig {
  enableBrowserNotifications: boolean;
  enablePushNotifications: boolean;
  enableServiceWorker: boolean;
  vapidPublicKey?: string;
  vapidPrivateKey?: string;
  notificationSound: boolean;
  notificationTimeout: number;
  defaultIcon: string;
}

class NotificationService {
  private config: NotificationConfig;
  private subscriptions: Map<string, PushSubscription> = new Map();
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private permissionGranted: boolean = false;

  constructor(config: NotificationConfig) {
    this.config = config;
    this.initializeServiceWorker();
    this.checkPermission();
  }

  private async initializeServiceWorker() {
    if (!this.config.enableServiceWorker || !('serviceWorker' in navigator)) {
      console.log('Service Worker non supportato o disabilitato');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      this.serviceWorkerRegistration = registration;
      console.log('Service Worker registrato con successo:', registration);

      // Aggiorna il service worker se necessario
      registration.update();
    } catch (error) {
      console.error('Errore nella registrazione del Service Worker:', error);
    }
  }

  private async checkPermission() {
    if (!('Notification' in window)) {
      console.log('Questo browser non supporta le notifiche desktop');
      return;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Questo browser non supporta le notifiche desktop');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('Errore nella richiesta di permesso per le notifiche:', error);
      return false;
    }
  }

  async subscribeToPush(userId: string): Promise<boolean> {
    if (!this.config.enablePushNotifications || !this.serviceWorkerRegistration) {
      return false;
    }

    try {
      // Verifica se esiste già una sottoscrizione
      const existingSubscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (existingSubscription) {
        this.subscriptions.set(userId, existingSubscription as any);
        await this.saveSubscription(userId, existingSubscription as any);
        return true;
      }

      // Crea una nuova sottoscrizione
      if (!this.config.vapidPublicKey) {
        console.error('VAPID public key non configurata');
        return false;
      }

      const subscription = await this.serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.config.vapidPublicKey)
      });

      this.subscriptions.set(userId, subscription as any);
      await this.saveSubscription(userId, subscription as any);
      return true;
    } catch (error) {
      console.error('Errore nella sottoscrizione push:', error);
      return false;
    }
  }

  async unsubscribeFromPush(userId: string): Promise<boolean> {
    if (!this.serviceWorkerRegistration) {
      return false;
    }

    try {
      const subscription = await this.serviceWorkerRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      this.subscriptions.delete(userId);
      await this.deleteSubscription(userId);
      return true;
    } catch (error) {
      console.error('Errore nella cancellazione sottoscrizione push:', error);
      return false;
    }
  }

  async showNotification(
    title: string,
    options: {
      body: string;
      icon?: string;
      badge?: string;
      tag?: string;
      data?: any;
      requireInteraction?: boolean;
      actions?: { action: string; title: string; icon?: string }[];
      silent?: boolean;
    }
  ): Promise<boolean> {
    if (!this.config.enableBrowserNotifications) {
      return false;
    }

    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    try {
      // Usa il service worker se disponibile
      if (this.serviceWorkerRegistration) {
        await this.serviceWorkerRegistration.showNotification(title, {
          ...options,
          icon: options.icon || this.config.defaultIcon,
          silent: options.silent || !this.config.notificationSound,
          requireInteraction: options.requireInteraction || false
        });
      } else {
        // Fallback a notifiche native
        const notification = new Notification(title, {
          ...options,
          icon: options.icon || this.config.defaultIcon,
          silent: options.silent || !this.config.notificationSound
        });

        // Auto-chiusura dopo timeout
        if (this.config.notificationTimeout > 0) {
          setTimeout(() => notification.close(), this.config.notificationTimeout);
        }
      }

      return true;
    } catch (error) {
      console.error('Errore nella visualizzazione notifica:', error);
      return false;
    }
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    if (!this.config.enablePushNotifications) {
      return false;
    }

    try {
      // In un'implementazione reale, questa chiamata andrebbe a un server
      // che gestisce l'invio delle notifiche push usando web-push
      console.log(`Invio notifica push a ${userId}:`, { title, body, data });

      // Simula invio tramite Supabase Edge Function
      if (shouldUseSupabase()) {
        try {
          const supabase = getSupabaseService();
          await supabase.callEdgeFunction('send-push-notification', {
            userId,
            title,
            body,
            data
          });
          return true;
        } catch (error) {
          console.error('Errore nell\'invio notifica push tramite Supabase:', error);
          return false;
        }
      }

      // Simula successo per demo
      return true;
    } catch (error) {
      console.error('Errore nell\'invio notifica push:', error);
      return false;
    }
  }

  async saveNotification(notification: AppNotification): Promise<boolean> {
    try {
      // Salva in Supabase se configurato
      if (shouldUseSupabase()) {
        const supabase = getSupabaseService();
        await supabase.insert('notifications', notification);
      }

      // Salva in localStorage per compatibilità
      const notifications = this.getNotificationsFromStorage();
      notifications.push(notification);
      localStorage.setItem('emmanuel_notifications', JSON.stringify(notifications));

      return true;
    } catch (error) {
      console.error('Errore nel salvataggio notifica:', error);
      return false;
    }
  }

  async getNotifications(userId: string): Promise<AppNotification[]> {
    try {
      // Carica da Supabase se configurato
      if (shouldUseSupabase()) {
        const supabase = getSupabaseService();
        return await supabase.getAll('notifications', {
          filters: { user_id: userId },
          orderBy: 'created_at',
          ascending: false
        });
      }

      // Carica da localStorage
      const notifications = this.getNotificationsFromStorage();
      return notifications.filter(n => n.user_id === userId);
    } catch (error) {
      console.error('Errore nel caricamento notifiche:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      // Aggiorna in Supabase se configurato
      if (shouldUseSupabase()) {
        const supabase = getSupabaseService();
        await supabase.update('notifications', notificationId, {
          is_read: true,
          read_at: new Date().toISOString()
        });
      }

      // Aggiorna in localStorage
      const notifications = this.getNotificationsFromStorage();
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.is_read = true;
        notification.read_at = new Date().toISOString();
        localStorage.setItem('emmanuel_notifications', JSON.stringify(notifications));
      }

      return true;
    } catch (error) {
      console.error('Errore nel marcare notifica come letta:', error);
      return false;
    }
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      // Aggiorna in Supabase se configurato
      if (shouldUseSupabase()) {
        const supabase = getSupabaseService();
        const { data: notifications } = await supabase.supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('is_read', false);

        if (notifications && notifications.length > 0) {
          await supabase.supabase
            .from('notifications')
            .update({
              is_read: true,
              read_at: new Date().toISOString()
            })
            .in('id', notifications.map(n => n.id));
        }
      }

      // Aggiorna in localStorage
      const notifications = this.getNotificationsFromStorage();
      notifications.forEach(n => {
        if (n.user_id === userId && !n.is_read) {
          n.is_read = true;
          n.read_at = new Date().toISOString();
        }
      });
      localStorage.setItem('emmanuel_notifications', JSON.stringify(notifications));

      return true;
    } catch (error) {
      console.error('Errore nel marcare tutte le notifiche come lette:', error);
      return false;
    }
  }

  // Utility methods
  private getNotificationsFromStorage(): AppNotification[] {
    const data = localStorage.getItem('emmanuel_notifications');
    return data ? JSON.parse(data) : [];
  }

  private async saveSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    // Salva in Supabase se configurato
    if (shouldUseSupabase()) {
      const supabase = getSupabaseService();
      await supabase.supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          expiration_time: subscription.expirationTime,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          created_at: new Date().toISOString()
        });
    }

    // Salva in localStorage per compatibilità
    const subscriptions = JSON.parse(localStorage.getItem('emmanuel_push_subscriptions') || '{}');
    subscriptions[userId] = subscription;
    localStorage.setItem('emmanuel_push_subscriptions', JSON.stringify(subscriptions));
  }

  private async deleteSubscription(userId: string): Promise<void> {
    // Elimina da Supabase se configurato
    if (shouldUseSupabase()) {
      const supabase = getSupabaseService();
      await supabase.supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId);
    }

    // Elimina da localStorage
    const subscriptions = JSON.parse(localStorage.getItem('emmanuel_push_subscriptions') || '{}');
    delete subscriptions[userId];
    localStorage.setItem('emmanuel_push_subscriptions', JSON.stringify(subscriptions));
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Configuration methods
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.enableServiceWorker !== undefined) {
      if (newConfig.enableServiceWorker) {
        this.initializeServiceWorker();
      } else if (this.serviceWorkerRegistration) {
        this.serviceWorkerRegistration.unregister();
        this.serviceWorkerRegistration = null;
      }
    }
  }

  getConfig(): NotificationConfig {
    return { ...this.config };
  }
}

// Singleton instance
let notificationServiceInstance: NotificationService | null = null;

export const getNotificationService = (): NotificationService => {
  if (!notificationServiceInstance) {
    const defaultConfig: NotificationConfig = {
      enableBrowserNotifications: true,
      enablePushNotifications: false, // Disabilitato di default perché richiede VAPID keys
      enableServiceWorker: false, // Disabilitato per compatibilità con StackBlitz
      notificationSound: true,
      notificationTimeout: 5000, // 5 secondi
      defaultIcon: '/Screenshot 2025-06-09 alle 14.11.10.png'
    };
    notificationServiceInstance = new NotificationService(defaultConfig);
  }
  return notificationServiceInstance;
};

export const initializeNotificationService = (config: NotificationConfig): NotificationService => {
  notificationServiceInstance = new NotificationService(config);
  return notificationServiceInstance;
};

// Export the class and type
export { NotificationService, type NotificationConfig };