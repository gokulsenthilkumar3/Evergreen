/**
 * Performance Monitoring Utility
 * Tracks Core Web Vitals and custom metrics
 */

interface PerformanceMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    timestamp: number;
}

class PerformanceMonitor {
    private metrics: PerformanceMetric[] = [];
    private enabled: boolean = true;

    constructor() {
        if (typeof window !== 'undefined') {
            this.initWebVitals();
        }
    }

    /**
     * Initialize Core Web Vitals monitoring
     */
    private initWebVitals() {
        // Largest Contentful Paint (LCP)
        this.observeLCP();

        // First Input Delay (FID)
        this.observeFID();

        // Cumulative Layout Shift (CLS)
        this.observeCLS();

        // First Contentful Paint (FCP)
        this.observeFCP();
    }

    private observeLCP() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;

            this.recordMetric({
                name: 'LCP',
                value: lastEntry.renderTime || lastEntry.loadTime,
                rating: this.getLCPRating(lastEntry.renderTime || lastEntry.loadTime),
                timestamp: Date.now(),
            });
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }

    private observeFID() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                this.recordMetric({
                    name: 'FID',
                    value: entry.processingStart - entry.startTime,
                    rating: this.getFIDRating(entry.processingStart - entry.startTime),
                    timestamp: Date.now(),
                });
            });
        });

        observer.observe({ entryTypes: ['first-input'] });
    }

    private observeCLS() {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            });

            this.recordMetric({
                name: 'CLS',
                value: clsValue,
                rating: this.getCLSRating(clsValue),
                timestamp: Date.now(),
            });
        });

        observer.observe({ entryTypes: ['layout-shift'] });
    }

    private observeFCP() {
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
                this.recordMetric({
                    name: 'FCP',
                    value: entry.startTime,
                    rating: this.getFCPRating(entry.startTime),
                    timestamp: Date.now(),
                });
            });
        });

        observer.observe({ entryTypes: ['paint'] });
    }

    private getLCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
        if (value <= 2500) return 'good';
        if (value <= 4000) return 'needs-improvement';
        return 'poor';
    }

    private getFIDRating(value: number): 'good' | 'needs-improvement' | 'poor' {
        if (value <= 100) return 'good';
        if (value <= 300) return 'needs-improvement';
        return 'poor';
    }

    private getCLSRating(value: number): 'good' | 'needs-improvement' | 'poor' {
        if (value <= 0.1) return 'good';
        if (value <= 0.25) return 'needs-improvement';
        return 'poor';
    }

    private getFCPRating(value: number): 'good' | 'needs-improvement' | 'poor' {
        if (value <= 1800) return 'good';
        if (value <= 3000) return 'needs-improvement';
        return 'poor';
    }

    /**
     * Record a custom metric
     */
    recordMetric(metric: PerformanceMetric) {
        if (!this.enabled) return;

        this.metrics.push(metric);

        // Log to console in development
        if (import.meta.env.DEV) {
            console.log(`[Performance] ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
        }

        // Send to analytics (implement your analytics service here)
        this.sendToAnalytics(metric);
    }

    /**
     * Send metrics to analytics service
     */
    private sendToAnalytics(metric: PerformanceMetric) {
        // Implement your analytics integration here
        // Example: Google Analytics, Sentry, custom endpoint
        if (import.meta.env.PROD) {
            // navigator.sendBeacon('/api/analytics/performance', JSON.stringify(metric));
        }
    }

    /**
     * Get all recorded metrics
     */
    getMetrics(): PerformanceMetric[] {
        return [...this.metrics];
    }

    /**
     * Get metrics by name
     */
    getMetricsByName(name: string): PerformanceMetric[] {
        return this.metrics.filter(m => m.name === name);
    }

    /**
     * Clear all metrics
     */
    clearMetrics() {
        this.metrics = [];
    }

    /**
     * Enable/disable monitoring
     */
    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export for testing
export { PerformanceMonitor };
