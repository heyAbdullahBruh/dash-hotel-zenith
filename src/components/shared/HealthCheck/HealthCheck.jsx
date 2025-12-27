// src/components/shared/HealthCheck/HealthCheck.jsx
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeartbeat,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faServer,
  faDatabase,
  faNetworkWired,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./HealthCheck.module.css";

const HealthCheck = () => {
  const [healthStatus, setHealthStatus] = useState({
    api: "checking",
    database: "checking",
    websocket: "checking",
    storage: "checking",
    overall: "checking",
  });
  const [uptime, setUptime] = useState(0);
  const [responseTimes, setResponseTimes] = useState({});

  const checkAPI = async () => {
    const start = Date.now();
    const response = await fetch("/api/health");
    const end = Date.now();

    if (!response.ok) throw new Error("API check failed");

    return {
      status: response.status,
      responseTime: end - start,
    };
  };

  const checkDatabase = async () => {
    const start = Date.now();
    const response = await fetch("/api/health/db");
    const end = Date.now();

    if (!response.ok) throw new Error("Database check failed");

    return {
      status: response.status,
      responseTime: end - start,
    };
  };

  const checkWebSocket = () => {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(import.meta.env.VITE_WS_URL);
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("WebSocket timeout"));
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve({ status: "connected" });
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        reject(new Error("WebSocket error"));
      };
    });
  };

  const checkStorage = async () => {
    try {
      // Test localStorage
      const testKey = "health_check";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);

      // Test IndexedDB
      const db = await indexedDB.open("health_check", 1);
      db.close();
      indexedDB.deleteDatabase("health_check");

      return { status: "available" };
    } catch (error) {
      throw new Error("Storage check failed");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "healthy":
        return (
          <FontAwesomeIcon icon={faCheckCircle} className={styles.healthy} />
        );
      case "degraded":
        return (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className={styles.degraded}
          />
        );
      case "unhealthy":
        return (
          <FontAwesomeIcon icon={faTimesCircle} className={styles.unhealthy} />
        );
      default:
        return <div className={styles.checking} />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "healthy":
        return "Healthy";
      case "degraded":
        return "Degraded";
      case "unhealthy":
        return "Unhealthy";
      default:
        return "Checking...";
    }
  };

  useEffect(() => {
    const checkHealth = async () => {
      const checks = [
        checkAPI(),
        checkDatabase(),
        checkWebSocket(),
        checkStorage(),
      ];

      const results = await Promise.allSettled(checks);

      const status = {
        api: results[0].status === "fulfilled" ? "healthy" : "unhealthy",
        database: results[1].status === "fulfilled" ? "healthy" : "unhealthy",
        websocket: results[2].status === "fulfilled" ? "healthy" : "unhealthy",
        storage: results[3].status === "fulfilled" ? "healthy" : "unhealthy",
      };

      const healthyCount = Object.values(status).filter(
        (s) => s === "healthy"
      ).length;
      status.overall =
        healthyCount >= 3
          ? "healthy"
          : healthyCount >= 2
          ? "degraded"
          : "unhealthy";

      setHealthStatus(status);

      // Update response times
      if (results[0].status === "fulfilled") {
        setResponseTimes((prev) => ({
          ...prev,
          api: results[0].value.responseTime,
        }));
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute

    // Calculate uptime
    const startTime = Date.now();
    const updateUptime = () => {
      const elapsed = Date.now() - startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      setUptime(`${hours}h ${minutes}m`);
    };

    updateUptime();
    const uptimeInterval = setInterval(updateUptime, 60000);

    return () => {
      clearInterval(interval);
      clearInterval(uptimeInterval);
    };
  }, []);

  return (
    <div className={styles.healthCheck}>
      <div className={styles.healthHeader}>
        <FontAwesomeIcon icon={faHeartbeat} />
        <h3>System Health</h3>
        <div
          className={`${styles.overallStatus} ${styles[healthStatus.overall]}`}
        >
          {getStatusIcon(healthStatus.overall)}
          <span>{getStatusLabel(healthStatus.overall)}</span>
        </div>
      </div>

      <div className={styles.healthGrid}>
        <div className={styles.healthCard}>
          <div className={styles.cardHeader}>
            <FontAwesomeIcon icon={faServer} />
            <span>API Server</span>
          </div>
          <div className={styles.cardBody}>
            {getStatusIcon(healthStatus.api)}
            <span>{getStatusLabel(healthStatus.api)}</span>
            {responseTimes.api && (
              <span className={styles.responseTime}>{responseTimes.api}ms</span>
            )}
          </div>
        </div>

        <div className={styles.healthCard}>
          <div className={styles.cardHeader}>
            <FontAwesomeIcon icon={faDatabase} />
            <span>Database</span>
          </div>
          <div className={styles.cardBody}>
            {getStatusIcon(healthStatus.database)}
            <span>{getStatusLabel(healthStatus.database)}</span>
          </div>
        </div>

        <div className={styles.healthCard}>
          <div className={styles.cardHeader}>
            <FontAwesomeIcon icon={faNetworkWired} />
            <span>WebSocket</span>
          </div>
          <div className={styles.cardBody}>
            {getStatusIcon(healthStatus.websocket)}
            <span>{getStatusLabel(healthStatus.websocket)}</span>
          </div>
        </div>

        <div className={styles.healthCard}>
          <div className={styles.cardHeader}>
            <FontAwesomeIcon icon={faServer} />
            <span>Storage</span>
          </div>
          <div className={styles.cardBody}>
            {getStatusIcon(healthStatus.storage)}
            <span>{getStatusLabel(healthStatus.storage)}</span>
          </div>
        </div>
      </div>

      <div className={styles.healthFooter}>
        <div className={styles.uptime}>
          <strong>Uptime:</strong> {uptime}
        </div>
        <div className={styles.lastCheck}>
          <strong>Last Check:</strong> {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default HealthCheck;
