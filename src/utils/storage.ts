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
  return data ? JSON.parse(data) : generateMockShifts();
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
  return data ? JSON.parse(data) : generateMockPatients();
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
  return data ? JSON.parse(data) : generateMockStaff();
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

const generateMockShifts = (): Shift[] => {
  const shifts: Shift[] = [];
  const today = new Date();
  
  // Generate shifts for the next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i - 15);
    
    // Skip weekends for some variety
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    const shiftTypes = ['domiciliare', 'ambulatorio', 'formazione'] as const;
    
    shifts.push({
      id: `shift-${i}`,
      userId: '3', // Anna Verdi (infermiere.01)
      date: date.toISOString().split('T')[0],
      startTime: i % 3 === 0 ? '08:00' : '14:00',
      endTime: i % 3 === 0 ? '14:00' : '20:00',
      type: shiftTypes[i % 3],
      patientId: shiftTypes[i % 3] === 'domiciliare' ? `patient-${(i % 5) + 1}` : undefined,
      notes: i % 4 === 0 ? 'Controllo pressione e medicazione' : undefined
    });
  }
  
  return shifts;
};

const generateMockPatients = (): Patient[] => {
  return [
    {
      id: 'patient-1',
      name: 'Giuseppe Marino',
      address: 'Via Roma 123, Napoli',
      phone: '081-1234567',
      medicalNotes: 'Diabete tipo 2, controllo glicemia quotidiano',
      assignedStaff: ['3']
    },
    {
      id: 'patient-2',
      name: 'Maria Rossi',
      address: 'Via Garibaldi 45, Napoli',
      phone: '081-2345678',
      medicalNotes: 'Post-operatorio, medicazione quotidiana',
      assignedStaff: ['3', '6']
    },
    {
      id: 'patient-3',
      name: 'Antonio Bianchi',
      address: 'Corso Umberto 78, Napoli',
      phone: '081-3456789',
      medicalNotes: 'Fisioterapia riabilitativa, 3 volte a settimana',
      assignedStaff: ['4']
    },
    {
      id: 'patient-4',
      name: 'Francesca Verde',
      address: 'Via Nazionale 234, Napoli',
      phone: '081-4567890',
      medicalNotes: 'Assistenza igiene personale, mobilizzazione',
      assignedStaff: ['5', '7']
    },
    {
      id: 'patient-5',
      name: 'Luigi Esposito',
      address: 'Via del Mare 56, Napoli',
      phone: '081-5678901',
      medicalNotes: 'Controllo pressione, terapia farmacologica',
      assignedStaff: ['3']
    }
  ];
};

const generateMockStaff = (): StaffMember[] => {
  return [
    {
      id: '1',
      name: 'Mario Rossi',
      position: 'Amministratore',
      department: 'Amministrazione',
      isPresent: true,
      clockInTime: '08:30'
    },
    {
      id: '2',
      name: 'Gennaro Borriello',
      position: 'Coordinatore',
      department: 'Assistenza Domiciliare',
      isPresent: true,
      clockInTime: '08:00'
    },
    {
      id: '3',
      name: 'Anna Verdi',
      position: 'Infermiere',
      department: 'Assistenza Domiciliare',
      isPresent: false
    },
    {
      id: '4',
      name: 'Luca Bianchi',
      position: 'Fisioterapista',
      department: 'Riabilitazione',
      isPresent: true,
      clockInTime: '09:15'
    },
    {
      id: '5',
      name: 'Giulia Romano',
      position: 'OSS',
      department: 'Assistenza Domiciliare',
      isPresent: false
    },
    {
      id: '6',
      name: 'Francesco Esposito',
      position: 'Infermiere',
      department: 'Assistenza Domiciliare',
      isPresent: true,
      clockInTime: '07:45'
    },
    {
      id: '7',
      name: 'Maria Conte',
      position: 'OSS',
      department: 'Assistenza Domiciliare',
      isPresent: true,
      clockInTime: '08:15'
    },
    {
      id: '8',
      name: 'Giuseppe Marino',
      position: 'Fisioterapista',
      department: 'Riabilitazione',
      isPresent: false
    }
  ];
};