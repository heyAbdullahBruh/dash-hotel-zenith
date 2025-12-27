import React from "react";
import styles from "./StatusBadge.module.css";

const statusConfig = {
  // Order Statuses
  order: {
    pending: { label: "Pending", className: styles.pending },
    accepted: { label: "Accepted", className: styles.accepted },
    preparing: { label: "Preparing", className: styles.preparing },
    ready: { label: "Ready", className: styles.ready },
    out_for_delivery: {
      label: "Out for Delivery",
      className: styles.outForDelivery,
    },
    delivered: { label: "Delivered", className: styles.delivered },
    completed: { label: "Completed", className: styles.completed },
    cancelled: { label: "Cancelled", className: styles.cancelled },
  },

  // Booking Statuses
  booking: {
    pending: { label: "Pending", className: styles.pending },
    confirmed: { label: "Confirmed", className: styles.confirmed },
    seated: { label: "Seated", className: styles.seated },
    completed: { label: "Completed", className: styles.completed },
    cancelled: { label: "Cancelled", className: styles.cancelled },
    no_show: { label: "No Show", className: styles.noShow },
    in_progress: { label: "In Progress", className: styles.inProgress },
  },

  // Generic Statuses
  status: {
    active: { label: "Active", className: styles.active },
    inactive: { label: "Inactive", className: styles.inactive },
    available: { label: "Available", className: styles.available },
    unavailable: { label: "Unavailable", className: styles.unavailable },
  },

  // Review Statuses
  review: {
    pending: { label: "Pending", className: styles.pending },
    approved: { label: "Approved", className: styles.approved },
    rejected: { label: "Rejected", className: styles.rejected },
  },
};

const StatusBadge = ({
  status,
  type = "status",
  size = "md",
  showDot = true,
}) => {
  const config = statusConfig[type]?.[status] || {
    label: status,
    className: styles.default,
  };

  return (
    <div
      className={`${styles.statusBadge} ${config.className} ${styles[size]}`}
    >
      {showDot && <span className={styles.dot} />}
      <span className={styles.label}>{config.label}</span>
    </div>
  );
};

export default StatusBadge;
