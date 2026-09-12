export interface RecoveryEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const EMAIL_TEMPLATES: RecoveryEmailTemplate[] = [
  {
    id: 'abandoned-cart-discount',
    name: 'Cart Recovery (10% OFF Code)',
    subject: 'Complete your TOPSUN order – Special 10% discount inside!',
    body: `Hi {CUSTOMER_NAME},

We noticed you left {ITEM_COUNT} pair of TOPSUN performance footwear in your shopping cart ({ITEMS_SUMMARY}).

Your selected sizes are in high demand and stocks are strictly limited. To help you experience TOPSUN comfort, use promo code COMFORT10 at checkout for an extra 10% OFF.

👉 Complete your order here: https://topsun.in/cart

If you have any questions or need sizing advice, reply to this email or chat with our team on WhatsApp: +91 7485006659.

Warm regards,
Team TOPSUN Footwear
Raniganj, West Bengal`,
  },
  {
    id: 'cart-stock-alert',
    name: 'Urgent Stock Alert (Cart Waiting)',
    subject: 'Your TOPSUN shoe selection is waiting (Stock selling fast!)',
    body: `Hi {CUSTOMER_NAME},

You added {ITEMS_SUMMARY} to your cart, but haven't completed your checkout yet.

Our production batches are handcrafted in limited quantities, and your selected size may sell out soon. We have temporarily reserved your pair.

👉 Resume checkout now: https://topsun.in/checkout

Enjoy Free Express Shipping across India + 7-Day hassle-free size exchanges.

Best,
TOPSUN Dispatch Team`,
  },
  {
    id: 'mega-sale-announcement',
    name: 'Festival Sale Announcement',
    subject: '🔥 TOPSUN Super Sale is Live – Huge Savings on Running & Casual Shoes',
    body: `Hi {CUSTOMER_NAME},

Exciting news! The TOPSUN Performance Footwear Sale is now live across our entire 2026 collection.

Upgrade your daily run, gym sessions, and streetwear with lightweight cloud cushioning, honeycomb grip soles, and breathable mesh.

👟 Explore the collection: https://topsun.in/shop
⚡ All orders ship free with Cash on Delivery & 5% Instant UPI discount available.

Happy shopping!
Team TOPSUN`,
  },
  {
    id: 'support-checkout-help',
    name: 'Checkout Assistance / Query',
    subject: 'Can we help you complete your TOPSUN order?',
    body: `Hi {CUSTOMER_NAME},

We noticed you started placing an order for {ITEMS_SUMMARY} but didn't finish.

Did you experience any issues with payment, size selection, or pincode delivery? We are here to help!

📱 WhatsApp Support: https://wa.me/917485006659
📧 Direct Email: topsunshoes7@gmail.com

Let us know and we'll ensure your order is processed smoothly.

Sincerely,
TOPSUN Customer Care`,
  },
];

export const SENDER_EMAIL = 'noreply@topsun.in';
export const SENDER_NAME = 'TOPSUN Footwear';

export function fillEmailTemplate(
  template: RecoveryEmailTemplate,
  data: {
    customerName?: string;
    itemsSummary?: string;
    itemCount?: number;
    cartTotal?: number;
  }
): { subject: string; body: string } {
  const name = data.customerName || 'Shopper';
  const summary = data.itemsSummary || 'your selected shoes';
  const count = String(data.itemCount || 1);

  const subject = template.subject
    .replace(/{CUSTOMER_NAME}/g, name)
    .replace(/{ITEMS_SUMMARY}/g, summary)
    .replace(/{ITEM_COUNT}/g, count);

  const body = template.body
    .replace(/{CUSTOMER_NAME}/g, name)
    .replace(/{ITEMS_SUMMARY}/g, summary)
    .replace(/{ITEM_COUNT}/g, count);

  return { subject, body };
}

export function openMailClient(toEmail: string, subject: string, body: string) {
  const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
}

export function openWhatsAppChat(phone: string, message: string) {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const waUrl = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, '_blank');
}

/**
 * Sends an email directly from noreply@topsun.in via Hostinger API endpoint
 */
export async function sendServerEmail(payload: {
  to: string;
  subject: string;
  body: string;
  customer_name?: string;
  type?: 'order_confirmation' | 'cart_recovery' | 'sale_alert' | 'general';
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
    const endpoint = apiBase.endsWith('/api') ? `${apiBase}/send-email.php` : `${apiBase}/api/send-email.php`;

    // Try primary endpoint first, then root relative fallback
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      response = await fetch('/api/send-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(errData.error || `Server responded with ${response.status}`);
    }

    const data = await response.json();
    return { success: true, message: data.message || `Sent successfully from ${SENDER_EMAIL}` };
  } catch (err: any) {
    console.warn(`[EmailService] Server dispatch failed (${err.message}). Logging notification.`);
    return { success: false, error: err.message };
  }
}

/**
 * Dispatches an order confirmation notification from noreply@topsun.in.
 * Logs order details and sends to the customer's email address.
 */
export async function sendOrderConfirmationEmail(orderData: {
  orderNumber: string;
  customerEmail?: string;
  customerName?: string;
  totalAmount: number;
  paymentMethod: string;
  items: any[];
  shippingAddress: any;
}) {
  const recipient = orderData.customerEmail || orderData.shippingAddress?.email;
  console.log(`📧 [EmailService] Sending Order Confirmation Email from ${SENDER_EMAIL} to: ${recipient || 'customer'} for Order #${orderData.orderNumber}`);

  const confirmationSubject = `Order Confirmed: #${orderData.orderNumber} – TOPSUN Footwear`;
  const confirmationBody = `Hi ${orderData.customerName || 'Customer'},

Thank you for choosing TOPSUN Footwear! Your order #${orderData.orderNumber} has been received and is being prepared for dispatch.

Order Details:
------------------------------------------
Order Number: #${orderData.orderNumber}
Total Amount: ₹${orderData.totalAmount.toLocaleString('en-IN')}
Payment Method: ${orderData.paymentMethod.toUpperCase()}
Items Ordered:
${(orderData.items || []).map(i => `• ${i.product_name || i.name} (UK ${i.size}) x ${i.quantity || 1} - ₹${((i.price || 0) * (i.quantity || 1)).toLocaleString('en-IN')}`).join('\n')}

Shipping Address:
${orderData.shippingAddress?.fullName || orderData.customerName || ''}
${orderData.shippingAddress?.addressLine1 || ''} ${orderData.shippingAddress?.addressLine2 || ''}
${orderData.shippingAddress?.city || ''}, ${orderData.shippingAddress?.state || ''} - ${orderData.shippingAddress?.pincode || ''}
Phone: ${orderData.shippingAddress?.phone || 'N/A'}

Estimated Delivery: 2-4 business days across India.
Track your package live: https://topsun.in/track-order

For any support queries, you can reach our helpline on WhatsApp at +91 7485006659 or email us at topsunshoes7@gmail.com.

Best regards,
TOPSUN Dispatch Team
INTELAGROW PVT. LTD.`;

  // Dispatch via Hostinger noreply@topsun.in
  let dispatchResult = { success: false, message: '' };
  if (recipient && recipient.includes('@')) {
    dispatchResult = await sendServerEmail({
      to: recipient,
      subject: confirmationSubject,
      body: confirmationBody,
      customer_name: orderData.customerName,
      type: 'order_confirmation',
    });
  }

  // Save dispatch audit log in localStorage for Admin inspection
  try {
    const storedLogs = JSON.parse(localStorage.getItem('topsun_email_dispatches') || '[]');
    storedLogs.unshift({
      id: `disp_${Date.now()}`,
      orderNumber: orderData.orderNumber,
      from: SENDER_EMAIL,
      recipient: recipient || 'N/A',
      subject: confirmationSubject,
      timestamp: new Date().toISOString(),
      status: dispatchResult.success ? 'sent' : 'logged',
    });
    localStorage.setItem('topsun_email_dispatches', JSON.stringify(storedLogs.slice(0, 50)));
  } catch (e) {
    // Ignore local storage error
  }

  return dispatchResult;
}
