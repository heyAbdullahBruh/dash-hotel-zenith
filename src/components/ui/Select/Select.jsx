import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import styles from "./Select.module.css";
import clsx from "clsx";

const Select = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  error,
  label,
  required = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={clsx(styles.selectWrapper, className)} ref={selectRef}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div
        className={clsx(styles.select, {
          [styles.open]: isOpen,
          [styles.disabled]: disabled,
          [styles.hasError]: error,
        })}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            !disabled && setIsOpen(!isOpen);
          }
        }}
      >
        <div className={styles.selectedValue}>
          {selectedOption ? (
            <>
              {selectedOption.icon && (
                <FontAwesomeIcon
                  icon={selectedOption.icon}
                  className={styles.optionIcon}
                />
              )}
              <span>{selectedOption.label}</span>
            </>
          ) : (
            <span className={styles.placeholder}>{placeholder}</span>
          )}
        </div>

        <FontAwesomeIcon
          icon={faChevronDown}
          className={clsx(styles.chevron, { [styles.rotated]: isOpen })}
        />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          {options.map((option) => (
            <div
              key={option.value}
              className={clsx(styles.option, {
                [styles.selected]: option.value === value,
                [styles.disabled]: option.disabled,
              })}
              onClick={() => !option.disabled && handleSelect(option)}
            >
              {option.icon && (
                <FontAwesomeIcon
                  icon={option.icon}
                  className={styles.optionIcon}
                />
              )}
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      )}

      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  );
};

export default Select;
