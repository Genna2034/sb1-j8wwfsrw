import { Message, MessageTemplate, AppNotification, CommunicationSettings, CommunicationLog, Task, FamilyAccess, FamilyMessage } from '../types/communications';
import { Appointment } from '../types/appointments';
import { Invoice } from '../types/billing';
import { Patient } from '../types/medical';
import { getAppointments } from './appointmentStorage';
import { getInvoices } from './billingStorage';
import { getPatients } from './medicalStorage';
import { getUsers } from './userManagement';

const STORAGE_KEYS = {
  MESSAGES: 'emmanuel_messages',
  MESSAGE_TEMPLATES: 'emmanuel_message_templates',
  NOTIFICATIONS: 'emmanuel_notifications',
  COMMUNICATION_SETTINGS: 'emmanuel_communication_settings',
  COMMUNICATION_LOGS: 'emmanuel_communication_logs',
  TASKS: 'emmanuel_tasks',
  FAMILY_ACCESS: 'emmanuel_family_access',
  FAMILY_MESSAGES: 'emmanuel_family_messages'
};

// MESSAGES
export const getMessages = (filters?: {
  userId?: string;
  type?: string;
  status?: string;
  patientId?: string;
}): Message[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
  let messages = data ? JSON.parse(data) : [];
  
  if (filters) {
    if (filters.userId) {
      messages = messages.filter((msg: Message) => 
        msg.fromUserId === filters.userId || msg.toUserIds.includes(filters.userId!)
      );
    }
    if (filters.type) {
      messages = messages.filter((msg: Message) => msg.type === filters.type);
    }
    if (filters.status) {
      messages = messages.filter((msg: Message) => msg.status === filters.status);
    }
    if (filters.patientId) {
      messages = messages.filter((msg: Message) => msg.patientId === filters.patientId);
    }
  }
  
  return messages.sort((a: Message, b: Message) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const saveMessage = (message: Message): void => {
  const messages = getMessages();
  const existingIndex = messages.findIndex(msg => msg.id === message.id);
  
  if (existingIndex >= 0) {
    messages[existingIndex] = { ...message, updatedAt: new Date().toISOString() };
  } else {
    messages.push({ 
      ...message, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
};

export const markMessageAsRead = (messageId: string, userId: string, userName: string): void => {
  const messages = getMessages();
  const message = messages.find(msg => msg.id === messageId);
  
  if (message && !message.readBy.some(read => read.userId === userId)) {
    message.readBy.push({
      userId,
      userName,
      readAt: new Date().toISOString()
    });
    
    if (message.readBy.length === message.toUserIds.length) {
      message.status = 'read';
    }
    
    saveMessage(message);
  }
};

// MESSAGE TEMPLATES
export const getMessageTemplates = (): MessageTemplate[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MESSAGE_TEMPLATES);
  return data ? JSON.parse(data) : generateDefaultTemplates();
};

export const saveMessageTemplate = (template: MessageTemplate): void => {
  const templates = getMessageTemplates();
  const existingIndex = templates.findIndex(t => t.id === template.id);
  
  if (existingIndex >= 0) {
    templates[existingIndex] = { ...template, updatedAt: new Date().toISOString() };
  } else {
    templates.push({ 
      ...template, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.MESSAGE_TEMPLATES, JSON.stringify(templates));
};

// NOTIFICATIONS
export const getNotifications = (userId?: string): AppNotification[] => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  let notifications = data ? JSON.parse(data) : [];
  
  if (userId) {
    notifications = notifications.filter((notif: AppNotification) => notif.user_id === userId);
  }
  
  return notifications.sort((a: AppNotification, b: AppNotification) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
};

export const saveNotification = (notification: AppNotification): void => {
  const notifications = getNotifications();
  notifications.push(notification);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

export const markNotificationAsRead = (notificationId: string): void => {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.is_read = true;
    notification.read_at = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }
};

export const markAllNotificationsAsRead = (userId: string): void => {
  const notifications = getNotifications();
  const userNotifications = notifications.filter(n => n.user_id === userId && !n.is_read);
  
  userNotifications.forEach(notification => {
    notification.is_read = true;
    notification.read_at = new Date().toISOString();
  });
  
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

// TASKS
export const getTasks = (filters?: {
  assignedTo?: string;
  status?: string;
  type?: string;
  patientId?: string;
  dueDate?: string;
}): Task[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  let tasks = data ? JSON.parse(data) : [];
  
  if (filters) {
    if (filters.assignedTo) {
      tasks = tasks.filter((task: Task) => task.assignedTo === filters.assignedTo);
    }
    if (filters.status) {
      tasks = tasks.filter((task: Task) => task.status === filters.status);
    }
    if (filters.type) {
      tasks = tasks.filter((task: Task) => task.type === filters.type);
    }
    if (filters.patientId) {
      tasks = tasks.filter((task: Task) => task.patientId === filters.patientId);
    }
    if (filters.dueDate) {
      tasks = tasks.filter((task: Task) => task.dueDate === filters.dueDate);
    }
  }
  
  // Mark overdue tasks
  const today = new Date().toISOString().split('T')[0];
  tasks.forEach((task: Task) => {
    if (task.dueDate < today && task.status !== 'completed' && task.status !== 'cancelled') {
      task.status = 'overdue';
    }
  });
  
  return tasks.sort((a: Task, b: Task) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
};

export const saveTask = (task: Task): void => {
  const tasks = getTasks();
  const existingIndex = tasks.findIndex(t => t.id === task.id);
  
  if (existingIndex >= 0) {
    tasks[existingIndex] = { ...task, updatedAt: new Date().toISOString() };
  } else {
    tasks.push({ 
      ...task, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const completeTask = (taskId: string): void => {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (task) {
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    saveTask(task);
  }
};

// UTILITY FUNCTIONS
export const generateMessageId = (): string => {
  return crypto.randomUUID();
};

export const generateNotificationId = (): string => {
  return crypto.randomUUID();
};

export const generateTaskId = (): string => {
  return crypto.randomUUID();
};

const replaceVariables = (text: string, variables: Record<string, string>): string => {
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return result;
};

// Default templates
const generateDefaultTemplates = (): MessageTemplate[] => {
  return [
    {
      id: crypto.randomUUID(),
      name: 'Promemoria Appuntamento',
      type: 'appointment_reminder',
      subject: 'Promemoria: Appuntamento con {{patientName}}',
      content: 'Gentile {{staffName}},\n\nLe ricordiamo che domani {{appointmentDate}} alle {{appointmentTime}} ha un appuntamento con {{patientName}} presso {{location}}.\n\nCordiali saluti,\nCooperativa Emmanuel',
      variables: ['patientName', 'staffName', 'appointmentDate', 'appointmentTime', 'location'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    },
    {
      id: crypto.randomUUID(),
      name: 'Conferma Appuntamento',
      type: 'appointment_confirmation',
      subject: 'Conferma Appuntamento - {{patientName}}',
      content: 'Gentile {{patientName}},\n\nConfermiamo il Suo appuntamento per {{appointmentDate}} alle {{appointmentTime}} con {{staffName}}.\n\nLuogo: {{location}}\n\nCordiali saluti,\nCooperativa Emmanuel',
      variables: ['patientName', 'staffName', 'appointmentDate', 'appointmentTime', 'location'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    },
    {
      id: crypto.randomUUID(),
      name: 'Promemoria Pagamento',
      type: 'invoice_reminder',
      subject: 'Promemoria Pagamento - Fattura {{invoiceNumber}}',
      content: 'Gentile {{patientName}},\n\nLe ricordiamo che la fattura {{invoiceNumber}} dell\'importo di {{amount}} è in scadenza il {{dueDate}}.\n\nPer informazioni sui metodi di pagamento, non esiti a contattarci.\n\nCordiali saluti,\nCooperativa Emmanuel',
      variables: ['patientName', 'invoiceNumber', 'amount', 'dueDate'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'system'
    }
  ];
};

// Reset all communication storage data
export const resetCommunicationStorageData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.MESSAGES);
  localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.FAMILY_ACCESS);
  localStorage.removeItem(STORAGE_KEYS.FAMILY_MESSAGES);
  // Keep message templates and communication settings
};