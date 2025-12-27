import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faCalendar,
  faTimes,
  faSave,
  faHistory,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../../ui/Button/Button";
import Input from "../../ui/Input/Input";
import Select from "../../ui/Select/Select";
import DateRangePicker from "../DateRangePicker/DateRangePicker";
import styles from "./AdvancedSearch.module.css";

const AdvancedSearch = ({
  filters = {},
  onSearch,
  onSaveFilter,
  savedFilters = [],
  onLoadFilter,
  filterConfig = [],
  module = "orders",
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [filterName, setFilterName] = useState("");
  const [activeSavedFilter, setActiveSavedFilter] = useState(null);

  const defaultConfig = {
    orders: [
      {
        key: "status",
        type: "select",
        label: "Status",
        options: [
          { value: "", label: "All Statuses" },
          { value: "pending", label: "Pending" },
          { value: "accepted", label: "Accepted" },
          { value: "preparing", label: "Preparing" },
          { value: "ready", label: "Ready" },
          { value: "delivered", label: "Delivered" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ],
      },
      {
        key: "type",
        type: "select",
        label: "Order Type",
        options: [
          { value: "", label: "All Types" },
          { value: "dine_in", label: "Dine-in" },
          { value: "takeaway", label: "Takeaway" },
          { value: "delivery", label: "Delivery" },
        ],
      },
      {
        key: "paymentStatus",
        type: "select",
        label: "Payment Status",
        options: [
          { value: "", label: "All" },
          { value: "paid", label: "Paid" },
          { value: "pending", label: "Pending" },
        ],
      },
      { key: "dateRange", type: "dateRange", label: "Date Range" },
      {
        key: "minAmount",
        type: "number",
        label: "Min Amount",
        placeholder: "0.00",
      },
      {
        key: "maxAmount",
        type: "number",
        label: "Max Amount",
        placeholder: "1000.00",
      },
    ],
    foods: [
      { key: "category", type: "select", label: "Category", options: [] },
      {
        key: "availability",
        type: "select",
        label: "Availability",
        options: [
          { value: "", label: "All" },
          { value: "available", label: "Available" },
          { value: "unavailable", label: "Unavailable" },
        ],
      },
      {
        key: "minPrice",
        type: "number",
        label: "Min Price",
        placeholder: "0.00",
      },
      {
        key: "maxPrice",
        type: "number",
        label: "Max Price",
        placeholder: "100.00",
      },
      {
        key: "hasDiscount",
        type: "select",
        label: "Has Discount",
        options: [
          { value: "", label: "All" },
          { value: "true", label: "Yes" },
          { value: "false", label: "No" },
        ],
      },
    ],
    bookings: [
      {
        key: "status",
        type: "select",
        label: "Status",
        options: [
          { value: "", label: "All Statuses" },
          { value: "pending", label: "Pending" },
          { value: "confirmed", label: "Confirmed" },
          { value: "seated", label: "Seated" },
          { value: "completed", label: "Completed" },
          { value: "cancelled", label: "Cancelled" },
        ],
      },
      { key: "dateRange", type: "dateRange", label: "Booking Date" },
      {
        key: "minGuests",
        type: "number",
        label: "Min Guests",
        placeholder: "1",
      },
      {
        key: "maxGuests",
        type: "number",
        label: "Max Guests",
        placeholder: "50",
      },
    ],
  };

  const config =
    filterConfig.length > 0 ? filterConfig : defaultConfig[module] || [];

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(localFilters);
    setShowAdvanced(false);
  };

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      alert("Please enter a name for this filter");
      return;
    }

    const filterToSave = {
      id: Date.now().toString(),
      name: filterName,
      filters: localFilters,
      module,
      createdAt: new Date().toISOString(),
    };

    onSaveFilter?.(filterToSave);
    setFilterName("");
    alert("Filter saved successfully!");
  };

  const handleLoadFilter = (filter) => {
    setLocalFilters(filter.filters);
    setActiveSavedFilter(filter.id);
    onLoadFilter?.(filter.filters);
  };

  const handleReset = () => {
    const resetFilters = {};
    config.forEach((field) => {
      resetFilters[field.key] =
        field.type === "dateRange" ? { start: null, end: null } : "";
    });
    setLocalFilters(resetFilters);
    setActiveSavedFilter(null);
    onSearch(resetFilters);
  };

  const renderFilterField = (field) => {
    switch (field.type) {
      case "select":
        return (
          <Select
            key={field.key}
            label={field.label}
            options={field.options || []}
            value={localFilters[field.key] || ""}
            onChange={(value) => handleFilterChange(field.key, value)}
            placeholder={`Select ${field.label}`}
          />
        );

      case "dateRange":
        return (
          <DateRangePicker
            key={field.key}
            label={field.label}
            value={localFilters[field.key] || { start: null, end: null }}
            onChange={(value) => handleFilterChange(field.key, value)}
          />
        );

      case "number":
        return (
          <Input
            key={field.key}
            label={field.label}
            type="number"
            placeholder={field.placeholder}
            value={localFilters[field.key] || ""}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
          />
        );

      case "text":
        return (
          <Input
            key={field.key}
            label={field.label}
            placeholder={field.placeholder}
            value={localFilters[field.key] || ""}
            onChange={(e) => handleFilterChange(field.key, e.target.value)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.advancedSearch}>
      {/* Quick Search Bar */}
      <div className={styles.quickSearch}>
        <div className={styles.searchInput}>
          <Input
            placeholder="Search..."
            icon={faSearch}
            value={localFilters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            fullWidth
          />
        </div>

        <Button
          variant="outline"
          icon={faFilter}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          Filters{" "}
          {Object.keys(localFilters).filter((k) => localFilters[k]).length >
            0 &&
            `(${
              Object.keys(localFilters).filter((k) => localFilters[k]).length
            })`}
        </Button>

        <Button variant="primary" onClick={handleSearch} loading={false}>
          Search
        </Button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className={styles.advancedPanel}>
          <div className={styles.panelHeader}>
            <h3>Advanced Filters</h3>
            <Button
              variant="outline"
              size="sm"
              icon={faTimes}
              onClick={() => setShowAdvanced(false)}
            />
          </div>

          <div className={styles.filterGrid}>
            {config.map((field) => renderFilterField(field))}
          </div>

          {/* Saved Filters */}
          {savedFilters.length > 0 && (
            <div className={styles.savedFilters}>
              <h4>
                <FontAwesomeIcon icon={faHistory} />
                Saved Filters
              </h4>
              <div className={styles.filterChips}>
                {savedFilters.map((filter) => (
                  <button
                    key={filter.id}
                    className={`${styles.filterChip} ${
                      activeSavedFilter === filter.id ? styles.active : ""
                    }`}
                    onClick={() => handleLoadFilter(filter)}
                  >
                    {filter.name}
                    <FontAwesomeIcon
                      icon={faTimes}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.panelActions}>
            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>

            <div className={styles.saveFilter}>
              <Input
                placeholder="Save filter as..."
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                size="sm"
              />
              <Button
                variant="outline"
                icon={faSave}
                onClick={handleSaveFilter}
                disabled={!filterName.trim()}
              >
                Save
              </Button>
            </div>

            <Button variant="primary" onClick={handleSearch}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
