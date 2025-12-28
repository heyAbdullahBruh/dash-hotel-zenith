import React, { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameDay,
  addDays,
  isWithinInterval,
} from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendar,
  faChevronLeft,
  faChevronRight,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../../ui/Button/Button";
import styles from "./DateRangePicker.module.css";
import clsx from "clsx";

const DateRangePicker = ({
  value = { start: null, end: null },
  onChange,
  label,
  placeholder = "Select date range",
  maxRange = null,
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempRange, setTempRange] = useState(value);
  const [hoverDate, setHoverDate] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateClick = (date) => {
    if (disabled) return;

    if (!tempRange.start || (tempRange.start && tempRange.end)) {
      // Start new range
      setTempRange({ start: date, end: null });
    } else if (tempRange.start && !tempRange.end) {
      // Complete range
      let start = tempRange.start;
      let end = date;

      // Ensure start is before end
      if (start > end) {
        [start, end] = [end, start];
      }

      // Check max range constraint
      if (maxRange) {
        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (daysDiff > maxRange) {
          end = addDays(start, maxRange);
        }
      }

      const newRange = { start, end };
      setTempRange(newRange);
      onChange(newRange);
      setTimeout(() => setIsOpen(false), 300);
    }
  };

  const handleHoverDate = (date) => {
    if (tempRange.start && !tempRange.end) {
      setHoverDate(date);
    }
  };

  const clearSelection = () => {
    setTempRange({ start: null, end: null });
    onChange({ start: null, end: null });
  };

  const applyPreset = (preset) => {
    let end = new Date();
    let start = new Date();

    switch (preset) {
      case "today":
        start = new Date();
        end.setDate(end.getDate() + 1);
        break;
      case "yesterday":
        start.setDate(start.getDate() - 1);
        break;
      case "last7":
        start.setDate(start.getDate() - 6);
        break;
      case "last30":
        start.setDate(start.getDate() - 29);
        break;
      case "thisMonth":
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      case "lastMonth":
        const lastMonth = subMonths(new Date(), 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      default:
        break;
    }

    const newRange = { start, end };
    setTempRange(newRange);
    onChange(newRange);
    setTimeout(() => setIsOpen(false), 300);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const isCurrentMonth = isSameDay(monthStart, startOfMonth(cloneDay));
        const isSelectedStart =
          tempRange.start && isSameDay(cloneDay, tempRange.start);
        const isSelectedEnd =
          tempRange.end && isSameDay(cloneDay, tempRange.end);
        const isInRange =
          tempRange.start &&
          tempRange.end &&
          isWithinInterval(cloneDay, {
            start: tempRange.start,
            end: tempRange.end,
          });
        const isInHoverRange =
          tempRange.start &&
          hoverDate &&
          !tempRange.end &&
          isWithinInterval(cloneDay, {
            start: tempRange.start < hoverDate ? tempRange.start : hoverDate,
            end: tempRange.start < hoverDate ? hoverDate : tempRange.start,
          });

        const isToday = isSameDay(cloneDay, new Date());
        const isDisabled =
          maxRange &&
          tempRange.start &&
          Math.abs(cloneDay - tempRange.start) / (1000 * 60 * 60 * 24) >
            maxRange;

        days.push(
          <button
            key={day.toString()}
            className={clsx(styles.day, {
              [styles.currentMonth]: isCurrentMonth,
              [styles.otherMonth]: !isCurrentMonth,
              [styles.selectedStart]: isSelectedStart,
              [styles.selectedEnd]: isSelectedEnd,
              [styles.inRange]: isInRange,
              [styles.hoverRange]: isInHoverRange,
              [styles.today]: isToday,
              [styles.disabled]: isDisabled,
            })}
            onClick={() => !isDisabled && handleDateClick(cloneDay)}
            onMouseEnter={() => handleHoverDate(cloneDay)}
            disabled={isDisabled || disabled}
            type="button"
          >
            <span className={styles.dayNumber}>{format(cloneDay, "d")}</span>
            {isToday && <div className={styles.todayIndicator} />}
          </button>
        );
        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className={styles.week}>
          {days}
        </div>
      );
      days = [];
    }

    return rows;
  };

  const formatDisplayValue = () => {
    if (!value.start && !value.end) {
      return placeholder;
    }
    if (value.start && value.end) {
      return `${format(value.start, "MMM dd, yyyy")} - ${format(
        value.end,
        "MMM dd, yyyy"
      )}`;
    }
    if (value.start) {
      return `From ${format(value.start, "MMM dd, yyyy")}`;
    }
    return placeholder;
  };

  return (
    <div className={clsx(styles.dateRangePicker, className)} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}

      <div className={styles.pickerContainer}>
        <button
          type="button"
          className={clsx(styles.pickerInput, {
            [styles.open]: isOpen,
            [styles.disabled]: disabled,
          })}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <FontAwesomeIcon icon={faCalendar} className={styles.calendarIcon} />
          <span className={styles.displayValue}>{formatDisplayValue()}</span>
          {(value.start || value.end) && !disabled && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              aria-label="Clear selection"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </button>

        {isOpen && (
          <div className={styles.pickerDropdown}>
            <div className={styles.pickerHeader}>
              <div className={styles.monthNav}>
                <button
                  type="button"
                  className={styles.navButton}
                  onClick={prevMonth}
                  aria-label="Previous month"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                </button>

                <div className={styles.currentMonthDisplay}>
                  {format(currentMonth, "MMMM yyyy")}
                </div>

                <button
                  type="button"
                  className={styles.navButton}
                  onClick={nextMonth}
                  aria-label="Next month"
                >
                  <FontAwesomeIcon icon={faChevronRight} />
                </button>
              </div>

              <div className={styles.quickPresets}>
                <button
                  type="button"
                  className={styles.presetButton}
                  onClick={() => applyPreset("today")}
                >
                  Today
                </button>
                <button
                  type="button"
                  className={styles.presetButton}
                  onClick={() => applyPreset("yesterday")}
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  className={styles.presetButton}
                  onClick={() => applyPreset("last7")}
                >
                  Last 7 days
                </button>
                <button
                  type="button"
                  className={styles.presetButton}
                  onClick={() => applyPreset("last30")}
                >
                  Last 30 days
                </button>
              </div>
            </div>

            <div className={styles.calendarContainer}>
              <div className={styles.weekdays}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div key={day} className={styles.weekday}>
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className={styles.calendar}>{renderCalendar()}</div>
            </div>

            <div className={styles.selectedRange}>
              {tempRange.start && (
                <div className={styles.rangeStart}>
                  <span className={styles.rangeLabel}>From:</span>
                  <span className={styles.rangeDate}>
                    {format(tempRange.start, "MMM dd, yyyy")}
                  </span>
                </div>
              )}
              {tempRange.end && (
                <div className={styles.rangeEnd}>
                  <span className={styles.rangeLabel}>To:</span>
                  <span className={styles.rangeDate}>
                    {format(tempRange.end, "MMM dd, yyyy")}
                  </span>
                </div>
              )}
              {!tempRange.end && tempRange.start && (
                <div className={styles.rangeHint}>Select end date</div>
              )}
            </div>

            <div className={styles.pickerFooter}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTempRange(value);
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onChange(tempRange);
                  setIsOpen(false);
                }}
                disabled={!tempRange.start || !tempRange.end}
              >
                Apply
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DateRangePicker;
