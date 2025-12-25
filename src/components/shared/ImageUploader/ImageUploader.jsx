import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faTimes } from "@fortawesome/free-solid-svg-icons";
import Button from "../../ui/Button/Button";
import styles from "./ImageUploader.module.css";

const ImageUploader = ({
  images = [],
  onImagesChange,
  maxImages = 5,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB
}) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (images.length + acceptedFiles.length > maxImages) {
        alert(`You can only upload up to ${maxImages} images`);
        return;
      }

      const newImages = [...images, ...acceptedFiles];
      onImagesChange(newImages);
    },
    [images, maxImages, onImagesChange]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: true,
  });

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  const isImageFile = (file) => {
    return file instanceof File;
  };

  const getImageUrl = (image) => {
    if (isImageFile(image)) {
      return URL.createObjectURL(image);
    }
    return image;
  };

  return (
    <div className={styles.imageUploader}>
      {/* Upload Zone */}
      {images.length < maxImages && (
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
              ? "Drop the images here..."
              : "Drag & drop images here, or click to select"}
          </p>
          <p className={styles.dropzoneHint}>
            Supports JPG, PNG up to {maxSize / 1024 / 1024}MB
          </p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className={styles.imageGrid}>
          {images.map((image, index) => (
            <div key={index} className={styles.imageItem}>
              <div className={styles.imageWrapper}>
                <img
                  src={getImageUrl(image)}
                  alt={`Preview ${index + 1}`}
                  className={styles.previewImage}
                  onLoad={() => {
                    if (isImageFile(image)) {
                      URL.revokeObjectURL(getImageUrl(image));
                    }
                  }}
                />
                <Button
                  variant="danger"
                  size="sm"
                  icon={faTimes}
                  className={styles.removeButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  title="Remove image"
                />
              </div>
              <div className={styles.imageInfo}>
                {isImageFile(image) && (
                  <span className={styles.imageName}>{image.name}</span>
                )}
                <span className={styles.imageSize}>
                  {isImageFile(image)
                    ? `${(image.size / 1024).toFixed(1)} KB`
                    : "Uploaded"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter */}
      <div className={styles.counter}>
        <span>
          {images.length} / {maxImages} images
        </span>
      </div>
    </div>
  );
};

export default ImageUploader;
