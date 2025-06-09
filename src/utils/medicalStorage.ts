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
  return data ? JSON.parse(data) : generateMockPatients();
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
  const records = data ? JSON.parse(data) : generateMockMedicalRecords();
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
  const appointments = data ? JSON.parse(data) : generateMockAppointments();
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
  let tasks = data ? JSON.parse(data) : generateMockTasks();
  
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
  return `PAT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const generateRecordId = (): string => {
  return `REC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const generateAppointmentId = (): string => {
  return `APP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const generateTaskId = (): string => {
  return `TSK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const generateCommunicationId = (): string => {
  return `COM-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

// MOCK DATA GENERATORS
const generateMockPatients = (): Patient[] => {
  return [
    {
      id: 'PAT-001',
      personalInfo: {
        name: 'Giuseppe',
        surname: 'Marino',
        dateOfBirth: '1945-03-15',
        fiscalCode: 'MRNGSPP45C15F839K',
        address: 'Via Roma 123',
        city: 'Napoli',
        postalCode: '80100',
        phone: '081-1234567',
        email: 'giuseppe.marino@email.com',
        emergencyContact: {
          name: 'Maria Marino',
          relationship: 'Moglie',
          phone: '081-1234568'
        }
      },
      medicalInfo: {
        allergies: ['Penicillina', 'Lattosio'],
        chronicConditions: ['Diabete Tipo 2', 'Ipertensione'],
        currentMedications: [
          {
            id: 'MED-001',
            name: 'Metformina',
            dosage: '500mg',
            frequency: '2 volte al giorno',
            startDate: '2024-01-01',
            prescribedBy: 'Dr. Rossi'
          }
        ],
        bloodType: 'A+',
        height: 175,
        weight: 80,
        notes: 'Paziente collaborativo, controllo glicemia quotidiano'
      },
      assignedStaff: ['3', '6'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
      status: 'active'
    },
    {
      id: 'PAT-002',
      personalInfo: {
        name: 'Maria',
        surname: 'Rossi',
        dateOfBirth: '1950-07-22',
        fiscalCode: 'RSSMRA50L62F839P',
        address: 'Via Garibaldi 45',
        city: 'Napoli',
        postalCode: '80100',
        phone: '081-2345678',
        emergencyContact: {
          name: 'Antonio Rossi',
          relationship: 'Figlio',
          phone: '081-2345679'
        }
      },
      medicalInfo: {
        allergies: [],
        chronicConditions: ['Artrite Reumatoide'],
        currentMedications: [
          {
            id: 'MED-002',
            name: 'Metotrexato',
            dosage: '15mg',
            frequency: '1 volta a settimana',
            startDate: '2024-01-01',
            prescribedBy: 'Dr. Bianchi'
          }
        ],
        bloodType: 'B+',
        height: 160,
        weight: 65,
        notes: 'Post-operatorio, medicazione quotidiana'
      },
      assignedStaff: ['3'],
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-16T00:00:00Z',
      status: 'active'
    }
  ];
};

const generateMockMedicalRecords = (): MedicalRecord[] => {
  return [
    {
      id: 'REC-001',
      patientId: 'PAT-001',
      date: '2024-01-15',
      time: '09:00',
      type: 'measurement',
      title: 'Controllo Glicemia',
      description: 'Misurazione glicemia a digiuno',
      staffId: '3',
      staffName: 'Anna Verdi',
      vitals: {
        bloodSugar: 120,
        bloodPressure: { systolic: 140, diastolic: 90 },
        weight: 80,
        notes: 'Valori nella norma'
      }
    },
    {
      id: 'REC-002',
      patientId: 'PAT-002',
      date: '2024-01-15',
      time: '10:30',
      type: 'therapy',
      title: 'Fisioterapia',
      description: 'Sessione di fisioterapia per artrite',
      staffId: '4',
      staffName: 'Luca Bianchi'
    }
  ];
};

const generateMockAppointments = (): Appointment[] => {
  return [
    {
      id: 'APP-001',
      patientId: 'PAT-001',
      staffId: '3',
      date: '2024-01-20',
      startTime: '09:00',
      endTime: '09:30',
      type: 'visit',
      status: 'scheduled',
      notes: 'Controllo mensile diabete',
      location: 'Domicilio'
    }
  ];
};

const generateMockTasks = (): Task[] => {
  return [
    {
      id: 'TSK-001',
      patientId: 'PAT-001',
      assignedTo: '3',
      title: 'Controllo Glicemia',
      description: 'Effettuare controllo glicemia mattutino',
      priority: 'high',
      status: 'pending',
      dueDate: '2024-01-16',
      createdAt: '2024-01-15T00:00:00Z'
    }
  ];
};