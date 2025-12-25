import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { orderService } from "../../../services/api/orderService";
import Card from "../../../components/ui/Card/Card";
import Button from "../../../components/ui/Button/Button";
import StatusBadge from "../../../components/shared/StatusBadge/StatusBadge";
import Timeline from "../../../components/shared/Timeline/Timeline";
import Modal from "../../../components/ui/Modal/Modal";
import Select from "../../../components/ui/Select/Select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPrint,
  faClock,
  faUser,
  faPhone,
  faMapMarkerAlt,
  faCreditCard,
  faReceipt,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./OrderDetail.module.css";

const STATUS_FLOW = [
  "pending",
  "accepted",
  "preparing",
  "ready",
  "out_for_delivery",
  "delivered",
  "completed",
];

const OrderDetail = () => {
  const { orderId } = useParams();
//   const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [note, setNote] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => orderService.getOrder(orderId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data) => orderService.updateOrderStatus(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      setShowStatusModal(false);
      setNote("");
    },
  });

  const handleStatusUpdate = () => {
    if (selectedStatus) {
      updateStatusMutation.mutate({
        status: selectedStatus,
        note,
      });
    }
  };

  const calculateTimeline = () => {
    if (!order) return [];

    const timeline = [];

    if (order.createdAt) {
      timeline.push({
        status: "Order Placed",
        description: "Order was placed by customer",
        time: order.createdAt,
        completed: true,
      });
    }

    if (order.acceptedAt) {
      timeline.push({
        status: "Order Accepted",
        description: "Order was accepted by kitchen",
        time: order.acceptedAt,
        completed: true,
      });
    }

    if (order.preparingAt) {
      timeline.push({
        status: "Preparing",
        description: "Kitchen started preparing the order",
        time: order.preparingAt,
        completed: true,
      });
    }

    if (order.readyAt) {
      timeline.push({
        status: "Ready",
        description: "Order is ready for pickup/delivery",
        time: order.readyAt,
        completed: true,
      });
    }

    if (order.deliveredAt) {
      timeline.push({
        status: "Delivered",
        description: "Order was delivered to customer",
        time: order.deliveredAt,
        completed: true,
      });
    }

    if (order.completedAt) {
      timeline.push({
        status: "Completed",
        description: "Order was marked as completed",
        time: order.completedAt,
        completed: true,
      });
    }

    return timeline;
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading order details...</div>;
  }

  if (!order) {
    return <div className={styles.notFound}>Order not found</div>;
  }

  const currentStatusIndex = STATUS_FLOW.indexOf(order.status);
  const availableStatuses = STATUS_FLOW.slice(currentStatusIndex + 1);

  return (
    <div className={styles.orderDetail}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Button
            variant="outline"
            icon={faArrowLeft}
            onClick={() => window.history.back()}
          >
            Back
          </Button>
          <div className={styles.orderHeader}>
            <h1 className={styles.title}>Order #{order.orderNumber}</h1>
            <div className={styles.orderMeta}>
              <span className={styles.orderDate}>
                {format(new Date(order.createdAt), "MMM dd, yyyy HH:mm")}
              </span>
              <StatusBadge status={order.status} type="order" />
            </div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <Button
            variant="outline"
            icon={faPrint}
            onClick={() => window.print()}
          >
            Print Invoice
          </Button>
          {order.status !== "cancelled" && order.status !== "completed" && (
            <Button variant="primary" onClick={() => setShowStatusModal(true)}>
              Update Status
            </Button>
          )}
        </div>
      </div>

      <div className={styles.contentGrid}>
        {/* Left Column - Order Details */}
        <div className={styles.leftColumn}>
          {/* Customer Info */}
          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faUser} />
              Customer Information
            </h3>
            <div className={styles.customerInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Name:</span>
                <span className={styles.infoValue}>
                  {order.customer?.name || "Guest"}
                </span>
              </div>
              {order.customer?.email && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Email:</span>
                  <span className={styles.infoValue}>
                    {order.customer.email}
                  </span>
                </div>
              )}
              {order.customer?.phone && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    <FontAwesomeIcon icon={faPhone} />
                    Phone:
                  </span>
                  <span className={styles.infoValue}>
                    {order.customer.phone}
                  </span>
                </div>
              )}
              {order.deliveryAddress && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    Delivery Address:
                  </span>
                  <span className={styles.infoValue}>
                    {order.deliveryAddress}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Order Items */}
          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faReceipt} />
              Order Items
            </h3>
            <div className={styles.orderItems}>
              {order.items.map((item, index) => (
                <div key={index} className={styles.orderItem}>
                  <div className={styles.itemMain}>
                    <div className={styles.itemInfo}>
                      <div className={styles.itemName}>{item.food?.name}</div>
                      <div className={styles.itemPrice}>
                        ${item.food?.price.toFixed(2)} each
                      </div>
                    </div>
                    <div className={styles.itemQuantity}>x{item.quantity}</div>
                  </div>
                  <div className={styles.itemSubtotal}>
                    ${(item.quantity * item.food?.price).toFixed(2)}
                  </div>
                  {item.specialInstructions && (
                    <div className={styles.itemNotes}>
                      <strong>Notes:</strong> {item.specialInstructions}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.orderSummary}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>${order.subtotal?.toFixed(2) || "0.00"}</span>
              </div>
              {order.taxAmount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Tax</span>
                  <span>${order.taxAmount.toFixed(2)}</span>
                </div>
              )}
              {order.deliveryFee > 0 && (
                <div className={styles.summaryRow}>
                  <span>Delivery Fee</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              {order.discountAmount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Discount</span>
                  <span>-${order.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className={styles.summaryRowTotal}>
                <span>Total</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Timeline & Actions */}
        <div className={styles.rightColumn}>
          {/* Order Timeline */}
          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faClock} />
              Order Timeline
            </h3>
            <Timeline items={calculateTimeline()} />
          </Card>

          {/* Payment Information */}
          <Card className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <FontAwesomeIcon icon={faCreditCard} />
              Payment Information
            </h3>
            <div className={styles.paymentInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Payment Method:</span>
                <span className={styles.infoValue}>
                  {order.paymentMethod || "Not specified"}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Payment Status:</span>
                <span className={styles.infoValue}>
                  {order.paymentStatus === "paid" ? (
                    <span className={styles.paidStatus}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                      Paid
                    </span>
                  ) : (
                    <span className={styles.unpaidStatus}>
                      <FontAwesomeIcon icon={faTimesCircle} />
                      Pending
                    </span>
                  )}
                </span>
              </div>
              {order.paymentId && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Transaction ID:</span>
                  <span className={styles.infoValue}>{order.paymentId}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Order Notes */}
          {order.notes && order.notes.length > 0 && (
            <Card className={styles.section}>
              <h3 className={styles.sectionTitle}>Order Notes</h3>
              <div className={styles.orderNotes}>
                {order.notes.map((note, index) => (
                  <div key={index} className={styles.noteItem}>
                    <div className={styles.noteContent}>{note.content}</div>
                    <div className={styles.noteMeta}>
                      <span className={styles.noteAuthor}>{note.author}</span>
                      <span className={styles.noteTime}>
                        {format(new Date(note.createdAt), "MMM dd, HH:mm")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="Update Order Status"
        size="md"
      >
        <div className={styles.statusModal}>
          <div className={styles.currentStatus}>
            <strong>Current Status:</strong>
            <StatusBadge status={order.status} type="order" />
          </div>

          <div className={styles.statusSelect}>
            <label>Select new status:</label>
            <Select
              options={availableStatuses.map((status) => ({
                value: status,
                label: status.replace(/_/g, " ").toUpperCase(),
              }))}
              value={selectedStatus}
              onChange={setSelectedStatus}
              placeholder="Select status"
            />
          </div>

          <div className={styles.noteInput}>
            <label>Add a note (optional):</label>
            <textarea
              className={styles.textarea}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this status change..."
              rows={3}
            />
          </div>

          <div className={styles.modalActions}>
            <Button variant="outline" onClick={() => setShowStatusModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusUpdate}
              loading={updateStatusMutation.isPending}
              disabled={!selectedStatus}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderDetail;
