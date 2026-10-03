from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsAdmin, IsMember, IsAdminOrReadOnly
from .models import Event, VolunteerApplication
from .serializers import (
    EventSerializer,
    VolunteerApplicationSerializer,
    ApplyVolunteerSerializer,
    VolunteerReviewActionSerializer,
)


# ============================================================================
# EVENT VIEWS
# ============================================================================

class EventListCreateView(generics.ListCreateAPIView):
    """
    GET /api/events/ -> List active events (Authenticated)
    POST /api/events/ -> Create a new event (Admin only)
    """
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = EventSerializer

    def get_queryset(self):
        # Admins can see all events; others see only active ones
        if self.request.user.role == 'ADMIN' or self.request.user.is_superuser:
            return Event.objects.all()
        return Event.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/events/<int:pk>/ -> View event details
    PUT/PATCH/DELETE /api/events/<int:pk>/ -> Edit/delete event (Admin only)
    """
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = EventSerializer
    queryset = Event.objects.all()


# ============================================================================
# MEMBER VOLUNTEER VIEWS
# ============================================================================

class ApplyVolunteerApplicationView(generics.CreateAPIView):
    """
    POST /api/volunteer/apply/
    Protected: Only Members can apply for a volunteer position.
    """
    permission_classes = [IsMember]
    serializer_class = ApplyVolunteerSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        return Response({
            "success": True,
            "message": "Volunteer application submitted successfully.",
            "data": VolunteerApplicationSerializer(application).data
        }, status=status.HTTP_201_CREATED)


class MemberVolunteerApplicationsView(generics.ListAPIView):
    """
    GET /api/volunteer/my-applications/
    Protected: Members view their own volunteer applications.
    """
    permission_classes = [IsMember]
    serializer_class = VolunteerApplicationSerializer

    def get_queryset(self):
        return VolunteerApplication.objects.filter(
            student=self.request.user
        ).select_related('event', 'student', 'reviewed_by')


# ============================================================================
# ADMIN VOLUNTEER MANAGEMENT VIEWS
# ============================================================================

class AdminVolunteerApplicationsListView(generics.ListAPIView):
    """
    GET /api/admin/volunteers/
    Protected: Only Admin can view all volunteer requests across events.
    Supports filtering by ?status=PENDING and ?event_id=1
    """
    permission_classes = [IsAdmin]
    serializer_class = VolunteerApplicationSerializer

    def get_queryset(self):
        queryset = VolunteerApplication.objects.select_related(
            'event', 'student', 'reviewed_by'
        ).all()

        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param.upper())

        event_id = self.request.query_params.get('event_id', None)
        if event_id:
            queryset = queryset.filter(event_id=event_id)

        return queryset


class AdminApproveVolunteerApplicationView(APIView):
    """
    POST /api/admin/volunteers/<int:pk>/approve/
    Protected: Only Admin can approve a volunteer application.
    """
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            application = VolunteerApplication.objects.get(pk=pk)
        except VolunteerApplication.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Volunteer application not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = VolunteerReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application.status = VolunteerApplication.Status.APPROVED
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.admin_feedback = serializer.validated_data.get('admin_feedback', '')
        application.save()

        return Response({
            "success": True,
            "message": f"Volunteer application for {application.student.full_name} has been APPROVED.",
            "data": VolunteerApplicationSerializer(application).data
        }, status=status.HTTP_200_OK)


class AdminRejectVolunteerApplicationView(APIView):
    """
    POST /api/admin/volunteers/<int:pk>/reject/
    Protected: Only Admin can reject a volunteer application.
    """
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            application = VolunteerApplication.objects.get(pk=pk)
        except VolunteerApplication.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Volunteer application not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = VolunteerReviewActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        application.status = VolunteerApplication.Status.REJECTED
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.admin_feedback = serializer.validated_data.get('admin_feedback', '')
        application.save()

        return Response({
            "success": True,
            "message": f"Volunteer application for {application.student.full_name} has been REJECTED.",
            "data": VolunteerApplicationSerializer(application).data
        }, status=status.HTTP_200_OK)
