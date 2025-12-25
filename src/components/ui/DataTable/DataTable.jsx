import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSort,
  faSortUp,
  faSortDown,
//   faChevronLeft,
//   faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../Button/Button";
import Loader from "../Loader/Loader";
import Pagination from "../Pagination/Pagination";
import styles from "./DataTable.module.css";
import clsx from "clsx";

const DataTable = ({
  columns,
  data,
  loading = false,
  totalItems = 0,
  page = 1,
  limit = 10,
  onPageChange,
  onSort,
  sortBy,
  sortOrder,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  emptyMessage = "No data found",
  className,
}) => {
  const totalPages = Math.ceil(totalItems / limit);
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalItems);

  const handleSort = (column) => {
    if (column.sortable && onSort) {
      const newSortOrder =
        sortBy === column.key && sortOrder === "asc" ? "desc" : "asc";
      onSort(column.key, newSortOrder);
    }
  };

  const getSortIcon = (column) => {
    if (!column.sortable) return null;
    if (sortBy !== column.key) return faSort;
    return sortOrder === "asc" ? faSortUp : faSortDown;
  };

  if (loading && !data.length) {
    return (
      <div className={styles.tableLoading}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={clsx(styles.dataTable, className)}>
      {/* Table Container */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              {selectable && (
                <th className={styles.selectColumn}>
                  <input
                    type="checkbox"
                    checked={
                      data.length > 0 && selectedRows.length === data.length
                    }
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className={styles.checkbox}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={clsx(styles.columnHeader, {
                    [styles.sortable]: column.sortable,
                  })}
                  style={{ width: column.width }}
                  onClick={() => handleSort(column)}
                >
                  <div className={styles.headerContent}>
                    <span>{column.header}</span>
                    {column.sortable && (
                      <FontAwesomeIcon
                        icon={getSortIcon(column)}
                        className={styles.sortIcon}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {data.length === 0 ? (
              <tr className={styles.emptyRow}>
                <td colSpan={columns.length + (selectable ? 1 : 0)}>
                  <div className={styles.emptyState}>
                    <p>{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || row._id || rowIndex}
                  className={clsx(styles.tableRow, {
                    [styles.selected]: selectedRows.includes(row.id || row._id),
                  })}
                >
                  {selectable && (
                    <td className={styles.selectCell}>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id || row._id)}
                        onChange={(e) =>
                          onSelectRow?.(row.id || row._id, e.target.checked)
                        }
                        className={styles.checkbox}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className={styles.tableCell}>
                      {column.render
                        ? column.render(row, rowIndex)
                        : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      {data.length > 0 && (
        <div className={styles.tableFooter}>
          <div className={styles.footerInfo}>
            Showing {startItem} to {endItem} of {totalItems} entries
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default DataTable;
