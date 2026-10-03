import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class Event(models.Model):
    """
    Organization events that members can attend or volunteer for.
    """
    class EventType(models.TextChoices):
        FLAGSHIP = 'Flagship Event', _('Flagship Event')
        WORKSHOP = 'Technical Workshop', _('Technical Workshop')
        HACKATHON = 'Hackathon', _('Hackathon')
        NETWORKING = 'Career & Networking', _('Career & Networking')
        SOCIAL = 'Social & Culture', _('Social & Culture')
        SEMINAR = 'Seminar & Lecture', _('Seminar & Lecture')
        OTHER = 'General Event', _('General Event')

    class Status(models.TextChoices):
        DRAFT = 'Draft', _('Draft')
        PUBLISHED = 'Published', _('Published')
        COMPLETED = 'Completed', _('Completed')
        CANCELLED = 'Cancelled', _('Cancelled')

    title = models.CharField(_('event name'), max_length=200)
    description = models.TextField(_('event description'), blank=True, default='')
    event_type = models.CharField(
        _('event type'),
        max_length=100,
        default='Flagship Event',
        blank=True
    )
    venue = models.CharField(_('venue / location'), max_length=255, default='Student Union Auditorium', blank=True)
    location = models.CharField(_('legacy location'), max_length=255, blank=True)
    date = models.DateField(_('event date'), default=timezone.now)
    start_time = models.TimeField(_('start time'), default='14:00:00')
    end_time = models.TimeField(_('end time'), default='17:00:00')
    capacity = models.PositiveIntegerField(_('attendee capacity'), default=150)
    ticket_price = models.DecimalField(
        _('ticket price'),
        max_digits=10,
        decimal_places=2,
        default=0.00
    )
    image = models.TextField(
        _('event banner url'),
        blank=True,
        default='https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
    )

    # Volunteer Configuration
    volunteers_required = models.BooleanField(_('volunteers required'), default=False)
    volunteer_count_required = models.PositiveIntegerField(_('volunteer count required'), default=0)
    volunteer_deadline = models.DateField(_('volunteer deadline'), null=True, blank=True)
    volunteer_roles_required = models.TextField(
        _('volunteer roles required'),
        blank=True,
        default='Registration Desk, Photography Team, Technical Support, Stage Management, Hospitality, Event Coordinator',
        help_text=_('Comma-separated list of volunteer roles')
    )

    # Event Status
    status = models.CharField(
        _('event status'),
        max_length=20,
        choices=Status.choices,
        default=Status.PUBLISHED
    )
    is_active = models.BooleanField(_('is active'), default=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_events'
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        ordering = ['-date', '-start_time']
        verbose_name = _('Event')
        verbose_name_plural = _('Events')

    def __str__(self):
        return f"{self.title} ({self.date}) [{self.status}]"

    def save(self, *args, **kwargs):
        if not self.location and self.venue:
            self.location = self.venue
        elif not self.venue and self.location:
            self.venue = self.location
        if self.status == self.Status.PUBLISHED:
            self.is_active = True
        elif self.status in [self.Status.CANCELLED, self.Status.COMPLETED]:
            self.is_active = False
        super().save(*args, **kwargs)

    @property
    def roles_list(self):
        if not self.volunteer_roles_required:
            return []
        return [r.strip() for r in self.volunteer_roles_required.split(',') if r.strip()]

    @property
    def active_volunteers_count(self):
        return self.volunteer_assignments.filter(status='Active').count()

    @property
    def volunteer_slots_remaining(self):
        assigned = self.volunteer_assignments.count()
        return max(0, self.volunteer_count_required - assigned)


class VolunteerApplication(models.Model):
    """
    Application submitted by a Student (Member) to volunteer for an event.
    """
    class Status(models.TextChoices):
        PENDING = 'Pending', _('Pending')
        APPROVED = 'Approved', _('Approved')
        REJECTED = 'Rejected', _('Rejected')

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='volunteer_applications',
        limit_choices_to={'role': 'MEMBER'}
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='volunteer_applications'
    )
    preferred_role = models.CharField(_('preferred role'), max_length=100, default='General Volunteer')
    reason = models.TextField(_('why do you want to volunteer?'), blank=True)
    notes = models.TextField(_('legacy notes'), blank=True)
    experience = models.TextField(_('previous experience'), blank=True)
    status = models.CharField(
        _('application status'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    applied_at = models.DateTimeField(_('applied at'), auto_now_add=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_volunteer_applications'
    )
    reviewed_at = models.DateTimeField(_('reviewed at'), null=True, blank=True)
    admin_feedback = models.TextField(_('admin notes/feedback'), blank=True)

    class Meta:
        ordering = ['-applied_at']
        unique_together = ('student', 'event')
        verbose_name = _('Volunteer Application')
        verbose_name_plural = _('Volunteer Applications')
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['applied_at']),
        ]

    def __str__(self):
        return f"{self.student.full_name} -> {self.event.title} [{self.status}]"

    def save(self, *args, **kwargs):
        if not self.notes and self.reason:
            self.notes = self.reason
        elif not self.reason and self.notes:
            self.reason = self.notes
        super().save(*args, **kwargs)


class VolunteerAssignment(models.Model):
    """
    Active Volunteer Record created when Admin approves a VolunteerApplication.
    """
    class Status(models.TextChoices):
        ACTIVE = 'Active', _('Active')
        COMPLETED = 'Completed', _('Completed')

    application = models.OneToOneField(
        VolunteerApplication,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assignment'
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='volunteer_assignments'
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='volunteer_assignments'
    )
    assigned_role = models.CharField(_('assigned volunteer role'), max_length=100)
    duration = models.CharField(_('duration'), max_length=100, default='4 Hours')
    notes = models.TextField(_('assignment notes'), blank=True)
    status = models.CharField(
        _('assignment status'),
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )
    approved_at = models.DateTimeField(_('approved at'), auto_now_add=True)
    completed_at = models.DateTimeField(_('completed at'), null=True, blank=True)

    class Meta:
        ordering = ['-approved_at']
        verbose_name = _('Volunteer Assignment')
        verbose_name_plural = _('Volunteer Assignments')

    def __str__(self):
        return f"{self.student.full_name} - {self.assigned_role} @ {self.event.title} [{self.status}]"


class Certificate(models.Model):
    """
    Official Institutional Volunteer Certificate issued after Event Completion.
    """
    certificate_id = models.CharField(
        _('certificate id'),
        max_length=50,
        unique=True,
        editable=False
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='certificates'
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='certificates'
    )
    assignment = models.ForeignKey(
        VolunteerAssignment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='certificates'
    )
    volunteer_role = models.CharField(_('volunteer role'), max_length=100)
    duration = models.CharField(_('duration / hours'), max_length=100, default='4 Hours')
    issue_date = models.DateField(_('issue date'), default=timezone.now)
    verification_hash = models.CharField(_('cryptographic verification hash'), max_length=64, blank=True)

    class Meta:
        ordering = ['-issue_date']
        unique_together = ('student', 'event')
        verbose_name = _('Certificate')
        verbose_name_plural = _('Certificates')

    def save(self, *args, **kwargs):
        if not self.certificate_id:
            uid = uuid.uuid4().hex[:8].upper()
            year = timezone.now().year
            self.certificate_id = f"CERT-{year}-{uid}"
        if not self.verification_hash:
            seed = f"{self.certificate_id}-{self.student_id}-{self.event_id}-{timezone.now().timestamp()}"
            import hashlib
            self.verification_hash = hashlib.sha256(seed.encode('utf-8')).hexdigest()[:16].upper()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.certificate_id} - {self.student.full_name} - {self.event.title}"
