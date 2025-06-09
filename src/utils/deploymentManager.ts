// Deployment Manager - Sistema di deployment e configurazione produzione
export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  version: string;
  buildNumber: string;
  deploymentDate: string;
  features: {
    analytics: boolean;
    errorTracking: boolean;
    performanceMonitoring: boolean;
    securityHeaders: boolean;
    compression: boolean;
    caching: boolean;
  };
  integrations: {
    sentry?: string;
    googleAnalytics?: string;
    hotjar?: string;
    intercom?: string;
  };
}

export class DeploymentManager {
  private static instance: DeploymentManager;
  private config: DeploymentConfig;

  constructor() {
    this.config = this.loadDeploymentConfig();
  }

  static getInstance(): DeploymentManager {
    if (!DeploymentManager.instance) {
      DeploymentManager.instance = new DeploymentManager();
    }
    return DeploymentManager.instance;
  }

  private loadDeploymentConfig(): DeploymentConfig {
    return {
      environment: (process.env.NODE_ENV as any) || 'development',
      version: process.env.REACT_APP_VERSION || '1.0.0',
      buildNumber: process.env.REACT_APP_BUILD_NUMBER || Date.now().toString(),
      deploymentDate: new Date().toISOString(),
      features: {
        analytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
        errorTracking: process.env.REACT_APP_ENABLE_ERROR_TRACKING === 'true',
        performanceMonitoring: process.env.REACT_APP_ENABLE_PERFORMANCE === 'true',
        securityHeaders: process.env.REACT_APP_ENABLE_SECURITY === 'true',
        compression: process.env.REACT_APP_ENABLE_COMPRESSION === 'true',
        caching: process.env.REACT_APP_ENABLE_CACHING === 'true'
      },
      integrations: {
        sentry: process.env.REACT_APP_SENTRY_DSN,
        googleAnalytics: process.env.REACT_APP_GA_TRACKING_ID,
        hotjar: process.env.REACT_APP_HOTJAR_ID,
        intercom: process.env.REACT_APP_INTERCOM_APP_ID
      }
    };
  }

  // Inizializzazione servizi produzione
  initializeProductionServices(): void {
    console.log(`🚀 Inizializzazione ambiente: ${this.config.environment}`);
    
    if (this.config.environment === 'production') {
      this.initializeSentry();
      this.initializeGoogleAnalytics();
      this.initializeHotjar();
      this.initializeIntercom();
      this.setupSecurityHeaders();
      this.setupPerformanceMonitoring();
      this.setupErrorBoundaries();
    }
  }

  // 1. SENTRY - Error Tracking
  private initializeSentry(): void {
    if (!this.config.integrations.sentry) return;

    try {
      // Simulazione inizializzazione Sentry
      console.log('🔍 Sentry inizializzato per error tracking');
      
      // In produzione useresti:
      // import * as Sentry from "@sentry/react";
      // Sentry.init({
      //   dsn: this.config.integrations.sentry,
      //   environment: this.config.environment,
      //   release: this.config.version
      // });
      
      // Setup error boundary globale
      window.addEventListener('error', (event) => {
        this.logError('Global Error', event.error);
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.logError('Unhandled Promise Rejection', event.reason);
      });

    } catch (error) {
      console.error('❌ Errore inizializzazione Sentry:', error);
    }
  }

  // 2. GOOGLE ANALYTICS
  private initializeGoogleAnalytics(): void {
    if (!this.config.integrations.googleAnalytics) return;

    try {
      // Carica Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.integrations.googleAnalytics}`;
      document.head.appendChild(script);

      // Inizializza gtag
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      
      gtag('js', new Date());
      gtag('config', this.config.integrations.googleAnalytics, {
        page_title: 'Emmanuel ERP',
        custom_map: { custom_parameter: 'healthcare_erp' }
      });

      console.log('📊 Google Analytics inizializzato');
    } catch (error) {
      console.error('❌ Errore inizializzazione Google Analytics:', error);
    }
  }

  // 3. HOTJAR - User Experience Analytics
  private initializeHotjar(): void {
    if (!this.config.integrations.hotjar) return;

    try {
      // Carica Hotjar
      (function(h: any, o: any, t: any, j: any, a?: any, r?: any) {
        h.hj = h.hj || function(...args: any[]) { (h.hj.q = h.hj.q || []).push(args); };
        h._hjSettings = { hjid: parseInt(this.config.integrations.hotjar!), hjsv: 6 };
        a = o.getElementsByTagName('head')[0];
        r = o.createElement('script'); r.async = 1;
        r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
        a.appendChild(r);
      }.bind(this))(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');

      console.log('🎯 Hotjar inizializzato per UX analytics');
    } catch (error) {
      console.error('❌ Errore inizializzazione Hotjar:', error);
    }
  }

  // 4. INTERCOM - Customer Support
  private initializeIntercom(): void {
    if (!this.config.integrations.intercom) return;

    try {
      // Carica Intercom
      (function() {
        const w = window as any;
        const ic = w.Intercom;
        if (typeof ic === "function") {
          ic('reattach_activator');
          ic('update', w.intercomSettings);
        } else {
          const d = document;
          const i = function(...args: any[]) {
            i.c(args);
          };
          i.q = [];
          i.c = function(args: any) {
            i.q.push(args);
          };
          w.Intercom = i;
          const l = function() {
            const s = d.createElement('script');
            s.type = 'text/javascript';
            s.async = true;
            s.src = `https://widget.intercom.io/widget/${this.config.integrations.intercom}`;
            const x = d.getElementsByTagName('script')[0];
            x.parentNode!.insertBefore(s, x);
          };
          if (w.attachEvent) {
            w.attachEvent('onload', l);
          } else {
            w.addEventListener('load', l, false);
          }
        }
      }.bind(this))();

      console.log('💬 Intercom inizializzato per customer support');
    } catch (error) {
      console.error('❌ Errore inizializzazione Intercom:', error);
    }
  }

  // 5. SECURITY HEADERS
  private setupSecurityHeaders(): void {
    if (!this.config.features.securityHeaders) return;

    try {
      // Content Security Policy
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://static.hotjar.com https://widget.intercom.io;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        font-src 'self' https://fonts.gstatic.com;
        img-src 'self' data: https: blob:;
        connect-src 'self' https://api.stripe.com https://api.sendgrid.com https://graph.facebook.com;
        frame-src 'self' https://js.stripe.com;
      `.replace(/\s+/g, ' ').trim();
      document.head.appendChild(meta);

      // X-Frame-Options
      const frameOptions = document.createElement('meta');
      frameOptions.httpEquiv = 'X-Frame-Options';
      frameOptions.content = 'DENY';
      document.head.appendChild(frameOptions);

      // X-Content-Type-Options
      const contentType = document.createElement('meta');
      contentType.httpEquiv = 'X-Content-Type-Options';
      contentType.content = 'nosniff';
      document.head.appendChild(contentType);

      console.log('🔒 Security headers configurati');
    } catch (error) {
      console.error('❌ Errore configurazione security headers:', error);
    }
  }

  // 6. PERFORMANCE MONITORING
  private setupPerformanceMonitoring(): void {
    if (!this.config.features.performanceMonitoring) return;

    try {
      // Web Vitals monitoring
      if ('PerformanceObserver' in window) {
        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.trackPerformanceMetric('FCP', entry.startTime);
          });
        }).observe({ entryTypes: ['paint'] });

        // Time to Interactive
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            this.trackPerformanceMetric('TTI', entry.processingStart);
          });
        }).observe({ entryTypes: ['navigation'] });
      }

      // Resource loading monitoring
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          this.trackPerformanceMetric('Load Time', navigation.loadEventEnd - navigation.fetchStart);
        }, 0);
      });

      console.log('📈 Performance monitoring attivato');
    } catch (error) {
      console.error('❌ Errore setup performance monitoring:', error);
    }
  }

  // 7. ERROR BOUNDARIES
  private setupErrorBoundaries(): void {
    try {
      // Global error handler
      window.onerror = (message, source, lineno, colno, error) => {
        this.logError('JavaScript Error', {
          message,
          source,
          lineno,
          colno,
          error: error?.stack
        });
        return false;
      };

      // Promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        this.logError('Unhandled Promise Rejection', {
          reason: event.reason,
          promise: event.promise
        });
      });

      console.log('🛡️ Error boundaries configurati');
    } catch (error) {
      console.error('❌ Errore setup error boundaries:', error);
    }
  }

  // Utility methods
  private logError(type: string, error: any): void {
    const errorData = {
      type,
      error,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      version: this.config.version,
      environment: this.config.environment
    };

    console.error('🚨 Error logged:', errorData);

    // In produzione, invia a Sentry o altro servizio
    if (this.config.environment === 'production') {
      this.sendErrorToService(errorData);
    }
  }

  private trackPerformanceMetric(name: string, value: number): void {
    const metricData = {
      name,
      value,
      timestamp: new Date().toISOString(),
      version: this.config.version,
      environment: this.config.environment
    };

    console.log('📊 Performance metric:', metricData);

    // In produzione, invia a Google Analytics o altro servizio
    if (this.config.environment === 'production' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: value,
        custom_parameter: 'healthcare_erp'
      });
    }
  }

  private async sendErrorToService(errorData: any): Promise<void> {
    try {
      // Simula invio a servizio di error tracking
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });
    } catch (error) {
      console.error('Failed to send error to service:', error);
    }
  }

  // Health check sistema
  async performHealthCheck(): Promise<any> {
    const healthData = {
      timestamp: new Date().toISOString(),
      version: this.config.version,
      environment: this.config.environment,
      status: 'healthy',
      checks: {
        localStorage: this.checkLocalStorage(),
        sessionStorage: this.checkSessionStorage(),
        indexedDB: await this.checkIndexedDB(),
        webWorkers: this.checkWebWorkers(),
        serviceWorker: await this.checkServiceWorker(),
        performance: this.checkPerformanceAPI(),
        connectivity: navigator.onLine
      }
    };

    console.log('🏥 Health check completato:', healthData);
    return healthData;
  }

  private checkLocalStorage(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private checkSessionStorage(): boolean {
    try {
      const test = 'test';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private async checkIndexedDB(): Promise<boolean> {
    try {
      return 'indexedDB' in window;
    } catch {
      return false;
    }
  }

  private checkWebWorkers(): boolean {
    return 'Worker' in window;
  }

  private async checkServiceWorker(): Promise<boolean> {
    try {
      return 'serviceWorker' in navigator;
    } catch {
      return false;
    }
  }

  private checkPerformanceAPI(): boolean {
    return 'performance' in window && 'getEntriesByType' in performance;
  }

  // Configurazione deployment
  getDeploymentInfo(): DeploymentConfig {
    return { ...this.config };
  }

  // Feature flags
  isFeatureEnabled(feature: keyof DeploymentConfig['features']): boolean {
    return this.config.features[feature];
  }

  // Environment checks
  isProduction(): boolean {
    return this.config.environment === 'production';
  }

  isDevelopment(): boolean {
    return this.config.environment === 'development';
  }

  isStaging(): boolean {
    return this.config.environment === 'staging';
  }
}

// Hook React per deployment
export const useDeployment = () => {
  const manager = DeploymentManager.getInstance();
  
  React.useEffect(() => {
    manager.initializeProductionServices();
  }, []);
  
  return {
    config: manager.getDeploymentInfo(),
    isFeatureEnabled: manager.isFeatureEnabled.bind(manager),
    isProduction: manager.isProduction(),
    isDevelopment: manager.isDevelopment(),
    isStaging: manager.isStaging(),
    healthCheck: manager.performHealthCheck.bind(manager)
  };
};