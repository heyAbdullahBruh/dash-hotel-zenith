import React, { forwardRef, useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faCompress } from "@fortawesome/free-solid-svg-icons";
import styles from "./TextArea.module.css";
import clsx from "clsx";

const TextArea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      disabled = false,
      required = false,
      resize = "vertical",
      showCount = false,
      maxLength,
      minRows = 3,
      maxRows = 10,
      className,
      onFocus,
      onBlur,
      onChange,
      value,
      autoGrow = true,
      showExpand = true,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [characterCount, setCharacterCount] = useState(value?.length || 0);
    const [isExpanded, setIsExpanded] = useState(false);
    const textareaRef = useRef(null);

    // Combine refs
    const combinedRef = (node) => {
      textareaRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Auto-grow functionality
    useEffect(() => {
      if (autoGrow && textareaRef.current) {
        // eslint-disable-next-line react-hooks/immutability
        adjustHeight();
      }
    }, [value, autoGrow]);

    const adjustHeight = () => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";

      // Calculate the new height
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      const scrollHeight = textarea.scrollHeight;

      // Set height within bounds
      if (scrollHeight < minHeight) {
        textarea.style.height = `${minHeight}px`;
      } else if (scrollHeight > maxHeight) {
        textarea.style.height = `${maxHeight}px`;
        textarea.style.overflowY = "auto";
      } else {
        textarea.style.height = `${scrollHeight}px`;
        textarea.style.overflowY = "hidden";
      }
    };

    const handleFocus = (e) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e) => {
      const newValue = e.target.value;
      setCharacterCount(newValue.length);
      onChange?.(e);
    };

    const handleExpand = () => {
      setIsExpanded(!isExpanded);
      if (!isExpanded && textareaRef.current) {
        // Save current dimensions
        const textarea = textareaRef.current;
        textarea.dataset.originalHeight = textarea.style.height;
        textarea.dataset.originalWidth = textarea.style.width;

        // Make it full screen
        textarea.style.position = "fixed";
        textarea.style.top = "50%";
        textarea.style.left = "50%";
        textarea.style.transform = "translate(-50%, -50%)";
        textarea.style.width = "90vw";
        textarea.style.height = "80vh";
        textarea.style.zIndex = "9999";
        textarea.style.boxShadow = "0 20px 60px rgba(0, 0, 0, 0.3)";
        textarea.style.borderRadius = "1rem";
        textarea.style.resize = "both";
        document.body.style.overflow = "hidden";
      } else {
        // Restore original dimensions
        const textarea = textareaRef.current;
        textarea.style.position = "";
        textarea.style.top = "";
        textarea.style.left = "";
        textarea.style.transform = "";
        textarea.style.width = textarea.dataset.originalWidth || "";
        textarea.style.height = textarea.dataset.originalHeight || "";
        textarea.style.zIndex = "";
        textarea.style.boxShadow = "";
        textarea.style.borderRadius = "";
        textarea.style.resize = resize === "none" ? "none" : "";
        document.body.style.overflow = "";
      }
    };

    const textareaClasses = clsx(
      styles.textarea,
      {
        [styles.hasError]: error,
        [styles.disabled]: disabled,
        [styles.fullWidth]: fullWidth,
        [styles.focused]: isFocused,
        [styles.noResize]: resize === "none",
        [styles.expanded]: isExpanded,
      },
      className
    );

    const wrapperClasses = clsx(styles.textareaWrapper, {
      [styles.fullWidth]: fullWidth,
    });

    return (
      <div className={wrapperClasses}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={styles.textareaContainer}>
          <textarea
            ref={combinedRef}
            className={textareaClasses}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            data-resize={resize}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            value={value}
            maxLength={maxLength}
            rows={minRows}
            {...props}
          />

          <div className={styles.textareaControls}>
            {showExpand && (
              <button
                type="button"
                className={styles.expandButton}
                onClick={handleExpand}
                disabled={disabled}
                aria-label={
                  isExpanded ? "Minimize textarea" : "Expand textarea"
                }
                tabIndex={-1}
              >
                <FontAwesomeIcon
                  icon={isExpanded ? faCompress : faExpand}
                  className={styles.expandIcon}
                />
              </button>
            )}

            {showCount && maxLength && (
              <div className={styles.characterCount}>
                <span
                  className={clsx(styles.count, {
                    [styles.countWarning]: characterCount > maxLength * 0.8,
                    [styles.countError]: characterCount > maxLength * 0.95,
                  })}
                >
                  {characterCount}
                </span>
                <span className={styles.countSeparator}>/</span>
                <span className={styles.countMax}>{maxLength}</span>
              </div>
            )}
          </div>

          <div className={styles.focusBorder} />
        </div>

        {error && (
          <div id={`${props.id}-error`} className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠</span>
            {error}
          </div>
        )}

        {helperText && !error && (
          <div className={styles.helperText}>
            <span className={styles.helperIcon}>💡</span>
            {helperText}
          </div>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
