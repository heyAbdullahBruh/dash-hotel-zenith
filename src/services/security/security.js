// src/services/security/security.js
export const SecurityService = {
  // XSS Protection
  sanitizeInput: (input) => {
    if (typeof input !== "string") return input;

    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;");
  },

  // Input validation
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePhone: (phone) => {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)\.]/g, ""));
  },

  validatePassword: (password) => {
    // Minimum 8 characters, at least one uppercase, one lowercase, one number
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return re.test(password);
  },

  // CSRF Protection
  generateCSRFToken: () => {
    const token = crypto.randomUUID();
    localStorage.setItem("csrf_token", token);
    return token;
  },

  validateCSRFToken: (token) => {
    const storedToken = localStorage.getItem("csrf_token");
    return token === storedToken;
  },

  // Rate limiting simulation
  rateLimitCheck: (() => {
    const requests = new Map();

    return (key, limit = 10, windowMs = 60000) => {
      const now = Date.now();
      const windowStart = now - windowMs;

      if (!requests.has(key)) {
        requests.set(key, []);
      }

      const timestamps = requests.get(key);
      // Remove old timestamps
      while (timestamps.length > 0 && timestamps[0] <= windowStart) {
        timestamps.shift();
      }

      // Check if limit exceeded
      if (timestamps.length >= limit) {
        return false;
      }

      timestamps.push(now);
      return true;
    };
  })(),

  // Content Security Policy nonce
  generateNonce: () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  },

  // Secure headers for API calls
  getSecureHeaders: () => {
    const nonce = SecurityService.generateNonce();

    return {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      "Content-Security-Policy": `default-src 'self'; script-src 'self' 'nonce-${nonce}';`,
      "X-CSRF-Token": SecurityService.generateCSRFToken(),
      "X-Request-ID": crypto.randomUUID(),
    };
  },

  // Session security
  validateSession: (session) => {
    if (!session || !session.expires) return false;

    const now = Date.now();
    const expires = new Date(session.expires).getTime();

    if (now > expires) {
      // Session expired
      localStorage.removeItem("session");
      return false;
    }

    // Check for suspicious activity
    if (session.ipAddress && session.userAgent) {
      const currentIp = ""; // Get from API
      const currentUserAgent = navigator.userAgent;

      if (
        session.ipAddress !== currentIp ||
        session.userAgent !== currentUserAgent
      ) {
        console.warn("Session anomaly detected");
        return false;
      }
    }

    return true;
  },

  // Data encryption for sensitive data
  encryptData: async (data, key) => {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(key),
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encodedData
    );

    return {
      iv: Array.from(iv)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
      data: Array.from(new Uint8Array(encrypted))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""),
    };
  },

  // Audit logging
  logSecurityEvent: async (event, severity = "info") => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: localStorage.getItem("userId"),
    };

    try {
      await fetch("/api/security/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      console.error("Failed to log security event:", error);
    }
  },
};
