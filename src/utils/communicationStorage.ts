import { Message, MessageTemplate, Notification, CommunicationSettings, CommunicationLog, Task, FamilyAccess, FamilyMessage } from '../types/communications';
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
  let messages = data ? JSON.parse(data) : generateMockMessages();
  
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
export const getNotifications = (userId?: string): Notification[] => {
  const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  let notifications = data ? JSON.parse(data) : generateMockNotifications();
  
  if (userId) {
    notifications = notifications.filter((notif: Notification) => notif.userId === userId);
  }
  
  return notifications.sort((a: Notification, b: Notification) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const saveNotification = (notification: Notification): void => {
  const notifications = getNotifications();
  notifications.push(notification);
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
};

export const markNotificationAsRead = (notificationId: string): void => {
  const notifications = getNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.isRead = true;
    notification.readAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }
};

export const markAllNotificationsAsRead = (userId: string): void => {
  const notifications = getNotifications();
  const userNotifications = notifications.filter(n => n.userId === userId && !n.isRead);
  
  userNotifications.forEach(notification => {
    notification.isRead = true;
    notification.readAt = new Date().toISOString();
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
  let tasks = data ? JSON.parse(data) : generateMockTasks();
  
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

// COMMUNICATION AUTOMATION
export const sendAppointmentReminder = (appointment: Appointment): void => {
  const template = getMessageTemplates().find(t => t.type === 'appointment_reminder');
  if (!template) return;
  
  const message: Message = {
    id: generateMessageId(),
    type: 'patient',
    priority: 'normal',
    status: 'sent',
    subject: replaceVariables(template.subject, { 
      patientName: appointment.patientName,
      appointmentDate: new Date(appointment.date).toLocaleDateString('it-IT'),
      appointmentTime: appointment.startTime
    }),
    content: replaceVariables(template.content, {
      patientName: appointment.patientName,
      appointmentDate: new Date(appointment.date).toLocaleDateString('it-IT'),
      appointmentTime: appointment.startTime,
      staffName: appointment.staffName,
      location: appointment.location === 'home' ? 'Domicilio' : 'Ambulatorio'
    }),
    fromUserId: 'system',
    fromUserName: 'Sistema Emmanuel',
    toUserIds: [appointment.staffId],
    toUserNames: [appointment.staffName],
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    appointmentId: appointment.id,
    readBy: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystemGenerated: true,
    templateId: template.id
  };
  
  saveMessage(message);
  
  // Create notification
  const notification: Notification = {
    id: generateNotificationId(),
    type: 'appointment',
    priority: 'normal',
    title: 'Promemoria Appuntamento',
    message: `Appuntamento con ${appointment.patientName} domani alle ${appointment.startTime}`,
    userId: appointment.staffId,
    isRead: false,
    actionUrl: `/appointments/${appointment.id}`,
    actionLabel: 'Visualizza',
    relatedId: appointment.id,
    relatedType: 'appointment',
    createdAt: new Date().toISOString()
  };
  
  saveNotification(notification);
};

export const sendInvoiceReminder = (invoice: Invoice): void => {
  const template = getMessageTemplates().find(t => t.type === 'invoice_reminder');
  if (!template) return;
  
  const message: Message = {
    id: generateMessageId(),
    type: 'patient',
    priority: 'normal',
    status: 'sent',
    subject: replaceVariables(template.subject, { 
      patientName: invoice.patientName,
      invoiceNumber: invoice.number,
      amount: `€${invoice.remainingAmount.toFixed(2)}`
    }),
    content: replaceVariables(template.content, {
      patientName: invoice.patientName,
      invoiceNumber: invoice.number,
      amount: `€${invoice.remainingAmount.toFixed(2)}`,
      dueDate: new Date(invoice.dueDate).toLocaleDateString('it-IT')
    }),
    fromUserId: 'system',
    fromUserName: 'Sistema Emmanuel',
    toUserIds: ['admin'],
    toUserNames: ['Amministrazione'],
    patientId: invoice.patientId,
    patientName: invoice.patientName,
    invoiceId: invoice.id,
    readBy: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystemGenerated: true,
    templateId: template.id
  };
  
  saveMessage(message);
};

export const createTaskFromAppointment = (appointment: Appointment, type: 'follow_up' | 'preparation'): void => {
  const task: Task = {
    id: generateTaskId(),
    title: type === 'follow_up' ? 'Follow-up Appuntamento' : 'Preparazione Appuntamento',
    description: `${type === 'follow_up' ? 'Contattare' : 'Preparare materiali per'} ${appointment.patientName} - ${appointment.type}`,
    type: type === 'follow_up' ? 'follow_up' : 'appointment',
    priority: appointment.priority === 'urgent' ? 'high' : 'normal',
    status: 'pending',
    assignedTo: appointment.staffId,
    assignedToName: appointment.staffName,
    assignedBy: 'system',
    assignedByName: 'Sistema',
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    appointmentId: appointment.id,
    dueDate: type === 'follow_up' 
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date(new Date(appointment.date).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reminders: []
  };
  
  saveTask(task);
};

// FAMILY ACCESS
export const getFamilyAccess = (patientId?: string): FamilyAccess[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FAMILY_ACCESS);
  let familyAccess = data ? JSON.parse(data) : [];
  
  if (patientId) {
    familyAccess = familyAccess.filter((access: FamilyAccess) => access.patientId === patientId);
  }
  
  return familyAccess;
};

export const saveFamilyAccess = (familyAccess: FamilyAccess): void => {
  const allAccess = getFamilyAccess();
  const existingIndex = allAccess.findIndex(access => access.id === familyAccess.id);
  
  if (existingIndex >= 0) {
    allAccess[existingIndex] = familyAccess;
  } else {
    allAccess.push(familyAccess);
  }
  
  localStorage.setItem(STORAGE_KEYS.FAMILY_ACCESS, JSON.stringify(allAccess));
};

// UTILITY FUNCTIONS
export const generateMessageId = (): string => {
  return `MSG-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const generateNotificationId = (): string => {
  return `NOT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const generateTaskId = (): string => {
  return `TSK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

const replaceVariables = (text: string, variables: Record<string, string>): string => {
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return result;
};

// MOCK DATA GENERATORS
const generateMockMessages = (): Message[] => {
  const users = getUsers();
  const patients = getPatients();
  const messages: Message[] = [];
  
  const types: Message['type'][] = ['internal', 'patient', 'system'];
  const priorities: Message['priority'][] = ['normal', 'high'];
  const statuses: Message['status'][] = ['sent', 'read'];
  
  for (let i = 0; i < 10; i++) {
    const fromUser = users[i % users.length];
    const toUser = users[(i + 1) % users.length];
    const patient = patients[i % patients.length];
    
    messages.push({
      id: `MSG-${i + 1}`,
      type: types[i % types.length],
      priority: priorities[i % priorities.length],
      status: statuses[i % statuses.length],
      subject: `Messaggio ${i + 1}`,
      content: `Contenuto del messaggio ${i + 1} riguardante ${patient.personalInfo.name}`,
      fromUserId: fromUser.id,
      fromUserName: fromUser.name,
      toUserIds: [toUser.id],
      toUserNames: [toUser.name],
      patientId: patient.id,
      patientName: `${patient.personalInfo.name} ${patient.personalInfo.surname}`,
      readBy: statuses[i % statuses.length] === 'read' ? [{
        userId: toUser.id,
        userName: toUser.name,
        readAt: new Date().toISOString()
      }] : [],
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      isSystemGenerated: types[i % types.length] === 'system'
    });
  }
  
  return messages;
};

const generateMockNotifications = (): Notification[] => {
  const users = getUsers();
  const notifications: Notification[] = [];
  
  const types: Notification['type'][] = ['appointment', 'message', 'invoice', 'system'];
  const priorities: Notification['priority'][] = ['normal', 'high'];
  
  for (let i = 0; i < 15; i++) {
    const user = users[i % users.length];
    
    notifications.push({
      id: `NOT-${i + 1}`,
      type: types[i % types.length],
      priority: priorities[i % priorities.length],
      title: `Notifica ${i + 1}`,
      message: `Messaggio di notifica ${i + 1}`,
      userId: user.id,
      isRead: Math.random() > 0.5,
      createdAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return notifications;
};

const generateMockTasks = (): Task[] => {
  const users = getUsers();
  const patients = getPatients();
  const tasks: Task[] = [];
  
  const types: Task['type'][] = ['appointment', 'follow_up', 'administrative', 'medical'];
  const priorities: Task['priority'][] = ['normal', 'high'];
  const statuses: Task['status'][] = ['pending', 'in_progress', 'completed'];
  
  for (let i = 0; i < 12; i++) {
    const assignedUser = users[i % users.length];
    const assignerUser = users[(i + 1) % users.length];
    const patient = patients[i % patients.length];
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (i - 5));
    
    tasks.push({
      id: `TSK-${i + 1}`,
      title: `Task ${i + 1}`,
      description: `Descrizione del task ${i + 1}`,
      type: types[i % types.length],
      priority: priorities[i % priorities.length],
      status: statuses[i % statuses.length],
      assignedTo: assignedUser.id,
      assignedToName: assignedUser.name,
      assignedBy: assignerUser.id,
      assignedByName: assignerUser.name,
      patientId: patient.id,
      patientName: `${patient.personalInfo.name} ${patient.personalInfo.surname}`,
      dueDate: dueDate.toISOString().split('T')[0],
      completedAt: statuses[i % statuses.length] === 'completed' ? new Date().toISOString() : undefined,
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      reminders: []
    });
  }
  
  return tasks;
};

const generateDefaultTemplates = (): MessageTemplate[] => {
  return [
    {
      id: 'TPL-001',
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
      id: 'TPL-002',
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
      id: 'TPL-003',
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