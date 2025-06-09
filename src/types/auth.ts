export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'coordinator' | 'staff';
  department: string;
  position: string;
  avatar?: string;
  password?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  totalHours?: number;
  notes?: string;
}

export interface Shift {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'domiciliare' | 'ambulatorio' | 'formazione';
  patientId?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  address: string;
  phone: string;
  medicalNotes?: string;
  assignedStaff: string[];
}

export interface StaffMember {
  id: string;
  name: string;
  position: string;
  department: string;
  isPresent: boolean;
  clockInTime?: string;
  avatar?: string;
}