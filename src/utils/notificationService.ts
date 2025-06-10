// Servizio notifiche avanzato
import { Notification } from '../types/communications';
import { saveNotification, generateNotificationId } from './communicationStorage';

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  reminderDays: number[];
}

export const getNotificationSettings = (): NotificationSettings => {
  const settings = localStorage.getItem('emmanuel_notification_settings');
  return settings ? JSON.parse(settings) : {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    soundEnabled: true,
    reminderDays: [1, 3, 7]
  };
};

export const saveNotificationSettings = (settings: NotificationSettings): void => {
  localStorage.setItem('emmanuel_notification_settings', JSON.stringify(settings));
};

export const createNotification = (
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  priority: Notification['priority'] = 'normal',
  actionUrl?: string,
  actionLabel?: string
): void => {
  const notification: Notification = {
    id: generateNotificationId(),
    type,
    priority,
    title,
    message,
    userId,
    isRead: false,
    actionUrl,
    actionLabel,
    createdAt: new Date().toISOString()
  };

  saveNotification(notification);
  
  // Mostra notifica browser se supportata
  showBrowserNotification(title, message);
  
  // Riproduci suono se abilitato
  const settings = getNotificationSettings();
  if (settings.soundEnabled) {
    playNotificationSound();
  }
};

export const showBrowserNotification = (title: string, body: string): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/Screenshot 2025-06-09 alle 14.11.10.png',
      badge: '/Screenshot 2025-06-09 alle 14.11.10.png'
    });
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Browser non supporta le notifiche');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const playNotificationSound = (): void => {
  try {
    // Crea un suono di notifica semplice usando Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (error) {
    console.log('Impossibile riprodurre suono notifica:', error);
  }
};

export const scheduleAppointmentReminder = (
  appointmentId: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string,
  staffId: string
): void => {
  const settings = getNotificationSettings();
  
  settings.reminderDays.forEach(days => {
    const reminderDate = new Date(appointmentDate);
    reminderDate.setDate(reminderDate.getDate() - days);
    
    if (reminderDate > new Date()) {
      // In un'app reale, useresti un sistema di scheduling
      // Per ora creiamo la notifica immediatamente
      createNotification(
        staffId,
        'appointment',
        'Promemoria Appuntamento',
        `Appuntamento con ${patientName} tra ${days} giorni (${appointmentDate} alle ${appointmentTime})`,
        'normal',
        `/appointments/${appointmentId}`,
        'Visualizza'
      );
    }
  });
};

export const scheduleInvoiceReminder = (
  invoiceId: string,
  patientName: string,
  amount: number,
  dueDate: string,
  adminId: string
): void => {
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - 3); // 3 giorni prima
  
  if (reminderDate > new Date()) {
    createNotification(
      adminId,
      'invoice',
      'Promemoria Fattura',
      `Fattura di ${patientName} (€${amount.toFixed(2)}) in scadenza il ${dueDate}`,
      'normal',
      `/billing/invoices/${invoiceId}`,
      'Visualizza'
    );
  }
};

export const notifySystemUpdate = (version: string, features: string[]): void => {
  const adminUsers = ['1']; // IDs degli amministratori
  
  adminUsers.forEach(adminId => {
    createNotification(
      adminId,
      'system',
      'Aggiornamento Sistema',
      `Sistema aggiornato alla versione ${version}. Nuove funzionalità: ${features.join(', ')}`,
      'normal'
    );
  });
};

export const notifyEmergency = (message: string, allUsers: string[]): void => {
  allUsers.forEach(userId => {
    createNotification(
      userId,
      'emergency',
      'EMERGENZA',
      message,
      'urgent'
    );
  });
};