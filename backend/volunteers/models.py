from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Event(models.Model):
    """
    Organization events that members can attend or volunteer for.
    """
    title = models.CharField(_('event title'), max_length=200)
    description = models.TextField(_('event description'))
    date = models.DateTimeField(_('event date & time'))
    location = models.CharField(_('event location'), max_length=255)
    max_volunteers = models.PositiveIntegerField(_('maximum volunteers required'), default=10)
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
        ordering = ['-date']
        verbose_name = _('Event')
        verbose_name_plural = _('Events')

    def __str__(self):
        return f"{self.title} - {self.date.strftime('%Y-%m-%d')}"


class VolunteerApplication(models.Model):
    """
    Application submitted by a Member to volunteer for a specific event.
    Admin reviews and marks status as APPROVED or REJECTED.
    """
    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        APPROVED = 'APPROVED', _('Approved')
        REJECTED = 'REJECTED', _('Rejected')

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='volunteer_applications',
        limit_choices_to={'role': 'MEMBER'}
    )
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )
    notes = models.TextField(
        _('reason or qualifications'),
        blank=True,
        help_text=_('Why the student wants to volunteer or relevant skills.')
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
    admin_feedback = models.TextField(_('admin feedback'), blank=True)

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
