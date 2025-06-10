// Servizio Performance e Ottimizzazioni
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  cacheHitRatio: number;
  errorRate: number;
  userInteractions: number;
}

export interface PerformanceConfig {
  enableMetrics: boolean;
  enableCaching: boolean;
  cacheSize: number; // MB
  enableCompression: boolean;
  enableLazyLoading: boolean;
  enableServiceWorker: boolean;
  metricsInterval: number; // seconds
}

class PerformanceService {
  private config: PerformanceConfig;
  private metrics: PerformanceMetrics;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private observers: PerformanceObserver[] = [];
  private metricsHistory: PerformanceMetrics[] = [];

  constructor(config: PerformanceConfig) {
    this.config = config;
    this.metrics = this.initializeMetrics();
    this.initializePerformanceMonitoring();
    this.initializeCache();
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      networkRequests: 0,
      cacheHitRatio: 0,
      errorRate: 0,
      userInteractions: 0
    };
  }

  private initializePerformanceMonitoring() {
    if (!this.config.enableMetrics) return;

    // Monitor navigation timing
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.metrics.loadTime = navEntry.loadEventEnd - navEntry.navigationStart;
          }
        });
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);

      // Monitor resource timing
      const resourceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.metrics.networkRequests += entries.length;
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Monitor paint timing
      const paintObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.renderTime = entry.startTime;
          }
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);
    }

    // Monitor memory usage
    this.startMemoryMonitoring();

    // Collect metrics periodically
    setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsInterval * 1000);
  }

  private startMemoryMonitoring() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.metrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }, 5000);
    }
  }

  private initializeCache() {
    if (!this.config.enableCaching) return;

    // Cleanup expired cache entries periodically
    setInterval(() => {
      this.cleanupCache();
    }, 60000); // Every minute
  }

  // Cache Management
  setCache(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    if (!this.config.enableCaching) return;

    const maxSize = this.config.cacheSize * 1024 * 1024; // Convert MB to bytes
    const currentSize = this.getCacheSize();

    if (currentSize > maxSize) {
      this.evictOldestEntries();
    }

    this.cache.set(key, {
      data: this.config.enableCompression ? this.compressData(data) : data,
      timestamp: Date.now(),
      ttl
    });
  }

  getCache(key: string): any | null {
    if (!this.config.enableCaching) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update cache hit ratio
    this.updateCacheHitRatio(true);

    return this.config.enableCompression ? this.decompressData(entry.data) : entry.data;
  }

  clearCache(): void {
    this.cache.clear();
  }

  private getCacheSize(): number {
    let size = 0;
    this.cache.forEach((entry) => {
      size += JSON.stringify(entry.data).length;
    });
    return size;
  }

  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    });

    toDelete.forEach(key => this.cache.delete(key));
  }

  private updateCacheHitRatio(hit: boolean): void {
    // Simple moving average for cache hit ratio
    const currentRatio = this.metrics.cacheHitRatio;
    this.metrics.cacheHitRatio = (currentRatio * 0.9) + (hit ? 0.1 : 0);
  }

  private compressData(data: any): string {
    // Simple compression (in production use a proper compression library)
    return JSON.stringify(data);
  }

  private decompressData(data: string): any {
    return JSON.parse(data);
  }

  // Performance Optimization Methods
  optimizeImages(): void {
    if (!this.config.enableLazyLoading) return;

    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }

  preloadCriticalResources(resources: string[]): void {
    resources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.match(/\.(jpg|jpeg|png|webp)$/)) {
        link.as = 'image';
      }
      
      document.head.appendChild(link);
    });
  }

  enableServiceWorker(): void {
    if (!this.config.enableServiceWorker || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrato:', registration);
      })
      .catch((error) => {
        console.error('❌ Errore Service Worker:', error);
      });
  }

  // Database Optimization
  optimizeLocalStorage(): void {
    const keys = Object.keys(localStorage);
    const optimizations: string[] = [];

    keys.forEach((key) => {
      if (key.startsWith('emmanuel_')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            
            // Remove empty arrays and objects
            const cleaned = this.removeEmptyValues(parsed);
            
            // Compress if significantly different
            const cleanedStr = JSON.stringify(cleaned);
            if (cleanedStr.length < data.length * 0.9) {
              localStorage.setItem(key, cleanedStr);
              optimizations.push(`${key}: ${data.length} -> ${cleanedStr.length} bytes`);
            }
          } catch (error) {
            // Skip invalid JSON
          }
        }
      }
    });

    if (optimizations.length > 0) {
      console.log('🔧 LocalStorage ottimizzato:', optimizations);
    }
  }

  private removeEmptyValues(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.filter(item => item != null).map(item => this.removeEmptyValues(item));
    }
    
    if (obj && typeof obj === 'object') {
      const cleaned: any = {};
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        if (value != null && value !== '' && !(Array.isArray(value) && value.length === 0)) {
          cleaned[key] = this.removeEmptyValues(value);
        }
      });
      return cleaned;
    }
    
    return obj;
  }

  // Metrics Collection
  private collectMetrics(): void {
    // Update user interactions
    this.metrics.userInteractions = this.getUserInteractionCount();

    // Calculate error rate
    this.metrics.errorRate = this.getErrorRate();

    // Store metrics history
    this.metricsHistory.push({ ...this.metrics });
    
    // Keep only last 100 entries
    if (this.metricsHistory.length > 100) {
      this.metricsHistory.shift();
    }
  }

  private getUserInteractionCount(): number {
    // This would be tracked by event listeners in a real implementation
    return Math.floor(Math.random() * 100); // Mock data
  }

  private getErrorRate(): number {
    // This would be calculated from actual error tracking
    return Math.random() * 0.05; // Mock 0-5% error rate
  }

  // Public API
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  getCacheStats(): {
    size: number;
    entries: number;
    hitRatio: number;
    maxSize: number;
  } {
    return {
      size: this.getCacheSize(),
      entries: this.cache.size,
      hitRatio: this.metrics.cacheHitRatio,
      maxSize: this.config.cacheSize * 1024 * 1024
    };
  }

  optimizeApp(): {
    optimizations: string[];
    beforeMetrics: PerformanceMetrics;
    afterMetrics: PerformanceMetrics;
  } {
    const beforeMetrics = { ...this.metrics };
    const optimizations: string[] = [];

    // Optimize localStorage
    this.optimizeLocalStorage();
    optimizations.push('LocalStorage ottimizzato');

    // Optimize images
    this.optimizeImages();
    optimizations.push('Lazy loading immagini abilitato');

    // Clean cache
    this.cleanupCache();
    optimizations.push('Cache pulita');

    // Enable service worker
    this.enableServiceWorker();
    optimizations.push('Service Worker abilitato');

    const afterMetrics = { ...this.metrics };

    return {
      optimizations,
      beforeMetrics,
      afterMetrics
    };
  }

  generatePerformanceReport(): {
    summary: string;
    metrics: PerformanceMetrics;
    recommendations: string[];
    cacheStats: any;
  } {
    const recommendations: string[] = [];

    if (this.metrics.loadTime > 3000) {
      recommendations.push('Tempo di caricamento elevato - considera l\'ottimizzazione delle risorse');
    }

    if (this.metrics.memoryUsage > 100) {
      recommendations.push('Uso memoria elevato - verifica memory leaks');
    }

    if (this.metrics.cacheHitRatio < 0.7) {
      recommendations.push('Cache hit ratio basso - ottimizza strategia di caching');
    }

    if (this.metrics.errorRate > 0.02) {
      recommendations.push('Tasso di errore elevato - verifica stabilità applicazione');
    }

    let summary = 'Prestazioni ';
    if (this.metrics.loadTime < 2000 && this.metrics.memoryUsage < 50) {
      summary += 'eccellenti';
    } else if (this.metrics.loadTime < 3000 && this.metrics.memoryUsage < 100) {
      summary += 'buone';
    } else {
      summary += 'da migliorare';
    }

    return {
      summary,
      metrics: this.getMetrics(),
      recommendations,
      cacheStats: this.getCacheStats()
    };
  }

  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.enableMetrics !== undefined) {
      if (newConfig.enableMetrics) {
        this.initializePerformanceMonitoring();
      } else {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
      }
    }
  }

  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.clearCache();
  }
}

// Istanza singleton del servizio performance
let performanceServiceInstance: PerformanceService | null = null;

export const getPerformanceService = (): PerformanceService => {
  if (!performanceServiceInstance) {
    const defaultConfig: PerformanceConfig = {
      enableMetrics: true,
      enableCaching: true,
      cacheSize: 50, // 50MB
      enableCompression: true,
      enableLazyLoading: true,
      enableServiceWorker: true,
      metricsInterval: 30 // 30 seconds
    };
    performanceServiceInstance = new PerformanceService(defaultConfig);
  }
  return performanceServiceInstance;
};

export const initializePerformanceService = (config: PerformanceConfig): PerformanceService => {
  performanceServiceInstance = new PerformanceService(config);
  return performanceServiceInstance;
};

export { PerformanceService, type PerformanceConfig, type PerformanceMetrics };