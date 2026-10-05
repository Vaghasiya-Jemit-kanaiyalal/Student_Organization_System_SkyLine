import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class UserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_("The Email field must be set"))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError(_('Superuser must have is_staff=True.'))
        if extra_fields.get('is_superuser') is not True:
            raise ValueError(_('Superuser must have is_superuser=True.'))

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model supporting three primary roles:
    - STUDENT / MEMBER (student enrolled in university / organization)
    - ADMIN (full organizational control)
    - TREASURER (financial management and approvals)

    Membership is a property/status of a Student (not a separate role).
    """
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', _('Student')
        MEMBER = 'MEMBER', _('Member')
        ADMIN = 'ADMIN', _('Admin')
        TREASURER = 'TREASURER', _('Treasurer')

    class MembershipStatus(models.TextChoices):
        NONE = 'NONE', _('None')
        ACTIVE = 'ACTIVE', _('Active')
        EXPIRED = 'EXPIRED', _('Expired')

    class MembershipType(models.TextChoices):
        SEMESTER = 'SEMESTER', _('Semester')
        ANNUAL = 'ANNUAL', _('Annual')

    full_name = models.CharField(_('full name'), max_length=150)
    student_id = models.CharField(
        _('student ID'),
        max_length=50,
        unique=True,
        null=True,
        blank=True,
        help_text=_('Unique university student ID. Required for student members.')
    )
    email = models.EmailField(_('university email address'), unique=True)
    role = models.CharField(
        _('role'),
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT
    )

    # Student Membership Status & Properties
    membership_status = models.CharField(
        _('membership status'),
        max_length=20,
        choices=MembershipStatus.choices,
        default=MembershipStatus.NONE
    )
    membership_type = models.CharField(
        _('membership type'),
        max_length=20,
        choices=MembershipType.choices,
        null=True,
        blank=True
    )
    membership_start_date = models.DateField(
        _('membership start date'),
        null=True,
        blank=True
    )
    membership_end_date = models.DateField(
        _('membership expiry date'),
        null=True,
        blank=True
    )

    # University Department & Metadata
    department = models.CharField(_('department / major'), max_length=150, blank=True, default='Computer Science & Software Engineering')
    semester = models.CharField(_('academic semester'), max_length=50, blank=True, default='Semester 4 • 2026')
    phone = models.CharField(_('contact phone'), max_length=30, blank=True, default='+1 (555) 234-8910')
    avatar = models.TextField(
        _('avatar image url'),
        blank=True,
        default='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
    )

    is_active = models.BooleanField(_('active status'), default=True)
    is_staff = models.BooleanField(_('staff status'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['student_id']),
            models.Index(fields=['role']),
            models.Index(fields=['membership_status']),
        ]

    def __str__(self):
        return f"{self.full_name} ({self.email}) - [{self.role} | {self.membership_status}]"

    def check_and_update_membership_expiry(self):
        """
        Auto-check if active membership has passed its expiry date.
        If finish duration is reached, membership is automatically discarded / expired.
        """
        today = timezone.now().date()
        changed = False

        if self.membership_status == self.MembershipStatus.ACTIVE:
            if self.membership_end_date and self.membership_end_date < today:
                self.membership_status = self.MembershipStatus.EXPIRED
                changed = True

        # Also expire any active ClubMembership records when their duration finishes
        expired_club_memberships = self.club_memberships.filter(
            status=ClubMembership.Status.ACTIVE,
            end_date__lt=today
        )
        if expired_club_memberships.exists():
            expired_club_memberships.update(status=ClubMembership.Status.EXPIRED)
            if not self.club_memberships.filter(status=ClubMembership.Status.ACTIVE).exists():
                self.membership_status = self.MembershipStatus.EXPIRED
                changed = True

        if changed:
            self.save(update_fields=['membership_status'])
        return changed

    def discard_membership(self, reset_to='EXPIRED', reason='Admin discarded membership'):
        """
        Admin action to immediately discard/revoke student's membership and privileges.
        """
        target_status = self.MembershipStatus.EXPIRED if reset_to == 'EXPIRED' else self.MembershipStatus.NONE
        self.membership_status = target_status
        # Cancel or expire all active club memberships
        self.club_memberships.filter(status=ClubMembership.Status.ACTIVE).update(
            status=ClubMembership.Status.CANCELLED
        )
        self.save(update_fields=['membership_status'])
        return True

    @classmethod
    def auto_discard_expired_memberships(cls):
        """
        System-wide bulk check to discard all memberships that have finished duration.
        """
        today = timezone.now().date()
        cls.objects.filter(
            membership_status=cls.MembershipStatus.ACTIVE,
            membership_end_date__lt=today
        ).update(membership_status=cls.MembershipStatus.EXPIRED)
        ClubMembership.objects.filter(
            status=ClubMembership.Status.ACTIVE,
            end_date__lt=today
        ).update(status=ClubMembership.Status.EXPIRED)

    @property
    def is_admin_role(self):
        return self.role == self.Role.ADMIN or self.is_superuser

    @property
    def is_treasurer_role(self):
        return self.role in [self.Role.TREASURER, self.Role.ADMIN] or self.is_superuser

    @property
    def is_member_role(self):
        return self.role in [self.Role.STUDENT, self.Role.MEMBER]

    @property
    def is_active_member(self):
        """
        Returns True if student currently holds active valid membership.
        Automatically discards / marks expired if the finish duration has passed.
        """
        if self.membership_status != self.MembershipStatus.ACTIVE:
            return False
        if self.membership_end_date and self.membership_end_date < timezone.now().date():
            self.check_and_update_membership_expiry()
            return False
        return True

    @property
    def membership_badge(self):
        """
        Badge:
        - Normal Student / Expired: "Student"
        - Active Semester: "Semester Member"
        - Active Annual: "Annual Member"
        """
        if not self.is_active_member:
            return "Student"
        if self.membership_type == self.MembershipType.ANNUAL:
            return "Annual Member"
        elif self.membership_type == self.MembershipType.SEMESTER:
            return "Semester Member"
        return "Student"


class Club(models.Model):
    """
    University Student Club & Organization Model
    """
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(_('club name'), max_length=200)
    short_name = models.CharField(_('short name'), max_length=100, blank=True)
    tagline = models.CharField(_('tagline'), max_length=255, blank=True)
    description = models.TextField(_('club description'), blank=True)
    category = models.CharField(_('category'), max_length=100, default='Engineering & Technology')
    badge = models.CharField(_('featured badge'), max_length=50, default='Flagship Chapter', blank=True)
    faculty_advisor = models.CharField(_('faculty advisor'), max_length=150, default='Dr. Alexander Vance (Faculty Advisor)')
    meeting_schedule = models.CharField(_('meeting schedule'), max_length=255, default='Tuesdays & Thursdays • 5:30 PM')
    banner_image = models.TextField(_('club banner url'), blank=True, default='https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80')
    semester_fee = models.DecimalField(_('semester membership fee'), max_digits=10, decimal_places=2, default=299.00)
    annual_fee = models.DecimalField(_('annual membership fee'), max_digits=10, decimal_places=2, default=499.00)
    available_spots = models.PositiveIntegerField(_('available spots'), default=35)
    total_spots = models.PositiveIntegerField(_('total spots'), default=150)
    benefits = models.JSONField(_('member benefits list'), default=list, blank=True)
    website_url = models.URLField(_('club resource link'), max_length=500, blank=True, default='')
    is_active = models.BooleanField(_('is active'), default=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    class Meta:
        ordering = ['name']
        verbose_name = _('Club')
        verbose_name_plural = _('Clubs')

    def __str__(self):
        return f"{self.name} ({self.category})"


class ClubMembership(models.Model):
    """
    Membership Record linking a Student to a specific Club or Organization.
    """
    class MembershipType(models.TextChoices):
        SEMESTER = 'SEMESTER', _('Semester')
        ANNUAL = 'ANNUAL', _('Annual')

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', _('Active')
        EXPIRED = 'EXPIRED', _('Expired')
        CANCELLED = 'CANCELLED', _('Cancelled')

    id = models.CharField(max_length=60, primary_key=True, editable=False)
    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='club_memberships'
    )
    club = models.ForeignKey(
        Club,
        on_delete=models.CASCADE,
        related_name='memberships',
        null=True,
        blank=True
    )
    club_name_snapshot = models.CharField(_('club name snapshot'), max_length=200, blank=True)
    membership_type = models.CharField(
        _('membership type'),
        max_length=20,
        choices=MembershipType.choices,
        default=MembershipType.ANNUAL
    )
    fee = models.DecimalField(_('membership fee paid'), max_digits=10, decimal_places=2, default=0.00)
    start_date = models.DateField(_('start date'), default=timezone.now)
    end_date = models.DateField(_('expiry date'))
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    payment_method = models.CharField(_('payment method'), max_length=100, default='Student Account (Bursar)')
    transaction_id = models.CharField(_('receipt / transaction ID'), max_length=100, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Club Membership')
        verbose_name_plural = _('Club Memberships')

    def save(self, *args, **kwargs):
        if not self.id:
            uid = uuid.uuid4().hex[:8].upper()
            year = timezone.now().year
            self.id = f"MEM-{year}-{uid}"
        if not self.transaction_id:
            self.transaction_id = f"TXN-{uuid.uuid4().hex[:10].upper()}"
        if self.club and not self.club_name_snapshot:
            self.club_name_snapshot = self.club.name
        
        super().save(*args, **kwargs)

        # Synchronize Student User's core membership status
        if self.status == self.Status.ACTIVE:
            self.student.membership_status = User.MembershipStatus.ACTIVE
            self.student.membership_type = self.membership_type
            self.student.membership_start_date = self.start_date
            self.student.membership_end_date = self.end_date
            self.student.save(update_fields=[
                'membership_status',
                'membership_type',
                'membership_start_date',
                'membership_end_date'
            ])

    def __str__(self):
        return f"{self.student.full_name} - {self.club_name_snapshot} ({self.membership_type}) [{self.status}]"


class MembershipNotificationLog(models.Model):
    """
    Tracks membership-related email notifications (expiry reminders & expired notices)
    to prevent duplicate dispatches and provide a full audit trail.
    """
    class NotificationType(models.TextChoices):
        REMINDER_30_DAYS = 'REMINDER_30_DAYS', _('30 Days Expiry Reminder')
        REMINDER_7_DAYS = 'REMINDER_7_DAYS', _('7 Days Expiry Reminder')
        REMINDER_1_DAY = 'REMINDER_1_DAY', _('1 Day Expiry Reminder')
        REMINDER_CUSTOM = 'REMINDER_CUSTOM', _('Custom Expiry Reminder')
        MEMBERSHIP_EXPIRED = 'MEMBERSHIP_EXPIRED', _('Membership Expired / Due Notice')
        PAYMENT_EVENT_TICKET = 'PAYMENT_EVENT_TICKET', _('Event Ticket Payment Success')
        PAYMENT_MERCHANDISE = 'PAYMENT_MERCHANDISE', _('Merchandise Payment Success')

    class DeliveryStatus(models.TextChoices):
        SENT = 'SENT', _('Sent Successfully')
        FAILED = 'FAILED', _('Failed')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='membership_notification_logs'
    )
    notification_type = models.CharField(
        _('notification type'),
        max_length=50,
        choices=NotificationType.choices
    )
    target_expiry_date = models.DateField(
        _('target expiry date'),
        null=True,
        blank=True,
        help_text=_('Expiry date for which the reminder/notice was dispatched.')
    )
    reference_id = models.CharField(
        _('payment or item reference ID'),
        max_length=100,
        blank=True,
        default='',
        help_text=_('Unique reference such as ticket_id, order_id, or payment_id to prevent duplicates.')
    )
    recipient_email = models.EmailField(_('recipient email address'))
    status = models.CharField(
        _('delivery status'),
        max_length=20,
        choices=DeliveryStatus.choices,
        default=DeliveryStatus.SENT
    )
    error_message = models.TextField(_('error message'), blank=True, default='')
    sent_at = models.DateTimeField(_('sent at'), auto_now_add=True)

    class Meta:
        ordering = ['-sent_at']
        verbose_name = _('Membership Notification Log')
        verbose_name_plural = _('Membership Notification Logs')
        indexes = [
            models.Index(fields=['user', 'notification_type', 'target_expiry_date']),
            models.Index(fields=['user', 'notification_type', 'reference_id']),
            models.Index(fields=['sent_at']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.notification_type} [{self.status}] on {self.sent_at.strftime('%Y-%m-%d %H:%M')}"


