import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format} from "date-fns";
import { bookingService } from "../../../services/api/bookingService";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Select from "../../../components/ui/Select/Select";
import DataTable from "../../../components/ui/DataTable/DataTable";
import StatusBadge from "../../../components/shared/StatusBadge/StatusBadge";
import CalendarView from "../../../components/shared/CalendarView/CalendarView";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCalendar,
  faUser,
  faPhone,
  faUsers,
  faCheck,
  faTimes,
  faEnvelope,
  faPrint,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./TableBookings.module.css";

const TableBookings = () => {
  const queryClient = useQueryClient();
  const [view, setView] = useState("list"); // 'list' or 'calendar'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    status: "",
    date: format(new Date(), "yyyy-MM-dd"),
    search: "",
  });
  const [selectedBooking, setSelectedBooking] = useState(null);

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["tableBookings", filters],
    queryFn: () => bookingService.getTableBookings(filters),
  });

  const { data: stats } = useQuery({
    queryKey: ["tableBookingStats"],
    queryFn: () => bookingService.getTableBookingStats(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ bookingId, status }) =>
      bookingService.updateTableBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tableBookings"] });
      queryClient.invalidateQueries({ queryKey: ["tableBookingStats"] });
      setSelectedBooking(null);
    },
  });

  const handleStatusUpdate = (bookingId, status) => {
    updateStatusMutation.mutate({ bookingId, status });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setFilters((prev) => ({ ...prev, date: format(date, "yyyy-MM-dd") }));
  };

  const columns = [
    {
      key: "bookingNumber",
      header: "Booking #",
      render: (booking) => (
        <div className={styles.bookingId}>
          <strong>#{booking.bookingNumber}</strong>
          <div className={styles.bookingTime}>
            {format(new Date(booking.bookingTime), "HH:mm")}
          </div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (booking) => (
        <div className={styles.customerInfo}>
          <div className={styles.customerName}>
            <FontAwesomeIcon icon={faUser} />
            {booking.customerName}
          </div>
          <div className={styles.customerPhone}>
            <FontAwesomeIcon icon={faPhone} />
            {booking.customerPhone}
          </div>
        </div>
      ),
    },
    {
      key: "details",
      header: "Booking Details",
      render: (booking) => (
        <div className={styles.bookingDetails}>
          <div className={styles.detailRow}>
            <FontAwesomeIcon icon={faUsers} />
            <span>{booking.guests} guests</span>
          </div>
          <div className={styles.detailRow}>
            <FontAwesomeIcon icon={faCalendar} />
            <span>{format(new Date(booking.bookingDate), "MMM dd, yyyy")}</span>
          </div>
          {booking.tableNumber && (
            <div className={styles.detailRow}>
              <span>Table: {booking.tableNumber}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (booking) => (
        <div className={styles.statusCell}>
          <StatusBadge status={booking.status} type="booking" />
          <div className={styles.statusActions}>
            {booking.status === "pending" && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  icon={faCheck}
                  onClick={() => handleStatusUpdate(booking._id, "confirmed")}
                  title="Confirm"
                />
                <Button
                  variant="danger"
                  size="sm"
                  icon={faTimes}
                  onClick={() => handleStatusUpdate(booking._id, "cancelled")}
                  title="Cancel"
                />
              </>
            )}
            {booking.status === "confirmed" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusUpdate(booking._id, "seated")}
                title="Mark as Seated"
              >
                Seated
              </Button>
            )}
            {booking.status === "seated" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusUpdate(booking._id, "completed")}
                title="Mark as Completed"
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (booking) => (
        <div className={styles.actionButtons}>
          <Button
            variant="outline"
            size="sm"
            icon={faEnvelope}
            onClick={() => {
              /* Send confirmation email */
            }}
            title="Send Confirmation"
          />
          <Button
            variant="outline"
            size="sm"
            icon={faPrint}
            onClick={() => window.print()}
            title="Print Details"
          />
        </div>
      ),
    },
  ];

  const calendarEvents = useMemo(() => {
    if (!bookings) return [];

    return bookings.map((booking) => ({
      id: booking._id,
      title: `${booking.customerName} - ${booking.guests} guests`,
      start: new Date(`${booking.bookingDate}T${booking.bookingTime}`),
      end: new Date(
        new Date(`${booking.bookingDate}T${booking.bookingTime}`).getTime() +
          2 * 60 * 60 * 1000 // 2 hours duration
      ),
      status: booking.status,
      booking,
    }));
  }, [bookings]);

  return (
    <div className={styles.tableBookings}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Table Bookings</h1>
          <p className={styles.subtitle}>
            Manage restaurant table reservations
          </p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.viewToggle}>
            <Button
              variant={view === "list" ? "primary" : "outline"}
              onClick={() => setView("list")}
            >
              List View
            </Button>
            <Button
              variant={view === "calendar" ? "primary" : "outline"}
              onClick={() => setView("calendar")}
            >
              Calendar View
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "rgba(245, 158, 11, 0.1)" }}
            >
              <FontAwesomeIcon
                icon={faClock}
                style={{ color: "var(--warning)" }}
              />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats?.pending || 0}</div>
              <div className={styles.statLabel}>Pending</div>
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
                icon={faCheck}
                style={{ color: "var(--success)" }}
              />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats?.confirmed || 0}</div>
              <div className={styles.statLabel}>Confirmed</div>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "rgba(59, 130, 246, 0.1)" }}
            >
              <FontAwesomeIcon
                icon={faUsers}
                style={{ color: "var(--primary)" }}
              />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats?.seated || 0}</div>
              <div className={styles.statLabel}>Seated</div>
            </div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <div
              className={styles.statIcon}
              style={{ backgroundColor: "rgba(107, 114, 128, 0.1)" }}
            >
              <FontAwesomeIcon
                icon={faCalendar}
                style={{ color: "var(--secondary)" }}
              />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats?.today || 0}</div>
              <div className={styles.statLabel}>Today</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div className={styles.searchBox}>
            <Input
              placeholder="Search by customer name or phone..."
              icon={faSearch}
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              fullWidth
            />
          </div>
          <Select
            options={[
              { value: "", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "confirmed", label: "Confirmed" },
              { value: "seated", label: "Seated" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
              { value: "no_show", label: "No Show" },
            ]}
            value={filters.status}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            placeholder="Filter by status"
          />
          <Input
            type="date"
            value={filters.date}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, date: e.target.value }))
            }
            icon={faCalendar}
          />
        </div>
      </Card>

      {/* Content based on view */}
      {view === "list" ? (
        <Card className={styles.tableCard}>
          <DataTable
            columns={columns}
            data={bookings || []}
            loading={isLoading}
            emptyMessage="No bookings found for the selected date"
          />
        </Card>
      ) : (
        <Card className={styles.calendarCard}>
          <CalendarView
            events={calendarEvents}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onEventClick={(event) => setSelectedBooking(event.booking)}
          />
        </Card>
      )}
    </div>
  );
};

export default TableBookings;
