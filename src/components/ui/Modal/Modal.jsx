import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Button from "../Button/Button";
import styles from "./Modal.module.css";
import clsx from "clsx";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showClose = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  showFooter = false,
  footerContent,
  primaryAction,
  secondaryAction,
  className,
  overlayClassName,
  contentClassName,
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement;
      document.body.style.overflow = "hidden";

      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      document.body.style.overflow = "unset";

      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (closeOnEsc && e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeOnEsc, isOpen, onClose]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className={clsx(styles.modalOverlay, overlayClassName, {
        [styles.open]: isOpen,
      })}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        ref={modalRef}
        className={clsx(styles.modal, styles[`size--${size}`], className)}
        onClick={handleModalClick}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className={styles.modalHeader}>
            {title && (
              <h2 id="modal-title" className={styles.modalTitle}>
                {title}
              </h2>
            )}
            {showClose && (
              <Button
                variant="outline"
                size="sm"
                icon={faTimes}
                onClick={onClose}
                className={styles.closeButton}
                aria-label="Close modal"
              />
            )}
          </div>
        )}

        {/* Content */}
        <div className={clsx(styles.modalContent, contentClassName)}>
          {children}
        </div>

        {/* Footer */}
        {showFooter && (
          <div className={styles.modalFooter}>
            {footerContent || (
              <>
                {secondaryAction && (
                  <Button
                    variant="outline"
                    onClick={secondaryAction.onClick}
                    loading={secondaryAction.loading}
                    disabled={secondaryAction.disabled}
                  >
                    {secondaryAction.label || "Cancel"}
                  </Button>
                )}
                {primaryAction && (
                  <Button
                    variant="primary"
                    onClick={primaryAction.onClick}
                    loading={primaryAction.loading}
                    disabled={primaryAction.disabled}
                  >
                    {primaryAction.label || "Confirm"}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Confirmation Modal Variant
export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showFooter
      primaryAction={{
        label: confirmText,
        onClick: onConfirm,
        loading,
        disabled: loading,
      }}
      secondaryAction={{
        label: cancelText,
        onClick: onClose,
        disabled: loading,
      }}
    >
      <div className={styles.confirmationContent}>
        <div className={styles.confirmationIcon}>
          {variant === "danger" && <div className={styles.iconDanger}>!</div>}
          {variant === "warning" && <div className={styles.iconWarning}>⚠</div>}
          {variant === "success" && <div className={styles.iconSuccess}>✓</div>}
        </div>
        <p className={styles.confirmationMessage}>{message}</p>
      </div>
    </Modal>
  );
};

export default Modal;
