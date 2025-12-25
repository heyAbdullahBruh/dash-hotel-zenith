import React from "react";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faClock } from "@fortawesome/free-solid-svg-icons";
import styles from "./Timeline.module.css";

const Timeline = ({ items = [] }) => {
  return (
    <div className={styles.timeline}>
      {items.map((item, index) => (
        <div key={index} className={styles.timelineItem}>
          <div className={styles.timelineIcon}>
            {item.completed ? (
              <FontAwesomeIcon
                icon={faCheckCircle}
                className={styles.completedIcon}
              />
            ) : (
              <div className={styles.pendingIcon}>
                <FontAwesomeIcon icon={faClock} />
              </div>
            )}
          </div>
          <div className={styles.timelineContent}>
            <div className={styles.timelineHeader}>
              <h4 className={styles.timelineTitle}>{item.status}</h4>
              <span className={styles.timelineTime}>
                {format(new Date(item.time), "MMM dd, HH:mm")}
              </span>
            </div>
            <p className={styles.timelineDescription}>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
