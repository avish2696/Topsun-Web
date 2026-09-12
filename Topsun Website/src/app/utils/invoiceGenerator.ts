export interface InvoiceOrderData {
  order_number: string;
  created_at: string;
  payment_status?: string;
  payment_method?: string;
  order_status?: string;
  total_amount: number;
  shipping_address?: {
    fullName?: string;
    phone?: string;
    email?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  items?: Array<{
    product_name?: string;
    name?: string;
    price: number;
    quantity?: number;
    size?: number | string;
    color_label?: string;
  }>;
}

/**
 * Opens a print-ready GST tax invoice window with high-resolution layout and instant PDF download/print options.
 */
export function openInvoicePrintWindow(order: InvoiceOrderData) {
  const invoiceNum = `INV-${order.order_number || Math.floor(100000 + Math.random() * 900000)}`;
  const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const address = order.shipping_address || {};
  const customerName = address.fullName || 'Valued Customer';
  const customerPhone = address.phone || 'N/A';
  const customerEmail = address.email || 'N/A';
  const fullAddress = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state ? `${address.state} - ${address.postalCode || ''}` : address.postalCode,
    address.country || 'India',
  ].filter(Boolean).join(', ') || 'Address on file';

  const items = order.items && order.items.length > 0 ? order.items : [
    {
      product_name: 'TOPSUN Performance Footwear',
      price: order.total_amount,
      quantity: 1,
      size: 'Standard',
      color_label: 'Original Edition',
    }
  ];

  const totalAmount = order.total_amount;
  // Indian GST calculation (18% inclusive in retail prices)
  const taxableAmount = Math.round(totalAmount / 1.18);
  const totalGst = totalAmount - taxableAmount;
  const cgst = Math.round(totalGst / 2);
  const sgst = totalGst - cgst;

  // Determine Payment Stamp
  const pStatus = (order.payment_status || '').toLowerCase();
  const pMethod = (order.payment_method || '').toLowerCase();
  let paymentLabel = 'PAID';
  let paymentColor = '#10b981'; // Green
  let paymentBg = '#ecfdf5';

  if (pStatus === 'failed' || pStatus === 'cancelled' || pStatus === 'unpaid') {
    paymentLabel = 'UNPAID';
    paymentColor = '#ef4444'; // Red
    paymentBg = '#fef2f2';
  } else if (pMethod === 'cod' || pStatus === 'cod' || pStatus === 'cod_pending') {
    paymentLabel = 'COD PENDING';
    paymentColor = '#f59e0b'; // Yellow / Amber
    paymentBg = '#fffbeb';
  }

  const invoiceHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tax Invoice - ${invoiceNum} | TOPSUN Footwear</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #121518;
      background: #f4f5f7;
      padding: 24px;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 24px;
      margin-bottom: 24px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #121518;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 11px;
      color: #009FE3;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 6px;
    }
    .company-details {
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
      max-width: 320px;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-title {
      font-size: 18px;
      font-weight: 800;
      color: #121518;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .meta-row {
      font-size: 12px;
      color: #64748b;
      margin-top: 3px;
    }
    .meta-row strong {
      color: #121518;
    }
    .badge-stamp {
      display: inline-block;
      margin-top: 10px;
      padding: 5px 14px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      border-radius: 8px;
      border: 1.5px solid ${paymentColor};
      color: ${paymentColor};
      background: ${paymentBg};
    }
    .bill-to-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 28px;
      background: #fafaf9;
      padding: 18px 22px;
      border-radius: 12px;
      border: 1px solid #e7e5e4;
    }
    .section-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #78716c;
      margin-bottom: 6px;
    }
    .person-name {
      font-size: 14px;
      font-weight: 700;
      color: #1c1917;
      margin-bottom: 4px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .items-table th {
      background: #121518;
      color: #ffffff;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 10px 14px;
      text-align: left;
    }
    .items-table th:last-child { text-align: right; }
    .items-table td {
      padding: 12px 14px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 12px;
    }
    .items-table td:last-child { text-align: right; font-weight: 700; }
    .summary-box {
      margin-left: auto;
      width: 320px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px 20px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 6px;
    }
    .summary-row strong { color: #1e293b; }
    .summary-row.grand-total {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 2px solid #cbd5e1;
      font-size: 16px;
      font-weight: 900;
      color: #009FE3;
    }
    .footer-note {
      margin-top: 36px;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94a3b8;
    }
    .no-print-bar {
      max-width: 800px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      padding: 9px 18px;
      font-size: 12px;
      font-weight: 700;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
    }
    .btn-primary { background: #121518; color: #ffffff; }
    .btn-primary:hover { background: #000000; }
    .btn-secondary { background: #e2e8f0; color: #334155; }
    @media print {
      body { background: #ffffff; padding: 0; }
      .invoice-card { box-shadow: none; border-radius: 0; padding: 20px; }
      .no-print-bar { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <button class="btn btn-secondary" onclick="window.close()">← Close Window</button>
    <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand-title">TOPSUN</div>
        <div class="brand-sub">PERFORMANCE FOOTWEAR</div>
        <div class="company-details">
          <strong>INTELAGROW PVT. LTD.</strong><br>
          A/90 NSB Road, Raniganj, Searsole Rajbari<br>
          Paschim Bardhaman – 713358, West Bengal, India<br>
          Support: +91 7485006659 | topsunshoes7@gmail.com
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">Tax Invoice</div>
        <div class="meta-row">Invoice No: <strong>${invoiceNum}</strong></div>
        <div class="meta-row">Order ID: <strong>#${order.order_number}</strong></div>
        <div class="meta-row">Date: <strong>${orderDate}</strong></div>
        <div class="meta-row">Payment: <strong>${order.payment_method?.toUpperCase() || 'ONLINE'}</strong></div>
        <div class="badge-stamp">${paymentLabel}</div>
      </div>
    </div>

    <div class="bill-to-grid">
      <div>
        <div class="section-label">Billed & Shipped To:</div>
        <div class="person-name">${customerName}</div>
        <div style="color: #475569; font-size: 12px; line-height: 1.4;">${fullAddress}</div>
        <div style="color: #64748b; font-size: 11px; margin-top: 4px;">Phone: +91 ${customerPhone}</div>
        <div style="color: #64748b; font-size: 11px;">Email: ${customerEmail}</div>
      </div>
      <div>
        <div class="section-label">Order Details:</div>
        <div style="color: #475569; font-size: 12px; line-height: 1.6;">
          <strong>Dispatch Hub:</strong> Raniganj Center, WB<br>
          <strong>Courier Partner:</strong> Express Priority Delivery<br>
          <strong>Exchange Window:</strong> 7-Day Hassle-Free Size Exchange<br>
          <strong>Invoice Nature:</strong> E-Commerce Retail Tax Invoice
        </div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 45%;">Item Description</th>
          <th style="width: 15%;">Size (UK)</th>
          <th style="width: 12%;">Qty</th>
          <th style="width: 13%;">Price</th>
          <th style="width: 15%;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(it => {
          const name = it.product_name || it.name || 'Footwear';
          const size = it.size || 'UK 8';
          const color = it.color_label || 'Sport Edition';
          const qty = it.quantity || 1;
          const price = it.price || 0;
          const lineTotal = price * qty;
          return `
          <tr>
            <td>
              <strong>${name}</strong><br>
              <span style="color: #64748b; font-size: 11px;">${color}</span>
            </td>
            <td>UK ${size}</td>
            <td>${qty}</td>
            <td>₹${price.toLocaleString('en-IN')}</td>
            <td>₹${lineTotal.toLocaleString('en-IN')}</td>
          </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    <div class="summary-box">
      <div class="summary-row">
        <span>Taxable Amount</span>
        <span>₹${taxableAmount.toLocaleString('en-IN')}</span>
      </div>
      <div class="summary-row">
        <span>CGST (9%)</span>
        <span>₹${cgst.toLocaleString('en-IN')}</span>
      </div>
      <div class="summary-row">
        <span>SGST (9%)</span>
        <span>₹${sgst.toLocaleString('en-IN')}</span>
      </div>
      <div class="summary-row">
        <span>Shipping Charges</span>
        <span style="color: #10b981; font-weight: 700;">FREE</span>
      </div>
      <div class="summary-row grand-total">
        <span>Grand Total</span>
        <span>₹${totalAmount.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div class="footer-note">
      <div>This is a computer-generated tax invoice and requires no signature.</div>
      <div>Thank you for choosing TOPSUN Footwear.</div>
    </div>
  </div>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  } else {
    alert('Please allow popups for this site to download/print the invoice.');
  }
}
