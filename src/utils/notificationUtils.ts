import { getNotificationService } from '../services/notificationService';
import { Appointment } from '../types/appointments';
import { Invoice } from '../types/billing';
import { Message, Task, Notification } from '../types/communications';
import { generateNotificationId } from '../utils/communicationStorage';

// Funzioni di utilità per generare e inviare notifiche

// Genera ID univoco per notifiche
export const generateUniqueNotificationId = (): string => {
  return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Crea e salva una notifica generica
export const createNotification = async (
  userId: string,
  type: Notification['type'],
  priority: Notification['priority'],
  title: string,
  message: string,
  options?: {
    relatedId?: string;
    relatedType?: 'appointment' | 'message' | 'invoice' | 'patient';
    actionUrl?: string;
    actionLabel?: string;
    expiresAt?: string;
  }
): Promise<Notification> => {
  const notificationService = getNotificationService();
  
  const notification: Notification = {
    id: generateNotificationId(),
    type,
    priority,
    title,
    message,
    userId,
    isRead: false,
    createdAt: new Date().toISOString(),
    ...options
  };
  
  await notificationService.saveNotification(notification);
  
  // Mostra notifica browser se abilitata
  await notificationService.showNotification(title, {
    body: message,
    tag: notification.id,
    data: {
      url: options?.actionUrl || '/',
      notificationId: notification.id,
      type
    }
  });
  
  return notification;
};

// Crea notifica per appuntamento
export const createAppointmentNotification = async (
  userId: string,
  appointment: Appointment,
  type: 'reminder' | 'confirmation' | 'cancellation' | 'rescheduled'
): Promise<Notification> => {
  let title = '';
  let message = '';
  let priority: Notification['priority'] = 'normal';
  
  switch (type) {
    case 'reminder':
      title = 'Promemoria Appuntamento';
      message = `Hai un appuntamento con ${appointment.patientName} domani alle ${appointment.startTime}`;
      break;
    case 'confirmation':
      title = 'Appuntamento Confermato';
      message = `L'appuntamento con ${appointment.patientName} del ${new Date(appointment.date).toLocaleDateString('it-IT')} alle ${appointment.startTime} è stato confermato`;
      break;
    case 'cancellation':
      title = 'Appuntamento Cancellato';
      message = `L'appuntamento con ${appointment.patientName} del ${new Date(appointment.date).toLocaleDateString('it-IT')} è stato cancellato`;
      priority = 'high';
      break;
    case 'rescheduled':
      title = 'Appuntamento Riprogrammato';
      message = `L'appuntamento con ${appointment.patientName} è stato riprogrammato per il ${new Date(appointment.date).toLocaleDateString('it-IT')} alle ${appointment.startTime}`;
      priority = 'high';
      break;
  }
  
  return createNotification(userId, 'appointment', priority, title, message, {
    relatedId: appointment.id,
    relatedType: 'appointment',
    actionUrl: `/appointments?id=${appointment.id}`,
    actionLabel: 'Visualizza Appuntamento'
  });
};

// Crea notifica per messaggio
export const createMessageNotification = async (
  userId: string,
  message: Message
): Promise<Notification> => {
  const priority = message.priority === 'urgent' ? 'urgent' : 
                  message.priority === 'high' ? 'high' : 'normal';
  
  return createNotification(userId, 'message', priority, 
    `Nuovo messaggio da ${message.fromUserName}`, 
    message.subject, 
    {
      relatedId: message.id,
      relatedType: 'message',
      actionUrl: `/communications?tab=messages&id=${message.id}`,
      actionLabel: 'Leggi Messaggio'
    }
  );
};

// Crea notifica per fattura
export const createInvoiceNotification = async (
  userId: string,
  invoice: Invoice,
  type: 'new' | 'reminder' | 'overdue' | 'paid'
): Promise<Notification> => {
  let title = '';
  let message = '';
  let priority: Notification['priority'] = 'normal';
  
  switch (type) {
    case 'new':
      title = 'Nuova Fattura';
      message = `È stata emessa una nuova fattura (${invoice.number}) per ${invoice.patientName}`;
      break;
    case 'reminder':
      title = 'Promemoria Pagamento';
      message = `La fattura ${invoice.number} per ${invoice.patientName} scade tra 5 giorni`;
      break;
    case 'overdue':
      title = 'Fattura Scaduta';
      message = `La fattura ${invoice.number} per ${invoice.patientName} è scaduta`;
      priority = 'high';
      break;
    case 'paid':
      title = 'Fattura Pagata';
      message = `La fattura ${invoice.number} per ${invoice.patientName} è stata pagata`;
      break;
  }
  
  return createNotification(userId, 'invoice', priority, title, message, {
    relatedId: invoice.id,
    relatedType: 'invoice',
    actionUrl: `/billing?tab=invoices&id=${invoice.id}`,
    actionLabel: 'Visualizza Fattura'
  });
};

// Crea notifica per task
export const createTaskNotification = async (
  userId: string,
  task: Task,
  type: 'new' | 'reminder' | 'overdue' | 'completed'
): Promise<Notification> => {
  let title = '';
  let message = '';
  let priority: Notification['priority'] = 'normal';
  
  switch (type) {
    case 'new':
      title = 'Nuovo Task Assegnato';
      message = `Ti è stato assegnato un nuovo task: ${task.title}`;
      break;
    case 'reminder':
      title = 'Promemoria Task';
      message = `Il task "${task.title}" è in scadenza domani`;
      break;
    case 'overdue':
      title = 'Task Scaduto';
      message = `Il task "${task.title}" è scaduto`;
      priority = 'high';
      break;
    case 'completed':
      title = 'Task Completato';
      message = `Il task "${task.title}" è stato completato`;
      break;
  }
  
  return createNotification(userId, 'reminder', priority, title, message, {
    relatedId: task.id,
    actionUrl: `/communications?tab=tasks&id=${task.id}`,
    actionLabel: 'Visualizza Task'
  });
};

// Crea notifica di emergenza
export const createEmergencyNotification = async (
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
): Promise<Notification> => {
  return createNotification(userId, 'emergency', 'urgent', title, message, {
    actionUrl,
    actionLabel: actionUrl ? 'Visualizza Dettagli' : undefined
  });
};

// Crea notifica di sistema
export const createSystemNotification = async (
  userId: string,
  title: string,
  message: string,
  options?: {
    priority?: Notification['priority'];
    actionUrl?: string;
    actionLabel?: string;
  }
): Promise<Notification> => {
  return createNotification(userId, 'system', options?.priority || 'normal', title, message, {
    actionUrl: options?.actionUrl,
    actionLabel: options?.actionLabel
  });
};