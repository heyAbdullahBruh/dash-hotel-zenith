import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { bookingService } from "../../../services/api/bookingService";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import Input from "../../../components/ui/Input/Input";
import Select from "../../../components/ui/Select/Select";
import DataTable from "../../../components/ui/DataTable/DataTable";
import StatusBadge from "../../../components/shared/StatusBadge/StatusBadge";
import ProgressBar from "../../../components/shared/ProgressBar/ProgressBar";
import DocumentUploader from "../../../components/shared/DocumentUploader/DocumentUploader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faCalendar,
  faUsers,
  faMoneyBill,
  faFile,
  faComment,
  faCheck,
  faTimes,
  faEye,
  faEdit,
  faPaperclip,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./EventBookings.module.css";

const EventBookings = () => {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    eventType: "",
    dateRange: {
      start: null,
      end: null,
    },
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ["eventBookings", filters],
    queryFn: () => bookingService.getEventBookings(filters),
  });

  const { data: stats } = useQuery({
    queryKey: ["eventBookingStats"],
    queryFn: () => bookingService.getEventBookingStats(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ bookingId, status }) =>
      bookingService.updateEventBookingStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventBookings"] });
      queryClient.invalidateQueries({ queryKey: ["eventBookingStats"] });
    },
  });

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleStatusUpdate = (eventId, status) => {
    updateStatusMutation.mutate({ bookingId: eventId, status });
  };

  const columns = [
    {
      key: "eventNumber",
      header: "Event #",
      render: (event) => (
        <div className={styles.eventId}>
          <strong>#{event.eventNumber}</strong>
          <div className={styles.eventType}>{event.eventType}</div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (event) => (
        <div className={styles.customerInfo}>
          <div className={styles.customerName}>
            <FontAwesomeIcon icon={faUsers} />
            {event.customerName}
          </div>
          <div className={styles.customerContact}>
            <span>{event.customerEmail}</span>
            {event.customerPhone && (
              <span className={styles.phone}>
                <FontAwesomeIcon icon={faPhone} />
                {event.customerPhone}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "eventDetails",
      header: "Event Details",
      render: (event) => (
        <div className={styles.eventDetails}>
          <div className={styles.detailRow}>
            <FontAwesomeIcon icon={faCalendar} />
            <span>{format(parseISO(event.eventDate), "MMM dd, yyyy")}</span>
          </div>
          <div className={styles.detailRow}>
            <FontAwesomeIcon icon={faUsers} />
            <span>{event.guestCount} guests</span>
          </div>
          <div className={styles.detailRow}>
            <FontAwesomeIcon icon={faMoneyBill} />
            <span>${event.totalBudget.toFixed(2)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "budgetProgress",
      header: "Budget Progress",
      render: (event) => (
        <div className={styles.budgetProgress}>
          <ProgressBar
            value={event.spentAmount || 0}
            max={event.totalBudget}
            formatValue={(value) => `$${value.toFixed(2)}`}
            showPercentage
          />
          <div className={styles.budgetInfo}>
            <span>Spent: ${(event.spentAmount || 0).toFixed(2)}</span>
            <span>
              Remaining: $
              {(event.totalBudget - (event.spentAmount || 0)).toFixed(2)}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (event) => (
        <div className={styles.statusCell}>
          <StatusBadge status={event.status} type="booking" />
          <div className={styles.statusActions}>
            {event.status === "pending" && (
              <>
                <Button
                  variant="success"
                  size="sm"
                  icon={faCheck}
                  onClick={() => handleStatusUpdate(event._id, "confirmed")}
                  title="Confirm"
                />
                <Button
                  variant="danger"
                  size="sm"
                  icon={faTimes}
                  onClick={() => handleStatusUpdate(event._id, "cancelled")}
                  title="Cancel"
                />
              </>
            )}
            {event.status === "confirmed" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusUpdate(event._id, "in_progress")}
                title="Mark as In Progress"
              >
                Start
              </Button>
            )}
            {event.status === "in_progress" && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusUpdate(event._id, "completed")}
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
      render: (event) => (
        <div className={styles.actionButtons}>
          <Button
            variant="outline"
            size="sm"
            icon={faEye}
            onClick={() => handleViewDetails(event)}
            title="View Details"
          />
          <Button
            variant="outline"
            size="sm"
            icon={faEdit}
            onClick={() => {
              /* Edit event */
            }}
            title="Edit"
          />
          <Button
            variant="outline"
            size="sm"
            icon={faPaperclip}
            onClick={() => {
              /* Manage documents */
            }}
            title="Documents"
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.eventBookings}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Event Bookings</h1>
          <p className={styles.subtitle}>Manage corporate and private events</p>
        </div>
        <div className={styles.headerRight}>
          <Button
            variant="primary"
            onClick={() => {
              /* Create new event */
            }}
          >
            Create Event Plan
          </Button>
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
                icon={faCalendar}
                style={{ color: "var(--warning)" }}
              />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats?.upcoming || 0}</div>
              <div className={styles.statLabel}>Upcoming</div>
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
                icon={faMoneyBill}
                style={{ color: "var(--primary)" }}
              />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>
                ${stats?.totalRevenue || 0}
              </div>
              <div className={styles.statLabel}>Revenue</div>
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
                icon={faUsers}
                style={{ color: "var(--secondary)" }}
              />
            </div>
            <div className={styles.statInfo}>
              <div className={styles.statValue}>{stats?.totalGuests || 0}</div>
              <div className={styles.statLabel}>Guests</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className={styles.filterCard}>
        <div className={styles.filterGrid}>
          <div className={styles.searchBox}>
            <Input
              placeholder="Search by customer or event name..."
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
              { value: "in_progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ]}
            value={filters.status}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, status: value }))
            }
            placeholder="Filter by status"
          />

          <Select
            options={[
              { value: "", label: "All Event Types" },
              { value: "wedding", label: "Wedding" },
              { value: "corporate", label: "Corporate Event" },
              { value: "birthday", label: "Birthday Party" },
              { value: "conference", label: "Conference" },
              { value: "other", label: "Other" },
            ]}
            value={filters.eventType}
            onChange={(value) =>
              setFilters((prev) => ({ ...prev, eventType: value }))
            }
            placeholder="Filter by type"
          />
        </div>
      </Card>

      {/* Events Table */}
      <Card className={styles.tableCard}>
        <DataTable
          columns={columns}
          data={events || []}
          loading={isLoading}
          emptyMessage="No event bookings found"
        />
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
        />
      )}
    </div>
  );
};

// Event Details Modal Component
const EventDetailsModal = ({ event, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [newMessage, setNewMessage] = useState("");

  const tabs = [
    { id: "details", label: "Event Details", icon: faCalendar },
    { id: "timeline", label: "Timeline", icon: faCalendar },
    { id: "documents", label: "Documents", icon: faFile },
    { id: "communication", label: "Communication", icon: faComment },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Event #${event.eventNumber} - ${
        event.eventName || "Event Details"
      }`}
      size="xl"
    >
      <div className={styles.eventDetailsModal}>
        {/* Tabs */}
        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${
                activeTab === tab.id ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <FontAwesomeIcon icon={tab.icon} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {activeTab === "details" && (
            <div className={styles.detailsContent}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailSection}>
                  <h4>Customer Information</h4>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <strong>Name:</strong>
                      <span>{event.customerName}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <strong>Email:</strong>
                      <span>{event.customerEmail}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <strong>Phone:</strong>
                      <span>{event.customerPhone || "Not provided"}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <strong>Company:</strong>
                      <span>{event.companyName || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Event Information</h4>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <strong>Event Type:</strong>
                      <span>{event.eventType}</span>
                    </div>
                    <div className={styles.infoItem}>
                      <strong>Date:</strong>
                      <span>
                        {format(
                          parseISO(event.eventDate),
                          "EEEE, MMMM dd, yyyy"
                        )}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <strong>Time:</strong>
                      <span>
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <strong>Guests:</strong>
                      <span>{event.guestCount} people</span>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Budget Details</h4>
                  <div className={styles.budgetDetails}>
                    <ProgressBar
                      value={event.spentAmount || 0}
                      max={event.totalBudget}
                      formatValue={(value) => `$${value.toFixed(2)}`}
                      showPercentage
                      height="12px"
                    />
                    <div className={styles.budgetBreakdown}>
                      <div className={styles.budgetItem}>
                        <span>Total Budget:</span>
                        <strong>${event.totalBudget.toFixed(2)}</strong>
                      </div>
                      <div className={styles.budgetItem}>
                        <span>Amount Spent:</span>
                        <strong>${(event.spentAmount || 0).toFixed(2)}</strong>
                      </div>
                      <div className={styles.budgetItem}>
                        <span>Remaining:</span>
                        <strong>
                          $
                          {(
                            event.totalBudget - (event.spentAmount || 0)
                          ).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={styles.detailSection}>
                  <h4>Event Requirements</h4>
                  <div className={styles.requirements}>
                    {event.requirements?.map((req, index) => (
                      <div key={index} className={styles.requirementItem}>
                        <FontAwesomeIcon icon={faCheck} />
                        <span>{req}</span>
                      </div>
                    )) || "No specific requirements"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "documents" && (
            <div className={styles.documentsContent}>
              <DocumentUploader
                documents={event.documents || []}
                onDocumentsChange={(docs) => {
                  // Handle document updates
                }}
                maxFiles={10}
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
            </div>
          )}

          {activeTab === "communication" && (
            <div className={styles.communicationContent}>
              <div className={styles.messageList}>
                {event.messages?.map((message, index) => (
                  <div
                    key={index}
                    className={`${styles.message} ${
                      message.sender === "admin"
                        ? styles.adminMessage
                        : styles.customerMessage
                    }`}
                  >
                    <div className={styles.messageHeader}>
                      <strong>
                        {message.sender === "admin"
                          ? "Admin"
                          : event.customerName}
                      </strong>
                      <span className={styles.messageTime}>
                        {format(parseISO(message.timestamp), "MMM dd, HH:mm")}
                      </span>
                    </div>
                    <div className={styles.messageBody}>{message.content}</div>
                  </div>
                )) || <div className={styles.noMessages}>No messages yet</div>}
              </div>

              <div className={styles.messageInput}>
                <textarea
                  className={styles.textarea}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={3}
                />
                <Button
                  variant="primary"
                  onClick={() => {
                    // Send message
                    setNewMessage("");
                  }}
                >
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary">Save Changes</Button>
        </div>
      </div>
    </Modal>
  );
};

export default EventBookings;
