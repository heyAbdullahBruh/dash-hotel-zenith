class WebSocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.subscribers = new Map();
    this.eventHandlers = new Map();
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = localStorage.getItem("adminToken");
    const wsUrl = `ws://${window.location.host}/ws?token=${token}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("WebSocket connected");
      this.reconnectAttempts = 0;
      this.notifySubscribers("connected", true);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };

    this.socket.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason);
      this.notifySubscribers("connected", false);
      this.attemptReconnect();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);

    setTimeout(() => {
      this.connect();
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(eventType);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(eventType);
        }
      }
    };
  }

  notifySubscribers(eventType, data) {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error("Error in subscriber callback:", error);
        }
      });
    }
  }

  handleMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case "new_order":
        this.handleNewOrder(payload);
        break;
      case "order_updated":
        this.handleOrderUpdate(payload);
        break;
      case "new_booking":
        this.handleNewBooking(payload);
        break;
      case "booking_updated":
        this.handleBookingUpdate(payload);
        break;
      case "new_review":
        this.handleNewReview(payload);
        break;
      case "notification":
        this.handleNotification(payload);
        break;
      default:
        console.log("Unknown WebSocket message type:", type);
    }

    // Notify general subscribers
    this.notifySubscribers(type, payload);
  }

  handleNewOrder(order) {
    console.log("New order received:", order);
    this.notifySubscribers("new_order", order);

    // Show desktop notification if enabled
    if (Notification.permission === "granted") {
      new Notification("New Order Received", {
        body: `Order #${order.orderNumber} from ${
          order.customer?.name || "Guest"
        }`,
        icon: "/hotel-logo.png",
      });
    }
  }

  handleOrderUpdate(order) {
    console.log("Order updated:", order);
    this.notifySubscribers("order_updated", order);
  }

  handleNewBooking(booking) {
    console.log("New booking received:", booking);
    this.notifySubscribers("new_booking", booking);

    if (Notification.permission === "granted") {
      new Notification("New Booking Received", {
        body: `${booking.customerName} booked for ${booking.guests} guests`,
        icon: "/hotel-logo.png",
      });
    }
  }

  handleBookingUpdate(booking) {
    console.log("Booking updated:", booking);
    this.notifySubscribers("booking_updated", booking);
  }

  handleNewReview(review) {
    console.log("New review received:", review);
    this.notifySubscribers("new_review", review);
  }

  handleNotification(notification) {
    console.log("Notification:", notification);
    this.notifySubscribers("notification", notification);
  }

  sendMessage(type, payload) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type, payload });
      this.socket.send(message);
      return true;
    }
    return false;
  }

  // Request permission for notifications
  requestNotificationPermission() {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }
}

// Singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
