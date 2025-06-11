import { TimeEntry, Shift, StaffMember, Patient } from '../types/auth';

const STORAGE_KEYS = {
  TIME_ENTRIES: 'emmanuel_time_entries',
  SHIFTS: 'emmanuel_shifts',
  STAFF_PRESENCE: 'emmanuel_staff_presence',
  PATIENTS: 'emmanuel_patients'
};

export const getTimeEntries = (): TimeEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES);
  return data ? JSON.parse(data) : [];
};

export const saveTimeEntry = (entry: TimeEntry): void => {
  const entries = getTimeEntries();
  const existingIndex = entries.findIndex(e => e.id === entry.id);
  
  if (existingIndex >= 0) {
    entries[existingIndex] = entry;
  } else {
    entries.push(entry);
  }
  
  localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries));
};

export const getShifts = (): Shift[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SHIFTS);
  return data ? JSON.parse(data) : [];
};

export const saveShift = (shift: Shift): void => {
  const shifts = getShifts();
  const existingIndex = shifts.findIndex(s => s.id === shift.id);
  
  if (existingIndex >= 0) {
    shifts[existingIndex] = shift;
  } else {
    shifts.push(shift);
  }
  
  localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(shifts));
};

export const deleteShift = (shiftId: string): void => {
  const shifts = getShifts();
  const filteredShifts = shifts.filter(s => s.id !== shiftId);
  localStorage.setItem(STORAGE_KEYS.SHIFTS, JSON.stringify(filteredShifts));
};

export const getPatients = (): Patient[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  return data ? JSON.parse(data) : [];
};

export const savePatient = (patient: Patient): void => {
  const patients = getPatients();
  const existingIndex = patients.findIndex(p => p.id === patient.id);
  
  if (existingIndex >= 0) {
    patients[existingIndex] = patient;
  } else {
    patients.push(patient);
  }
  
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
};

export const getStaffPresence = (): StaffMember[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STAFF_PRESENCE);
  return data ? JSON.parse(data) : [];
};

export const updateStaffPresence = (staffId: string, isPresent: boolean, clockInTime?: string): void => {
  const staff = getStaffPresence();
  const member = staff.find(s => s.id === staffId);
  
  if (member) {
    member.isPresent = isPresent;
    member.clockInTime = clockInTime;
    localStorage.setItem(STORAGE_KEYS.STAFF_PRESENCE, JSON.stringify(staff));
  }
};

// Reset all storage data except for users
export const resetStorageData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.TIME_ENTRIES);
  localStorage.removeItem(STORAGE_KEYS.SHIFTS);
  localStorage.removeItem(STORAGE_KEYS.STAFF_PRESENCE);
  localStorage.removeItem(STORAGE_KEYS.PATIENTS);
};