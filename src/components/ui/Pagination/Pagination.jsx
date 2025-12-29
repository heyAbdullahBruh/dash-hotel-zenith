import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faEllipsis,
  faAngleDoubleLeft,
  faAngleDoubleRight,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../Button/Button";
import Input from "../Input/Input";
import Select from "../Select/Select";
import styles from "./Pagination.module.css";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  showPageSize = true,
  pageSizeOptions = [5, 10, 20, 50, 100],
  pageSize = 10,
  onPageSizeChange,
  showQuickJump = true,
  showPageNumbers = true,
  showFirstLast = true,
  showPrevNext = true,
  maxVisiblePages = 5,
  className,
}) => {
  const [jumpPage, setJumpPage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setJumpPage("");
  }, [currentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(jumpPage);
    if (page >= 1 && page <= totalPages) {
      handlePageChange(page);
      setJumpPage("");
      setIsEditing(false);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    // Add first page if needed
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push("ellipsis-start");
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Add last page if needed
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  const renderPageNumber = (page) => {
    if (page === "ellipsis-start" || page === "ellipsis-end") {
      return (
        <span key={page} className={styles.ellipsis}>
          <FontAwesomeIcon icon={faEllipsis} />
        </span>
      );
    }

    return (
      <button
        key={page}
        className={`${styles.pageButton} ${
          page === currentPage ? styles.active : ""
        }`}
        onClick={() => handlePageChange(page)}
        aria-label={`Go to page ${page}`}
        aria-current={page === currentPage ? "page" : undefined}
      >
        {page}
      </button>
    );
  };

  return (
    <div className={`${styles.pagination} ${className}`}>
      {/* Page Size Selector */}
      {showPageSize && totalPages > 0 && (
        <div className={styles.pageSizeSelector}>
          <span className={styles.pageSizeLabel}>Show</span>
          <Select
            options={pageSizeOptions.map((size) => ({
              value: size,
              label: `${size}`,
            }))}
            value={pageSize}
            onChange={onPageSizeChange}
            className={styles.pageSizeSelect}
            size="sm"
          />
          <span className={styles.pageSizeLabel}>entries</span>
        </div>
      )}

      {/* Page Navigation */}
      <div className={styles.pageNavigation}>
        {/* First Page */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            icon={faAngleDoubleLeft}
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className={styles.navButton}
            aria-label="Go to first page"
          />
        )}

        {/* Previous Page */}
        {showPrevNext && (
          <Button
            variant="outline"
            size="sm"
            icon={faChevronLeft}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.navButton}
            aria-label="Go to previous page"
          />
        )}

        {/* Page Numbers */}
        {showPageNumbers && totalPages > 0 && (
          <div className={styles.pageNumbers}>
            {generatePageNumbers().map(renderPageNumber)}
          </div>
        )}

        {/* Next Page */}
        {showPrevNext && (
          <Button
            variant="outline"
            size="sm"
            icon={faChevronRight}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.navButton}
            aria-label="Go to next page"
          />
        )}

        {/* Last Page */}
        {showFirstLast && (
          <Button
            variant="outline"
            size="sm"
            icon={faAngleDoubleRight}
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={styles.navButton}
            aria-label="Go to last page"
          />
        )}
      </div>

      {/* Page Info & Quick Jump */}
      <div className={styles.pageInfo}>
        <span className={styles.pageInfoText}>
          Page {currentPage} of {totalPages}
        </span>

        {showQuickJump && totalPages > 1 && (
          <form
            className={styles.quickJump}
            onSubmit={handleJumpSubmit}
            onBlur={() => setIsEditing(false)}
          >
            {isEditing ? (
              <div className={styles.jumpInputWrapper}>
                <Input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  onBlur={handleJumpSubmit}
                  placeholder={`1-${totalPages}`}
                  className={styles.jumpInput}
                  size="sm"
                  autoFocus
                />
                <button
                  type="submit"
                  className={styles.jumpButton}
                  aria-label="Jump to page"
                >
                  Go
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.jumpTrigger}
                onClick={() => setIsEditing(true)}
              >
                Go to page
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default Pagination;
