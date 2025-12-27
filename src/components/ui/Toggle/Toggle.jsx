import React from "react";
import styles from "./Toggle.module.css";
import clsx from "clsx";

const Toggle = React.forwardRef(
  (
    {
      label,
      description,
      checked = false,
      onChange,
      disabled = false,
      size = "md",
      className,
      ...props
    },
    ref
  ) => {
    const handleChange = (e) => {
      if (!disabled && onChange) {
        onChange(e.target.checked);
      }
    };

    return (
      <div className={clsx(styles.toggleWrapper, className)}>
        <div className={styles.toggleContent}>
          <div className={styles.toggleInfo}>
            <label className={styles.toggleLabel}>{label}</label>
            {description && (
              <p className={styles.toggleDescription}>{description}</p>
            )}
          </div>

          <label
            className={clsx(styles.toggle, styles[size], {
              [styles.disabled]: disabled,
            })}
          >
            <input
              ref={ref}
              type="checkbox"
              checked={checked}
              onChange={handleChange}
              disabled={disabled}
              className={styles.toggleInput}
              {...props}
            />
            <span className={styles.toggleTrack}>
              <span className={styles.toggleThumb} />
            </span>
          </label>
        </div>
      </div>
    );
  }
);

Toggle.displayName = "Toggle";

export default Toggle;
