// src/components/shared/AuditLog/AuditLog.jsx
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Card from "../../ui/Card/Card";
import Button from "../../ui/Button/Button";
import Input from "../../ui/Input/Input";
import Select from "../../ui/Select/Select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faDownload,
  faEye,
  faTrash,
  faUserShield,
  faExclamationTriangle,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./AuditLog.module.css";

const AuditLog = () => {
  const [filters, setFilters] = useState({
    action: "",
    severity: "",
    userId: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [selectedLog, setSelectedLog] = useState(null);

  const {
    data: logs,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["auditLogs", filters],
    queryFn: () => fetchLogs(filters),
  });

  const fetchLogs = async (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    const response = await fetch(`/api/security/logs?${query}`);
    return response.json();
  };

  const exportLogs = async () => {
    const response = await fetch("/api/security/logs/export", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteLogs = async (days) => {
    if (!window.confirm(`Delete logs older than ${days} days?`)) return;

    await fetch(`/api/security/logs/cleanup?days=${days}`, {
      method: "DELETE",
    });

    refetch();
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "critical":
        return (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className={styles.critical}
          />
        );
      case "warning":
        return (
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className={styles.warning}
          />
        );
      case "info":
        return <FontAwesomeIcon icon={faInfoCircle} className={styles.info} />;
      default:
        return <FontAwesomeIcon icon={faInfoCircle} />;
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case "login":
      case "logout":
        return styles.auth;
      case "create":
      case "update":
      case "delete":
        return styles.crud;
      case "export":
      case "import":
        return styles.data;
      case "security":
        return styles.security;
      default:
        return styles.default;
    }
  };

  return (
    <div className={styles.auditLog}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>
            <FontAwesomeIcon icon={faUserShield} />
            Audit Logs
          </h1>
          <p className={styles.subtitle}>Security and activity monitoring</p>
        </div>
        <div className={styles.headerRight}>
          <Button variant="outline" icon={faDownload} onClick={exportLogs}>
            Export
          </Button>
          <Button
            variant="danger"
            icon={faTrash}
            onClick={() => deleteLogs(30)}
          >
            Cleanup (30 days)
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <Input
            placeholder="Search logs..."
            icon={faSearch}
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            fullWidth
          />

          <Select
            options={[
              { value: "", label: "All Actions" },
              { value: "login", label: "Login" },
              { value: "logout", label: "Logout" },
              { value: "create", label: "Create" },
              { value: "update", label: "Update" },
              { value: "delete", label: "Delete" },
              { value: "export", label: "Export" },
              { value: "import", label: "Import" },
            ]}
            value={filters.action}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, action: value }))
            }
            placeholder="Action"
          />

          <Select
            options={[
              { value: "", label: "All Severities" },
              { value: "info", label: "Info" },
              { value: "warning", label: "Warning" },
              { value: "critical", label: "Critical" },
            ]}
            value={filters.severity}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, severity: value }))
            }
            placeholder="Severity"
          />

          <Input
            type="date"
            label="Start Date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, startDate: e.target.value }))
            }
          />

          <Input
            type="date"
            label="End Date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, endDate: e.target.value }))
            }
          />
        </div>
      </Card>

      {/* Logs Table */}
      <Card className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div className={styles.tableCell}>Timestamp</div>
          <div className={styles.tableCell}>Action</div>
          <div className={styles.tableCell}>User</div>
          <div className={styles.tableCell}>Severity</div>
          <div className={styles.tableCell}>Details</div>
          <div className={styles.tableCell}>IP Address</div>
          <div className={styles.tableCell}>Actions</div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>Loading logs...</div>
        ) : logs?.length === 0 ? (
          <div className={styles.empty}>No logs found</div>
        ) : (
          logs?.map((log) => (
            <div key={log.id} className={styles.tableRow}>
              <div className={styles.tableCell}>
                {format(new Date(log.timestamp), "MMM dd, HH:mm:ss")}
              </div>
              <div className={styles.tableCell}>
                <span
                  className={`${styles.actionBadge} ${getActionColor(
                    log.action
                  )}`}
                >
                  {log.action}
                </span>
              </div>
              <div className={styles.tableCell}>{log.userId || "System"}</div>
              <div className={styles.tableCell}>
                <div className={styles.severity}>
                  {getSeverityIcon(log.severity)}
                  <span className={styles[log.severity]}>{log.severity}</span>
                </div>
              </div>
              <div className={styles.tableCell}>
                <div className={styles.details}>
                  {log.details?.substring(0, 50)}
                  {log.details?.length > 50 && "..."}
                </div>
              </div>
              <div className={styles.tableCell}>{log.ipAddress || "N/A"}</div>
              <div className={styles.tableCell}>
                <Button
                  variant="outline"
                  size="sm"
                  icon={faEye}
                  onClick={() => setSelectedLog(log)}
                >
                  View
                </Button>
              </div>
            </div>
          ))
        )}
      </Card>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Log Details</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </Button>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <strong>Timestamp:</strong>
                  <span>{format(new Date(selectedLog.timestamp), "PPpp")}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Action:</strong>
                  <span>{selectedLog.action}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>Severity:</strong>
                  <span className={styles[selectedLog.severity]}>
                    {selectedLog.severity}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <strong>User ID:</strong>
                  <span>{selectedLog.userId || "System"}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>IP Address:</strong>
                  <span>{selectedLog.ipAddress || "N/A"}</span>
                </div>
                <div className={styles.detailItem}>
                  <strong>User Agent:</strong>
                  <span>{selectedLog.userAgent}</span>
                </div>
                <div className={styles.detailItemFull}>
                  <strong>Details:</strong>
                  <pre className={styles.detailsPre}>
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
                <div className={styles.detailItemFull}>
                  <strong>Metadata:</strong>
                  <pre className={styles.metadataPre}>
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLog;
