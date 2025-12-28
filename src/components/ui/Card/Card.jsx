import React from "react";
import styles from "./Card.module.css";
import clsx from "clsx";

const Card = ({
  children,
  className,
  padding = "md",
  variant = "default",
  hoverable = false,
  bordered = true,
  shadow = "md",
  onClick,
  ...props
}) => {
  const cardClasses = clsx(
    styles.card,
    styles[`padding--${padding}`],
    styles[`variant--${variant}`],
    styles[`shadow--${shadow}`],
    {
      [styles.hoverable]: hoverable,
      [styles.bordered]: bordered,
      [styles.clickable]: onClick,
    },
    className
  );

  return (
    <div
      className={cardClasses}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
