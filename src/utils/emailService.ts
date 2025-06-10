// Servizio per l'invio di email con le credenziali
import { getEmailService } from '../services/emailService';

export interface EmailCredentials {
  to: string;
  username: string;
  password: string;
  name: string;
  role: string;
  department: string;
  position: string;
}

export const sendCredentialsEmail = async (credentials: EmailCredentials): Promise<boolean> => {
  try {
    console.log('📧 Preparazione invio email credenziali...');
    
    // Usa il servizio email avanzato
    const emailService = getEmailService();
    const result = await emailService.sendEmail(
      credentials.to,
      'user-credentials',
      {
        name: credentials.name,
        username: credentials.username,
        password: credentials.password,
        role: getRoleDisplayName(credentials.role),
        department: credentials.department,
        position: credentials.position
      }
    );
    
    if (result.success) {
      console.log('✅ Email inviata con successo a:', credentials.to);
      
      // Salva log dell'invio
      saveEmailLog(credentials);
      
      return true;
    } else {
      console.error('❌ Errore nell\'invio email:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Errore nell\'invio email:', error);
    return false;
  }
};

const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin': return 'Amministratore Sistema';
    case 'coordinator': return 'Coordinatore Sanitario';
    case 'staff': return 'Equipe Sanitaria';
    default: return role;
  }
};

const saveEmailLog = (credentials: EmailCredentials): void => {
  const logs = getEmailLogs();
  const newLog = {
    id: `email-${Date.now()}`,
    to: credentials.to,
    username: credentials.username,
    name: credentials.name,
    role: credentials.role,
    sentAt: new Date().toISOString(),
    status: 'sent'
  };
  
  logs.push(newLog);
  localStorage.setItem('emmanuel_email_logs', JSON.stringify(logs));
};

export const getEmailLogs = () => {
  const data = localStorage.getItem('emmanuel_email_logs');
  return data ? JSON.parse(data) : [];
};

// Funzione per preview dell'email (utile per testing)
export const previewEmail = (credentials: EmailCredentials): void => {
  const emailService = getEmailService();
  const template = emailService.getTemplate('user-credentials');
  
  if (!template) {
    alert('Template email non trovato');
    return;
  }
  
  const content = emailService.sendEmail(
    'preview@example.com',
    'user-credentials',
    {
      name: credentials.name,
      username: credentials.username,
      password: credentials.password,
      role: getRoleDisplayName(credentials.role),
      department: credentials.department,
      position: credentials.position
    }
  );
  
  // Apri in una nuova finestra
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(template.htmlContent);
    newWindow.document.close();
  }
};