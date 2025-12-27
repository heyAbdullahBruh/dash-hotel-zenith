
export const initPerformanceMonitoring = () => {
  // Core Web Vitals monitoring
  if ("PerformanceObserver" in window) {
    // LCP (Largest Contentful Paint)
    const lcpObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];

      // Report LCP to analytics
      reportMetric("LCP", lastEntry.startTime);
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });

    // FID (First Input Delay)
    const fidObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        reportMetric("FID", entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ type: "first-input", buffered: true });

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    let clsEntries = [];

    const clsObserver = new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }

      // Report CLS when page becomes hidden
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          reportMetric("CLS", clsValue);
          clsValue = 0;
          clsEntries = [];
        }
      });
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });
  }

  // Custom performance marks
  window.addEventListener("load", () => {
    // Measure page load time
    const navTiming = performance.getEntriesByType("navigation")[0];
    if (navTiming) {
      const loadTime = navTiming.loadEventEnd - navTiming.startTime;
      reportMetric("page_load", loadTime);
    }

    // Measure First Contentful Paint
    const paintTiming = performance.getEntriesByType("paint");
    paintTiming.forEach((paint) => {
      if (paint.name === "first-contentful-paint") {
        reportMetric("FCP", paint.startTime);
      }
    });
  });
};

const reportMetric = (name, value) => {
  // Send to analytics backend
  const data = {
    name,
    value,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
  };

  // Send via Beacon API for reliability
  navigator.sendBeacon("/api/analytics/performance", JSON.stringify(data));

  // Also log to console in development
  if (import.meta.env.DEV) {
    console.log(`Performance Metric - ${name}:`, value);
  }
};

// Resource timing monitoring
export const monitorResourceTiming = () => {
  const resources = performance.getEntriesByType("resource");
  const apiCalls = resources.filter(
    (resource) =>
      resource.initiatorType === "fetch" ||
      resource.initiatorType === "xmlhttprequest"
  );

  apiCalls.forEach((apiCall) => {
    const duration = apiCall.duration;
    if (duration > 1000) {
      // Alert on slow API calls
      console.warn("Slow API call detected:", {
        url: apiCall.name,
        duration: `${duration}ms`,
        timing: {
          redirect: apiCall.redirectEnd - apiCall.redirectStart,
          dns: apiCall.domainLookupEnd - apiCall.domainLookupStart,
          tcp: apiCall.connectEnd - apiCall.connectStart,
          request: apiCall.responseStart - apiCall.requestStart,
          response: apiCall.responseEnd - apiCall.responseStart,
        },
      });
    }
  });
};
