import { Appointment, AppointmentSlot, StaffSchedule, AppointmentReminder, RecurringAppointment, WaitingList, AppointmentConflict } from '../types/appointments';
import { getPatients } from './medicalStorage';
import { getUsers } from './userManagement';

const STORAGE_KEYS = {
  APPOINTMENTS: 'emmanuel_appointments_v2',
  STAFF_SCHEDULES: 'emmanuel_staff_schedules',
  APPOINTMENT_SLOTS: 'emmanuel_appointment_slots',
  REMINDERS: 'emmanuel_appointment_reminders',
  RECURRING: 'emmanuel_recurring_appointments',
  WAITING_LIST: 'emmanuel_waiting_list'
};

// APPOINTMENTS
export const getAppointments = (filters?: {
  date?: string;
  staffId?: string;
  patientId?: string;
  status?: string;
  type?: string;
}): Appointment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  let appointments = data ? JSON.parse(data) : [];
  
  if (filters) {
    if (filters.date) {
      appointments = appointments.filter((a: Appointment) => a.date === filters.date);
    }
    if (filters.staffId) {
      appointments = appointments.filter((a: Appointment) => a.staffId === filters.staffId);
    }
    if (filters.patientId) {
      appointments = appointments.filter((a: Appointment) => a.patientId === filters.patientId);
    }
    if (filters.status) {
      appointments = appointments.filter((a: Appointment) => a.status === filters.status);
    }
    if (filters.type) {
      appointments = appointments.filter((a: Appointment) => a.type === filters.type);
    }
  }
  
  return appointments.sort((a: Appointment, b: Appointment) => {
    const dateA = new Date(`${a.date} ${a.startTime}`);
    const dateB = new Date(`${b.date} ${b.startTime}`);
    return dateA.getTime() - dateB.getTime();
  });
};

export const saveAppointment = (appointment: Appointment): void => {
  const appointments = getAppointments();
  const existingIndex = appointments.findIndex(a => a.id === appointment.id);
  
  if (existingIndex >= 0) {
    appointments[existingIndex] = { ...appointment, updatedAt: new Date().toISOString() };
  } else {
    appointments.push({ 
      ...appointment, 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
};

export const deleteAppointment = (appointmentId: string): void => {
  const appointments = getAppointments();
  const filteredAppointments = appointments.filter(a => a.id !== appointmentId);
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(filteredAppointments));
};

// STAFF SCHEDULES
export const getStaffSchedules = (date?: string, staffId?: string): StaffSchedule[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STAFF_SCHEDULES);
  let schedules = data ? JSON.parse(data) : [];
  
  if (date) {
    schedules = schedules.filter((s: StaffSchedule) => s.date === date);
  }
  if (staffId) {
    schedules = schedules.filter((s: StaffSchedule) => s.staffId === staffId);
  }
  
  return schedules;
};

export const saveStaffSchedule = (schedule: StaffSchedule): void => {
  const schedules = getStaffSchedules();
  const existingIndex = schedules.findIndex(s => s.id === schedule.id);
  
  if (existingIndex >= 0) {
    schedules[existingIndex] = schedule;
  } else {
    schedules.push(schedule);
  }
  
  localStorage.setItem(STORAGE_KEYS.STAFF_SCHEDULES, JSON.stringify(schedules));
};

// APPOINTMENT CONFLICTS
export const checkAppointmentConflicts = (appointment: Appointment): AppointmentConflict[] => {
  const conflicts: AppointmentConflict[] = [];
  const existingAppointments = getAppointments({
    date: appointment.date,
    staffId: appointment.staffId
  });
  
  // Check for time overlaps
  const appointmentStart = new Date(`${appointment.date} ${appointment.startTime}`);
  const appointmentEnd = new Date(`${appointment.date} ${appointment.endTime}`);
  
  existingAppointments.forEach(existing => {
    if (existing.id === appointment.id) return; // Skip self when editing
    
    const existingStart = new Date(`${existing.date} ${existing.startTime}`);
    const existingEnd = new Date(`${existing.date} ${existing.endTime}`);
    
    if (
      (appointmentStart >= existingStart && appointmentStart < existingEnd) ||
      (appointmentEnd > existingStart && appointmentEnd <= existingEnd) ||
      (appointmentStart <= existingStart && appointmentEnd >= existingEnd)
    ) {
      conflicts.push({
        type: 'overlap',
        message: `Conflitto orario con appuntamento esistente: ${existing.patientName} (${existing.startTime}-${existing.endTime})`,
        conflictingAppointment: existing,
        suggestions: [
          `Sposta a ${getNextAvailableSlot(appointment.staffId, appointment.date, appointment.duration)}`,
          'Assegna a un altro operatore',
          'Modifica la durata dell\'appuntamento'
        ]
      });
    }
  });
  
  // Check staff availability
  const staffSchedule = getStaffSchedules(appointment.date, appointment.staffId)[0];
  if (staffSchedule && !staffSchedule.isAvailable) {
    conflicts.push({
      type: 'staff_unavailable',
      message: `L'operatore non è disponibile in questa data`,
      suggestions: [
        'Seleziona una data diversa',
        'Assegna a un altro operatore disponibile'
      ]
    });
  }
  
  // Check patient conflicts
  const patientAppointments = getAppointments({
    date: appointment.date,
    patientId: appointment.patientId
  });
  
  patientAppointments.forEach(existing => {
    if (existing.id === appointment.id) return;
    
    const existingStart = new Date(`${existing.date} ${existing.startTime}`);
    const existingEnd = new Date(`${existing.date} ${existing.endTime}`);
    
    if (
      (appointmentStart >= existingStart && appointmentStart < existingEnd) ||
      (appointmentEnd > existingStart && appointmentEnd <= existingEnd)
    ) {
      conflicts.push({
        type: 'patient_conflict',
        message: `Il paziente ha già un appuntamento in questo orario`,
        conflictingAppointment: existing,
        suggestions: [
          'Sposta a un orario diverso',
          'Unisci gli appuntamenti se appropriato'
        ]
      });
    }
  });
  
  return conflicts;
};

// AVAILABLE SLOTS
export const getAvailableSlots = (staffId: string, date: string, duration: number = 30): string[] => {
  const schedule = getStaffSchedules(date, staffId)[0];
  if (!schedule || !schedule.isAvailable) return [];
  
  const appointments = getAppointments({ date, staffId });
  const slots: string[] = [];
  
  const workStart = new Date(`${date} ${schedule.workingHours.start}`);
  const workEnd = new Date(`${date} ${schedule.workingHours.end}`);
  
  let currentTime = new Date(workStart);
  
  while (currentTime < workEnd) {
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);
    
    if (slotEnd <= workEnd) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      
      // Check if slot is available
      const isAvailable = !appointments.some(apt => {
        const aptStart = new Date(`${date} ${apt.startTime}`);
        const aptEnd = new Date(`${date} ${apt.endTime}`);
        return currentTime < aptEnd && slotEnd > aptStart;
      });
      
      // Check if slot is during break
      const isDuringBreak = schedule.breaks.some(breakTime => {
        const breakStart = new Date(`${date} ${breakTime.start}`);
        const breakEnd = new Date(`${date} ${breakTime.end}`);
        return currentTime < breakEnd && slotEnd > breakStart;
      });
      
      if (isAvailable && !isDuringBreak) {
        slots.push(timeString);
      }
    }
    
    currentTime = new Date(currentTime.getTime() + 15 * 60000); // 15-minute intervals
  }
  
  return slots;
};

const getNextAvailableSlot = (staffId: string, date: string, duration: number): string => {
  const slots = getAvailableSlots(staffId, date, duration);
  return slots.length > 0 ? slots[0] : 'Nessuno slot disponibile';
};

// WAITING LIST
export const getWaitingList = (): WaitingList[] => {
  const data = localStorage.getItem(STORAGE_KEYS.WAITING_LIST);
  return data ? JSON.parse(data) : [];
};

export const addToWaitingList = (waitingItem: WaitingList): void => {
  const waitingList = getWaitingList();
  waitingList.push(waitingItem);
  localStorage.setItem(STORAGE_KEYS.WAITING_LIST, JSON.stringify(waitingList));
};

export const removeFromWaitingList = (waitingId: string): void => {
  const waitingList = getWaitingList();
  const filtered = waitingList.filter(w => w.id !== waitingId);
  localStorage.setItem(STORAGE_KEYS.WAITING_LIST, JSON.stringify(filtered));
};

// UTILITY FUNCTIONS
export const generateAppointmentId = (): string => {
  return crypto.randomUUID();
};

export const calculateEndTime = (startTime: string, duration: number): string => {
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(start.getTime() + duration * 60000);
  return end.toTimeString().slice(0, 5);
};

export const getAppointmentStats = (staffId?: string, dateRange?: { start: string; end: string }) => {
  let appointments = getAppointments();
  
  if (staffId) {
    appointments = appointments.filter(a => a.staffId === staffId);
  }
  
  if (dateRange) {
    appointments = appointments.filter(a => a.date >= dateRange.start && a.date <= dateRange.end);
  }
  
  return {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    noShow: appointments.filter(a => a.status === 'no-show').length,
    byType: appointments.reduce((acc, apt) => {
      acc[apt.type] = (acc[apt.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    byPriority: appointments.reduce((acc, apt) => {
      acc[apt.priority] = (acc[apt.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
};

// Reset all appointment storage data
export const resetAppointmentStorageData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
  localStorage.removeItem(STORAGE_KEYS.STAFF_SCHEDULES);
  localStorage.removeItem(STORAGE_KEYS.APPOINTMENT_SLOTS);
  localStorage.removeItem(STORAGE_KEYS.REMINDERS);
  localStorage.removeItem(STORAGE_KEYS.RECURRING);
  localStorage.removeItem(STORAGE_KEYS.WAITING_LIST);
};