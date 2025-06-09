// External Integrations - Sistema di integrazione con servizi esterni
export interface IntegrationConfig {
  name: string;
  apiKey: string;
  baseUrl: string;
  enabled: boolean;
  rateLimits: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export class ExternalIntegrationsManager {
  private static instance: ExternalIntegrationsManager;
  private integrations: Map<string, IntegrationConfig> = new Map();
  private rateLimiters: Map<string, { requests: number; resetTime: number }> = new Map();

  static getInstance(): ExternalIntegrationsManager {
    if (!ExternalIntegrationsManager.instance) {
      ExternalIntegrationsManager.instance = new ExternalIntegrationsManager();
    }
    return ExternalIntegrationsManager.instance;
  }

  // Configurazione integrazioni
  configureIntegration(name: string, config: IntegrationConfig): void {
    this.integrations.set(name, config);
    console.log(`✅ Integrazione ${name} configurata`);
  }

  // Rate limiting intelligente
  private async checkRateLimit(integrationName: string): Promise<boolean> {
    const config = this.integrations.get(integrationName);
    if (!config) return false;

    const now = Date.now();
    const limiter = this.rateLimiters.get(integrationName) || { requests: 0, resetTime: now + 60000 };

    if (now > limiter.resetTime) {
      limiter.requests = 0;
      limiter.resetTime = now + 60000;
    }

    if (limiter.requests >= config.rateLimits.requestsPerMinute) {
      console.warn(`⚠️ Rate limit raggiunto per ${integrationName}`);
      return false;
    }

    limiter.requests++;
    this.rateLimiters.set(integrationName, limiter);
    return true;
  }

  // 1. INTEGRAZIONE WHATSAPP BUSINESS API
  async sendWhatsAppMessage(to: string, message: string, type: 'text' | 'template' = 'text'): Promise<boolean> {
    if (!await this.checkRateLimit('whatsapp')) return false;

    try {
      const config = this.integrations.get('whatsapp');
      if (!config?.enabled) throw new Error('WhatsApp non configurato');

      const response = await fetch(`${config.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to.replace(/\D/g, ''), // Solo numeri
          type,
          text: type === 'text' ? { body: message } : undefined,
          template: type === 'template' ? {
            name: 'appointment_reminder',
            language: { code: 'it' },
            components: [{ type: 'body', parameters: [{ type: 'text', text: message }] }]
          } : undefined
        })
      });

      if (!response.ok) throw new Error(`WhatsApp API error: ${response.status}`);
      
      console.log('✅ Messaggio WhatsApp inviato con successo');
      return true;
    } catch (error) {
      console.error('❌ Errore invio WhatsApp:', error);
      return false;
    }
  }

  // 2. INTEGRAZIONE GOOGLE CALENDAR
  async createGoogleCalendarEvent(appointment: any): Promise<string | null> {
    if (!await this.checkRateLimit('google_calendar')) return null;

    try {
      const config = this.integrations.get('google_calendar');
      if (!config?.enabled) throw new Error('Google Calendar non configurato');

      const event = {
        summary: `Appuntamento: ${appointment.patientName}`,
        description: `Tipo: ${appointment.type}\nNote: ${appointment.notes || 'Nessuna nota'}`,
        start: {
          dateTime: `${appointment.date}T${appointment.startTime}:00`,
          timeZone: 'Europe/Rome'
        },
        end: {
          dateTime: `${appointment.date}T${appointment.endTime}:00`,
          timeZone: 'Europe/Rome'
        },
        attendees: [
          { email: appointment.staffEmail },
          { email: appointment.patientEmail }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24h prima
            { method: 'popup', minutes: 30 }       // 30min prima
          ]
        }
      };

      const response = await fetch(`${config.baseUrl}/calendars/primary/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });

      if (!response.ok) throw new Error(`Google Calendar API error: ${response.status}`);
      
      const result = await response.json();
      console.log('✅ Evento Google Calendar creato:', result.id);
      return result.id;
    } catch (error) {
      console.error('❌ Errore Google Calendar:', error);
      return null;
    }
  }

  // 3. INTEGRAZIONE STRIPE PAYMENTS
  async createStripePaymentIntent(amount: number, currency: string = 'EUR', metadata: any = {}): Promise<any> {
    if (!await this.checkRateLimit('stripe')) return null;

    try {
      const config = this.integrations.get('stripe');
      if (!config?.enabled) throw new Error('Stripe non configurato');

      const response = await fetch(`${config.baseUrl}/payment_intents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          amount: (amount * 100).toString(), // Stripe usa centesimi
          currency: currency.toLowerCase(),
          automatic_payment_methods: JSON.stringify({ enabled: true }),
          metadata: JSON.stringify(metadata)
        })
      });

      if (!response.ok) throw new Error(`Stripe API error: ${response.status}`);
      
      const paymentIntent = await response.json();
      console.log('✅ Payment Intent Stripe creato:', paymentIntent.id);
      return paymentIntent;
    } catch (error) {
      console.error('❌ Errore Stripe:', error);
      return null;
    }
  }

  // 4. INTEGRAZIONE SENDGRID EMAIL
  async sendEmail(to: string[], subject: string, htmlContent: string, attachments?: any[]): Promise<boolean> {
    if (!await this.checkRateLimit('sendgrid')) return false;

    try {
      const config = this.integrations.get('sendgrid');
      if (!config?.enabled) throw new Error('SendGrid non configurato');

      const emailData = {
        personalizations: [{
          to: to.map(email => ({ email })),
          subject
        }],
        from: { email: 'noreply@emmanuel.it', name: 'Cooperativa Emmanuel' },
        content: [{ type: 'text/html', value: htmlContent }],
        attachments: attachments || []
      };

      const response = await fetch(`${config.baseUrl}/mail/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) throw new Error(`SendGrid API error: ${response.status}`);
      
      console.log('✅ Email inviata con successo via SendGrid');
      return true;
    } catch (error) {
      console.error('❌ Errore SendGrid:', error);
      return false;
    }
  }

  // 5. INTEGRAZIONE TWILIO SMS
  async sendSMS(to: string, message: string): Promise<boolean> {
    if (!await this.checkRateLimit('twilio')) return false;

    try {
      const config = this.integrations.get('twilio');
      if (!config?.enabled) throw new Error('Twilio non configurato');

      const response = await fetch(`${config.baseUrl}/Accounts/${config.apiKey}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${config.apiKey}:${config.baseUrl}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: '+39123456789', // Numero Twilio
          To: to,
          Body: message
        })
      });

      if (!response.ok) throw new Error(`Twilio API error: ${response.status}`);
      
      console.log('✅ SMS inviato con successo via Twilio');
      return true;
    } catch (error) {
      console.error('❌ Errore Twilio:', error);
      return false;
    }
  }

  // 6. INTEGRAZIONE MICROSOFT TEAMS
  async sendTeamsNotification(webhookUrl: string, title: string, message: string, color: string = '0078D4'): Promise<boolean> {
    try {
      const card = {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: title,
        themeColor: color,
        sections: [{
          activityTitle: title,
          activitySubtitle: 'Cooperativa Emmanuel',
          activityImage: 'https://via.placeholder.com/64x64/0078D4/FFFFFF?text=E',
          text: message,
          markdown: true
        }],
        potentialAction: [{
          '@type': 'OpenUri',
          name: 'Apri Sistema',
          targets: [{ os: 'default', uri: window.location.origin }]
        }]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(card)
      });

      if (!response.ok) throw new Error(`Teams webhook error: ${response.status}`);
      
      console.log('✅ Notifica Teams inviata con successo');
      return true;
    } catch (error) {
      console.error('❌ Errore Teams:', error);
      return false;
    }
  }

  // 7. INTEGRAZIONE SLACK
  async sendSlackMessage(webhookUrl: string, channel: string, message: string, username: string = 'Emmanuel Bot'): Promise<boolean> {
    try {
      const payload = {
        channel,
        username,
        icon_emoji: ':hospital:',
        text: message,
        attachments: [{
          color: 'good',
          fields: [{
            title: 'Sistema',
            value: 'Cooperativa Emmanuel',
            short: true
          }, {
            title: 'Timestamp',
            value: new Date().toLocaleString('it-IT'),
            short: true
          }]
        }]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`Slack webhook error: ${response.status}`);
      
      console.log('✅ Messaggio Slack inviato con successo');
      return true;
    } catch (error) {
      console.error('❌ Errore Slack:', error);
      return false;
    }
  }

  // 8. INTEGRAZIONE ZAPIER WEBHOOKS
  async triggerZapierWebhook(webhookUrl: string, data: any): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          source: 'Emmanuel ERP',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error(`Zapier webhook error: ${response.status}`);
      
      console.log('✅ Webhook Zapier attivato con successo');
      return true;
    } catch (error) {
      console.error('❌ Errore Zapier:', error);
      return false;
    }
  }

  // Configurazione automatica integrazioni
  initializeIntegrations(): void {
    // WhatsApp Business API
    this.configureIntegration('whatsapp', {
      name: 'WhatsApp Business',
      apiKey: process.env.REACT_APP_WHATSAPP_TOKEN || '',
      baseUrl: 'https://graph.facebook.com/v18.0/YOUR_PHONE_NUMBER_ID',
      enabled: !!process.env.REACT_APP_WHATSAPP_TOKEN,
      rateLimits: { requestsPerMinute: 80, requestsPerHour: 1000 }
    });

    // Google Calendar
    this.configureIntegration('google_calendar', {
      name: 'Google Calendar',
      apiKey: process.env.REACT_APP_GOOGLE_CALENDAR_TOKEN || '',
      baseUrl: 'https://www.googleapis.com/calendar/v3',
      enabled: !!process.env.REACT_APP_GOOGLE_CALENDAR_TOKEN,
      rateLimits: { requestsPerMinute: 100, requestsPerHour: 10000 }
    });

    // Stripe
    this.configureIntegration('stripe', {
      name: 'Stripe Payments',
      apiKey: process.env.REACT_APP_STRIPE_SECRET_KEY || '',
      baseUrl: 'https://api.stripe.com/v1',
      enabled: !!process.env.REACT_APP_STRIPE_SECRET_KEY,
      rateLimits: { requestsPerMinute: 100, requestsPerHour: 1000 }
    });

    // SendGrid
    this.configureIntegration('sendgrid', {
      name: 'SendGrid Email',
      apiKey: process.env.REACT_APP_SENDGRID_API_KEY || '',
      baseUrl: 'https://api.sendgrid.com/v3',
      enabled: !!process.env.REACT_APP_SENDGRID_API_KEY,
      rateLimits: { requestsPerMinute: 600, requestsPerHour: 10000 }
    });

    // Twilio
    this.configureIntegration('twilio', {
      name: 'Twilio SMS',
      apiKey: process.env.REACT_APP_TWILIO_ACCOUNT_SID || '',
      baseUrl: process.env.REACT_APP_TWILIO_AUTH_TOKEN || '',
      enabled: !!(process.env.REACT_APP_TWILIO_ACCOUNT_SID && process.env.REACT_APP_TWILIO_AUTH_TOKEN),
      rateLimits: { requestsPerMinute: 60, requestsPerHour: 1000 }
    });

    console.log('🔗 Integrazioni esterne inizializzate');
  }

  // Status check integrazioni
  async checkIntegrationsHealth(): Promise<any> {
    const health: any = {};
    
    for (const [name, config] of this.integrations) {
      if (!config.enabled) {
        health[name] = { status: 'disabled', message: 'Integrazione disabilitata' };
        continue;
      }

      try {
        // Test di connettività base
        const response = await fetch(config.baseUrl, { method: 'HEAD' });
        health[name] = {
          status: response.ok ? 'healthy' : 'error',
          message: response.ok ? 'Connessione OK' : `HTTP ${response.status}`,
          lastCheck: new Date().toISOString()
        };
      } catch (error) {
        health[name] = {
          status: 'error',
          message: 'Connessione fallita',
          error: error.message,
          lastCheck: new Date().toISOString()
        };
      }
    }

    return health;
  }
}

// Hook React per integrazioni
export const useExternalIntegrations = () => {
  const manager = ExternalIntegrationsManager.getInstance();
  
  React.useEffect(() => {
    manager.initializeIntegrations();
  }, []);
  
  return {
    sendWhatsApp: manager.sendWhatsAppMessage.bind(manager),
    createCalendarEvent: manager.createGoogleCalendarEvent.bind(manager),
    createPayment: manager.createStripePaymentIntent.bind(manager),
    sendEmail: manager.sendEmail.bind(manager),
    sendSMS: manager.sendSMS.bind(manager),
    sendTeamsNotification: manager.sendTeamsNotification.bind(manager),
    sendSlackMessage: manager.sendSlackMessage.bind(manager),
    triggerZapier: manager.triggerZapierWebhook.bind(manager),
    checkHealth: manager.checkIntegrationsHealth.bind(manager)
  };
};