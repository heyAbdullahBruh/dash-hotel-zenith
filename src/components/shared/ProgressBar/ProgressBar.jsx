import React from "react";
import styles from "./ProgressBar.module.css";

const ProgressBar = ({
  value = 0,
  max = 100,
  formatValue = (val) => val,
  showPercentage = false,
  height = "8px",
  color = "var(--primary)",
  backgroundColor = "var(--border)",
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={styles.progressBar}>
      <div className={styles.barContainer} style={{ height, backgroundColor }}>
        <div
          className={styles.barFill}
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <div className={styles.barInfo}>
        <span className={styles.barValue}>
          {formatValue(value)} / {formatValue(max)}
        </span>
        {showPercentage && (
          <span className={styles.barPercentage}>{percentage.toFixed(1)}%</span>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
