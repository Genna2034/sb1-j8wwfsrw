export interface Patient {
  id: string;
  personalInfo: {
    name: string;
    surname: string;
    dateOfBirth: string;
    fiscalCode: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    email?: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  medicalInfo: {
    allergies: string[];
    chronicConditions: string[];
    currentMedications: Medication[];
    bloodType?: string;
    height?: number;
    weight?: number;
    notes: string;
  };
  assignedStaff: string[];
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'discharged';
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  date: string;
  time: string;
  type: 'visit' | 'therapy' | 'measurement' | 'medication' | 'note';
  title: string;
  description: string;
  staffId: string;
  staffName: string;
  attachments?: string[];
  vitals?: VitalSigns;
  medications?: MedicationAdministration[];
}

export interface VitalSigns {
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  bloodSugar?: number;
  weight?: number;
  notes?: string;
}

export interface MedicationAdministration {
  medicationId: string;
  medicationName: string;
  dosageGiven: string;
  time: string;
  administeredBy: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'visit' | 'therapy' | 'consultation' | 'follow-up';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  location?: string;
}

export interface Task {
  id: string;
  patientId: string;
  assignedTo: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface Communication {
  id: string;
  patientId: string;
  fromStaffId: string;
  fromStaffName: string;
  toStaffIds: string[];
  subject: string;
  message: string;
  priority: 'normal' | 'high' | 'urgent';
  timestamp: string;
  readBy: string[];
  attachments?: string[];
}