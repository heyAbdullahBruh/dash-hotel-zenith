import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUpload,
  faFile,
  faTimes,
  faEye,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../../ui/Button/Button";
import styles from "./DocumentUploader.module.css";

const DocumentUploader = ({
  documents = [],
  onDocumentsChange,
  maxFiles = 5,
  accept = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
}) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (documents.length + acceptedFiles.length > maxFiles) {
        alert(`You can only upload up to ${maxFiles} documents`);
        return;
      }

      const newDocuments = [...documents, ...acceptedFiles];
      onDocumentsChange(newDocuments);
    },
    [documents, maxFiles, onDocumentsChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true,
  });

  const removeDocument = (index) => {
    const newDocuments = [...documents];
    newDocuments.splice(index, 1);
    onDocumentsChange(newDocuments);
  };

  const getFileIcon = (file) => {
    if (file.type.includes("pdf")) return faFile;
    if (file.type.includes("word")) return faFile;
    if (file.type.includes("image")) return faFile;
    return faFile;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={styles.documentUploader}>
      {/* Upload Zone */}
      {documents.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`${styles.dropzone} ${
            isDragActive ? styles.dragActive : ""
          }`}
        >
          <input {...getInputProps()} />
          <FontAwesomeIcon icon={faUpload} className={styles.uploadIcon} />
          <p className={styles.dropzoneText}>
            {isDragActive
              ? "Drop the documents here..."
              : "Drag & drop documents here, or click to select"}
          </p>
          <p className={styles.dropzoneHint}>
            Supports PDF, Word, Images up to {maxSize / 1024 / 1024}MB
          </p>
        </div>
      )}

      {/* Documents List */}
      {documents.length > 0 && (
        <div className={styles.documentsList}>
          {documents.map((doc, index) => (
            <div key={index} className={styles.documentItem}>
              <div className={styles.documentIcon}>
                <FontAwesomeIcon icon={getFileIcon(doc)} />
              </div>

              <div className={styles.documentInfo}>
                <div className={styles.documentName}>{doc.name}</div>
                <div className={styles.documentMeta}>
                  <span className={styles.documentType}>
                    {doc.type.split("/")[1]?.toUpperCase()}
                  </span>
                  <span className={styles.documentSize}>
                    {formatFileSize(doc.size)}
                  </span>
                </div>
              </div>

              <div className={styles.documentActions}>
                {doc.type.includes("image") ? (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={faEye}
                    onClick={() =>
                      window.open(URL.createObjectURL(doc), "_blank")
                    }
                    title="Preview"
                  />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={faDownload}
                    onClick={() => {
                      const url = URL.createObjectURL(doc);
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = doc.name;
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                    title="Download"
                  />
                )}

                <Button
                  variant="danger"
                  size="sm"
                  icon={faTimes}
                  onClick={() => removeDocument(index)}
                  title="Remove"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter */}
      <div className={styles.counter}>
        <span>
          {documents.length} / {maxFiles} documents
        </span>
      </div>
    </div>
  );
};

export default DocumentUploader;
