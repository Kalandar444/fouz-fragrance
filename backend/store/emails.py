import logging
import os
from django.core.mail import EmailMultiAlternatives, get_connection
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


def get_secure_smtp_connection():
    """
    Creates a dedicated, high-reliability SMTP connection.
    Defaults to Port 465 SSL for Gmail (no connection drop on cloud/ISPs).
    Falls back to Port 587 TLS if needed.
    """
    host = getattr(settings, 'EMAIL_HOST', 'smtp.gmail.com')
    user = getattr(settings, 'EMAIL_HOST_USER', 'fouzfragrance02@gmail.com').strip()
    pwd = getattr(settings, 'EMAIL_HOST_PASSWORD', 'mqybgujrtqbeshty').replace(' ', '').strip()
    timeout = getattr(settings, 'EMAIL_TIMEOUT', 15)

    if not (user and pwd):
        return None

    # 1. Try Port 465 SSL first (standard for Gmail, zero connection drop)
    try:
        conn = get_connection(
            backend='django.core.mail.backends.smtp.EmailBackend',
            host=host,
            port=465,
            username=user,
            password=pwd,
            use_ssl=True,
            use_tls=False,
            timeout=timeout
        )
        conn.open()
        return conn
    except Exception as e:
        logger.warning(f"Port 465 SSL connection attempt failed ({e}), attempting port 587 TLS fallback...")

    # 2. Fallback to Port 587 TLS
    try:
        conn = get_connection(
            backend='django.core.mail.backends.smtp.EmailBackend',
            host=host,
            port=587,
            username=user,
            password=pwd,
            use_ssl=False,
            use_tls=True,
            timeout=timeout
        )
        conn.open()
        return conn
    except Exception as e2:
        logger.error(f"Port 587 TLS fallback also failed: {e2}")
        return None


import urllib.request
import json


def send_via_resend(api_key, to_email, subject, html_content, text_content, from_email=None):
    """
    Sends email via Resend HTTPS REST API (Port 443 - never blocked by cloud firewalls).
    """
    url = "https://api.resend.com/emails"
    from_addr = from_email or "Fouz Fragrance <onboarding@resend.dev>"
    payload = {
        "from": from_addr,
        "to": [to_email] if isinstance(to_email, str) else to_email,
        "subject": subject,
        "html": html_content,
        "text": text_content,
        "reply_to": "fouzfragrance02@gmail.com",
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Authorization": f"Bearer {api_key.strip()}",
            "Content-Type": "application/json",
            "User-Agent": "FouzFragrance/1.0"
        }
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status in (200, 201)


def send_via_brevo(api_key, to_email, subject, html_content, text_content, sender_name="Fouz Fragrance", sender_email="fouzfragrance02@gmail.com"):
    """
    Sends email via Brevo HTTPS REST API (Port 443 - never blocked by cloud firewalls).
    """
    url = "https://api.brevo.com/v3/smtp/email"
    payload = {
        "sender": {"name": sender_name, "email": sender_email},
        "to": [{"email": to_email if isinstance(to_email, str) else to_email[0]}],
        "subject": subject,
        "htmlContent": html_content,
        "textContent": text_content,
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "api-key": api_key.strip(),
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "FouzFragrance/1.0"
        }
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.status in (200, 201)


def is_smtp_configured():
    """
    Checks whether basic SMTP credentials (host user & password) are populated.
    """
    user = getattr(settings, 'EMAIL_HOST_USER', 'fouzfragrance02@gmail.com').strip()
    pwd = getattr(settings, 'EMAIL_HOST_PASSWORD', 'mqybgujrtqbeshty').strip()
    return bool(user and pwd)



def send_order_notifications(order_or_id):
    """
    Sends order notification to the business email (fouzfragrance02@gmail.com)
    and customer confirmation email.
    
    Guaranteed safety:
    - Never deletes, loses, or fails a committed order if email sending fails.
    - Captures detailed delivery logs directly in order.email_delivery_log.
    - Explicitly prints progress to stdout for Render real-time log stream.
    """
    from django.db import close_old_connections
    close_old_connections()
    try:
        from store.models import Order
        if isinstance(order_or_id, (int, str)) and str(order_or_id).isdigit():
            order = Order.objects.prefetch_related('items').get(id=int(order_or_id))
        elif hasattr(order_or_id, 'id'):
            order = Order.objects.prefetch_related('items').get(id=order_or_id.id)
        else:
            order = order_or_id

        business_email = getattr(settings, 'BUSINESS_CONTACT_EMAIL', 'fouzfragrance02@gmail.com').strip()
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', f'Fouz Fragrance <{business_email}>')
        currency = order.currency or 'AED'
        print(f"[ORDER EMAIL] Starting dispatch for Order #{order.order_reference} to {business_email}...", flush=True)
        
        delivery_logs = []
        now_str = timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')
        
        # 1. Prepare items table HTML and text
        items_text = []
        items_html_rows = []
        
        # Fetch items safely
        order_items = list(order.items.all())
        if not order_items:
            items_text.append("- No items recorded in this order.")
            items_html_rows.append('<tr><td colspan="4" style="padding: 12px; text-align: center; color: #888;">No items recorded</td></tr>')
        else:
            for item in order_items:
                brand_info = f"({item.brand_name}) " if item.brand_name else ""
                variant_info = f" [{item.variant_title}]" if item.variant_title else ""
                items_text.append(
                    f"• {item.product_name} {brand_info}{variant_info}\n"
                    f"   Quantity: {item.quantity} | Unit Price: {item.price} {currency} | Item Total: {item.subtotal} {currency}"
                )
                items_html_rows.append(f"""
                    <tr style="border-bottom: 1px solid #f0ede8;">
                        <td style="padding: 14px 10px; font-size: 14px; color: #1a1a1a;">
                            <strong style="color: #111;">{item.product_name}</strong><br/>
                            <span style="font-size: 12px; color: #777;">{brand_info}{variant_info}</span>
                        </td>
                        <td style="padding: 14px 10px; text-align: center; font-size: 14px; color: #333; font-weight: 500;">
                            {item.quantity}
                        </td>
                        <td style="padding: 14px 10px; text-align: right; font-size: 14px; color: #333;">
                            {item.price} {currency}
                        </td>
                        <td style="padding: 14px 10px; text-align: right; font-size: 14px; font-weight: 700; color: #9e7d47;">
                            {item.subtotal} {currency}
                        </td>
                    </tr>
                """)

        items_text_str = "\n".join(items_text)
        items_html_str = "".join(items_html_rows)
        order_date_str = order.created_at.strftime('%Y-%m-%d %H:%M:%S') if order.created_at else now_str

        # -------------------------------------------------------------
        # Business Notification Email
        # -------------------------------------------------------------
        business_subject = f"🛍️ New Order #{order.order_reference} — {currency} {order.total_amount} | {order.customer_name}"
        
        business_text = f"""============================================================
FOUZ FRAGRANCE — NEW ORDER NOTIFICATION
============================================================

ORDER DETAILS:
------------------------------------------------------------
Order Number:          {order.order_reference}
Order Date & Time:     {order_date_str}
Payment Method:        {order.payment_method}
Order Status:          {order.status}

CUSTOMER & DELIVERY DETAILS:
------------------------------------------------------------
Customer Name:         {order.customer_name}
Phone Number:          {order.customer_phone}
Email:                 {order.customer_email or 'Not provided'}
Country:               {getattr(order, 'country', 'United Arab Emirates')}
City / State / Emirate:{order.city}, {order.state_emirate}
Delivery Address:      {order.delivery_address}
Postal Code:           {order.postal_code or 'N/A'}
Delivery Instructions: {order.delivery_instructions or 'None'}

ORDERED PERFUMES & ITEMS:
------------------------------------------------------------
{items_text_str}

FINANCIAL BREAKDOWN:
------------------------------------------------------------
Subtotal:              {order.subtotal} {currency}
Delivery Charges:      {order.shipping_fee} {currency}
TOTAL AMOUNT PAYABLE:  {order.total_amount} {currency} ({order.payment_method})
============================================================

Fouz Fragrance Store Management
Gold Souk, Dubai, United Arab Emirates
Phone / WhatsApp: +971 54 4540097
"""

        business_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8"/>
            <title>New Order #{order.order_reference}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf9f6; margin: 0; padding: 24px; color: #222;">
            <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e8e3d9; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
                
                <!-- Luxury Gold Header -->
                <div style="background-color: #111111; color: #ffffff; padding: 28px 24px; text-align: center; border-bottom: 3px solid #c5a880;">
                    <h1 style="margin: 0; font-size: 22px; letter-spacing: 3px; font-weight: 500; text-transform: uppercase; color: #ffffff;">FOUZ FRAGRANCE</h1>
                    <p style="margin: 6px 0 0; font-size: 13px; color: #c5a880; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600;">
                        New Customer Order Notification
                    </p>
                </div>
                
                <div style="padding: 24px 28px;">
                    
                    <!-- Quick Order Status Card -->
                    <div style="background-color: #fcfbf9; border: 1px solid #ede8de; padding: 18px; margin-bottom: 24px; border-radius: 6px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                            <tr>
                                <td style="padding: 4px 0; color: #666; width: 140px;"><strong>Order Number:</strong></td>
                                <td style="padding: 4px 0;"><span style="color: #9e7d47; font-weight: bold; font-size: 15px;">{order.order_reference}</span></td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; color: #666;"><strong>Order Date:</strong></td>
                                <td style="padding: 4px 0; color: #333;">{order_date_str}</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; color: #666;"><strong>Payment Method:</strong></td>
                                <td style="padding: 4px 0;">
                                    <span style="background: #eef7ee; color: #1e7e34; padding: 3px 10px; border-radius: 4px; font-weight: 600; font-size: 12px;">
                                        💵 {order.payment_method}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 4px 0; color: #666;"><strong>Order Status:</strong></td>
                                <td style="padding: 4px 0;">
                                    <span style="background: #fff4e5; color: #b76e00; padding: 3px 10px; border-radius: 4px; font-weight: 600; font-size: 12px;">
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <!-- Customer & Delivery Details -->
                    <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #111; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #e8e3d9; padding-bottom: 8px;">
                        📍 Customer & Delivery Destination
                    </h3>
                    <table style="width: 100%; font-size: 13px; margin-bottom: 24px; line-height: 1.6; border-collapse: collapse;">
                        <tr>
                            <td style="width: 140px; color: #777; padding: 4px 0;">Customer Name:</td>
                            <td style="padding: 4px 0;"><strong>{order.customer_name}</strong></td>
                        </tr>
                        <tr>
                            <td style="color: #777; padding: 4px 0;">Phone Number:</td>
                            <td style="padding: 4px 0;">
                                <a href="tel:{order.customer_phone}" style="color: #9e7d47; text-decoration: none; font-weight: bold; font-size: 14px;">{order.customer_phone}</a>
                                &nbsp;|&nbsp;
                                <a href="https://wa.me/{order.customer_phone.replace('+', '').replace(' ', '').replace('-', '')}" style="color: #25D366; text-decoration: none; font-weight: 600;">💬 Open WhatsApp</a>
                            </td>
                        </tr>
                        <tr>
                            <td style="color: #777; padding: 4px 0;">Customer Email:</td>
                            <td style="padding: 4px 0; color: #444;">{order.customer_email or 'Not provided'}</td>
                        </tr>
                        <tr>
                            <td style="color: #777; padding: 4px 0;">Country:</td>
                            <td style="padding: 4px 0;"><strong style="color: #9e7d47;">{getattr(order, 'country', 'United Arab Emirates')}</strong></td>
                        </tr>
                        <tr>
                            <td style="color: #777; padding: 4px 0;">City / State / Emirate:</td>
                            <td style="padding: 4px 0;"><strong>{order.state_emirate} ({order.city})</strong></td>
                        </tr>
                        <tr>
                            <td style="color: #777; padding: 4px 0; vertical-align: top;">Delivery Address:</td>
                            <td style="padding: 4px 0; color: #222; font-weight: 500;">{order.delivery_address}</td>
                        </tr>
                        <tr>
                            <td style="color: #777; padding: 4px 0;">Postal Code:</td>
                            <td style="padding: 4px 0; color: #555;">{order.postal_code or 'N/A'}</td>
                        </tr>
                        <tr>
                            <td style="color: #777; padding: 4px 0;">Special Instructions:</td>
                            <td style="padding: 4px 0; color: #555;"><em>{order.delivery_instructions or 'None'}</em></td>
                        </tr>
                    </table>

                    <!-- Ordered Items -->
                    <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #111; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #e8e3d9; padding-bottom: 8px;">
                        🧴 Ordered Fragrances
                    </h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="border-bottom: 2px solid #e8e3d9; font-size: 12px; text-transform: uppercase; color: #777; letter-spacing: 0.5px;">
                                <th style="text-align: left; padding: 10px 8px;">Perfume Name</th>
                                <th style="text-align: center; padding: 10px 8px; width: 60px;">Qty</th>
                                <th style="text-align: right; padding: 10px 8px; width: 100px;">Price</th>
                                <th style="text-align: right; padding: 10px 8px; width: 110px;">Item Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items_html_str}
                        </tbody>
                    </table>

                    <!-- Totals Breakdown -->
                    <div style="background-color: #faf8f5; border-top: 2px solid #c5a880; border-radius: 0 0 4px 4px; padding: 18px 20px; margin-top: 10px;">
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; color: #555;">
                            <span>Subtotal:</span>
                            <span style="font-weight: 500; color: #222;">{order.subtotal} {currency}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; color: #555;">
                            <span>UAE Delivery Charges:</span>
                            <span style="font-weight: 500; color: #222;">{order.shipping_fee} {currency}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #111; padding-top: 10px; border-top: 1px solid #e8e3d9;">
                            <span>Total Payable (Cash on Delivery):</span>
                            <span style="color: #9e7d47; font-size: 18px;">{order.total_amount} {currency}</span>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f7f6f3; padding: 18px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #e8e3d9; line-height: 1.6;">
                    <strong>Fouz Fragrance</strong> — UAE Luxury Perfumes<br/>
                    Gold Souk, Dubai, United Arab Emirates<br/>
                    WhatsApp / Call: <a href="https://wa.me/971544540097" style="color: #9e7d47; text-decoration: none; font-weight: bold;">+971 54 4540097</a> | Business Email: {business_email}
                </div>
            </div>
        </body>
        </html>
        """

        # -------------------------------------------------------------
        # Dispatch Order Notifications (HTTPS REST API first, then SMTP fallback)
        # -------------------------------------------------------------
        resend_key = getattr(settings, 'RESEND_API_KEY', '').strip()
        brevo_key = getattr(settings, 'BREVO_API_KEY', '').strip()

        # Priority 1: Resend HTTPS API (Port 443 - zero cloud firewall blockage)
        if resend_key:
            try:
                send_via_resend(resend_key, business_email, business_subject, business_html, business_text)
                order.business_email_sent = True
                delivery_logs.append(f"[{now_str}] SUCCESS: Sent order notification via Resend HTTPS API to {business_email}")
                print(f"[ORDER EMAIL] SUCCESS: Notification delivered via Resend HTTPS API to {business_email}!", flush=True)
            except Exception as r_err:
                delivery_logs.append(f"[{now_str}] NOTICE: Resend HTTPS attempt: {r_err}")
                print(f"[ORDER EMAIL] Resend HTTPS notice: {r_err}", flush=True)

        # Priority 2: Brevo HTTPS API (Port 443 - zero cloud firewall blockage)
        if not order.business_email_sent and brevo_key:
            try:
                send_via_brevo(brevo_key, business_email, business_subject, business_html, business_text)
                order.business_email_sent = True
                delivery_logs.append(f"[{now_str}] SUCCESS: Sent order notification via Brevo HTTPS API to {business_email}")
                print(f"[ORDER EMAIL] SUCCESS: Notification delivered via Brevo HTTPS API to {business_email}!", flush=True)
            except Exception as br_err:
                delivery_logs.append(f"[{now_str}] NOTICE: Brevo HTTPS attempt: {br_err}")
                print(f"[ORDER EMAIL] Brevo HTTPS notice: {br_err}", flush=True)

        # Priority 3: Direct Gmail SMTP Connection (Port 465 SSL / Port 587 TLS)
        conn = None
        if not order.business_email_sent:
            conn = get_secure_smtp_connection()
            if not conn:
                err_msg = "Gmail SMTP connection could not be established (Note: standard SMTP is blocked on Render Free tier; configure RESEND_API_KEY or BREVO_API_KEY for guaranteed delivery)."
                delivery_logs.append(f"[{now_str}] NOTICE: {err_msg}")
                print(f"[ORDER EMAIL] FAILED TO CONNECT TO SMTP: {err_msg}", flush=True)
                order.business_email_sent = False
            else:
                try:
                    msg = EmailMultiAlternatives(
                        subject=business_subject,
                        body=business_text,
                        from_email=from_email,
                        to=[business_email],
                        connection=conn,
                    )
                    msg.attach_alternative(business_html, "text/html")
                    msg.send(fail_silently=False)
                    order.business_email_sent = True
                    delivery_logs.append(f"[{now_str}] SUCCESS: Sent order notification to business email {business_email}")
                    print(f"[ORDER EMAIL] SUCCESS: Notification delivered to {business_email} for Order #{order.order_reference}!", flush=True)
                    logger.info(f"Order #{order.order_reference}: Notification sent successfully to {business_email}")
                except Exception as b_err:
                    order.business_email_sent = False
                    err_msg = f"Failed to send business notification to {business_email}: {str(b_err)}"
                    delivery_logs.append(f"[{now_str}] ERROR: {err_msg}")
                    print(f"[ORDER EMAIL] ERROR: {err_msg}", flush=True)
                    logger.error(f"Order #{order.order_reference}: {err_msg}", exc_info=True)

            # 2. Send Customer Confirmation Email (if customer provided email)
            if order.customer_email:
                cust_subject = f"Order Confirmation #{order.order_reference} — Fouz Fragrance"
                cust_text = f"""Dear {order.customer_name},

Thank you for your order with Fouz Fragrance!
Your order #{order.order_reference} has been received and is being prepared for dispatch directly from Dubai Gold Souk.

ORDER SUMMARY:
------------------------------------------------------------
Order Reference: {order.order_reference}
Order Date:      {order_date_str}
Payment Method:  {order.payment_method}
Total Amount:    {order.total_amount} {currency}

DELIVERY DETAILS:
------------------------------------------------------------
Recipient:       {order.customer_name}
Phone / WhatsApp:{order.customer_phone}
Delivery Address:{order.delivery_address}

ORDERED ITEMS:
------------------------------------------------------------
{items_text_str}

Delivery Fee:    {order.shipping_fee} {currency}
Total Payable:   {order.total_amount} {currency}

If you have any questions or need to track your shipment, message us anytime on WhatsApp at +971 54 4540097.

Warm regards,
Fouz Fragrance — UAE Luxury Perfumes
Gold Souk, Dubai, United Arab Emirates
"""
                cust_html = f"""
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"/><title>Order Confirmation #{order.order_reference}</title></head>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf9f6; margin: 0; padding: 24px; color: #222;">
                    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e8e3d9; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
                        <div style="background-color: #111111; color: #ffffff; padding: 24px; text-align: center; border-bottom: 3px solid #c5a880;">
                            <h1 style="margin: 0; font-size: 20px; letter-spacing: 2px; font-weight: 500; text-transform: uppercase; color: #ffffff;">FOUZ FRAGRANCE</h1>
                            <p style="margin: 6px 0 0; font-size: 12px; color: #c5a880; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;">Order Confirmation</p>
                        </div>
                        <div style="padding: 24px;">
                            <p style="font-size: 15px; margin-top: 0;">Dear <strong>{order.customer_name}</strong>,</p>
                            <p style="font-size: 14px; color: #444; line-height: 1.6;">
                                Thank you for choosing Fouz Fragrance. We have received your order <strong>#{order.order_reference}</strong> and our team in Dubai Gold Souk is currently preparing your luxury fragrances.
                            </p>
                            
                            <div style="background-color: #fcfbf9; border: 1px solid #ede8de; padding: 14px 16px; border-radius: 4px; margin: 18px 0; font-size: 13px;">
                                💵 <strong>Payment Method:</strong> {order.payment_method}<br/>
                                📦 <strong>Total Amount:</strong> <strong style="color: #9e7d47; font-size: 15px;">{order.total_amount} {currency}</strong>
                            </div>

                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                <thead>
                                    <tr style="border-bottom: 2px solid #e8e3d9; font-size: 12px; text-transform: uppercase; color: #777;">
                                        <th style="text-align: left; padding: 8px;">Product</th>
                                        <th style="text-align: center; padding: 8px;">Qty</th>
                                        <th style="text-align: right; padding: 8px;">Price</th>
                                        <th style="text-align: right; padding: 8px;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items_html_str}
                                </tbody>
                            </table>

                            <div style="background-color: #faf8f5; border-top: 1px solid #e8e3d9; padding: 14px 16px; border-radius: 4px;">
                                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                                    <span>Subtotal:</span>
                                    <span>{order.subtotal} {currency}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
                                    <span>Shipping / Delivery:</span>
                                    <span>{order.shipping_fee} {currency}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; margin-top: 6px; color: #9e7d47;">
                                    <span>Total Payable:</span>
                                    <span>{order.total_amount} {currency}</span>
                                </div>
                            </div>

                            <p style="font-size: 13px; color: #666; margin-top: 24px; line-height: 1.5;">
                                Delivering to: <strong>{order.delivery_address}</strong><br/>
                                Phone / WhatsApp: {order.customer_phone}
                            </p>
                        </div>
                        <div style="background-color: #f7f6f3; padding: 16px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #e8e3d9;">
                            Need assistance? WhatsApp us at <a href="https://wa.me/971544540097" style="color: #25D366; text-decoration: none; font-weight: bold;">+971 54 4540097</a><br/>
                            Fouz Fragrance — Gold Souk, Dubai, UAE
                        </div>
                    </div>
                </body>
                </html>
                """

                cust_sent = False
                if resend_key:
                    try:
                        send_via_resend(resend_key, order.customer_email, cust_subject, cust_html, cust_text)
                        order.customer_email_sent = True
                        cust_sent = True
                        delivery_logs.append(f"[{now_str}] SUCCESS: Sent confirmation via Resend to {order.customer_email}")
                        print(f"[ORDER EMAIL] Customer confirmation sent via Resend to {order.customer_email}", flush=True)
                    except Exception as rc_err:
                        delivery_logs.append(f"[{now_str}] NOTICE: Resend customer email notice: {rc_err}")

                if not cust_sent and conn:
                    try:
                        cust_msg = EmailMultiAlternatives(
                            subject=cust_subject,
                            body=cust_text,
                            from_email=from_email,
                            to=[order.customer_email],
                            connection=conn,
                        )
                        cust_msg.attach_alternative(cust_html, "text/html")
                        cust_msg.send(fail_silently=False)
                        order.customer_email_sent = True
                        delivery_logs.append(f"[{now_str}] SUCCESS: Sent confirmation to customer {order.customer_email}")
                        logger.info(f"Order #{order.order_reference}: Customer confirmation sent to {order.customer_email}")
                    except Exception as c_err:
                        order.customer_email_sent = False
                        err_msg = f"Failed to send customer confirmation to {order.customer_email}: {str(c_err)}"
                        delivery_logs.append(f"[{now_str}] ERROR: {err_msg}")
                        logger.error(f"Order #{order.order_reference}: {err_msg}")

            if conn:
                try:
                    conn.close()
                except Exception:
                    pass

        # Safely save delivery logs on order
        try:
            order.email_delivery_log = "\n".join(delivery_logs)
            order.save(update_fields=['business_email_sent', 'customer_email_sent', 'email_delivery_log'])
        except Exception as save_err:
            logger.error(f"Failed to update email log on order #{order.order_reference}: {save_err}")

        return order.business_email_sent

    except Exception as fatal_e:
        # Ultimate fail-safe: order is already safely committed in DB, never let an exception crash the caller
        logger.error(f"Unexpected fatal error inside send_order_notifications: {fatal_e}", exc_info=True)
        return False


def send_test_email(recipient=None):
    """
    Test function to verify Gmail SMTP connectivity and dispatch an authentic
    test order notification to the business email or specified recipient.
    
    Returns a dict with:
    {
        'success': bool,
        'recipient': str,
        'smtp_configured': bool,
        'message': str,
        'error': str or None
    }
    """
    business_email = getattr(settings, 'BUSINESS_CONTACT_EMAIL', 'fouzfragranceae@gmail.com').strip()
    target_recipient = (recipient or business_email).strip()
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', f'Fouz Fragrance <{business_email}>')
    
    smtp_user = getattr(settings, 'EMAIL_HOST_USER', '').strip()
    smtp_pass = getattr(settings, 'EMAIL_HOST_PASSWORD', '').strip()
    
    if not smtp_pass:
        return {
            'success': False,
            'recipient': target_recipient,
            'smtp_configured': False,
            'message': (
                "Google App Password is not configured in backend/.env (EMAIL_HOST_PASSWORD is blank). "
                "Please generate a 16-character Google App Password for fouzfragranceae@gmail.com and add it to backend/.env."
            ),
            'error': "Missing EMAIL_HOST_PASSWORD"
        }
    
    subject = f"🧪 [TEST NOTIFICATION] New Order #FF-TEST-DEMO — AED 490.00 | Test Customer"
    
    text_content = f"""============================================================
🧪 FOUZ FRAGRANCE — SMTP CONFIGURATION TEST EMAIL 🧪
============================================================

This is a live test notification verifying that your Django backend is successfully 
configured to dispatch new order notifications to your business inbox.

TEST ORDER DETAILS:
------------------------------------------------------------
Order Number:          FF-TEST-DEMO
Order Date & Time:     {timezone.now().strftime('%Y-%m-%d %H:%M:%S UTC')}
Payment Method:        Cash on Delivery
Order Status:          Pending

CUSTOMER & DELIVERY DETAILS:
------------------------------------------------------------
Customer Name:         Fouz Quality Assurance
Phone Number:          +971 54 4540097
Email:                 {target_recipient}
City / Emirate:        Dubai, Dubai
Delivery Address:      Villa 12, Al Wasl Road, Jumeirah
Postal Code:           00000
Special Instructions:  Please ring the bell upon arrival

ORDERED PERFUMES & ITEMS:
------------------------------------------------------------
• Amber Oud Eau de Parfum (Fouz Signature) [100ml]
   Quantity: 2 | Unit Price: 245.00 AED | Item Total: 490.00 AED

FINANCIAL BREAKDOWN:
------------------------------------------------------------
Subtotal:              490.00 AED
Delivery Charges:      0.00 AED (Free Delivery applied)
TOTAL AMOUNT PAYABLE:  490.00 AED (Cash on Delivery)
============================================================

Your Gmail SMTP configuration is WORKING PERFECTLY!
"""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/><title>Fouz Fragrance SMTP Test</title></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #faf9f6; margin: 0; padding: 24px; color: #222;">
        <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border: 1px solid #e8e3d9; border-radius: 6px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.04);">
            <div style="background-color: #111111; color: #ffffff; padding: 28px 24px; text-align: center; border-bottom: 3px solid #c5a880;">
                <h1 style="margin: 0; font-size: 22px; letter-spacing: 3px; font-weight: 500; text-transform: uppercase;">FOUZ FRAGRANCE</h1>
                <p style="margin: 6px 0 0; font-size: 13px; color: #c5a880; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600;">
                    🧪 Live Email Configuration Test
                </p>
            </div>
            <div style="padding: 24px 28px;">
                <div style="background-color: #eef7ee; border: 1px solid #c8e6c9; border-radius: 6px; padding: 16px; margin-bottom: 24px; color: #1e7e34;">
                    <strong style="font-size: 15px;">✔ SMTP Connection Verified!</strong>
                    <p style="margin: 6px 0 0; font-size: 13px; line-height: 1.5;">
                        Your Gmail SMTP credentials are functioning properly. When a customer completes checkout on the website, an email with full order specifications will be delivered immediately to this inbox.
                    </p>
                </div>

                <div style="background-color: #fcfbf9; border: 1px solid #ede8de; padding: 16px; margin-bottom: 20px; border-radius: 6px; font-size: 13px;">
                    <table style="width: 100%;">
                        <tr><td style="color: #666; width: 140px;"><strong>Order Reference:</strong></td><td><strong style="color: #9e7d47;">FF-TEST-DEMO</strong></td></tr>
                        <tr><td style="color: #666;"><strong>Date & Time:</strong></td><td>{timezone.now().strftime('%B %d, %Y at %I:%M %p UTC')}</td></tr>
                        <tr><td style="color: #666;"><strong>Payment Method:</strong></td><td><span style="background: #eef7ee; color: #1e7e34; padding: 2px 8px; border-radius: 3px; font-weight: 600;">💵 Cash on Delivery</span></td></tr>
                    </table>
                </div>

                <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #111; margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #e8e3d9; padding-bottom: 8px;">
                    📍 Sample Customer Details
                </h3>
                <table style="width: 100%; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
                    <tr><td style="width: 140px; color: #777;">Customer:</td><td><strong>Fouz Quality Assurance</strong></td></tr>
                    <tr><td style="color: #777;">Phone:</td><td><strong style="color: #9e7d47;">+971 54 4540097</strong></td></tr>
                    <tr><td style="color: #777;">Destination:</td><td>Villa 12, Al Wasl Road, Jumeirah, Dubai</td></tr>
                </table>

                <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #111; margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #e8e3d9; padding-bottom: 8px;">
                    🧴 Sample Perfume Items
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="border-bottom: 2px solid #e8e3d9; font-size: 12px; text-transform: uppercase; color: #777;">
                            <th style="text-align: left; padding: 8px;">Product</th>
                            <th style="text-align: center; padding: 8px;">Qty</th>
                            <th style="text-align: right; padding: 8px;">Price</th>
                            <th style="text-align: right; padding: 8px;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #f0ede8;">
                            <td style="padding: 12px 8px; font-size: 14px;"><strong>Amber Oud Eau de Parfum</strong><br/><span style="font-size: 12px; color: #777;">(Fouz Signature) [100ml]</span></td>
                            <td style="padding: 12px 8px; text-align: center; font-size: 14px;">2</td>
                            <td style="padding: 12px 8px; text-align: right; font-size: 14px;">245.00 AED</td>
                            <td style="padding: 12px 8px; text-align: right; font-size: 14px; font-weight: bold; color: #9e7d47;">490.00 AED</td>
                        </tr>
                    </tbody>
                </table>

                <div style="background-color: #faf8f5; border-top: 2px solid #c5a880; padding: 16px; border-radius: 0 0 4px 4px;">
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; color: #555;">
                        <span>Subtotal:</span><span>490.00 AED</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; color: #555;">
                        <span>UAE Delivery Charges:</span><span style="color: #27ae60; font-weight: bold;">FREE</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #111; margin-top: 6px; padding-top: 8px; border-top: 1px solid #e8e3d9;">
                        <span>Total Payable on Delivery:</span><span style="color: #9e7d47; font-size: 18px;">490.00 AED</span>
                    </div>
                </div>
            </div>
            <div style="background-color: #f7f6f3; padding: 16px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #e8e3d9;">
                Fouz Fragrance — Gold Souk, Dubai, UAE | WhatsApp: +971 54 4540097
            </div>
        </div>
    </body>
    </html>
    """

    resend_key = getattr(settings, 'RESEND_API_KEY', '').strip()
    brevo_key = getattr(settings, 'BREVO_API_KEY', '').strip()

    if resend_key:
        try:
            send_via_resend(resend_key, target_recipient, subject, html_content, text_content)
            return {
                'success': True,
                'recipient': target_recipient,
                'provider': 'Resend HTTPS API (Port 443)',
                'message': f"Test email successfully sent to {target_recipient} via Resend HTTPS API!",
                'error': None
            }
        except Exception as r_err:
            return {
                'success': False,
                'recipient': target_recipient,
                'provider': 'Resend HTTPS API (Port 443)',
                'message': f"Resend API error: {r_err}",
                'error': str(r_err)
            }

    if brevo_key:
        try:
            send_via_brevo(brevo_key, target_recipient, subject, html_content, text_content)
            return {
                'success': True,
                'recipient': target_recipient,
                'provider': 'Brevo HTTPS API (Port 443)',
                'message': f"Test email successfully sent to {target_recipient} via Brevo HTTPS API!",
                'error': None
            }
        except Exception as br_err:
            return {
                'success': False,
                'recipient': target_recipient,
                'provider': 'Brevo HTTPS API (Port 443)',
                'message': f"Brevo API error: {br_err}",
                'error': str(br_err)
            }

    try:
        conn = get_secure_smtp_connection()
        if not conn:
            return {
                'success': False,
                'recipient': target_recipient,
                'provider': 'Gmail SMTP',
                'message': "SMTP connection could not be opened (Note: Render Free tier blocks ports 465 and 587; use RESEND_API_KEY or BREVO_API_KEY).",
                'error': "Connection timeout or port blocked"
            }
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[target_recipient],
            connection=conn,
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        conn.close()
        return {
            'success': True,
            'recipient': target_recipient,
            'provider': 'Gmail SMTP',
            'message': f"Test email successfully sent to {target_recipient} via Gmail SMTP!",
            'error': None
        }
    except Exception as e:
        err_str = str(e)
        logger.error(f"Test email to {target_recipient} failed: {err_str}", exc_info=True)
        return {
            'success': False,
            'recipient': target_recipient,
            'provider': 'Gmail SMTP',
            'message': f"Failed to send test email to {target_recipient}: {err_str}",
            'error': err_str
        }


def send_contact_enquiry_notification(enquiry):
    """
    Sends email notification when a customer submits a contact enquiry.
    """
    try:
        business_email = getattr(settings, 'BUSINESS_CONTACT_EMAIL', 'fouzfragrance02@gmail.com').strip()
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', f'Fouz Fragrance <{business_email}>')
        
        subject = f"💬 New Contact Enquiry from {enquiry.name} — Fouz Fragrance"
        text_content = f"""NEW CONTACT FORM SUBMISSION

From:    {enquiry.name}
Email:   {enquiry.email}
Phone:   {enquiry.phone or 'Not provided'}
Subject: {enquiry.subject}
Date:    {enquiry.created_at.strftime('%Y-%m-%d %H:%M:%S')}

Message:
{enquiry.message}

Reply to: {enquiry.email}
"""
        conn = get_secure_smtp_connection()
        if not conn:
            logger.warning("Contact enquiry received, but SMTP connection could not be opened.")
            return False

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=from_email,
            to=[business_email],
            reply_to=[enquiry.email],
            connection=conn,
        )
        msg.send(fail_silently=False)
        conn.close()
        enquiry.email_sent = True
        enquiry.save(update_fields=['email_sent'])
        return True
    except Exception as e:
        logger.error(f"Failed to send enquiry email: {e}")
        return False
