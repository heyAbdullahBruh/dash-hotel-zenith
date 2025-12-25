import React, { forwardRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./Input.module.css";
import clsx from "clsx";

const Input = forwardRef(
  (
    {
      label,
      type = "text",
      icon,
      error,
      helperText,
      fullWidth = false,
      disabled = false,
      required = false,
      className,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputType = type === "password" && showPassword ? "text" : type;

    const inputClasses = clsx(
      styles.input,
      {
        [styles.hasError]: error,
        [styles.hasIcon]: icon,
        [styles.disabled]: disabled,
        [styles.fullWidth]: fullWidth,
      },
      className
    );

    return (
      <div className={styles.inputWrapper}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={styles.inputContainer}>
          {icon && (
            <div className={styles.iconContainer}>
              <FontAwesomeIcon icon={icon} className={styles.icon} />
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />

          {type === "password" && (
            <button
              type="button"
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              <FontAwesomeIcon
                icon={showPassword ? "eye-slash" : "eye"}
                className={styles.toggleIcon}
              />
            </button>
          )}
        </div>

        {error && (
          <div id={`${props.id}-error`} className={styles.errorMessage}>
            {error}
          </div>
        )}

        {helperText && !error && (
          <div className={styles.helperText}>{helperText}</div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
