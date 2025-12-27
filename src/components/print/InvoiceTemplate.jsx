import React from "react";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHotel,
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import styles from "./InvoiceTemplate.module.css";

const InvoiceTemplate = ({ order, settings = {} }) => {
  const {
    hotelName = "HotelZenith",
    hotelPhone = "+1 (555) 123-4567",
    hotelEmail = "contact@hotelzenith.com",
    hotelAddress = "123 Restaurant Street, City, Country",
    printLogo = true,
    printFooter = true,
    printTerms = true,
  } = settings;

  const calculateTotal = () => {
    const subtotal =
      order.items?.reduce(
        (sum, item) => sum + item.quantity * item.food?.price,
        0
      ) || 0;
    const tax = order.taxAmount || 0;
    const delivery = order.deliveryFee || 0;
    const discount = order.discountAmount || 0;
    return subtotal + tax + delivery - discount;
  };

  return (
    <div id="invoice-template" className={styles.invoiceTemplate}>
      {/* Header */}
      <div className={styles.invoiceHeader}>
        {printLogo && (
          <div className={styles.logoSection}>
            <FontAwesomeIcon icon={faHotel} className={styles.logo} />
            <h1>{hotelName}</h1>
          </div>
        )}

        <div className={styles.invoiceInfo}>
          <h2>INVOICE</h2>
          <div className={styles.invoiceMeta}>
            <div className={styles.metaItem}>
              <strong>Invoice #:</strong>
              <span>{order.orderNumber}</span>
            </div>
            <div className={styles.metaItem}>
              <strong>Date:</strong>
              <span>{format(new Date(order.createdAt), "MMMM dd, yyyy")}</span>
            </div>
            <div className={styles.metaItem}>
              <strong>Due Date:</strong>
              <span>{format(new Date(), "MMMM dd, yyyy")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hotel & Customer Info */}
      <div className={styles.infoSections}>
        <div className={styles.infoSection}>
          <h3>From:</h3>
          <div className={styles.infoContent}>
            <strong>{hotelName}</strong>
            <div className={styles.infoRow}>
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>{hotelAddress}</span>
            </div>
            <div className={styles.infoRow}>
              <FontAwesomeIcon icon={faPhone} />
              <span>{hotelPhone}</span>
            </div>
            <div className={styles.infoRow}>
              <FontAwesomeIcon icon={faEnvelope} />
              <span>{hotelEmail}</span>
            </div>
          </div>
        </div>

        <div className={styles.infoSection}>
          <h3>Bill To:</h3>
          <div className={styles.infoContent}>
            <strong>{order.customer?.name || "Guest Customer"}</strong>
            {order.customer?.email && (
              <div className={styles.infoRow}>
                <FontAwesomeIcon icon={faEnvelope} />
                <span>{order.customer.email}</span>
              </div>
            )}
            {order.customer?.phone && (
              <div className={styles.infoRow}>
                <FontAwesomeIcon icon={faPhone} />
                <span>{order.customer.phone}</span>
              </div>
            )}
            {order.deliveryAddress && (
              <div className={styles.infoRow}>
                <FontAwesomeIcon icon={faMapMarkerAlt} />
                <span>{order.deliveryAddress}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items Table */}
      <div className={styles.itemsTable}>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Description</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => (
              <tr key={index}>
                <td>{item.food?.name}</td>
                <td>{item.food?.description?.substring(0, 50)}...</td>
                <td>{item.quantity}</td>
                <td>${item.food?.price.toFixed(2)}</td>
                <td>${(item.quantity * item.food?.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className={styles.totalsSection}>
        <div className={styles.totalsTable}>
          <div className={styles.totalRow}>
            <span>Subtotal:</span>
            <span>${(order.subtotal || calculateTotal()).toFixed(2)}</span>
          </div>
          {order.taxAmount > 0 && (
            <div className={styles.totalRow}>
              <span>Tax:</span>
              <span>${order.taxAmount.toFixed(2)}</span>
            </div>
          )}
          {order.deliveryFee > 0 && (
            <div className={styles.totalRow}>
              <span>Delivery Fee:</span>
              <span>${order.deliveryFee.toFixed(2)}</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className={styles.totalRow}>
              <span>Discount:</span>
              <span>-${order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className={styles.totalRowGrand}>
            <span>Grand Total:</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Info */}
      <div className={styles.paymentSection}>
        <h3>Payment Information</h3>
        <div className={styles.paymentInfo}>
          <div className={styles.paymentRow}>
            <strong>Payment Method:</strong>
            <span>{order.paymentMethod || "Not specified"}</span>
          </div>
          <div className={styles.paymentRow}>
            <strong>Payment Status:</strong>
            <span
              className={`${styles.status} ${
                order.paymentStatus === "paid" ? styles.paid : styles.pending
              }`}
            >
              {order.paymentStatus === "paid" ? "Paid" : "Pending"}
            </span>
          </div>
          {order.paymentId && (
            <div className={styles.paymentRow}>
              <strong>Transaction ID:</strong>
              <span>{order.paymentId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {printFooter && (
        <div className={styles.invoiceFooter}>
          <p>Thank you for choosing {hotelName}!</p>
          {printTerms && (
            <div className={styles.terms}>
              <p>
                <strong>Terms & Conditions:</strong> Payment is due within 30
                days. Please include the invoice number with your payment. Late
                payments may be subject to a 1.5% monthly service charge.
              </p>
            </div>
          )}
          <div className={styles.footerNote}>
            <p>This is a computer-generated invoice. No signature required.</p>
            <p>
              © {new Date().getFullYear()} {hotelName}. All rights reserved.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceTemplate;
