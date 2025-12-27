import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";
import styles from "./Rating.module.css";

const Rating = ({
  value = 0,
  max = 5,
  onChange,
  readOnly = false,
  size = "md",
}) => {
  const handleClick = (newValue) => {
    if (!readOnly && onChange) {
      onChange(newValue);
    }
  };

  const stars = Array.from({ length: max }, (_, index) => {
    const starValue = index + 1;
    const isFilled = starValue <= value;

    return (
      <button
        key={index}
        type="button"
        className={`${styles.star} ${styles[size]} ${
          readOnly ? styles.readOnly : ""
        }`}
        onClick={() => handleClick(starValue)}
        disabled={readOnly}
        aria-label={`Rate ${starValue} out of ${max}`}
      >
        <FontAwesomeIcon
          icon={isFilled ? solidStar : regularStar}
          className={isFilled ? styles.filled : styles.empty}
        />
      </button>
    );
  });

  return (
    <div className={styles.rating} role="radiogroup" aria-label="Rating">
      {stars}
      {readOnly && value > 0 && (
        <span className={styles.ratingValue}>{value.toFixed(1)}</span>
      )}
    </div>
  );
};

export default Rating;
