import React, { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO,
} from "date-fns";
import Button from "../../ui/Button/Button";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faCalendar,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./CalendarView.module.css";

const CalendarView = ({
  events = [],
  selectedDate,
  onDateSelect,
  onEventClick,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const renderHeader = () => {
    return (
      <div className={styles.calendarHeader}>
        <Button variant="outline" icon={faChevronLeft} onClick={prevMonth} />

        <div className={styles.monthDisplay}>
          <h2>{format(currentMonth, "MMMM yyyy")}</h2>
          <Button variant="outline" onClick={goToToday}>
            Today
          </Button>
        </div>

        <Button variant="outline" icon={faChevronRight} onClick={nextMonth} />
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className={styles.weekday}>
          {format(addDays(startDate, i), "EEE")}
        </div>
      );
    }

    return <div className={styles.weekdays}>{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = new Date(day);
        const isToday = isSameDay(day, new Date());
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, currentMonth);

        const dayEvents = events.filter((event) =>
          isSameDay(parseISO(event.start), day)
        );

        days.push(
          <div
            key={day.toString()}
            className={`${styles.day} ${
              !isCurrentMonth ? styles.disabled : ""
            } ${isToday ? styles.today : ""} ${
              isSelected ? styles.selected : ""
            }`}
            onClick={() => isCurrentMonth && onDateSelect?.(cloneDay)}
          >
            <div className={styles.dayHeader}>
              <span className={styles.dayNumber}>{formattedDate}</span>
              {isToday && <span className={styles.todayBadge}>Today</span>}
            </div>

            <div className={styles.events}>
              {dayEvents.slice(0, 2).map((event, index) => (
                <div
                  key={index}
                  className={`${styles.event} ${styles[event.status]}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event);
                  }}
                  title={event.title}
                >
                  <div className={styles.eventTime}>
                    {format(event.start, "HH:mm")}
                  </div>
                  <div className={styles.eventTitle}>{event.title}</div>
                </div>
              ))}
              {dayEvents.length > 2 && (
                <div className={styles.moreEvents}>
                  +{dayEvents.length - 2} more
                </div>
              )}
            </div>
          </div>
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

    return <div className={styles.calendarBody}>{rows}</div>;
  };

  return (
    <div className={styles.calendarView}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default CalendarView;
