from django.contrib import admin
from .models import Event, VolunteerApplication, VolunteerAssignment, Certificate, Ticket


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'event_type', 'venue', 'date', 'status', 'volunteers_required', 'volunteer_count_required', 'created_at')
    list_filter = ('status', 'event_type', 'volunteers_required', 'date')
    search_fields = ('title', 'description', 'venue')


@admin.register(VolunteerApplication)
class VolunteerApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'event', 'preferred_role', 'status', 'applied_at', 'reviewed_by', 'reviewed_at')
    list_filter = ('status', 'applied_at', 'event')
    search_fields = ('student__full_name', 'student__email', 'student__student_id', 'event__title')


@admin.register(VolunteerAssignment)
class VolunteerAssignmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'event', 'assigned_role', 'duration', 'status', 'approved_at', 'completed_at')
    list_filter = ('status', 'assigned_role', 'event')
    search_fields = ('student__full_name', 'student__email', 'event__title')


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('id', 'certificate_id', 'student', 'event', 'volunteer_role', 'duration', 'issue_date')
    list_filter = ('issue_date', 'event')
    search_fields = ('certificate_id', 'student__full_name', 'student__student_id', 'event__title')


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'student', 'event', 'tier', 'price_paid', 'status', 'seat', 'created_at')
    list_filter = ('status', 'tier', 'created_at')
    search_fields = ('ticket_id', 'student__full_name', 'student__email', 'student__student_id', 'event__title')
