from django.contrib import admin
from .models import Event, VolunteerApplication


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'date', 'location', 'max_volunteers', 'is_active', 'created_at')
    list_filter = ('is_active', 'date')
    search_fields = ('title', 'description', 'location')


@admin.register(VolunteerApplication)
class VolunteerApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'event', 'status', 'applied_at', 'reviewed_by', 'reviewed_at')
    list_filter = ('status', 'applied_at', 'event')
    search_fields = ('student__full_name', 'student__email', 'student__student_id', 'event__title')
