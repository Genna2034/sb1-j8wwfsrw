// Servizio per l'invio di email con le credenziali
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
    
    // Simula l'invio email (in produzione useresti un servizio come EmailJS, SendGrid, etc.)
    const emailContent = generateEmailTemplate(credentials);
    
    console.log('📧 Email generata:', emailContent);
    
    // In un ambiente reale, qui faresti la chiamata API al servizio email
    // Per ora simuliamo con un delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simula successo (in produzione gestiresti errori reali)
    console.log('✅ Email inviata con successo a:', credentials.to);
    
    // Salva log dell'invio
    saveEmailLog(credentials);
    
    return true;
  } catch (error) {
    console.error('❌ Errore nell\'invio email:', error);
    return false;
  }
};

const generateEmailTemplate = (credentials: EmailCredentials): string => {
  const roleDisplayName = getRoleDisplayName(credentials.role);
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Credenziali di Accesso - Cooperativa Emmanuel</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 15px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .credentials-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #374151; }
        .credential-value { font-family: monospace; background: #1f2937; color: #f9fafb; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-left: 10px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none; }
        .button { background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">E</div>
            <h1>Cooperativa Emmanuel</h1>
            <p>Benvenuto nel nostro sistema</p>
        </div>
        
        <div class="content">
            <h2>Ciao ${credentials.name},</h2>
            
            <p>È stato creato un account per te nel sistema della <strong>Cooperativa Emmanuel</strong>.</p>
            
            <p><strong>Dettagli del tuo account:</strong></p>
            <ul>
                <li><strong>Ruolo:</strong> ${roleDisplayName}</li>
                <li><strong>Dipartimento:</strong> ${credentials.department}</li>
                <li><strong>Posizione:</strong> ${credentials.position}</li>
            </ul>
            
            <div class="credentials-box">
                <h3>🔐 Le tue credenziali di accesso:</h3>
                
                <div class="credential-item">
                    <span class="credential-label">Username:</span>
                    <span class="credential-value">${credentials.username}</span>
                </div>
                
                <div class="credential-item">
                    <span class="credential-label">Password:</span>
                    <span class="credential-value">${credentials.password}</span>
                </div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul>
                    <li>Conserva queste credenziali in modo sicuro</li>
                    <li>Non condividere mai username e password con altri</li>
                    <li>Cambia la password al primo accesso se possibile</li>
                    <li>Contatta l'amministratore per qualsiasi problema</li>
                </ul>
            </div>
            
            <p>Puoi accedere al sistema utilizzando il link qui sotto:</p>
            <a href="${window.location.origin}" class="button">Accedi al Sistema</a>
            
            <p>Se hai domande o problemi, non esitare a contattare l'amministratore del sistema.</p>
            
            <p>Benvenuto nel team!</p>
        </div>
        
        <div class="footer">
            <p><strong>Cooperativa Sociale Emmanuel</strong><br>
            Napoli - Sistema di Gestione Staff<br>
            <small>Questa email è stata generata automaticamente dal sistema</small></p>
        </div>
    </div>
</body>
</html>
  `;
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
  const emailContent = generateEmailTemplate(credentials);
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(emailContent);
    newWindow.document.close();
  }
};