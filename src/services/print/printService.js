import { format } from "date-fns";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const printService = {
  // Print Invoice
  printInvoice: async (order, template = "modern") => {
    const invoiceElement = document.getElementById("invoice-template");

    if (!invoiceElement) {
      console.error("Invoice template not found");
      return;
    }

    try {
      // Clone the element to avoid affecting the original
      const clone = invoiceElement.cloneNode(true);
      clone.style.display = "block";
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const position = 10;

      pdf.addImage(imgData, "PNG", position, position, imgWidth, imgHeight);
      pdf.save(
        `invoice-${order.orderNumber}-${format(new Date(), "yyyy-MM-dd")}.pdf`
      );

      return true;
    } catch (error) {
      console.error("Print error:", error);
      throw error;
    }
  },

  // Print Report
  printReport: async (data, title, type = "orders") => {
    const reportElement = document.createElement("div");
    reportElement.id = "print-report";
    reportElement.style.cssText = `
      position: fixed;
      left: -9999px;
      top: 0;
      width: 210mm;
      padding: 20mm;
      background: white;
      font-family: Arial, sans-serif;
    `;

    const html = printService.generateReportHTML(data, title, type);
    reportElement.innerHTML = html;
    document.body.appendChild(reportElement);

    try {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20mm; }
            .header { text-align: center; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #333; }
            .header .subtitle { color: #666; margin-top: 5px; }
            .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
            .info-item { padding: 10px; background: #f8f9fa; border-radius: 4px; }
            .info-label { font-weight: bold; color: #666; }
            .info-value { margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f8f9fa; text-align: left; padding: 12px; border-bottom: 2px solid #dee2e6; }
            td { padding: 12px; border-bottom: 1px solid #dee2e6; }
            .total-row { font-weight: bold; background: #f8f9fa; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
            @media print {
              @page { margin: 20mm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.onload = () => window.print();
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      console.error("Print report error:", error);
    } finally {
      document.body.removeChild(reportElement);
    }
  },

  generateReportHTML: (data, title, type) => {
    const date = format(new Date(), "MMMM dd, yyyy HH:mm");
    let tableHTML = "";

    switch (type) {
      case "orders":
        tableHTML = `
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (order) => `
                <tr>
                  <td>${order.orderNumber}</td>
                  <td>${order.customer?.name || "Guest"}</td>
                  <td>${format(new Date(order.createdAt), "MMM dd, yyyy")}</td>
                  <td>${order.status}</td>
                  <td>$${order.totalAmount.toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `;
        break;

      case "foods":
        tableHTML = `
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (food) => `
                <tr>
                  <td>${food.name}</td>
                  <td>${food.category?.name}</td>
                  <td>$${food.price.toFixed(2)}</td>
                  <td>${food.stock}</td>
                  <td>${food.isAvailable ? "Available" : "Unavailable"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `;
        break;

      case "bookings":
        tableHTML = `
          <table>
            <thead>
              <tr>
                <th>Booking #</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Guests</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (booking) => `
                <tr>
                  <td>${booking.bookingNumber || booking.eventNumber}</td>
                  <td>${booking.customerName}</td>
                  <td>${format(
                    new Date(booking.bookingDate || booking.eventDate),
                    "MMM dd, yyyy"
                  )}</td>
                  <td>${booking.guests || booking.guestCount}</td>
                  <td>${booking.status}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `;
        break;
    }

    return `
      <div class="header">
        <h1>${title}</h1>
        <div class="subtitle">Generated on ${date}</div>
        <div class="subtitle">HotelZenith Management System</div>
      </div>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Report Type</div>
          <div class="info-value">${
            type.charAt(0).toUpperCase() + type.slice(1)
          }</div>
        </div>
        <div class="info-item">
          <div class="info-label">Total Records</div>
          <div class="info-value">${data.length}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Generation Date</div>
          <div class="info-value">${date}</div>
        </div>
      </div>
      
      ${tableHTML}
      
      <div class="footer">
        <p>This report was generated by HotelZenith Management System</p>
        <p>© ${new Date().getFullYear()} HotelZenith. All rights reserved.</p>
      </div>
    `;
  },

  // Quick Print
  quickPrint: (elementId) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const printContent = element.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    location.reload(); // Restore original page
  },

  // Email Invoice
  emailInvoice: async (order, email) => {
    // This would integrate with your email service
    console.log("Email invoice to:", email, order);
    // Implement email sending logic here
  },
};
