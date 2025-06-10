// Utility per inizializzare dati di esempio e configurazioni
import { Patient } from '../types/medical';
import { Appointment } from '../types/appointments';
import { Invoice } from '../types/billing';
import { Message, Notification, Task } from '../types/communications';
import { savePatient } from './medicalStorage';
import { saveAppointment } from './appointmentStorage';
import { saveInvoice } from './billingStorage';
import { saveMessage, saveNotification, saveTask } from './communicationStorage';

export const initializeSystemData = () => {
  console.log('🚀 Inizializzazione dati di sistema...');
  
  // Verifica se i dati sono già stati inizializzati
  const isInitialized = localStorage.getItem('emmanuel_data_initialized');
  if (isInitialized) {
    console.log('✅ Dati già inizializzati');
    return;
  }

  try {
    initializeSamplePatients();
    initializeSampleAppointments();
    initializeSampleInvoices();
    initializeSampleCommunications();
    
    // Marca come inizializzato
    localStorage.setItem('emmanuel_data_initialized', 'true');
    localStorage.setItem('emmanuel_data_version', '1.0.0');
    
    console.log('✅ Inizializzazione dati completata');
  } catch (error) {
    console.error('❌ Errore durante inizializzazione:', error);
  }
};

const initializeSamplePatients = () => {
  const samplePatients: Patient[] = [
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
      assignedStaff: ['3'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active'
    }
  ];

  samplePatients.forEach(patient => savePatient(patient));
  console.log('✅ Pazienti di esempio creati');
};

const initializeSampleAppointments = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sampleAppointments: Appointment[] = [
    {
      id: 'APT-001',
      patientId: 'PAT-001',
      patientName: 'Giuseppe Marino',
      staffId: '3',
      staffName: 'Anna Verdi',
      date: tomorrow.toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '09:30',
      type: 'visit',
      status: 'scheduled',
      priority: 'normal',
      location: 'home',
      duration: 30,
      notes: 'Controllo mensile diabete',
      symptoms: 'Controllo routine glicemia',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '2',
      cost: 50
    }
  ];

  sampleAppointments.forEach(appointment => saveAppointment(appointment));
  console.log('✅ Appuntamenti di esempio creati');
};

const initializeSampleInvoices = () => {
  const sampleInvoices: Invoice[] = [
    {
      id: 'INV-001',
      number: 'EMM0001',
      patientId: 'PAT-001',
      patientName: 'Giuseppe Marino',
      patientFiscalCode: 'MRNGSPP45C15F839K',
      patientAddress: 'Via Roma 123, Napoli 80100',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'sent',
      type: 'invoice',
      items: [
        {
          id: 'ITEM-001',
          description: 'Visita Medica Domiciliare',
          serviceType: 'visit',
          quantity: 1,
          unitPrice: 50,
          discount: 0,
          discountType: 'percentage',
          taxRate: 22,
          total: 50,
          date: new Date().toISOString().split('T')[0]
        }
      ],
      subtotal: 50,
      taxRate: 22,
      taxAmount: 11,
      total: 61,
      paidAmount: 0,
      remainingAmount: 61,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '2',
      isElectronic: true
    }
  ];

  sampleInvoices.forEach(invoice => saveInvoice(invoice));
  console.log('✅ Fatture di esempio create');
};

const initializeSampleCommunications = () => {
  // Messaggio di benvenuto
  const welcomeMessage: Message = {
    id: 'MSG-WELCOME',
    type: 'system',
    priority: 'normal',
    status: 'sent',
    subject: 'Benvenuto nel Sistema Emmanuel',
    content: 'Benvenuto nel sistema di gestione della Cooperativa Emmanuel. Il sistema è stato configurato con successo e tutti i moduli sono operativi.',
    fromUserId: 'system',
    fromUserName: 'Sistema Emmanuel',
    toUserIds: ['1', '2', '3'],
    toUserNames: ['Mario Rossi', 'Gennaro Borriello', 'Anna Verdi'],
    readBy: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isSystemGenerated: true
  };

  // Notifica di sistema
  const systemNotification: Notification = {
    id: 'NOT-SYSTEM',
    type: 'system',
    priority: 'normal',
    title: 'Sistema Inizializzato',
    message: 'Il sistema Emmanuel è stato configurato con successo. Tutti i moduli sono operativi.',
    userId: '1',
    isRead: false,
    createdAt: new Date().toISOString()
  };

  // Task di esempio
  const sampleTask: Task = {
    id: 'TSK-001',
    title: 'Controllo Sistema',
    description: 'Verificare che tutti i moduli del sistema funzionino correttamente',
    type: 'administrative',
    priority: 'normal',
    status: 'pending',
    assignedTo: '1',
    assignedToName: 'Mario Rossi',
    assignedBy: 'system',
    assignedByName: 'Sistema',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reminders: []
  };

  saveMessage(welcomeMessage);
  saveNotification(systemNotification);
  saveTask(sampleTask);
  
  console.log('✅ Comunicazioni di esempio create');
};

export const resetSystemData = () => {
  if (window.confirm('Sei sicuro di voler resettare tutti i dati? Questa azione non può essere annullata.')) {
    // Rimuovi tutti i dati
    const keysToRemove = Object.keys(localStorage).filter(key => key.startsWith('emmanuel_'));
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('🗑️ Dati di sistema resettati');
    
    // Reinizializza
    initializeSystemData();
    
    // Ricarica la pagina
    window.location.reload();
  }
};

export const exportSystemData = () => {
  const data = {};
  
  // Esporta tutti i dati Emmanuel
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('emmanuel_')) {
      data[key] = localStorage.getItem(key);
    }
  });
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `emmanuel-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
  console.log('📦 Backup dati esportato');
};

export const importSystemData = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Importa i dati
        Object.entries(data).forEach(([key, value]) => {
          if (key.startsWith('emmanuel_')) {
            localStorage.setItem(key, value as string);
          }
        });
        
        console.log('📥 Dati importati con successo');
        resolve(true);
      } catch (error) {
        console.error('❌ Errore durante importazione:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Errore nella lettura del file'));
    reader.readAsText(file);
  });
};