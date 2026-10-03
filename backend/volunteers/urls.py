from django.urls import path
from .views import (
    EventListCreateView,
    EventDetailView,
    ApplyVolunteerApplicationView,
    MemberVolunteerApplicationsView,
    AdminVolunteerApplicationsListView,
    AdminApproveVolunteerApplicationView,
    AdminRejectVolunteerApplicationView,
)

urlpatterns = [
    # Event endpoints
    path('events/', EventListCreateView.as_view(), name='event-list-create'),
    path('events/<int:pk>/', EventDetailView.as_view(), name='event-detail'),

    # Member volunteer endpoints: /api/volunteer/...
    path('volunteer/apply/', ApplyVolunteerApplicationView.as_view(), name='volunteer-apply'),
    path('volunteer/my-applications/', MemberVolunteerApplicationsView.as_view(), name='volunteer-my-applications'),

    # Admin volunteer review endpoints: /api/admin/volunteers/...
    path('admin/volunteers/', AdminVolunteerApplicationsListView.as_view(), name='admin-volunteers-list'),
    path('admin/volunteers/<int:pk>/approve/', AdminApproveVolunteerApplicationView.as_view(), name='admin-volunteer-approve'),
    path('admin/volunteers/<int:pk>/reject/', AdminRejectVolunteerApplicationView.as_view(), name='admin-volunteer-reject'),
]
