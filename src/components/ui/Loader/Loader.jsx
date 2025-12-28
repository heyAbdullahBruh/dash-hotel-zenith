import React from "react";
import styles from "./Loader.module.css";
import clsx from "clsx";

const Loader = ({
  size = "md",
  variant = "spinner",
  color = "primary",
  fullScreen = false,
  text,
  className,
}) => {
  const loaderClasses = clsx(
    styles.loader,
    styles[`size--${size}`],
    styles[`variant--${variant}`],
    {
      [styles.fullScreen]: fullScreen,
    },
    className
  );

  const renderLoader = () => {
    switch (variant) {
      case "spinner":
        return (
          <div className={styles.spinnerContainer}>
            <div className={clsx(styles.spinner, styles[`color--${color}`])}>
              <div></div>
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        );

      case "dots":
        return (
          <div className={clsx(styles.dots, styles[`color--${color}`])}>
            <div></div>
            <div></div>
            <div></div>
          </div>
        );

      case "pulse":
        return (
          <div className={clsx(styles.pulse, styles[`color--${color}`])}></div>
        );

      case "skeleton":
        return (
          <div className={styles.skeletonContainer}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
          </div>
        );

      default:
        return (
          <div className={clsx(styles.spinner, styles[`color--${color}`])}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        );
    }
  };

  if (fullScreen) {
    return (
      <div className={styles.fullScreenWrapper}>
        <div className={loaderClasses}>
          {renderLoader()}
          {text && <p className={styles.loaderText}>{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={loaderClasses}>
      {renderLoader()}
      {text && <p className={styles.loaderText}>{text}</p>}
    </div>
  );
};

export default Loader;
