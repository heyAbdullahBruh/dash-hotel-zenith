import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import webSocketService from "../../../services/websocket/websocketService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCheck,
  faTimes,
  faShoppingCart,
  faCalendar,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./RealTimeUpdates.module.css";

const RealTimeUpdates = () => {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // Request notification permission
    webSocketService.requestNotificationPermission();

    // Connect WebSocket
    webSocketService.connect();

    // Subscribe to connection events
    const unsubscribeConnect = webSocketService.subscribe(
      "connected",
      (connected) => {
        setIsConnected(connected);
        if (connected) {
          toast.success("Real-time updates connected");
        } else {
          toast.error("Disconnected from real-time updates");
        }
      }
    );

    // Subscribe to new orders
    const unsubscribeOrders = webSocketService.subscribe(
      "new_order",
      (order) => {
        addNotification({
          id: Date.now(),
          type: "order",
          title: "New Order",
          message: `Order #${order.orderNumber} from ${
            order.customer?.name || "Guest"
          }`,
          data: order,
          timestamp: new Date(),
          read: false,
        });

        // Invalidate orders query to refresh data
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["orderStats"] });
      }
    );

    // Subscribe to order updates
    const unsubscribeOrderUpdates = webSocketService.subscribe(
      "order_updated",
      (order) => {
        addNotification({
          id: Date.now(),
          type: "order_update",
          title: "Order Updated",
          message: `Order #${order.orderNumber} status changed to ${order.status}`,
          data: order,
          timestamp: new Date(),
          read: false,
        });

        // Invalidate specific order query
        queryClient.invalidateQueries({ queryKey: ["order", order._id] });
        queryClient.invalidateQueries({ queryKey: ["orders"] });
      }
    );

    // Subscribe to new bookings
    const unsubscribeBookings = webSocketService.subscribe(
      "new_booking",
      (booking) => {
        addNotification({
          id: Date.now(),
          type: "booking",
          title: "New Booking",
          message: `${booking.customerName} booked for ${
            booking.guests || booking.guestCount
          } guests`,
          data: booking,
          timestamp: new Date(),
          read: false,
        });

        queryClient.invalidateQueries({ queryKey: ["tableBookings"] });
        queryClient.invalidateQueries({ queryKey: ["eventBookings"] });
        queryClient.invalidateQueries({ queryKey: ["bookingStats"] });
      }
    );

    // Subscribe to new reviews
    const unsubscribeReviews = webSocketService.subscribe(
      "new_review",
      (review) => {
        addNotification({
          id: Date.now(),
          type: "review",
          title: "New Review",
          message: `New ${review.rating}★ review from ${review.customerName}`,
          data: review,
          timestamp: new Date(),
          read: false,
        });

        queryClient.invalidateQueries({ queryKey: ["reviews"] });
      }
    );

    // Cleanup on unmount
    return () => {
      unsubscribeConnect();
      unsubscribeOrders();
      unsubscribeOrderUpdates();
      unsubscribeBookings();
      unsubscribeReviews();
      webSocketService.disconnect();
    };
  }, [queryClient]);

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount((prev) => prev + 1);

    // Show toast notification
    toast.custom((t) => (
      <div
        className={`${styles.toastNotification} ${styles[notification.type]}`}
      >
        <div className={styles.toastIcon}>
          <FontAwesomeIcon icon={getNotificationIcon(notification.type)} />
        </div>
        <div className={styles.toastContent}>
          <div className={styles.toastTitle}>{notification.title}</div>
          <div className={styles.toastMessage}>{notification.message}</div>
        </div>
        <button
          className={styles.toastClose}
          onClick={() => toast.dismiss(t.id)}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    ));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "order":
      case "order_update":
        return faShoppingCart;
      case "booking":
        return faCalendar;
      case "review":
        return faStar;
      default:
        return faBell;
    }
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className={styles.realTimeUpdates}>
      {/* Connection Status */}
      <div
        className={`${styles.connectionStatus} ${
          isConnected ? styles.connected : styles.disconnected
        }`}
      >
        <div className={styles.statusDot} />
        <span>{isConnected ? "Connected" : "Disconnected"}</span>
      </div>

      {/* Notification Bell */}
      <div className={styles.notificationWrapper}>
        <button
          className={styles.notificationButton}
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <FontAwesomeIcon icon={faBell} />
          {unreadCount > 0 && (
            <span className={styles.notificationBadge}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && (
          <div className={styles.notificationsDropdown}>
            <div className={styles.dropdownHeader}>
              <h3>Notifications</h3>
              <div className={styles.headerActions}>
                <button onClick={markAllAsRead} className={styles.markAllRead}>
                  <FontAwesomeIcon icon={faCheck} />
                  Mark all read
                </button>
                <button
                  onClick={clearNotifications}
                  className={styles.clearAll}
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className={styles.notificationsList}>
              {notifications.length === 0 ? (
                <div className={styles.emptyNotifications}>
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`${styles.notificationItem} ${
                      !notification.read ? styles.unread : ""
                    } ${styles[notification.type]}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className={styles.notificationIcon}>
                      <FontAwesomeIcon
                        icon={getNotificationIcon(notification.type)}
                      />
                    </div>
                    <div className={styles.notificationContent}>
                      <div className={styles.notificationTitle}>
                        {notification.title}
                      </div>
                      <div className={styles.notificationMessage}>
                        {notification.message}
                      </div>
                      <div className={styles.notificationTime}>
                        {formatTime(notification.timestamp)}
                      </div>
                    </div>
                    {!notification.read && <div className={styles.unreadDot} />}
                  </div>
                ))
              )}
            </div>

            <div className={styles.dropdownFooter}>
              <button
                className={styles.viewAll}
                onClick={() => {
                  // Navigate to notifications page
                  setShowNotifications(false);
                }}
              >
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeUpdates;
