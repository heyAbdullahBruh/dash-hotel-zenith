import React, { useState, useRef, useEffect, forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faCheck,
  faSearch,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./Select.module.css";
import clsx from "clsx";

const Select = forwardRef(
  (
    {
      options = [],
      value,
      onChange,
      placeholder = "Select an option",
      disabled = false,
      error,
      label,
      required = false,
      className,
      multiple = false,
      searchable = false,
      loading = false,
      clearable = false,
      showIcon = false,
      size = "md",
      fullWidth = false,
      helperText,
      icon,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState();
    const selectRef = useRef(null);
    const dropdownRef = useRef(null);

    const selectedOptions = multiple
      ? options.filter((opt) => internalValue?.includes(opt.value))
      : [options.find((opt) => opt.value === internalValue)];

    const filteredOptions = options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
      if (typeof value === 'object') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setInternalValue(value?._id);
      } else {
        setInternalValue(value);
      }
    }, [value]);
    // console.log(value);
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
      if (isOpen && searchable) {
        const searchInput = dropdownRef.current?.querySelector("input");
        if (searchInput) {
          searchInput.focus();
        }
      }
    }, [isOpen, searchable]);

    const handleSelectChange = (e) => {
      if (multiple) {
        const selectedValues = Array.from(
          e.target.selectedOptions,
          (option) => option.value
        );
        setInternalValue(selectedValues);
        onChange?.(selectedValues);
      } else {
        const selectedValue = e.target.value;
        setInternalValue(selectedValue);
        onChange?.(selectedValue);
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleOptionClick = (optionValue) => {
      if (multiple) {
        const newValue = internalValue?.includes(optionValue)
          ? internalValue.filter((val) => val !== optionValue)
          : [...(internalValue || []), optionValue];
        setInternalValue(newValue);
        onChange?.(newValue);
      } else {
        setInternalValue(optionValue);
        onChange?.(optionValue);
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    const handleClear = (e) => {
      e.stopPropagation();
      if (multiple) {
        setInternalValue([]);
        onChange?.([]);
      } else {
        setInternalValue("");
        onChange?.("");
      }
    };

    const handleSearchChange = (e) => {
      setSearchTerm(e.target.value);
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      } else if (e.key === "Enter" && !isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    const getDisplayValue = () => {
      if (multiple) {
        if (selectedOptions.length === 0) {
          return <span className={styles.placeholder}>{placeholder}</span>;
        }
        if (selectedOptions.length <= 2) {
          return selectedOptions.map((opt) => opt.label).join(", ");
        }
        return `${selectedOptions.length} selected`;
      }

      return (
        selectedOptions[0]?.label || (
          <span className={styles.placeholder}>{placeholder}</span>
        )
      );
    };

    const isOptionSelected = (optionValue) => {
      if (multiple) {
        return internalValue?.includes(optionValue);
      }
      return internalValue === optionValue;
    };

    const containerClasses = clsx(styles.selectWrapper, className, {
      [styles.fullWidth]: fullWidth,
      [styles.loading]: loading,
    });

    const selectClasses = clsx(styles.select, styles[size], {
      [styles.open]: isOpen,
      [styles.disabled]: disabled,
      [styles.hasError]: error,
      [styles.focused]: isFocused,
      [styles.hasValue]:
        internalValue && (!multiple || internalValue.length > 0),
    });
    // console.log(internalValue);
    return (
      <div className={containerClasses} ref={selectRef}>
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div
          className={selectClasses}
          onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-label={label || placeholder}
        >
          <div className={styles.selectContent}>
            {showIcon && icon && (
              <FontAwesomeIcon icon={icon} className={styles.selectIcon} />
            )}

            {multiple && selectedOptions.length > 0 && (
              <div className={styles.multiSelectTags}>
                {selectedOptions.slice(0, 2).map((option) => (
                  <span key={option.value} className={styles.multiSelectTag}>
                    {option.label}
                    {selectedOptions.length > 2 &&
                      selectedOptions.indexOf(option) === 1 && (
                        <span className={styles.moreCount}>
                          +{selectedOptions.length - 2}
                        </span>
                      )}
                  </span>
                ))}
              </div>
            )}

            <div className={styles.selectedValue}>{getDisplayValue()}</div>

            <div className={styles.selectControls}>
              {clearable &&
                internalValue &&
                (!multiple || internalValue.length > 0) && (
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={handleClear}
                    aria-label="Clear selection"
                    tabIndex={-1}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                )}

              <FontAwesomeIcon
                icon={faChevronDown}
                className={clsx(styles.chevron, { [styles.rotated]: isOpen })}
              />
            </div>
          </div>

          {/* Hidden native select for form submission */}
          <select
            ref={ref}
            value={internalValue}
            onChange={handleSelectChange}
            multiple={multiple}
            disabled={disabled}
            className={styles.hiddenSelect}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            aria-hidden="true"
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {isOpen && !disabled && (
          <div
            className={styles.dropdown}
            ref={dropdownRef}
            role="listbox"
            aria-multiselectable={multiple}
          >
            {searchable && (
              <div className={styles.searchContainer}>
                <FontAwesomeIcon
                  icon={faSearch}
                  className={styles.searchIcon}
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className={styles.searchInput}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className={styles.optionsList}>
              {filteredOptions.length === 0 ? (
                <div className={styles.noResults}>No results found</div>
              ) : (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={clsx(styles.option, {
                      [styles.selected]: isOptionSelected(option.value),
                      [styles.disabled]: option.disabled,
                      [styles.multiple]: multiple,
                    })}
                    onClick={() =>
                      !option.disabled && handleOptionClick(option.value)
                    }
                    role="option"
                    aria-selected={isOptionSelected(option.value)}
                    aria-disabled={option.disabled}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        !option.disabled && handleOptionClick(option.value);
                      }
                    }}
                  >
                    {multiple && (
                      <div
                        className={clsx(styles.checkbox, {
                          [styles.checked]: isOptionSelected(option.value),
                        })}
                      >
                        {isOptionSelected(option.value) && (
                          <FontAwesomeIcon icon={faCheck} />
                        )}
                      </div>
                    )}

                    {option.icon && (
                      <FontAwesomeIcon
                        icon={option.icon}
                        className={styles.optionIcon}
                      />
                    )}

                    <span className={styles.optionLabel}>{option.label}</span>

                    {!multiple && isOptionSelected(option.value) && (
                      <FontAwesomeIcon
                        icon={faCheck}
                        className={styles.optionCheck}
                      />
                    )}
                  </div>
                ))
              )}
            </div>

            {multiple && (
              <div className={styles.dropdownFooter}>
                <button
                  type="button"
                  className={styles.applyButton}
                  onClick={() => {
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  Apply Selection
                </button>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className={styles.loadingSpinner}>
            <div className={styles.spinner} />
          </div>
        )}

        {error && (
          <div className={styles.errorMessage}>
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

Select.displayName = "Select";

export default Select;
