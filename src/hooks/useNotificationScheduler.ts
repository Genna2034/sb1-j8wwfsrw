import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { getAppointments } from '../utils/appointmentStorage';
import { getInvoices } from '../utils/billingStorage';
import { getTasks } from '../utils/communicationStorage';
import { 
  createAppointmentNotification, 
  createInvoiceNotification, 
  createTaskNotification 
} from '../utils/notificationUtils';

// Hook per la gestione automatica delle notifiche programmate
export function useNotificationScheduler() {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [stats, setStats] = useState({
    appointmentReminders: 0,
    invoiceReminders: 0,
    taskReminders: 0,
    total: 0
  });

  useEffect(() => {
    if (user) {
      // Esegui all'avvio
      runScheduler();
      
      // Imposta intervallo per esecuzione periodica (ogni 15 minuti)
      const interval = setInterval(runScheduler, 15 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const runScheduler = async () => {
    if (!user || isRunning) return;
    
    setIsRunning(true);
    
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayStr = today.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      let notificationCount = 0;
      
      // Initialize arrays with default values
      let staffAppointments: any[] = [];
      let dueInvoicesArray: any[] = [];
      let overdueInvoicesArray: any[] = [];
      let dueTasks: any[] = [];
      let overdueTasks: any[] = [];
      
      // Promemoria appuntamenti per domani
      try {
        const appointments = getAppointments({ date: tomorrowStr });
        staffAppointments = appointments.filter(apt => 
          apt.staffId === user.id && 
          (apt.status === 'scheduled' || apt.status === 'confirmed')
        );
        
        for (const appointment of staffAppointments) {
          try {
            await createAppointmentNotification(user.id, appointment, 'reminder');
            notificationCount++;
          } catch (error) {
            console.error('Errore nella creazione notifica appuntamento:', error);
          }
        }
      } catch (error) {
        console.error('Errore nel recupero appuntamenti:', error);
      }
      
      // Promemoria fatture in scadenza
      if (user.role === 'admin' || user.role === 'coordinator') {
        try {
          const invoices = getInvoices();
          dueInvoicesArray = invoices.filter(inv => {
            const dueDate = new Date(inv.dueDate);
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays <= 5 && diffDays > 0 && inv.status !== 'paid' && inv.status !== 'cancelled';
          });
          
          for (const invoice of dueInvoicesArray) {
            try {
              await createInvoiceNotification(user.id, invoice, 'reminder');
              notificationCount++;
            } catch (error) {
              console.error('Errore nella creazione notifica fattura:', error);
            }
          }
          
          // Fatture scadute oggi
          overdueInvoicesArray = invoices.filter(inv => 
            inv.dueDate === todayStr && 
            inv.status !== 'paid' && 
            inv.status !== 'cancelled'
          );
          
          for (const invoice of overdueInvoicesArray) {
            try {
              await createInvoiceNotification(user.id, invoice, 'overdue');
              notificationCount++;
            } catch (error) {
              console.error('Errore nella creazione notifica fattura scaduta:', error);
            }
          }
        } catch (error) {
          console.error('Errore nel recupero fatture:', error);
        }
      }
      
      // Promemoria task in scadenza
      try {
        const tasks = getTasks({ assignedTo: user.id });
        dueTasks = tasks.filter(task => {
          const dueDate = new Date(task.dueDate);
          const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays === 1 && task.status !== 'completed' && task.status !== 'cancelled';
        });
        
        for (const task of dueTasks) {
          try {
            await createTaskNotification(user.id, task, 'reminder');
            notificationCount++;
          } catch (error) {
            console.error('Errore nella creazione notifica task:', error);
          }
        }
        
        // Task scaduti oggi
        overdueTasks = tasks.filter(task => 
          task.dueDate === todayStr && 
          task.status !== 'completed' && 
          task.status !== 'cancelled'
        );
        
        for (const task of overdueTasks) {
          try {
            await createTaskNotification(user.id, task, 'overdue');
            notificationCount++;
          } catch (error) {
            console.error('Errore nella creazione notifica task scaduto:', error);
          }
        }
      } catch (error) {
        console.error('Errore nel recupero task:', error);
      }
      
      // Aggiorna statistiche
      setStats({
        appointmentReminders: staffAppointments.length,
        invoiceReminders: (user.role === 'admin' || user.role === 'coordinator') ? 
          dueInvoicesArray.length + overdueInvoicesArray.length : 0,
        taskReminders: dueTasks.length + overdueTasks.length,
        total: notificationCount
      });
      
      // Aggiorna la lista notifiche
      if (notificationCount > 0) {
        refreshNotifications();
      }
      
      setLastRun(new Date());
    } catch (error) {
      console.error('Errore nell\'esecuzione dello scheduler notifiche:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return {
    isRunning,
    lastRun,
    stats,
    runNow: runScheduler
  };
}