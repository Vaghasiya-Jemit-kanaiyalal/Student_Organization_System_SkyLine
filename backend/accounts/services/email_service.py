import logging
from datetime import date
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from accounts.models import User, ClubMembership, MembershipNotificationLog

logger = logging.getLogger(__name__)


def get_frontend_renewal_url() -> str:
    """
    Returns the frontend membership renewal URL.
    """
    base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    return f"{base_url}/member/dashboard?tab=membership"


def get_frontend_reset_password_url(uidb64: str, token: str) -> str:
    """
    Returns the frontend password reset URL with secure token parameters.
    """
    base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    return f"{base_url}/reset-password?uid={uidb64}&token={token}"


def is_valid_email(email: str) -> bool:
    """
    Basic sanity check for email validity.
    """
    if not email or not isinstance(email, str):
        return False
    email = email.strip()
    return '@' in email and '.' in email and len(email) >= 5


def get_reminder_notification_type(days_left: int) -> str:
    """
    Maps day thresholds to NotificationType enum choices or custom tags.
    """
    if days_left == 30:
        return MembershipNotificationLog.NotificationType.REMINDER_30_DAYS
    elif days_left == 7:
        return MembershipNotificationLog.NotificationType.REMINDER_7_DAYS
    elif days_left == 1:
        return MembershipNotificationLog.NotificationType.REMINDER_1_DAY
    return f"REMINDER_{days_left}_DAYS"


def send_membership_expiry_reminder(
    user: User,
    days_left: int,
    target_expiry_date: date = None,
    dry_run: bool = False,
    force: bool = False
) -> dict:
    """
    Sends a membership expiration reminder email to an active member.
    Prevents duplicate emails for the same expiration period unless force=True.
    """
    if not user or not user.is_active:
        return {'success': False, 'status': 'SKIPPED', 'reason': 'User inactive or not found'}

    target_date = target_expiry_date or user.membership_end_date
    if not target_date:
        return {'success': False, 'status': 'SKIPPED', 'reason': 'User has no membership expiry date'}

    recipient_email = (user.email or '').strip()
    if not is_valid_email(recipient_email):
        logger.warning(f"Cannot send expiry reminder: Invalid email '{recipient_email}' for user {user.id}")
        if not dry_run:
            MembershipNotificationLog.objects.create(
                user=user,
                notification_type=get_reminder_notification_type(days_left),
                target_expiry_date=target_date,
                recipient_email=recipient_email or 'unknown@invalid',
                status=MembershipNotificationLog.DeliveryStatus.FAILED,
                error_message='Invalid or empty recipient email address'
            )
        return {'success': False, 'status': 'FAILED', 'reason': 'Invalid email address'}

    notif_type = get_reminder_notification_type(days_left)

    # Duplicate Prevention Check:
    # Ensure this user hasn't already received this reminder for the CURRENT target expiry date.
    if not force:
        already_sent = MembershipNotificationLog.objects.filter(
            user=user,
            notification_type=notif_type,
            target_expiry_date=target_date,
            status=MembershipNotificationLog.DeliveryStatus.SENT
        ).exists()
        if already_sent:
            return {
                'success': True,
                'status': 'ALREADY_SENT',
                'reason': f"Reminder for {days_left} days already sent for expiry date {target_date}"
            }

    renewal_url = get_frontend_renewal_url()
    subject = f"[SkyLine] Action Required: Your Membership Expires in {days_left} Day{'s' if days_left != 1 else ''}"
    
    # Temporary placeholder email message (will be updated when final wording is provided)
    message = (
        f"Hello {user.full_name},\n\n"
        f"This is a reminder that your Skyline Student Organization membership will expire in "
        f"{days_left} day{'s' if days_left != 1 else ''} on {target_date.strftime('%B %d, %Y')}.\n\n"
        f"To continue enjoying member benefits, voting rights, and organization access without interruption, "
        f"please renew your membership:\n\n"
        f"Renew Online: {renewal_url}\n\n"
        f"Best regards,\n"
        f"SkyLine Student Organization Team"
    )

    if dry_run:
        logger.info(f"[DRY-RUN] Would send {notif_type} to {recipient_email} (Expiry: {target_date})")
        return {'success': True, 'status': 'DRY_RUN_SUCCESS', 'recipient': recipient_email}

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False
        )

        MembershipNotificationLog.objects.create(
            user=user,
            notification_type=notif_type,
            target_expiry_date=target_date,
            recipient_email=recipient_email,
            status=MembershipNotificationLog.DeliveryStatus.SENT,
            error_message=''
        )
        logger.info(f"Successfully sent membership expiry reminder ({days_left}d) to {recipient_email}")
        return {'success': True, 'status': 'SENT', 'recipient': recipient_email}

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send expiry reminder to {recipient_email}: {error_msg}")
        MembershipNotificationLog.objects.create(
            user=user,
            notification_type=notif_type,
            target_expiry_date=target_date,
            recipient_email=recipient_email,
            status=MembershipNotificationLog.DeliveryStatus.FAILED,
            error_message=error_msg
        )
        return {'success': False, 'status': 'FAILED', 'reason': error_msg}


def send_membership_expired_notice(
    user: User,
    target_expiry_date: date = None,
    dry_run: bool = False,
    force: bool = False
) -> dict:
    """
    Sends an email to a member whose membership has reached/passed its expiry date.
    Prevents duplicate emails for the same expiration period unless force=True.
    """
    if not user or not user.is_active:
        return {'success': False, 'status': 'SKIPPED', 'reason': 'User inactive or not found'}

    target_date = target_expiry_date or user.membership_end_date
    if not target_date:
        return {'success': False, 'status': 'SKIPPED', 'reason': 'User has no membership expiry date'}

    recipient_email = (user.email or '').strip()
    if not is_valid_email(recipient_email):
        logger.warning(f"Cannot send expired notice: Invalid email '{recipient_email}' for user {user.id}")
        if not dry_run:
            MembershipNotificationLog.objects.create(
                user=user,
                notification_type=MembershipNotificationLog.NotificationType.MEMBERSHIP_EXPIRED,
                target_expiry_date=target_date,
                recipient_email=recipient_email or 'unknown@invalid',
                status=MembershipNotificationLog.DeliveryStatus.FAILED,
                error_message='Invalid or empty recipient email address'
            )
        return {'success': False, 'status': 'FAILED', 'reason': 'Invalid email address'}

    notif_type = MembershipNotificationLog.NotificationType.MEMBERSHIP_EXPIRED

    # Duplicate Prevention Check
    if not force:
        already_sent = MembershipNotificationLog.objects.filter(
            user=user,
            notification_type=notif_type,
            target_expiry_date=target_date,
            status=MembershipNotificationLog.DeliveryStatus.SENT
        ).exists()
        if already_sent:
            return {
                'success': True,
                'status': 'ALREADY_SENT',
                'reason': f"Expired notice already sent for expiry date {target_date}"
            }

    renewal_url = get_frontend_renewal_url()
    subject = "[SkyLine] Important: Your Membership Has Expired - Renewal Due"

    # Temporary placeholder email message (will be updated when final wording is provided)
    message = (
        f"Hello {user.full_name},\n\n"
        f"Your Skyline Student Organization membership expired on {target_date.strftime('%B %d, %Y')}.\n\n"
        f"Your member privileges and club access have been temporarily paused. "
        f"You can reactivate your membership at any time by renewing through the portal:\n\n"
        f"Renew Membership: {renewal_url}\n\n"
        f"Thank you for being a part of our student community.\n\n"
        f"Best regards,\n"
        f"SkyLine Student Organization Team"
    )

    if dry_run:
        logger.info(f"[DRY-RUN] Would send expired notice to {recipient_email} (Expired: {target_date})")
        return {'success': True, 'status': 'DRY_RUN_SUCCESS', 'recipient': recipient_email}

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False
        )

        MembershipNotificationLog.objects.create(
            user=user,
            notification_type=notif_type,
            target_expiry_date=target_date,
            recipient_email=recipient_email,
            status=MembershipNotificationLog.DeliveryStatus.SENT,
            error_message=''
        )
        logger.info(f"Successfully sent membership expired notice to {recipient_email}")
        return {'success': True, 'status': 'SENT', 'recipient': recipient_email}

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send expired notice to {recipient_email}: {error_msg}")
        MembershipNotificationLog.objects.create(
            user=user,
            notification_type=notif_type,
            target_expiry_date=target_date,
            recipient_email=recipient_email,
            status=MembershipNotificationLog.DeliveryStatus.FAILED,
            error_message=error_msg
        )
        return {'success': False, 'status': 'FAILED', 'reason': error_msg}


def send_password_reset_email(user: User) -> dict:
    """
    Generates a secure password reset token and dispatches the password reset email.
    """
    if not user or not user.is_active:
        return {'success': False, 'reason': 'User inactive or not found'}

    recipient_email = (user.email or '').strip()
    if not is_valid_email(recipient_email):
        return {'success': False, 'reason': 'Invalid email address'}

    token = default_token_generator.make_token(user)
    uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
    reset_url = get_frontend_reset_password_url(uidb64, token)

    subject = "[SkyLine] Password Reset Request"

    # Temporary placeholder email message (will be updated when final wording is provided)
    message = (
        f"Hello {user.full_name},\n\n"
        f"We received a request to reset your password for your Skyline Student Organization account.\n\n"
        f"Click the link below to set a new password:\n"
        f"{reset_url}\n\n"
        f"This link is valid for a limited time. If you did not request a password reset, "
        f"please disregard this message and your password will remain unchanged.\n\n"
        f"Best regards,\n"
        f"SkyLine Security Team"
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False
        )
        logger.info(f"Successfully sent password reset email to {recipient_email}")
        return {'success': True, 'recipient': recipient_email}
    except Exception as e:
        logger.error(f"Failed to send password reset email to {recipient_email}: {e}")
        return {'success': False, 'reason': str(e)}


def process_membership_checks(
    reminder_days: list = None,
    dry_run: bool = False,
    force: bool = False
) -> dict:
    """
    Executes a comprehensive membership check:
    1. Identifies active memberships that have expired (end_date <= today),
       updates their status, and dispatches the expired notification.
    2. Identifies active memberships approaching expiry matching the configured
       reminder day thresholds (e.g. 30, 7, 1 days before expiry), and dispatches reminders.
    3. Handles already expired members who haven't yet received the expired notice.
    """
    if reminder_days is None:
        reminder_days = getattr(settings, 'MEMBERSHIP_EXPIRY_REMINDER_DAYS', [30, 7, 1])

    today = timezone.now().date()
    stats = {
        'total_checked': 0,
        'reminders_sent': 0,
        'expired_sent': 0,
        'already_sent': 0,
        'failed': 0,
        'status_updated_to_expired': 0,
        'details': []
    }

    # Fetch all users with a registered membership_end_date
    users_with_expiry = User.objects.filter(
        is_active=True,
        membership_end_date__isnull=False
    ).exclude(membership_status=User.MembershipStatus.NONE)

    for user in users_with_expiry:
        stats['total_checked'] += 1
        end_date = user.membership_end_date

        if end_date <= today:
            # Membership has reached or passed expiry date
            if user.membership_status == User.MembershipStatus.ACTIVE:
                if not dry_run:
                    user.membership_status = User.MembershipStatus.EXPIRED
                    user.save(update_fields=['membership_status'])
                    ClubMembership.objects.filter(
                        student=user,
                        status=ClubMembership.Status.ACTIVE,
                        end_date__lte=today
                    ).update(status=ClubMembership.Status.EXPIRED)
                stats['status_updated_to_expired'] += 1

            # Dispatch Expired / Due email
            res = send_membership_expired_notice(
                user=user,
                target_expiry_date=end_date,
                dry_run=dry_run,
                force=force
            )
            if res.get('status') in ['SENT', 'DRY_RUN_SUCCESS']:
                stats['expired_sent'] += 1
            elif res.get('status') == 'ALREADY_SENT':
                stats['already_sent'] += 1
            else:
                stats['failed'] += 1

            stats['details'].append({
                'user_id': user.id,
                'email': user.email,
                'type': 'EXPIRED_NOTICE',
                'result': res
            })

        else:
            # Active membership approaching expiry
            days_left = (end_date - today).days
            if days_left in reminder_days and user.membership_status == User.MembershipStatus.ACTIVE:
                res = send_membership_expiry_reminder(
                    user=user,
                    days_left=days_left,
                    target_expiry_date=end_date,
                    dry_run=dry_run,
                    force=force
                )
                if res.get('status') in ['SENT', 'DRY_RUN_SUCCESS']:
                    stats['reminders_sent'] += 1
                elif res.get('status') == 'ALREADY_SENT':
                    stats['already_sent'] += 1
                else:
                    stats['failed'] += 1

                stats['details'].append({
                    'user_id': user.id,
                    'email': user.email,
                    'type': f'REMINDER_{days_left}_DAYS',
                    'days_left': days_left,
                    'result': res
                })

    return stats


def send_event_payment_success_email(
    user: User,
    event_name: str,
    event_date: str,
    event_time: str,
    event_venue: str,
    ticket_id: str,
    amount_paid: str,
    payment_id: str = '',
    ticket_url: str = None
) -> dict:
    """
    Sends a confirmation email upon successful backend verification of an event ticket payment.
    Includes full event details, ticket ID, payment status, and a secure link to view/download the ticket.
    Guaranteed not to throw exceptions so payment integrity is never compromised.
    """
    if not user or not user.is_active:
        return {'success': False, 'status': 'SKIPPED', 'reason': 'User inactive or not found'}

    recipient_email = (user.email or '').strip()
    if not is_valid_email(recipient_email):
        logger.warning(f"Cannot send event payment email: Invalid email '{recipient_email}'")
        MembershipNotificationLog.objects.create(
            user=user,
            notification_type=MembershipNotificationLog.NotificationType.PAYMENT_EVENT_TICKET,
            reference_id=str(ticket_id or payment_id or ''),
            recipient_email=recipient_email or 'unknown@invalid',
            status=MembershipNotificationLog.DeliveryStatus.FAILED,
            error_message='Invalid or empty recipient email address'
        )
        return {'success': False, 'status': 'FAILED', 'reason': 'Invalid email address'}

    # Duplicate Prevention Check
    ref_key = str(ticket_id or payment_id or '').strip()
    if ref_key:
        already_sent = MembershipNotificationLog.objects.filter(
            user=user,
            notification_type=MembershipNotificationLog.NotificationType.PAYMENT_EVENT_TICKET,
            reference_id=ref_key,
            status=MembershipNotificationLog.DeliveryStatus.SENT
        ).exists()
        if already_sent:
            return {
                'success': True,
                'status': 'ALREADY_SENT',
                'reason': f"Event payment confirmation already sent for ticket/payment {ref_key}"
            }

    base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    target_ticket_url = ticket_url or f"{base_url}/member/dashboard?tab=events"

    subject = f"[SkyLine] Payment Confirmed: Your Ticket for {event_name}"

    # Temporary placeholder email message (will be updated when final wording is provided)
    message = (
        f"EVENT PAYMENT SUCCESSFUL\n\n"
        f"Participant: {user.full_name}\n"
        f"Event: {event_name}\n"
        f"Date: {event_date}\n"
        f"Time: {event_time}\n"
        f"Venue: {event_venue}\n"
        f"Amount: ${amount_paid}\n"
        f"Payment Status: PAID\n"
        f"Payment Reference: {payment_id or 'Online / Bursar'}\n"
        f"Ticket ID: {ticket_id}\n\n"
        f"Your event ticket has been generated and is ready for entry.\n\n"
        f"DOWNLOAD YOUR TICKET:\n"
        f"{target_ticket_url}\n\n"
        f"You can also access all your active tickets anytime by logging into the Skyline student portal.\n\n"
        f"Best regards,\n"
        f"SkyLine Events Team"
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False
        )

        MembershipNotificationLog.objects.create(
            user=user,
            notification_type=MembershipNotificationLog.NotificationType.PAYMENT_EVENT_TICKET,
            reference_id=ref_key,
            recipient_email=recipient_email,
            status=MembershipNotificationLog.DeliveryStatus.SENT,
            error_message=''
        )
        logger.info(f"Successfully sent event payment success email for ticket {ticket_id} to {recipient_email}")
        return {'success': True, 'status': 'SENT', 'recipient': recipient_email}

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send event payment email to {recipient_email}: {error_msg}")
        MembershipNotificationLog.objects.create(
            user=user,
            notification_type=MembershipNotificationLog.NotificationType.PAYMENT_EVENT_TICKET,
            reference_id=ref_key,
            recipient_email=recipient_email,
            status=MembershipNotificationLog.DeliveryStatus.FAILED,
            error_message=error_msg
        )
        # Return cleanly so payment remains SUCCESS
        return {'success': False, 'status': 'FAILED', 'reason': error_msg}


def send_merchandise_payment_success_email(
    user: User,
    order_id: str,
    item_name: str,
    amount_paid: str,
    quantity: int = 1,
    variant: str = '',
    image_url: str = '',
    payment_id: str = '',
    collection_status: str = 'READY FOR COLLECTION',
    order_url: str = None
) -> dict:
    """
    Sends a confirmation email upon successful backend verification of a merchandise order.
    Includes item photo reference, variant, quantity, collection info, and a collection pass link.
    Guaranteed not to throw exceptions so payment integrity is never compromised.
    """
    if not user or not user.is_active:
        return {'success': False, 'status': 'SKIPPED', 'reason': 'User inactive or not found'}

    recipient_email = (user.email or '').strip()
    if not is_valid_email(recipient_email):
        logger.warning(f"Cannot send merchandise payment email: Invalid email '{recipient_email}'")
        MembershipNotificationLog.objects.create(
            user=user,
            notification_type=MembershipNotificationLog.NotificationType.PAYMENT_MERCHANDISE,
            reference_id=str(order_id or payment_id or ''),
            recipient_email=recipient_email or 'unknown@invalid',
            status=MembershipNotificationLog.DeliveryStatus.FAILED,
            error_message='Invalid or empty recipient email address'
        )
        return {'success': False, 'status': 'FAILED', 'reason': 'Invalid email address'}

    # Duplicate Prevention Check
    ref_key = str(order_id or payment_id or '').strip()
    if ref_key:
        already_sent = MembershipNotificationLog.objects.filter(
            user=user,
            notification_type=MembershipNotificationLog.NotificationType.PAYMENT_MERCHANDISE,
            reference_id=ref_key,
            status=MembershipNotificationLog.DeliveryStatus.SENT
        ).exists()
        if already_sent:
            return {
                'success': True,
                'status': 'ALREADY_SENT',
                'reason': f"Merchandise payment confirmation already sent for order/payment {ref_key}"
            }

    base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    target_order_url = order_url or f"{base_url}/member/dashboard?tab=merchandise"

    # Ensure image URL is well-formed for email clients
    full_image_url = image_url or ''
    if full_image_url.startswith('/'):
        full_image_url = f"{base_url}{full_image_url}"

    subject = f"[SkyLine] Payment Confirmed: Merchandise Order #{order_id}"

    # Temporary placeholder email message (will be updated when final wording is provided)
    message = (
        f"MERCHANDISE PAYMENT SUCCESSFUL\n\n"
        f"Customer: {user.full_name}\n"
        f"Order ID: {order_id}\n"
        f"Merchandise: {item_name}\n"
        f"Variant: {variant or 'Standard'}\n"
        f"Quantity: {quantity}\n"
        f"Amount: ${amount_paid}\n"
        f"Payment Status: PAID\n"
        f"Payment Reference: {payment_id or 'Online / Bursar'}\n"
        f"Collection Status: {collection_status}\n"
        f"Product Photo: {full_image_url}\n\n"
        f"Your order has been confirmed and is scheduled for pickup at the Skyline Student Union Office.\n\n"
        f"VIEW ORDER / DOWNLOAD COLLECTION PASS:\n"
        f"{target_order_url}\n\n"
        f"Best regards,\n"
        f"SkyLine Merchandise & Store Team"
    )

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False
        )

        MembershipNotificationLog.objects.create(
            user=user,
            notification_type=MembershipNotificationLog.NotificationType.PAYMENT_MERCHANDISE,
            reference_id=ref_key,
            recipient_email=recipient_email,
            status=MembershipNotificationLog.DeliveryStatus.SENT,
            error_message=''
        )
        logger.info(f"Successfully sent merchandise payment success email for order {order_id} to {recipient_email}")
        return {'success': True, 'status': 'SENT', 'recipient': recipient_email}

    except Exception as e:
        error_msg = str(e)
        logger.error(f"Failed to send merchandise payment email to {recipient_email}: {error_msg}")
        MembershipNotificationLog.objects.create(
            user=user,
            notification_type=MembershipNotificationLog.NotificationType.PAYMENT_MERCHANDISE,
            reference_id=ref_key,
            recipient_email=recipient_email,
            status=MembershipNotificationLog.DeliveryStatus.FAILED,
            error_message=error_msg
        )
        # Return cleanly so payment remains SUCCESS
        return {'success': False, 'status': 'FAILED', 'reason': error_msg}

