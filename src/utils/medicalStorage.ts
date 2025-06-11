import { Patient, MedicalRecord, Appointment, Task, Communication } from '../types/medical';

const STORAGE_KEYS = {
  PATIENTS: 'emmanuel_patients_v2',
  MEDICAL_RECORDS: 'emmanuel_medical_records',
  APPOINTMENTS: 'emmanuel_appointments',
  TASKS: 'emmanuel_tasks',
  COMMUNICATIONS: 'emmanuel_communications'
};

// PATIENTS
export const getPatients = (): Patient[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  return data ? JSON.parse(data) : [];
};

export const savePatient = (patient: Patient): void => {
  const patients = getPatients();
  const existingIndex = patients.findIndex(p => p.id === patient.id);
  
  if (existingIndex >= 0) {
    patients[existingIndex] = { ...patient, updatedAt: new Date().toISOString() };
  } else {
    patients.push({ ...patient, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
};

export const deletePatient = (patientId: string): void => {
  const patients = getPatients();
  const filteredPatients = patients.filter(p => p.id !== patientId);
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(filteredPatients));
};

// MEDICAL RECORDS
export const getMedicalRecords = (patientId?: string): MedicalRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MEDICAL_RECORDS);
  const records = data ? JSON.parse(data) : [];
  return patientId ? records.filter((r: MedicalRecord) => r.patientId === patientId) : records;
};

export const saveMedicalRecord = (record: MedicalRecord): void => {
  const records = getMedicalRecords();
  const existingIndex = records.findIndex(r => r.id === record.id);
  
  if (existingIndex >= 0) {
    records[existingIndex] = record;
  } else {
    records.push(record);
  }
  
  localStorage.setItem(STORAGE_KEYS.MEDICAL_RECORDS, JSON.stringify(records));
};

// APPOINTMENTS
export const getAppointments = (patientId?: string): Appointment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
  const appointments = data ? JSON.parse(data) : [];
  return patientId ? appointments.filter((a: Appointment) => a.patientId === patientId) : appointments;
};

export const saveAppointment = (appointment: Appointment): void => {
  const appointments = getAppointments();
  const existingIndex = appointments.findIndex(a => a.id === appointment.id);
  
  if (existingIndex >= 0) {
    appointments[existingIndex] = appointment;
  } else {
    appointments.push(appointment);
  }
  
  localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
};

// TASKS
export const getTasks = (patientId?: string, assignedTo?: string): Task[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TASKS);
  let tasks = data ? JSON.parse(data) : [];
  
  if (patientId) {
    tasks = tasks.filter((t: Task) => t.patientId === patientId);
  }
  
  if (assignedTo) {
    tasks = tasks.filter((t: Task) => t.assignedTo === assignedTo);
  }
  
  return tasks;
};

export const saveTask = (task: Task): void => {
  const tasks = getTasks();
  const existingIndex = tasks.findIndex(t => t.id === task.id);
  
  if (existingIndex >= 0) {
    tasks[existingIndex] = task;
  } else {
    tasks.push(task);
  }
  
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

// COMMUNICATIONS
export const getCommunications = (patientId?: string): Communication[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COMMUNICATIONS);
  const communications = data ? JSON.parse(data) : [];
  return patientId ? communications.filter((c: Communication) => c.patientId === patientId) : communications;
};

export const saveCommunication = (communication: Communication): void => {
  const communications = getCommunications();
  communications.push(communication);
  localStorage.setItem(STORAGE_KEYS.COMMUNICATIONS, JSON.stringify(communications));
};

// UTILITY FUNCTIONS
export const generatePatientId = (): string => {
  return crypto.randomUUID();
};

export const generateRecordId = (): string => {
  return crypto.randomUUID();
};

export const generateAppointmentId = (): string => {
  return crypto.randomUUID();
};

export const generateTaskId = (): string => {
  return crypto.randomUUID();
};

export const generateCommunicationId = (): string => {
  return crypto.randomUUID();
};

// Reset all medical storage data
export const resetMedicalStorageData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.PATIENTS);
  localStorage.removeItem(STORAGE_KEYS.MEDICAL_RECORDS);
  localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  localStorage.removeItem(STORAGE_KEYS.COMMUNICATIONS);
};