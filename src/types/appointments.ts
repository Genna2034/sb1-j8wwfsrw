export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  staffId: string;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'visit' | 'therapy' | 'consultation' | 'follow-up' | 'emergency' | 'routine';
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  location: 'home' | 'clinic' | 'hospital' | 'remote';
  duration: number; // in minutes
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  followUpRequired?: boolean;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  reminderSent?: boolean;
  familyNotified?: boolean;
  cost?: number;
  insuranceCovered?: boolean;
  attachments?: string[];
}

export interface AppointmentSlot {
  id: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentId?: string;
  blockReason?: string;
}

export interface StaffSchedule {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  workingHours: {
    start: string;
    end: string;
  };
  breaks: {
    start: string;
    end: string;
    reason: string;
  }[];
  isAvailable: boolean;
  maxAppointments: number;
  appointmentDuration: number; // default duration in minutes
  location: string;
  notes?: string;
}

export interface AppointmentConflict {
  type: 'overlap' | 'staff_unavailable' | 'patient_conflict' | 'location_conflict';
  message: string;
  conflictingAppointment?: Appointment;
  suggestions?: string[];
}

export interface AppointmentReminder {
  id: string;
  appointmentId: string;
  type: 'sms' | 'email' | 'call' | 'app_notification';
  scheduledFor: string;
  sent: boolean;
  sentAt?: string;
  recipient: string;
  message: string;
}

export interface RecurringAppointment {
  id: string;
  patientId: string;
  staffId: string;
  type: Appointment['type'];
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  startDate: string;
  endDate?: string;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  interval?: number; // for custom frequency
  maxOccurrences?: number;
  template: Partial<Appointment>;
  isActive: boolean;
}

export interface WaitingList {
  id: string;
  patientId: string;
  patientName: string;
  requestedDate?: string;
  requestedStaff?: string;
  appointmentType: Appointment['type'];
  priority: Appointment['priority'];
  notes?: string;
  createdAt: string;
  notifyWhenAvailable: boolean;
  maxWaitDays?: number;
}