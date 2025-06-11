export interface Message {
  id: string;
  type: 'internal' | 'patient' | 'family' | 'system' | 'emergency';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'sent' | 'delivered' | 'read' | 'failed';
  subject: string;
  content: string;
  fromUserId: string;
  fromUserName: string;
  toUserIds: string[];
  toUserNames: string[];
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  invoiceId?: string;
  attachments?: MessageAttachment[];
  scheduledFor?: string;
  sentAt?: string;
  readBy: MessageRead[];
  createdAt: string;
  updatedAt: string;
  isSystemGenerated: boolean;
  templateId?: string;
  metadata?: Record<string, any>;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface MessageRead {
  userId: string;
  userName: string;
  readAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'appointment_reminder' | 'appointment_confirmation' | 'invoice_reminder' | 'medical_update' | 'custom';
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AppNotification {
  id: string;
  type: 'appointment' | 'message' | 'invoice' | 'system' | 'emergency' | 'reminder';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  title: string;
  message: string;
  user_id: string;
  is_read: boolean;
  action_url?: string;
  action_label?: string;
  related_id?: string;
  related_type?: 'appointment' | 'message' | 'invoice' | 'patient';
  created_at: string;
  read_at?: string;
  expires_at?: string;
  metadata?: Record<string, any>;
}

export interface CommunicationSettings {
  emailNotifications: {
    enabled: boolean;
    appointmentReminders: boolean;
    appointmentConfirmations: boolean;
    invoiceReminders: boolean;
    systemUpdates: boolean;
    emergencyAlerts: boolean;
  };
  smsNotifications: {
    enabled: boolean;
    appointmentReminders: boolean;
    emergencyAlerts: boolean;
  };
  inAppNotifications: {
    enabled: boolean;
    showDesktopNotifications: boolean;
    soundEnabled: boolean;
  };
  reminderSettings: {
    appointmentReminderDays: number[];
    invoiceReminderDays: number[];
    followUpReminderDays: number[];
  };
}

export interface CommunicationLog {
  id: string;
  type: 'email' | 'sms' | 'call' | 'in_app' | 'system';
  recipient: string;
  subject?: string;
  content: string;
  status: 'sent' | 'delivered' | 'failed' | 'bounced';
  sentAt: string;
  deliveredAt?: string;
  failureReason?: string;
  relatedId?: string;
  relatedType?: string;
  cost?: number;
  metadata?: Record<string, any>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'appointment' | 'follow_up' | 'administrative' | 'medical' | 'billing' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  assignedTo: string;
  assignedToName: string;
  assignedBy: string;
  assignedByName: string;
  patientId?: string;
  patientName?: string;
  appointmentId?: string;
  dueDate: string;
  completedAt?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  reminders: TaskReminder[];
}

export interface TaskReminder {
  id: string;
  taskId: string;
  reminderDate: string;
  sent: boolean;
  sentAt?: string;
}

export interface FamilyAccess {
  id: string;
  patientId: string;
  familyMemberName: string;
  familyMemberEmail: string;
  familyMemberPhone: string;
  relationship: string;
  accessLevel: 'view_only' | 'limited' | 'full';
  permissions: {
    viewAppointments: boolean;
    viewMedicalRecords: boolean;
    viewInvoices: boolean;
    receiveNotifications: boolean;
    bookAppointments: boolean;
    communicateWithStaff: boolean;
  };
  isActive: boolean;
  activationCode?: string;
  activatedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  createdBy: string;
}

export interface FamilyMessage {
  id: string;
  patientId: string;
  familyAccessId: string;
  fromFamily: boolean;
  fromName: string;
  toName: string;
  subject: string;
  content: string;
  priority: 'normal' | 'high' | 'urgent';
  status: 'sent' | 'read' | 'replied';
  sentAt: string;
  readAt?: string;
  repliedAt?: string;
  attachments?: string[];
  isSystemGenerated: boolean;
}