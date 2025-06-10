// Servizio Email Professionale con Multiple Provider
import { EmailCredentials } from '../utils/emailService';

export interface EmailConfig {
  provider: 'emailjs' | 'sendgrid' | 'smtp' | 'mock';
  apiKey?: string;
  serviceId?: string;
  templateId?: string;
  smtpConfig?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
}

class EmailService {
  private config: EmailConfig;
  private templates: Map<string, EmailTemplate> = new Map();

  constructor(config: EmailConfig) {
    this.config = config;
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Template per credenziali utente
    this.templates.set('user-credentials', {
      id: 'user-credentials',
      name: 'Credenziali Utente',
      subject: 'Benvenuto in Emmanuel - Le tue credenziali di accesso',
      htmlContent: this.getCredentialsTemplate(),
      textContent: 'Le tue credenziali: Username: {{username}}, Password: {{password}}',
      variables: ['name', 'username', 'password', 'role', 'department', 'position']
    });

    // Template promemoria appuntamento
    this.templates.set('appointment-reminder', {
      id: 'appointment-reminder',
      name: 'Promemoria Appuntamento',
      subject: 'Promemoria: Appuntamento {{date}} alle {{time}}',
      htmlContent: this.getAppointmentReminderTemplate(),
      textContent: 'Promemoria appuntamento con {{patientName}} il {{date}} alle {{time}}',
      variables: ['patientName', 'date', 'time', 'staffName', 'location', 'notes']
    });

    // Template fattura
    this.templates.set('invoice-reminder', {
      id: 'invoice-reminder',
      name: 'Promemoria Fattura',
      subject: 'Promemoria Pagamento - Fattura {{invoiceNumber}}',
      htmlContent: this.getInvoiceReminderTemplate(),
      textContent: 'Promemoria pagamento fattura {{invoiceNumber}} di €{{amount}}',
      variables: ['patientName', 'invoiceNumber', 'amount', 'dueDate']
    });
  }

  async sendEmail(
    to: string | string[],
    templateId: string,
    variables: Record<string, string>,
    attachments?: Array<{ name: string; content: string; type: string }>
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} non trovato`);
      }

      const emailData = {
        to: Array.isArray(to) ? to : [to],
        subject: this.replaceVariables(template.subject, variables),
        html: this.replaceVariables(template.htmlContent, variables),
        text: this.replaceVariables(template.textContent, variables),
        attachments
      };

      switch (this.config.provider) {
        case 'emailjs':
          return await this.sendWithEmailJS(emailData);
        case 'sendgrid':
          return await this.sendWithSendGrid(emailData);
        case 'smtp':
          return await this.sendWithSMTP(emailData);
        case 'mock':
        default:
          return await this.sendMockEmail(emailData);
      }
    } catch (error) {
      console.error('Errore invio email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
    }
  }

  private async sendWithEmailJS(emailData: any) {
    // Implementazione EmailJS (richiede libreria esterna)
    console.log('📧 Invio con EmailJS:', emailData);
    
    // Simula invio per ora
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      messageId: `emailjs_${Date.now()}`
    };
  }

  private async sendWithSendGrid(emailData: any) {
    // Implementazione SendGrid
    console.log('📧 Invio con SendGrid:', emailData);
    
    if (!this.config.apiKey) {
      throw new Error('API Key SendGrid non configurata');
    }

    // Simula chiamata API SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: emailData.to.map((email: string) => ({ email }))
        }],
        from: { email: 'noreply@emmanuel.it', name: 'Cooperativa Emmanuel' },
        subject: emailData.subject,
        content: [
          { type: 'text/html', value: emailData.html },
          { type: 'text/plain', value: emailData.text }
        ]
      })
    });

    if (response.ok) {
      return {
        success: true,
        messageId: response.headers.get('X-Message-Id') || `sendgrid_${Date.now()}`
      };
    } else {
      throw new Error(`SendGrid error: ${response.status}`);
    }
  }

  private async sendWithSMTP(emailData: any) {
    // Implementazione SMTP (richiede configurazione server)
    console.log('📧 Invio con SMTP:', emailData);
    
    if (!this.config.smtpConfig) {
      throw new Error('Configurazione SMTP non trovata');
    }

    // Simula invio SMTP
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      messageId: `smtp_${Date.now()}`
    };
  }

  private async sendMockEmail(emailData: any) {
    console.log('📧 MOCK EMAIL SEND:', emailData);
    
    // Salva log dell'email
    this.saveEmailLog({
      to: emailData.to,
      subject: emailData.subject,
      content: emailData.html,
      sentAt: new Date().toISOString(),
      provider: 'mock',
      status: 'sent'
    });

    // Simula delay di invio
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return {
      success: true,
      messageId: `mock_${Date.now()}`
    };
  }

  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  }

  private saveEmailLog(log: any) {
    const logs = JSON.parse(localStorage.getItem('emmanuel_email_logs') || '[]');
    logs.push({ ...log, id: `log_${Date.now()}` });
    localStorage.setItem('emmanuel_email_logs', JSON.stringify(logs));
  }

  private getCredentialsTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Benvenuto in Emmanuel</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; padding: 40px 30px; text-align: center; }
        .logo { width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold; margin-bottom: 20px; }
        .content { padding: 40px 30px; }
        .credentials-box { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .credential-item { margin: 12px 0; display: flex; align-items: center; }
        .credential-label { font-weight: 600; color: #374151; min-width: 100px; }
        .credential-value { font-family: 'Courier New', monospace; background: #1f2937; color: #f9fafb; padding: 8px 16px; border-radius: 6px; margin-left: 12px; font-size: 14px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 24px 0; }
        .footer { background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
        .button { background: #0ea5e9; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600; }
        .role-badge { background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">E</div>
            <h1 style="margin: 0; font-size: 28px;">Cooperativa Emmanuel</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Sistema di Gestione Sanitaria</p>
        </div>
        
        <div class="content">
            <h2 style="color: #1f2937; margin-bottom: 16px;">Benvenuto {{name}}!</h2>
            
            <p>È stato creato un account per te nel sistema della <strong>Cooperativa Emmanuel</strong>.</p>
            
            <div style="margin: 20px 0;">
                <p><strong>Dettagli del tuo account:</strong></p>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 8px 0;"><strong>Ruolo:</strong> <span class="role-badge">{{role}}</span></li>
                    <li style="margin: 8px 0;"><strong>Dipartimento:</strong> {{department}}</li>
                    <li style="margin: 8px 0;"><strong>Posizione:</strong> {{position}}</li>
                </ul>
            </div>
            
            <div class="credentials-box">
                <h3 style="margin-top: 0; color: #1f2937;">🔐 Le tue credenziali di accesso</h3>
                
                <div class="credential-item">
                    <span class="credential-label">Username:</span>
                    <span class="credential-value">{{username}}</span>
                </div>
                
                <div class="credential-item">
                    <span class="credential-label">Password:</span>
                    <span class="credential-value">{{password}}</span>
                </div>
            </div>
            
            <div class="warning">
                <h4 style="margin-top: 0; color: #92400e;">⚠️ Importante - Sicurezza</h4>
                <ul style="margin: 0; color: #92400e;">
                    <li>Conserva queste credenziali in modo sicuro</li>
                    <li>Non condividere mai username e password</li>
                    <li>Cambia la password al primo accesso</li>
                    <li>Contatta l'amministratore per problemi</li>
                </ul>
            </div>
            
            <div style="text-align: center;">
                <a href="${window.location.origin}" class="button">🚀 Accedi al Sistema</a>
            </div>
            
            <p style="margin-top: 30px;">Se hai domande o problemi, contatta l'amministratore del sistema.</p>
            
            <p><strong>Benvenuto nel team Emmanuel!</strong> 🎉</p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;"><strong>Cooperativa Sociale Emmanuel</strong></p>
            <p style="margin: 5px 0; color: #6b7280;">Napoli - Sistema di Gestione Sanitaria</p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">Email generata automaticamente dal sistema</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getAppointmentReminderTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Promemoria Appuntamento</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .appointment-card { background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 12px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .label { font-weight: 600; color: #374151; }
        .value { color: #1f2937; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">📅 Promemoria Appuntamento</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Cooperativa Emmanuel</p>
        </div>
        
        <div class="content">
            <h2 style="color: #1f2937;">Ciao {{staffName}},</h2>
            
            <p>Ti ricordiamo che hai un appuntamento programmato:</p>
            
            <div class="appointment-card">
                <h3 style="margin-top: 0; color: #059669;">Dettagli Appuntamento</h3>
                
                <div class="detail-row">
                    <span class="label">Paziente:</span>
                    <span class="value">{{patientName}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">Data:</span>
                    <span class="value">{{date}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">Orario:</span>
                    <span class="value">{{time}}</span>
                </div>
                
                <div class="detail-row">
                    <span class="label">Luogo:</span>
                    <span class="value">{{location}}</span>
                </div>
                
                {{#if notes}}
                <div class="detail-row">
                    <span class="label">Note:</span>
                    <span class="value">{{notes}}</span>
                </div>
                {{/if}}
            </div>
            
            <p>Assicurati di essere puntuale e di avere tutto il necessario per la visita.</p>
            
            <p>Grazie per il tuo impegno!</p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;"><strong>Cooperativa Sociale Emmanuel</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #9ca3af;">Sistema di Gestione Appuntamenti</p>
        </div>
    </div>
</body>
</html>`;
  }

  private getInvoiceReminderTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Promemoria Pagamento</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .invoice-card { background: #fffbeb; border: 2px solid #fde68a; border-radius: 12px; padding: 24px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: #d97706; text-align: center; margin: 16px 0; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">💰 Promemoria Pagamento</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Cooperativa Emmanuel</p>
        </div>
        
        <div class="content">
            <h2 style="color: #1f2937;">Gentile {{patientName}},</h2>
            
            <p>Le ricordiamo che la fattura <strong>{{invoiceNumber}}</strong> è in scadenza.</p>
            
            <div class="invoice-card">
                <h3 style="margin-top: 0; color: #d97706; text-align: center;">Dettagli Fattura</h3>
                
                <div class="amount">€{{amount}}</div>
                
                <p style="text-align: center; margin: 0;"><strong>Scadenza: {{dueDate}}</strong></p>
            </div>
            
            <p>Per informazioni sui metodi di pagamento o per qualsiasi chiarimento, non esiti a contattarci.</p>
            
            <p>Cordiali saluti,<br><strong>Cooperativa Emmanuel</strong></p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;"><strong>Cooperativa Sociale Emmanuel</strong></p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #9ca3af;">Sistema di Fatturazione</p>
        </div>
    </div>
</body>
</html>`;
  }

  // Metodi pubblici per gestione template
  getTemplate(id: string): EmailTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  addTemplate(template: EmailTemplate): void {
    this.templates.set(template.id, template);
  }

  updateConfig(newConfig: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Istanza singleton del servizio email
let emailServiceInstance: EmailService | null = null;

export const getEmailService = (): EmailService => {
  if (!emailServiceInstance) {
    // Configurazione di default (mock)
    const defaultConfig: EmailConfig = {
      provider: 'mock'
    };
    emailServiceInstance = new EmailService(defaultConfig);
  }
  return emailServiceInstance;
};

export const initializeEmailService = (config: EmailConfig): EmailService => {
  emailServiceInstance = new EmailService(config);
  return emailServiceInstance;
};

// Funzioni di utilità
export const sendCredentialsEmail = async (credentials: EmailCredentials): Promise<boolean> => {
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

  return result.success;
};

export const sendAppointmentReminder = async (appointmentData: {
  to: string;
  staffName: string;
  patientName: string;
  date: string;
  time: string;
  location: string;
  notes?: string;
}): Promise<boolean> => {
  const emailService = getEmailService();
  
  const result = await emailService.sendEmail(
    appointmentData.to,
    'appointment-reminder',
    appointmentData
  );

  return result.success;
};

export const sendInvoiceReminder = async (invoiceData: {
  to: string;
  patientName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
}): Promise<boolean> => {
  const emailService = getEmailService();
  
  const result = await emailService.sendEmail(
    invoiceData.to,
    'invoice-reminder',
    invoiceData
  );

  return result.success;
};

const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'admin': return 'Amministratore Sistema';
    case 'coordinator': return 'Coordinatore Sanitario';
    case 'staff': return 'Equipe Sanitaria';
    default: return role;
  }
};

export { EmailService, type EmailConfig, type EmailTemplate };