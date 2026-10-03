from django.urls import path
from .views import (
    EventListCreateView,
    EventDetailView,
    VolunteerApplyView,
    VolunteerApplicationsListView,
    AdminVolunteerListView,
    VolunteerApproveView,
    VolunteerRejectView,
    VolunteerActiveListView,
    VolunteerAssignmentCompleteView,
    VolunteerAssignmentDeleteView,
    VolunteerAnalyticsView,
    CertificateGenerateView,
    StudentCertificatesView,
    CertificateDetailView,
    AnnouncementListCreateView,
    AnnouncementDetailView,
)

urlpatterns = [
    # Event Management Endpoints
    path('events/', EventListCreateView.as_view(), name='event-list-create'),
    path('events/create/', EventListCreateView.as_view(), name='event-create'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),

    # Announcement Endpoints
    path('announcements/', AnnouncementListCreateView.as_view(), name='announcement-list-create'),
    path('announcements/<int:pk>/', AnnouncementDetailView.as_view(), name='announcement-detail'),

    # Volunteer Applications Endpoints
    path('volunteers/apply/', VolunteerApplyView.as_view(), name='volunteer-apply'),
    path('volunteers/applications/', VolunteerApplicationsListView.as_view(), name='volunteer-applications'),
    path('volunteers/approve/<int:pk>/', VolunteerApproveView.as_view(), name='volunteer-approve'),
    path('volunteers/reject/<int:pk>/', VolunteerRejectView.as_view(), name='volunteer-reject'),

    # Active Volunteers Endpoints
    path('volunteers/active/', VolunteerActiveListView.as_view(), name='volunteers-active'),
    path('volunteers/assignment/<int:pk>/complete/', VolunteerAssignmentCompleteView.as_view(), name='volunteer-assignment-complete'),
    path('volunteers/assignment/<int:pk>/', VolunteerAssignmentDeleteView.as_view(), name='volunteer-assignment-delete'),

    # Volunteer Analytics Endpoint
    path('volunteers/analytics/', VolunteerAnalyticsView.as_view(), name='volunteer-analytics'),

    # Certificates Endpoints
    path('certificates/generate/', CertificateGenerateView.as_view(), name='certificates-generate'),
    path('certificates/student/', StudentCertificatesView.as_view(), name='certificates-student'),
    path('certificates/<str:certificate_id>/', CertificateDetailView.as_view(), name='certificate-detail'),

    # Backward compatibility and admin aliases
    path('volunteer/apply/', VolunteerApplyView.as_view(), name='volunteer-apply-legacy'),
    path('volunteer/my-applications/', VolunteerApplicationsListView.as_view(), name='volunteer-my-applications-legacy'),
    path('admin/volunteers/', AdminVolunteerListView.as_view(), name='admin-volunteers-list'),
    path('admin/volunteers/approve/<int:pk>/', VolunteerApproveView.as_view(), name='admin-volunteer-approve'),
    path('admin/volunteers/reject/<int:pk>/', VolunteerRejectView.as_view(), name='admin-volunteer-reject'),
]
