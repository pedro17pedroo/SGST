// Sistema UX Hiper-Rápida - Otimização de Performance < 200ms
import { QueryClient } from "@tanstack/react-query";

export class PerformanceOptimizer {
  private static cache = new Map<string, any>();
  private static preloadedData = new Map<string, Promise<any>>();
  private static lastRequestTimes = new Map<string, number>();
  private static readonly CACHE_TTL = 5000; // 5 seconds
  private static readonly PRELOAD_THRESHOLD = 100; // ms

  // Intelligent Prefetching
  static prefetchCriticalData(queryClient: QueryClient) {
    const criticalQueries = [
      '/api/dashboard/stats',
      '/api/inventory/summary',
      '/api/warehouses',
      '/api/products?limit=50',
      '/api/orders/recent'
    ];

    criticalQueries.forEach(query => {
      queryClient.prefetchQuery({
        queryKey: [query],
        staleTime: 30000, // 30 seconds
        gcTime: 60000 // 1 minute
      });
    });
  }

  // Smart Caching with Immediate Response
  static async optimizedFetch<T>(url: string, fallbackData?: T): Promise<T> {
    const now = Date.now();
    const cacheKey = url;
    
    // Return cached data immediately if available and fresh
    const cached = this.cache.get(cacheKey);
    if (cached && (now - cached.timestamp) < this.CACHE_TTL) {
      return cached.data;
    }

    // Return fallback data immediately while fetching in background
    if (fallbackData) {
      this.backgroundFetch(url);
      return fallbackData;
    }

    // Fast fetch with timeout
    try {
      const response = await Promise.race([
        fetch(url),
        this.timeoutPromise(150) // 150ms timeout
      ]);

      if (response instanceof Response) {
        const data = await response.json();
        this.cache.set(cacheKey, { data, timestamp: now });
        return data;
      } else {
        throw new Error('Request timeout');
      }
    } catch (error) {
      // Return stale cache if available
      if (cached) {
        return cached.data;
      }
      throw error;
    }
  }

  // Background fetch to update cache
  private static backgroundFetch(url: string) {
    if (this.preloadedData.has(url)) return;

    const fetchPromise = fetch(url)
      .then(res => res.json())
      .then(data => {
        this.cache.set(url, { data, timestamp: Date.now() });
        this.preloadedData.delete(url);
      })
      .catch(() => {
        this.preloadedData.delete(url);
      });

    this.preloadedData.set(url, fetchPromise);
  }

  // Timeout helper
  private static timeoutPromise(ms: number): Promise<never> {
    return new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), ms);
    });
  }

  // Predictive Loading based on user behavior
  static initPredictiveLoading(queryClient: QueryClient) {
    let lastPath = '';
    let pathSequence: string[] = [];

    const observer = new MutationObserver(() => {
      const currentPath = window.location.pathname;
      if (currentPath !== lastPath) {
        pathSequence.push(currentPath);
        if (pathSequence.length > 5) {
          pathSequence = pathSequence.slice(-5);
        }

        // Predict next likely page based on patterns
        const predictions = this.predictNextPages(pathSequence);
        predictions.forEach(path => {
          this.preloadPageData(path, queryClient);
        });

        lastPath = currentPath;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Predict next pages based on common navigation patterns
  private static predictNextPages(sequence: string[]): string[] {
    const patterns = {
      '/dashboard': ['/products', '/inventory', '/orders'],
      '/products': ['/inventory', '/product-locations', '/suppliers'],
      '/inventory': ['/products', '/warehouses', '/inventory-counts'],
      '/orders': ['/shipping', '/picking-packing', '/products'],
      '/warehouses': ['/inventory', '/digital-twin', '/product-locations'],
      '/shipping': ['/orders', '/public-tracking', '/green-eta'],
      '/reports': ['/advanced-analytics', '/dashboard'],
      '/digital-twin': ['/warehouses', '/rtls', '/green-eta'],
      '/green-eta': ['/shipping', '/reports', '/digital-twin']
    };

    const currentPath = sequence[sequence.length - 1];
    return patterns[currentPath as keyof typeof patterns] || [];
  }

  // Preload data for predicted pages
  private static preloadPageData(path: string, queryClient: QueryClient) {
    const preloadQueries = {
      '/products': ['/api/products?limit=20', '/api/categories', '/api/suppliers'],
      '/inventory': ['/api/inventory/summary', '/api/warehouses', '/api/stock-alerts'],
      '/orders': ['/api/orders/recent', '/api/orders/pending'],
      '/shipping': ['/api/shipments/active', '/api/carriers'],
      '/warehouses': ['/api/warehouses', '/api/warehouse-zones'],
      '/reports': ['/api/reports/summary'],
      '/digital-twin': ['/api/digital-twin/viewer', '/api/warehouses'],
      '/green-eta': ['/api/green-eta/reports/sustainability']
    };

    const queries = preloadQueries[path as keyof typeof preloadQueries];
    if (queries) {
      queries.forEach(query => {
        queryClient.prefetchQuery({
          queryKey: [query],
          staleTime: 10000
        });
      });
    }
  }

  // Optimize images and assets
  static optimizeAssets() {
    // Preload critical images
    const criticalImages = [
      '/assets/logo.svg',
      '/assets/dashboard-bg.jpg'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  // Memory management
  static cleanupCache() {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes

    Array.from(this.cache.entries()).forEach(([key, value]) => {
      if (now - value.timestamp > maxAge) {
        this.cache.delete(key);
      }
    });
  }

  // Performance monitoring
  static monitorPerformance() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const totalTime = navEntry.loadEventEnd - navEntry.fetchStart;
          
          console.log(`🚀 Page Load Performance: ${totalTime.toFixed(2)}ms`);
          
          if (totalTime > 2000) {
            console.warn('⚠️ Slow page load detected, optimizing...');
            this.performEmergencyOptimization();
          }
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
  }

  // Emergency optimizations for slow performance
  private static performEmergencyOptimization() {
    // Clear non-essential cache
    this.cache.clear();
    
    // Disable animations temporarily
    document.body.style.setProperty('--animation-duration', '0s');
    
    // Restore after 5 seconds
    setTimeout(() => {
      document.body.style.removeProperty('--animation-duration');
    }, 5000);
  }

  // Initialize all optimizations
  static initialize(queryClient: QueryClient) {
    this.prefetchCriticalData(queryClient);
    this.initPredictiveLoading(queryClient);
    this.optimizeAssets();
    this.monitorPerformance();
    
    // Cleanup cache every 2 minutes
    setInterval(() => this.cleanupCache(), 120000);
    
    console.log('🚀 UX Hiper-Rápida iniciada - Latência alvo < 200ms');
  }

  // Get performance metrics
  static getMetrics() {
    return {
      cacheSize: this.cache.size,
      preloadedRequests: this.preloadedData.size,
      lastCleanup: Date.now(),
      status: 'active'
    };
  }
}