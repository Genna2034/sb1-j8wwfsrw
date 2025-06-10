// Servizio API REST per integrazioni esterne
export interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  timeout: number;
  retries: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  headers?: Record<string, string>;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requiresAuth: boolean;
  rateLimit?: number;
}

class ApiService {
  private config: ApiConfig;
  private endpoints: Map<string, ApiEndpoint> = new Map();

  constructor(config: ApiConfig) {
    this.config = config;
    this.initializeEndpoints();
  }

  private initializeEndpoints() {
    // Endpoints per pazienti
    this.endpoints.set('patients.list', {
      method: 'GET',
      path: '/api/patients',
      description: 'Lista tutti i pazienti',
      requiresAuth: true
    });

    this.endpoints.set('patients.create', {
      method: 'POST',
      path: '/api/patients',
      description: 'Crea nuovo paziente',
      requiresAuth: true
    });

    this.endpoints.set('patients.get', {
      method: 'GET',
      path: '/api/patients/:id',
      description: 'Ottieni paziente per ID',
      requiresAuth: true
    });

    this.endpoints.set('patients.update', {
      method: 'PUT',
      path: '/api/patients/:id',
      description: 'Aggiorna paziente',
      requiresAuth: true
    });

    // Endpoints per appuntamenti
    this.endpoints.set('appointments.list', {
      method: 'GET',
      path: '/api/appointments',
      description: 'Lista appuntamenti',
      requiresAuth: true
    });

    this.endpoints.set('appointments.create', {
      method: 'POST',
      path: '/api/appointments',
      description: 'Crea nuovo appuntamento',
      requiresAuth: true
    });

    this.endpoints.set('appointments.update', {
      method: 'PUT',
      path: '/api/appointments/:id',
      description: 'Aggiorna appuntamento',
      requiresAuth: true
    });

    // Endpoints per fatture
    this.endpoints.set('invoices.list', {
      method: 'GET',
      path: '/api/invoices',
      description: 'Lista fatture',
      requiresAuth: true
    });

    this.endpoints.set('invoices.create', {
      method: 'POST',
      path: '/api/invoices',
      description: 'Crea nuova fattura',
      requiresAuth: true
    });

    // Endpoints per sincronizzazione
    this.endpoints.set('sync.export', {
      method: 'POST',
      path: '/api/sync/export',
      description: 'Esporta dati per sincronizzazione',
      requiresAuth: true
    });

    this.endpoints.set('sync.import', {
      method: 'POST',
      path: '/api/sync/import',
      description: 'Importa dati da sincronizzazione',
      requiresAuth: true
    });

    // Endpoints per notifiche
    this.endpoints.set('notifications.send', {
      method: 'POST',
      path: '/api/notifications/send',
      description: 'Invia notifica',
      requiresAuth: true
    });

    // Endpoints per backup
    this.endpoints.set('backup.create', {
      method: 'POST',
      path: '/api/backup',
      description: 'Crea backup',
      requiresAuth: true
    });

    this.endpoints.set('backup.restore', {
      method: 'POST',
      path: '/api/backup/restore',
      description: 'Ripristina backup',
      requiresAuth: true
    });
  }

  async request<T = any>(
    endpointKey: string,
    params?: Record<string, any>,
    data?: any,
    options?: {
      timeout?: number;
      headers?: Record<string, string>;
      pathParams?: Record<string, string>;
    }
  ): Promise<ApiResponse<T>> {
    const endpoint = this.endpoints.get(endpointKey);
    if (!endpoint) {
      return {
        success: false,
        error: `Endpoint ${endpointKey} non trovato`
      };
    }

    try {
      let url = this.config.baseUrl + endpoint.path;
      
      // Sostituisci parametri nel path
      if (options?.pathParams) {
        Object.entries(options.pathParams).forEach(([key, value]) => {
          url = url.replace(`:${key}`, encodeURIComponent(value));
        });
      }

      // Aggiungi query parameters per GET
      if (endpoint.method === 'GET' && params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        if (searchParams.toString()) {
          url += '?' + searchParams.toString();
        }
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...options?.headers
      };

      // Aggiungi autenticazione se richiesta
      if (endpoint.requiresAuth && this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const requestOptions: RequestInit = {
        method: endpoint.method,
        headers,
        signal: AbortSignal.timeout(options?.timeout || this.config.timeout)
      };

      // Aggiungi body per metodi che lo supportano
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && data) {
        requestOptions.body = JSON.stringify(data);
      }

      console.log(`🌐 API Request: ${endpoint.method} ${url}`);

      const response = await this.fetchWithRetry(url, requestOptions);
      
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      if (response.ok) {
        const responseData = await response.json();
        return {
          success: true,
          data: responseData,
          status: response.status,
          headers: responseHeaders
        };
      } else {
        const errorData = await response.text();
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorData}`,
          status: response.status,
          headers: responseHeaders
        };
      }

    } catch (error) {
      console.error(`API Error for ${endpointKey}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      };
    }
  }

  private async fetchWithRetry(url: string, options: RequestInit): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        // Se la risposta è ok o è un errore client (4xx), non ritentare
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }
        
        // Per errori server (5xx), ritenta
        if (attempt < this.config.retries) {
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
          continue;
        }
        
        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Fetch error');
        
        if (attempt < this.config.retries) {
          await this.delay(Math.pow(2, attempt) * 1000);
          continue;
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Metodi di convenienza per operazioni comuni
  async getPatients(filters?: Record<string, any>): Promise<ApiResponse> {
    return this.request('patients.list', filters);
  }

  async createPatient(patientData: any): Promise<ApiResponse> {
    return this.request('patients.create', undefined, patientData);
  }

  async getPatient(id: string): Promise<ApiResponse> {
    return this.request('patients.get', undefined, undefined, {
      pathParams: { id }
    });
  }

  async updatePatient(id: string, patientData: any): Promise<ApiResponse> {
    return this.request('patients.update', undefined, patientData, {
      pathParams: { id }
    });
  }

  async getAppointments(filters?: Record<string, any>): Promise<ApiResponse> {
    return this.request('appointments.list', filters);
  }

  async createAppointment(appointmentData: any): Promise<ApiResponse> {
    return this.request('appointments.create', undefined, appointmentData);
  }

  async updateAppointment(id: string, appointmentData: any): Promise<ApiResponse> {
    return this.request('appointments.update', undefined, appointmentData, {
      pathParams: { id }
    });
  }

  async getInvoices(filters?: Record<string, any>): Promise<ApiResponse> {
    return this.request('invoices.list', filters);
  }

  async createInvoice(invoiceData: any): Promise<ApiResponse> {
    return this.request('invoices.create', undefined, invoiceData);
  }

  async exportData(dataTypes: string[]): Promise<ApiResponse> {
    return this.request('sync.export', undefined, { dataTypes });
  }

  async importData(data: any): Promise<ApiResponse> {
    return this.request('sync.import', undefined, data);
  }

  async sendNotification(notificationData: any): Promise<ApiResponse> {
    return this.request('notifications.send', undefined, notificationData);
  }

  async createBackup(options?: any): Promise<ApiResponse> {
    return this.request('backup.create', undefined, options);
  }

  async restoreBackup(backupData: any): Promise<ApiResponse> {
    return this.request('backup.restore', undefined, backupData);
  }

  // Metodi per gestione configurazione
  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getEndpoints(): Array<{ key: string; endpoint: ApiEndpoint }> {
    return Array.from(this.endpoints.entries()).map(([key, endpoint]) => ({
      key,
      endpoint
    }));
  }

  addEndpoint(key: string, endpoint: ApiEndpoint): void {
    this.endpoints.set(key, endpoint);
  }

  // Test di connettività
  async testConnection(): Promise<{ success: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(this.config.baseUrl + '/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      
      const latency = Date.now() - startTime;
      
      return {
        success: response.ok,
        latency,
        error: response.ok ? undefined : `HTTP ${response.status}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }
}

// Istanza singleton del servizio API
let apiServiceInstance: ApiService | null = null;

export const getApiService = (): ApiService => {
  if (!apiServiceInstance) {
    // Configurazione di default
    const defaultConfig: ApiConfig = {
      baseUrl: 'https://api.emmanuel.local', // Cambia con il tuo endpoint
      timeout: 10000,
      retries: 3,
      headers: {
        'X-Client': 'Emmanuel-Web-App',
        'X-Version': '1.0.0'
      }
    };
    apiServiceInstance = new ApiService(defaultConfig);
  }
  return apiServiceInstance;
};

export const initializeApiService = (config: ApiConfig): ApiService => {
  apiServiceInstance = new ApiService(config);
  return apiServiceInstance;
};

export { ApiService, type ApiConfig, type ApiResponse, type ApiEndpoint };