import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faTrash,
  faCheck,
  faTimes,
  faInfoCircle,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../Button/Button";
import styles from "./ConfirmationModal.module.css";

const ConfirmationModal = ({
  isOpen = false,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  cancelVariant = "outline",
  type = "warning", // warning, danger, info, success
  loading = false,
  disableConfirm = false,
  disableCancel = false,
  showCloseButton = true,
  children,
}) => {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    // Auto focus close button when modal opens
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return faTrash;
      case "warning":
        return faExclamationTriangle;
      case "info":
        return faInfoCircle;
      case "success":
        return faCheck;
      default:
        return faWarning;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case "danger":
        return styles.danger;
      case "warning":
        return styles.warning;
      case "info":
        return styles.info;
      case "success":
        return styles.success;
      default:
        return styles.warning;
    }
  };

  return (
    <div className={styles.modalOverlay} data-open={isOpen}>
      <div
        className={styles.modal}
        ref={modalRef}
        role="dialog"
        aria-labelledby="confirmation-modal-title"
        aria-describedby="confirmation-modal-description"
        aria-modal="true"
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
            disabled={disableCancel}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        )}

        {/* Modal Icon */}
        <div className={`${styles.modalIcon} ${getTypeClass()}`}>
          <FontAwesomeIcon icon={getIcon()} />
        </div>

        {/* Modal Content */}
        <div className={styles.modalContent}>
          <h3 id="confirmation-modal-title" className={styles.modalTitle}>
            {title}
          </h3>

          <p
            id="confirmation-modal-description"
            className={styles.modalMessage}
          >
            {message}
          </p>

          {/* Children (for additional content) */}
          {children && <div className={styles.modalChildren}>{children}</div>}

          {/* Action Buttons */}
          <div className={styles.modalActions}>
            <Button
              variant={cancelVariant}
              onClick={onClose}
              disabled={disableCancel || loading}
              fullWidth
            >
              {cancelText}
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              loading={loading}
              disabled={disableConfirm || loading}
              icon={getIcon()}
              fullWidth
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
