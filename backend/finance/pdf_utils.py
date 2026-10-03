import io
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    HRFlowable
)
from reportlab.pdfgen import canvas
from django.core.files.base import ContentFile
from PIL import Image as PILImage
import qrcode


def generate_ticket_pdf(ticket) -> ContentFile:
    """
    Generates a professional, printable Event Ticket PDF.
    Contains:
      - SKYLINE Event Ticket Header
      - Ticket ID, Participant Name & Email
      - Event Name, Date, Time, Venue
      - Payment Status (PAID), Payment ID, Amount Paid
      - Seat & Gate
      - High-resolution QR Code
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0F172A'),
        alignment=1 # Center
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#059669'),
        alignment=1 # Center
    )
    label_style = ParagraphStyle(
        'FieldLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#64748B')
    )
    value_style = ParagraphStyle(
        'FieldValue',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0F172A')
    )
    bold_value_style = ParagraphStyle(
        'BoldFieldValue',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # Header Card
    story.append(Paragraph("SKYLINE CAMPUS", title_style))
    story.append(Paragraph("OFFICIAL EVENT ADMISSION TICKET", subtitle_style))
    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#E2E8F0'), spaceAfter=14))

    # Event Name Callout
    event_title = ticket.event.title if ticket.event else "Campus Event"
    event_style = ParagraphStyle(
        'EventTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0F172A')
    )
    story.append(Paragraph(event_title, event_style))
    story.append(Spacer(1, 12))

    # Generate QR Code image for the PDF
    qr_token = ticket.qr_token or f"SKYLINE-TICKET:{ticket.ticket_id}"
    qr_buf = io.BytesIO()
    qr_obj = qrcode.QRCode(
        box_size=6,
        border=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M
    )
    qr_obj.add_data(qr_token)
    qr_obj.make(fit=True)
    qr_img = qr_obj.make_image(fill_color="#0F172A", back_color="#FFFFFF")
    qr_img.save(qr_buf, format='PNG')
    qr_buf.seek(0)
    rl_qr = RLImage(qr_buf, width=130, height=130)

    # Participant Details & Ticket Details Table
    student = ticket.student
    student_name = student.full_name if student else "Student"
    student_email = student.email if student else "student@university.edu"
    student_id = getattr(student, 'student_id', None) or "N/A"
    
    event_date = str(ticket.event.date) if ticket.event and ticket.event.date else "TBA"
    event_time = f"{ticket.event.start_time} - {ticket.event.end_time}" if ticket.event else "TBA"
    venue = ticket.event.venue if ticket.event and ticket.event.venue else (ticket.event.location or "Student Union Auditorium")
    
    payment_id = ticket.payment.razorpay_payment_id if ticket.payment and ticket.payment.razorpay_payment_id else "VERIFIED-DIRECT"
    amount_paid = f"INR {ticket.price_paid:.2f}"

    left_data = [
        [Paragraph("Ticket ID:", label_style), Paragraph(str(ticket.ticket_id), bold_value_style)],
        [Paragraph("Participant Name:", label_style), Paragraph(student_name, value_style)],
        [Paragraph("Participant Email:", label_style), Paragraph(student_email, value_style)],
        [Paragraph("Student ID:", label_style), Paragraph(str(student_id), value_style)],
        [Paragraph("Event Date:", label_style), Paragraph(event_date, bold_value_style)],
        [Paragraph("Event Time:", label_style), Paragraph(event_time, value_style)],
        [Paragraph("Venue:", label_style), Paragraph(venue, value_style)],
        [Paragraph("Pass Tier:", label_style), Paragraph(ticket.tier or "Member Pass", value_style)],
        [Paragraph("Gate / Seat:", label_style), Paragraph(f"{ticket.gate} • {ticket.seat}", value_style)],
        [Paragraph("Payment Status:", label_style), Paragraph("<font color='#059669'><b>PAID (VERIFIED)</b></font>", value_style)],
        [Paragraph("Payment ID:", label_style), Paragraph(payment_id, value_style)],
        [Paragraph("Amount Paid:", label_style), Paragraph(amount_paid, bold_value_style)],
    ]

    details_table = Table(left_data, colWidths=[120, 240])
    details_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))

    # Combine details with QR Code side-by-side
    qr_card = [
        [rl_qr],
        [Paragraph("<font size=8 color='#64748B'>SCAN AT GATE</font>", ParagraphStyle('C', alignment=1))],
        [Paragraph(f"<font size=7 color='#94A3B8'>{ticket.ticket_id}</font>", ParagraphStyle('C2', alignment=1))]
    ]
    qr_table = Table(qr_card, colWidths=[140])
    qr_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))

    layout_table = Table([[details_table, qr_table]], colWidths=[380, 160])
    layout_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))

    story.append(layout_table)
    story.append(Spacer(1, 24))

    # Security & Instructions Notice
    security_text = (
        "<b>Notice to Attendee:</b> Please present this official PDF ticket and your Student ID card at the entrance gate. "
        "Each QR code is cryptographically unique and strictly allows one-time check-in. Duplicate entries or copies will "
        "be flagged and rejected by the entry verification scanner."
    )
    notice_style = ParagraphStyle(
        'Notice',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#64748B')
    )
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E2E8F0'), spaceAfter=10))
    story.append(Paragraph(security_text, notice_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("<font size=8 color='#94A3B8'>ConnectU Student Organization System • Division of Campus Life • Verified Institutional Pass</font>", ParagraphStyle('Footer', alignment=1)))

    doc.build(story)
    buffer.seek(0)
    return ContentFile(buffer.getvalue(), name=f"{ticket.ticket_id}.pdf")


def generate_merchandise_pdf(order) -> ContentFile:
    """
    Generates a professional, printable Merchandise Collection Pass PDF.
    Contains:
      - SKYLINE MERCHANDISE COLLECTION PASS
      - Order ID, Customer Name & Email
      - Merchandise Item Name, Variant/Size, Quantity
      - Amount Paid, Payment Status (PAID)
      - Collection Status (READY FOR COLLECTION)
      - Pickup Location
      - High-resolution Collection QR Code
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0F172A'),
        alignment=1
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0284C7'), # Skyline cyan/blue
        alignment=1
    )
    label_style = ParagraphStyle(
        'FieldLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#64748B')
    )
    value_style = ParagraphStyle(
        'FieldValue',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0F172A')
    )
    bold_value_style = ParagraphStyle(
        'BoldFieldValue',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#0F172A')
    )

    story = []

    # Header Card
    story.append(Paragraph("SKYLINE CAMPUS", title_style))
    story.append(Paragraph("OFFICIAL MERCHANDISE COLLECTION PASS", subtitle_style))
    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#E2E8F0'), spaceAfter=14))

    # Item Title
    item_title = order.merchandise.name if order.merchandise else "Skyline Campus Merchandise"
    item_style = ParagraphStyle(
        'ItemTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor('#0F172A')
    )
    story.append(Paragraph(item_title, item_style))
    story.append(Spacer(1, 12))

    # Generate QR Code image for the Collection Pass
    qr_token = order.qr_token or f"SKYLINE-MERCH:{order.order_id}"
    qr_buf = io.BytesIO()
    qr_obj = qrcode.QRCode(
        box_size=6,
        border=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M
    )
    qr_obj.add_data(qr_token)
    qr_obj.make(fit=True)
    qr_img = qr_obj.make_image(fill_color="#0F172A", back_color="#FFFFFF")
    qr_img.save(qr_buf, format='PNG')
    qr_buf.seek(0)
    rl_qr = RLImage(qr_buf, width=130, height=130)

    customer = order.user
    customer_name = customer.full_name if customer else "Student"
    customer_email = customer.email if customer else "student@university.edu"
    student_id = getattr(customer, 'student_id', None) or "N/A"
    
    payment_id = order.payment.razorpay_payment_id if order.payment and order.payment.razorpay_payment_id else "VERIFIED-DIRECT"
    amount_paid = f"INR {order.total_amount:.2f}"
    pickup_loc = order.pickup_location or "Student Union Desk - Campus Hub"

    left_data = [
        [Paragraph("Order ID:", label_style), Paragraph(str(order.order_id), bold_value_style)],
        [Paragraph("Customer Name:", label_style), Paragraph(customer_name, value_style)],
        [Paragraph("Customer Email:", label_style), Paragraph(customer_email, value_style)],
        [Paragraph("Student ID:", label_style), Paragraph(str(student_id), value_style)],
        [Paragraph("Merchandise:", label_style), Paragraph(item_title, bold_value_style)],
        [Paragraph("Variant / Size:", label_style), Paragraph(order.variant or "Standard", bold_value_style)],
        [Paragraph("Quantity:", label_style), Paragraph(str(order.quantity), bold_value_style)],
        [Paragraph("Amount Paid:", label_style), Paragraph(amount_paid, bold_value_style)],
        [Paragraph("Payment Status:", label_style), Paragraph("<font color='#059669'><b>PAID (VERIFIED)</b></font>", value_style)],
        [Paragraph("Payment ID:", label_style), Paragraph(payment_id, value_style)],
        [Paragraph("Collection Status:", label_style), Paragraph("<font color='#0284C7'><b>READY FOR COLLECTION</b></font>", bold_value_style)],
        [Paragraph("Pickup Location:", label_style), Paragraph(pickup_loc, value_style)],
    ]

    details_table = Table(left_data, colWidths=[120, 240])
    details_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
    ]))

    qr_card = [
        [rl_qr],
        [Paragraph("<font size=8 color='#64748B'>COLLECTION PASS</font>", ParagraphStyle('C', alignment=1))],
        [Paragraph(f"<font size=7 color='#94A3B8'>{order.order_id}</font>", ParagraphStyle('C2', alignment=1))]
    ]
    qr_table = Table(qr_card, colWidths=[140])
    qr_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))

    layout_table = Table([[details_table, qr_table]], colWidths=[380, 160])
    layout_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))

    story.append(layout_table)
    story.append(Spacer(1, 24))

    security_text = (
        "<b>Collection Instructions:</b> Present this digital or printed Collection Pass at the Student Union Desk. "
        "The collection organizer will scan this QR code to confirm and dispense your item. Once marked collected in the system, "
        "this pass is permanently retired."
    )
    notice_style = ParagraphStyle(
        'Notice',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#64748B')
    )
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E2E8F0'), spaceAfter=10))
    story.append(Paragraph(security_text, notice_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph("<font size=8 color='#94A3B8'>ConnectU Student Organization System • Campus Store & Inventory Management</font>", ParagraphStyle('Footer', alignment=1)))

    doc.build(story)
    buffer.seek(0)
    return ContentFile(buffer.getvalue(), name=f"{order.order_id}.pdf")
