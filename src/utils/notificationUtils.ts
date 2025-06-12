import { getNotificationService } from '../services/notificationService';
import { Appointment } from '../types/appointments';
import { Invoice } from '../types/billing';
import { Message, Task, AppNotification } from '../types/communications';
import { generateNotificationId } from '../utils/communicationStorage';

// Funzioni di utilità per generare e inviare notifiche

// Genera ID univoco per notifiche
export const generateUniqueNotificationId = (): string => {
  return `notif-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Crea e salva una notifica generica
export const createNotification = async (
  userId: string,
  type: AppNotification['type'],
  priority: AppNotification['priority'],
  title: string,
  message: string,
  options?: {
    related_id?: string;
    related_type?: 'appointment' | 'message' | 'invoice' | 'patient';
    action_url?: string;
    action_label?: string;
    expires_at?: string;
  }
): Promise<AppNotification> => {
  const notificationService = getNotificationService();
  
  const notification: AppNotification = {
    id: generateNotificationId(),
    type,
    priority,
    title,
    message,
    user_id: userId,
    is_read: false,
    created_at: new Date().toISOString(),
    ...options
  };
  
  try {
    // Salva la notifica
    const success = await notificationService.saveNotification(notification);
    
    if (!success) {
      console.warn('Impossibile salvare la notifica nel database, ma continuo con la visualizzazione');
    }
    
    // Mostra notifica browser se abilitata
    await notificationService.showNotification(title, {
      body: message,
      tag: notification.id,
      data: {
        url: options?.action_url || '/',
        notificationId: notification.id,
        type
      }
    });
    
    return notification;
  } catch (error) {
    console.error('Errore durante la creazione della notifica:', error);
    
    // Fallback: mostra comunque la notifica anche se non è stato possibile salvarla
    await notificationService.showNotification(title, {
      body: message,
      tag: notification.id,
    });
    
    return notification;
  }
};

// Crea notifica per appuntamento
export const createAppointmentNotification = async (
  userId: string,
  appointment: Appointment,
  type: 'reminder' | 'confirmation' | 'cancellation' | 'rescheduled'
): Promise<AppNotification> => {
  let title = '';
  let message = '';
  let priority: AppNotification['priority'] = 'normal';
  
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
    related_id: appointment.id,
    related_type: 'appointment',
    action_url: `/appointments?id=${appointment.id}`,
    action_label: 'Visualizza Appuntamento'
  });
};

// Crea notifica per messaggio
export const createMessageNotification = async (
  userId: string,
  message: Message
): Promise<AppNotification> => {
  const priority = message.priority === 'urgent' ? 'urgent' : 
                  message.priority === 'high' ? 'high' : 'normal';
  
  return createNotification(userId, 'message', priority, 
    `Nuovo messaggio da ${message.fromUserName}`, 
    message.subject, 
    {
      related_id: message.id,
      related_type: 'message',
      action_url: `/communications?tab=messages&id=${message.id}`,
      action_label: 'Leggi Messaggio'
    }
  );
};

// Crea notifica per fattura
export const createInvoiceNotification = async (
  userId: string,
  invoice: Invoice,
  type: 'new' | 'reminder' | 'overdue' | 'paid'
): Promise<AppNotification> => {
  let title = '';
  let message = '';
  let priority: AppNotification['priority'] = 'normal';
  
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
    related_id: invoice.id,
    related_type: 'invoice',
    action_url: `/billing?tab=invoices&id=${invoice.id}`,
    action_label: 'Visualizza Fattura'
  });
};

// Crea notifica per task
export const createTaskNotification = async (
  userId: string,
  task: Task,
  type: 'new' | 'reminder' | 'overdue' | 'completed'
): Promise<AppNotification> => {
  let title = '';
  let message = '';
  let priority: AppNotification['priority'] = 'normal';
  
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
    related_id: task.id,
    action_url: `/communications?tab=tasks&id=${task.id}`,
    action_label: 'Visualizza Task'
  });
};

// Crea notifica di emergenza
export const createEmergencyNotification = async (
  userId: string,
  title: string,
  message: string,
  actionUrl?: string
): Promise<AppNotification> => {
  return createNotification(userId, 'emergency', 'urgent', title, message, {
    action_url: actionUrl,
    action_label: actionUrl ? 'Visualizza Dettagli' : undefined
  });
};

// Crea notifica di sistema
export const createSystemNotification = async (
  userId: string,
  title: string,
  message: string,
  options?: {
    priority?: AppNotification['priority'];
    action_url?: string;
    action_label?: string;
  }
): Promise<AppNotification> => {
  return createNotification(userId, 'system', options?.priority || 'normal', title, message, {
    action_url: options?.action_url,
    action_label: options?.action_label
  });
};