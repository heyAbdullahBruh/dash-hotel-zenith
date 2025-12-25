import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Button.module.css";
import clsx from "clsx";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconPosition = "left",
  type = "button",
  onClick,
  className,
  ...props
}) => {
  const buttonClasses = clsx(
    styles.button,
    styles[`variant--${variant}`],
    styles[`size--${size}`],
    {
      [styles.loading]: loading,
      [styles.disabled]: disabled,
      [styles.fullWidth]: fullWidth,
    },
    className
  );

  const handleClick = (e) => {
    if (!loading && !disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <span className={styles.spinner} aria-hidden="true">
          <div className={styles.spinnerDot}></div>
          <div className={styles.spinnerDot}></div>
          <div className={styles.spinnerDot}></div>
        </span>
      )}

      {icon && iconPosition === "left" && !loading && (
        <FontAwesomeIcon icon={icon} className={styles.iconLeft} />
      )}

      <span className={styles.content}>{children}</span>

      {icon && iconPosition === "right" && !loading && (
        <FontAwesomeIcon icon={icon} className={styles.iconRight} />
      )}
    </button>
  );
};

export default Button;
