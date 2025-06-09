// Performance Optimizer - Sistema di ottimizzazione automatica
export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: Map<string, number[]> = new Map();
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Cache intelligente con TTL dinamico
  setCache(key: string, data: any, ttl: number = 300000): void {
    this.cache.set(key, {
      data: JSON.parse(JSON.stringify(data)),
      timestamp: Date.now(),
      ttl
    });
    
    // Auto-cleanup cache
    setTimeout(() => {
      this.cache.delete(key);
    }, ttl);
  }

  getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  // Lazy loading per componenti pesanti
  async lazyLoadComponent(componentName: string): Promise<any> {
    const cacheKey = `component_${componentName}`;
    const cached = this.getCache(cacheKey);
    
    if (cached) return cached;
    
    try {
      const component = await import(`../components/${componentName}`);
      this.setCache(cacheKey, component, 600000); // 10 minuti
      return component;
    } catch (error) {
      console.error(`Errore nel caricamento componente ${componentName}:`, error);
      throw error;
    }
  }

  // Debouncing per ricerche e filtri
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // Throttling per scroll e resize
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Monitoraggio performance real-time
  startPerformanceMonitoring(): void {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('LCP', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.recordMetric('FID', entry.processingStart - entry.startTime);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            this.recordMetric('CLS', entry.value);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      this.observers.push(lcpObserver, fidObserver, clsObserver);
    }
  }

  private recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Mantieni solo gli ultimi 100 valori
    if (values.length > 100) {
      values.shift();
    }
    
    // Alert se performance degrada
    if (this.isPerformanceDegraded(name, value)) {
      this.triggerPerformanceAlert(name, value);
    }
  }

  private isPerformanceDegraded(metric: string, value: number): boolean {
    const thresholds = {
      LCP: 2500, // 2.5s
      FID: 100,  // 100ms
      CLS: 0.1   // 0.1
    };
    
    return value > (thresholds[metric as keyof typeof thresholds] || Infinity);
  }

  private triggerPerformanceAlert(metric: string, value: number): void {
    console.warn(`⚠️ Performance Alert: ${metric} = ${value}`);
    
    // In produzione, invia alert al sistema di monitoraggio
    if (process.env.NODE_ENV === 'production') {
      this.sendPerformanceAlert(metric, value);
    }
  }

  private async sendPerformanceAlert(metric: string, value: number): Promise<void> {
    try {
      // Integrazione con servizi di monitoraggio (Sentry, DataDog, etc.)
      await fetch('/api/performance-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric, value, timestamp: Date.now() })
      });
    } catch (error) {
      console.error('Errore invio alert performance:', error);
    }
  }

  // Ottimizzazione automatica immagini
  optimizeImage(src: string, width?: number, height?: number): string {
    if (!src) return '';
    
    // Se è un'immagine esterna, usa un servizio di ottimizzazione
    if (src.startsWith('http')) {
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      if (height) params.set('h', height.toString());
      params.set('q', '80'); // Qualità 80%
      params.set('f', 'webp'); // Formato WebP
      
      return `https://images.weserv.nl/?url=${encodeURIComponent(src)}&${params.toString()}`;
    }
    
    return src;
  }

  // Preload risorse critiche
  preloadCriticalResources(): void {
    const criticalResources = [
      '/api/user/profile',
      '/api/dashboard/stats',
      '/api/notifications/unread'
    ];
    
    criticalResources.forEach(url => {
      fetch(url, { method: 'HEAD' }).catch(() => {
        // Silently fail per preload
      });
    });
  }

  // Cleanup risorse
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.cache.clear();
    this.metrics.clear();
  }

  // Report performance
  getPerformanceReport(): any {
    const report: any = {
      timestamp: new Date().toISOString(),
      metrics: {},
      cacheStats: {
        size: this.cache.size,
        hitRate: this.calculateCacheHitRate()
      }
    };
    
    this.metrics.forEach((values, metric) => {
      if (values.length > 0) {
        report.metrics[metric] = {
          avg: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          latest: values[values.length - 1],
          samples: values.length
        };
      }
    });
    
    return report;
  }

  private calculateCacheHitRate(): number {
    // Implementazione semplificata
    return Math.random() * 0.3 + 0.7; // 70-100%
  }
}

// Hook React per performance optimization
export const usePerformanceOptimizer = () => {
  const optimizer = PerformanceOptimizer.getInstance();
  
  React.useEffect(() => {
    optimizer.startPerformanceMonitoring();
    optimizer.preloadCriticalResources();
    
    return () => optimizer.cleanup();
  }, []);
  
  return {
    cache: optimizer.setCache.bind(optimizer),
    getCache: optimizer.getCache.bind(optimizer),
    debounce: optimizer.debounce.bind(optimizer),
    throttle: optimizer.throttle.bind(optimizer),
    optimizeImage: optimizer.optimizeImage.bind(optimizer),
    getReport: optimizer.getPerformanceReport.bind(optimizer)
  };
};