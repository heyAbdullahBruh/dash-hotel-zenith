// src/services/monitoring/sentry.js
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export const initSentry = () => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 0.1,
      environment: import.meta.env.VITE_NODE_ENV,
      release: `hotelzenith-dashboard@${import.meta.env.VITE_APP_VERSION}`,
      beforeSend(event) {
        // Filter out certain errors
        if (event.exception?.values?.[0]?.value?.includes("ResizeObserver")) {
          return null;
        }
        return event;
      },
    });
  }
};

// Custom error boundary component
export const ErrorBoundary = Sentry.ErrorBoundary;

// Error reporting utility
export const reportError = (error, context = {}) => {
  console.error("Application Error:", error, context);

  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
  }

  // Also log to your backend
  logToBackend(error, context);
};

const logToBackend = async (error, context) => {
  try {
    await fetch("/api/logs/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        context,
      }),
    });
  } catch (e) {
    console.error("Failed to log error to backend:", e);
  }
};
