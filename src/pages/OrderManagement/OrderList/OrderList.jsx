import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { orderService } from "../../../services/api/orderService";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Select from "../../../components/ui/Select/Select";
import DataTable from "../../../components/ui/DataTable/DataTable";
import StatusBadge from "../../../components/shared/StatusBadge/StatusBadge";
import DateRangePicker from "../../../components/shared/DateRangePicker/DateRangePicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faEye,
  faFileExport,
  faPrint,
  faCalendar,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./OrderList.module.css";
import useDebounce  from "../../../hooks/useDebounce";

const ORDER_STATUSES = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "accepted", label: "Accepted", color: "blue" },
  { value: "preparing", label: "Preparing", color: "indigo" },
  { value: "ready", label: "Ready", color: "purple" },
  { value: "out_for_delivery", label: "Out for Delivery", color: "green" },
  { value: "delivered", label: "Delivered", color: "teal" },
  { value: "completed", label: "Completed", color: "teal" },
  { value: "cancelled", label: "Cancelled", color: "red" },
];

const ORDER_TYPES = [
  { value: "", label: "All Types" },
  { value: "dine_in", label: "Dine-in" },
  { value: "takeaway", label: "Takeaway" },
  { value: "delivery", label: "Delivery" },
];

const OrderList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    dateRange: {
      start: subDays(new Date(), 7),
      end: new Date(),
    },
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const debouncedSearch = useDebounce(search, 500);

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit,
      search: debouncedSearch,
      status: filters.status,
      type: filters.type,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };

    if (filters.dateRange.start && filters.dateRange.end) {
      params.startDate = startOfDay(filters.dateRange.start).toISOString();
      params.endDate = endOfDay(filters.dateRange.end).toISOString();
    }

    return params;
  }, [page, limit, debouncedSearch, filters]);

  const {
    data: orders,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["orders", queryParams],
    queryFn: () => orderService.getAllOrders(queryParams),
    keepPreviousData: true,
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleDateRangeChange = (range) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const response = await orderService.exportOrders(queryParams);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `orders-${format(new Date(), "yyyy-MM-dd")}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const columns = [
    {
      key: "orderNumber",
      header: "Order #",
      sortable: true,
      render: (order) => (
        <div className={styles.orderId}>
          <strong>#{order.orderNumber}</strong>
          <span className={styles.orderType}>{order.type}</span>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (order) => (
        <div className={styles.customerInfo}>
          <div className={styles.customerName}>
            {order.customer?.name || "Guest"}
          </div>
          {order.customer?.phone && (
            <div className={styles.customerPhone}>{order.customer.phone}</div>
          )}
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      render: (order) => (
        <div className={styles.orderItems}>
          {order.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className={styles.orderItem}>
              {item.quantity}x {item.food?.name}
            </div>
          ))}
          {order.items.length > 2 && (
            <div className={styles.moreItems}>
              +{order.items.length - 2} more
            </div>
          )}
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      sortable: true,
      render: (order) => (
        <div className={styles.orderTotal}>
          <div className={styles.totalAmount}>
            ${order.totalAmount.toFixed(2)}
          </div>
          {order.paymentMethod && (
            <div className={styles.paymentMethod}>{order.paymentMethod}</div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (order) => (
        <div className={styles.statusCell}>
          <StatusBadge status={order.status} type="order" />
          <div className={styles.statusTime}>
            {format(new Date(order.updatedAt), "MMM dd, HH:mm")}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (order) => (
        <div className={styles.actionButtons}>
          <Button
            variant="outline"
            size="sm"
            icon={faEye}
            onClick={() => navigate(`/orders/${order._id}`)}
            title="View Details"
          />
          <Button
            variant="outline"
            size="sm"
            icon={faPrint}
            onClick={() =>
              window.open(`/orders/${order._id}/invoice`, "_blank")
            }
            title="Print Invoice"
          />
          {order.status === "pending" && (
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                navigate(`/orders/${order._id}?action=update-status`)
              }
            >
              Process
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.orderList}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Order Management</h1>
          <p className={styles.subtitle}>Track and manage customer orders</p>
        </div>
        <div className={styles.headerRight}>
          <Button
            variant="outline"
            icon={faRefresh}
            onClick={() => refetch()}
            loading={isLoading}
          >
            Refresh
          </Button>
          <Button variant="primary" icon={faFileExport} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <div className={styles.searchBox}>
            <Input
              placeholder="Search by order # or customer..."
              icon={faSearch}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
          </div>

          <Select
            options={ORDER_STATUSES}
            value={filters.status}
            onChange={(value) => handleFilterChange("status", value)}
            placeholder="Filter by status"
          />

          <Select
            options={ORDER_TYPES}
            value={filters.type}
            onChange={(value) => handleFilterChange("type", value)}
            placeholder="Filter by type"
          />

          <DateRangePicker
            value={filters.dateRange}
            onChange={handleDateRangeChange}
            maxRange={30}
          />
        </div>
      </Card>

      {/* Stats Summary */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
            >
              <FontAwesomeIcon
                icon={faFilter}
                style={{ color: "var(--primary)" }}
              />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>
                {orders?.stats?.pending || 0}
              </div>
              <div className={styles.statLabel}>Pending Orders</div>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "rgba(16, 185, 129, 0.1)" }}
            >
              <FontAwesomeIcon
                icon={faCalendar}
                style={{ color: "var(--success)" }}
              />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>
                {orders?.stats?.today || 0}
              </div>
              <div className={styles.statLabel}>Today's Orders</div>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <FontAwesomeIcon
                icon={faFilter}
                style={{ color: "var(--warning)" }}
              />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>
                ${orders?.stats?.revenue || 0}
              </div>
              <div className={styles.statLabel}>Today's Revenue</div>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            >
              <FontAwesomeIcon
                icon={faFilter}
                style={{ color: "var(--danger)" }}
              />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>
                {orders?.stats?.cancelled || 0}
              </div>
              <div className={styles.statLabel}>Cancelled</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Data Table */}
      <Card className={styles.tableCard}>
        <DataTable
          columns={columns}
          data={orders?.data || []}
          loading={isLoading}
          totalItems={orders?.total || 0}
          page={page}
          limit={limit}
          onPageChange={setPage}
          sortBy={filters.sortBy}
          sortOrder={filters.sortOrder}
          onSort={(sortBy, sortOrder) => {
            handleFilterChange("sortBy", sortBy);
            handleFilterChange("sortOrder", sortOrder);
          }}
          emptyMessage="No orders found. Start accepting orders!"
        />
      </Card>
    </div>
  );
};

export default OrderList;
