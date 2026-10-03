from django.utils import timezone
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsAdmin, IsMember, IsAdminOrReadOnly
from .models import Event, VolunteerApplication, VolunteerAssignment, Certificate
from .serializers import (
    EventSerializer,
    VolunteerApplicationSerializer,
    ApplyVolunteerSerializer,
    VolunteerApproveSerializer,
    VolunteerRejectSerializer,
    VolunteerAssignmentSerializer,
    CertificateSerializer,
    CertificateGenerateSerializer,
)


# ============================================================================
# EVENT MANAGEMENT APIS
# ============================================================================

class EventListCreateView(generics.ListCreateAPIView):
    """
    GET /api/events/ -> List events
        - Students / Members: View Published events
        - Admins: View all events (Draft, Published, Completed, Cancelled)
        - Supports filter by ?volunteers_required=true and ?status=Published
    POST /api/events/ -> Create a new event (Admin only)
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EventSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Event.objects.all()

        if user.role != 'ADMIN' and not user.is_superuser:
            # Members only see published events
            queryset = queryset.filter(status=Event.Status.PUBLISHED)

        # Query Filters
        status_param = self.request.query_params.get('status')
        if status_param and (user.role == 'ADMIN' or user.is_superuser):
            queryset = queryset.filter(status=status_param)

        vol_req = self.request.query_params.get('volunteers_required')
        if vol_req is not None:
            if vol_req.lower() in ['true', '1', 'yes']:
                queryset = queryset.filter(volunteers_required=True)
            elif vol_req.lower() in ['false', '0', 'no']:
                queryset = queryset.filter(volunteers_required=False)

        event_type = self.request.query_params.get('event_type')
        if event_type:
            queryset = queryset.filter(event_type=event_type)

        return queryset

    def perform_create(self, serializer):
        if self.request.user.role != 'ADMIN' and not self.request.user.is_superuser:
            raise permissions.exceptions.PermissionDenied("Only organization administrators can create events.")
        serializer.save(created_by=self.request.user)


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/events/<int:pk>/ -> View event details
    PUT/PATCH /api/events/<int:pk>/ -> Edit event or change status (Admin only)
    DELETE /api/events/<int:pk>/ -> Delete event (Admin only)
    """
    permission_classes = [IsAdminOrReadOnly]
    serializer_class = EventSerializer
    queryset = Event.objects.all()


# ============================================================================
# VOLUNTEER APPLICATION APIS
# ============================================================================

class VolunteerApplyView(generics.CreateAPIView):
    """
    POST /api/volunteers/apply/
    Allows a Student Member to submit a volunteer application.
    """
    permission_classes = [IsMember]
    serializer_class = ApplyVolunteerSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        application = serializer.save()
        return Response({
            "success": True,
            "message": f"Volunteer application for '{application.event.title}' submitted successfully.",
            "data": VolunteerApplicationSerializer(application).data
        }, status=status.HTTP_201_CREATED)


class VolunteerApplicationsListView(generics.ListAPIView):
    """
    GET /api/volunteers/applications/
    - Admin: View all applications (supports ?status=Pending&event_id=X)
    - Member: View own submitted applications
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VolunteerApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN' or user.is_superuser:
            queryset = VolunteerApplication.objects.select_related('student', 'event', 'reviewed_by').all()
            status_param = self.request.query_params.get('status')
            if status_param:
                queryset = queryset.filter(status=status_param)
            event_id = self.request.query_params.get('event_id')
            if event_id:
                queryset = queryset.filter(event_id=event_id)
            return queryset
        else:
            return VolunteerApplication.objects.filter(student=user).select_related('event', 'student')


class AdminVolunteerListView(generics.ListAPIView):
    """
    GET /api/admin/volunteers/
    Strictly Admin-only view for volunteer applications.
    """
    permission_classes = [IsAdmin]
    serializer_class = VolunteerApplicationSerializer
    queryset = VolunteerApplication.objects.select_related('student', 'event', 'reviewed_by').all()


class VolunteerApproveView(APIView):
    """
    PUT/POST /api/volunteers/approve/<int:pk>/
    Admin approves a volunteer application and assigns role, duration, and notes.
    Automatically creates an Active Volunteer record (VolunteerAssignment).
    """
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        return self.process_approval(request, pk)

    def post(self, request, pk):
        return self.process_approval(request, pk)

    def process_approval(self, request, pk):
        try:
            application = VolunteerApplication.objects.select_related('student', 'event').get(pk=pk)
        except VolunteerApplication.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Volunteer application not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = VolunteerApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        assigned_role = serializer.validated_data.get('assigned_role') or application.preferred_role
        duration = serializer.validated_data.get('duration', '4 Hours')
        notes = serializer.validated_data.get('notes', '')

        # Update application status
        application.status = VolunteerApplication.Status.APPROVED
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.admin_feedback = notes
        application.save()

        # Automatically create or update Active Volunteer Assignment
        assignment, _ = VolunteerAssignment.objects.update_or_create(
            student=application.student,
            event=application.event,
            defaults={
                'application': application,
                'assigned_role': assigned_role,
                'duration': duration,
                'notes': notes,
                'status': VolunteerAssignment.Status.ACTIVE,
                'approved_at': timezone.now()
            }
        )

        return Response({
            "success": True,
            "message": f"Volunteer application for {application.student.full_name} APPROVED. Assigned as '{assigned_role}'.",
            "application": VolunteerApplicationSerializer(application).data,
            "assignment": VolunteerAssignmentSerializer(assignment).data
        }, status=status.HTTP_200_OK)


class VolunteerRejectView(APIView):
    """
    PUT/POST /api/volunteers/reject/<int:pk>/
    Admin rejects a volunteer application with optional notes.
    """
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        return self.process_rejection(request, pk)

    def post(self, request, pk):
        return self.process_rejection(request, pk)

    def process_rejection(self, request, pk):
        try:
            application = VolunteerApplication.objects.select_related('student', 'event').get(pk=pk)
        except VolunteerApplication.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Volunteer application not found."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = VolunteerRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        admin_notes = serializer.validated_data.get('admin_notes', '')

        application.status = VolunteerApplication.Status.REJECTED
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.admin_feedback = admin_notes
        application.save()

        # If an active assignment existed, remove it
        VolunteerAssignment.objects.filter(student=application.student, event=application.event).delete()

        return Response({
            "success": True,
            "message": f"Volunteer application for {application.student.full_name} REJECTED.",
            "application": VolunteerApplicationSerializer(application).data
        }, status=status.HTTP_200_OK)


# ============================================================================
# ACTIVE VOLUNTEERS & ASSIGNMENTS APIS
# ============================================================================

class VolunteerActiveListView(generics.ListAPIView):
    """
    GET /api/volunteers/active/
    - Admin: View all Active & Completed volunteers (supports ?status=Active and ?event_id=X)
    - Member: View own active and completed assignments
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = VolunteerAssignmentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN' or user.is_superuser:
            queryset = VolunteerAssignment.objects.select_related('student', 'event', 'application').all()
            status_param = self.request.query_params.get('status')
            if status_param:
                queryset = queryset.filter(status=status_param)
            event_id = self.request.query_params.get('event_id')
            if event_id:
                queryset = queryset.filter(event_id=event_id)
            return queryset
        else:
            return VolunteerAssignment.objects.filter(student=user).select_related('event', 'student')


class VolunteerAssignmentCompleteView(APIView):
    """
    PUT /api/volunteers/assignment/<int:pk>/complete/
    Admin marks an active volunteer as COMPLETED.
    """
    permission_classes = [IsAdmin]

    def put(self, request, pk):
        try:
            assignment = VolunteerAssignment.objects.select_related('student', 'event').get(pk=pk)
        except VolunteerAssignment.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Volunteer assignment not found."
            }, status=status.HTTP_404_NOT_FOUND)

        assignment.status = VolunteerAssignment.Status.COMPLETED
        assignment.completed_at = timezone.now()
        assignment.save()

        return Response({
            "success": True,
            "message": f"Volunteer service for {assignment.student.full_name} marked as COMPLETED.",
            "data": VolunteerAssignmentSerializer(assignment).data
        }, status=status.HTTP_200_OK)


class VolunteerAssignmentDeleteView(APIView):
    """
    DELETE /api/volunteers/assignment/<int:pk>/
    Admin removes a volunteer assignment.
    """
    permission_classes = [IsAdmin]

    def delete(self, request, pk):
        try:
            assignment = VolunteerAssignment.objects.get(pk=pk)
        except VolunteerAssignment.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Volunteer assignment not found."
            }, status=status.HTTP_404_NOT_FOUND)

        student_name = assignment.student.full_name
        assignment.delete()

        return Response({
            "success": True,
            "message": f"Volunteer assignment for {student_name} removed."
        }, status=status.HTTP_200_OK)


class VolunteerAnalyticsView(APIView):
    """
    GET /api/volunteers/analytics/
    Admin gets high-level volunteer analytics:
    - Total Applications
    - Pending Applications
    - Approved Volunteers
    - Active Volunteers
    - Completed Volunteers
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        total_apps = VolunteerApplication.objects.count()
        pending_apps = VolunteerApplication.objects.filter(status=VolunteerApplication.Status.PENDING).count()
        approved_apps = VolunteerApplication.objects.filter(status=VolunteerApplication.Status.APPROVED).count()
        active_vols = VolunteerAssignment.objects.filter(status=VolunteerAssignment.Status.ACTIVE).count()
        completed_vols = VolunteerAssignment.objects.filter(status=VolunteerAssignment.Status.COMPLETED).count()

        return Response({
            "success": True,
            "analytics": {
                "total_applications": total_apps,
                "pending_applications": pending_apps,
                "approved_volunteers": approved_apps,
                "active_volunteers": active_vols,
                "completed_volunteers": completed_vols,
            }
        }, status=status.HTTP_200_OK)


# ============================================================================
# CERTIFICATE FLOW APIS
# ============================================================================

class CertificateGenerateView(APIView):
    """
    POST /api/certificates/generate/
    Admin generates official verified certificates for volunteers of a completed event.
    """
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = CertificateGenerateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        event_id = serializer.validated_data['event_id']
        student_ids = serializer.validated_data.get('student_ids')

        try:
            event = Event.objects.get(pk=event_id)
        except Event.DoesNotExist:
            return Response({
                "success": False,
                "error": "NotFound",
                "details": "Event not found."
            }, status=status.HTTP_404_NOT_FOUND)

        # Mark event as Completed if not already
        if event.status != Event.Status.COMPLETED:
            event.status = Event.Status.COMPLETED
            event.save()

        # Find eligible volunteer assignments
        assignments = VolunteerAssignment.objects.filter(event=event)
        if student_ids:
            assignments = assignments.filter(student_id__in=student_ids)

        if not assignments.exists():
            return Response({
                "success": False,
                "error": "NoVolunteers",
                "details": "No volunteer assignments found for this event to issue certificates."
            }, status=status.HTTP_400_BAD_REQUEST)

        created_certificates = []
        for assign in assignments:
            # Mark assignment completed
            assign.status = VolunteerAssignment.Status.COMPLETED
            if not assign.completed_at:
                assign.completed_at = timezone.now()
            assign.save()

            cert, created = Certificate.objects.get_or_create(
                student=assign.student,
                event=event,
                defaults={
                    'assignment': assign,
                    'volunteer_role': assign.assigned_role,
                    'duration': assign.duration,
                    'issue_date': timezone.now().date(),
                }
            )
            created_certificates.append(cert)

        return Response({
            "success": True,
            "message": f"Successfully generated {len(created_certificates)} certificate(s) for event '{event.title}'.",
            "certificates": CertificateSerializer(created_certificates, many=True).data
        }, status=status.HTTP_201_CREATED)


class StudentCertificatesView(generics.ListAPIView):
    """
    GET /api/certificates/student/
    Member retrieves their own official certificates.
    """
    permission_classes = [IsMember]
    serializer_class = CertificateSerializer

    def get_queryset(self):
        return Certificate.objects.filter(student=self.request.user).select_related('event', 'student')


class CertificateDetailView(generics.RetrieveAPIView):
    """
    GET /api/certificates/<str:certificate_id>/
    Public verification of institutional credential by unique certificate ID.
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CertificateSerializer
    lookup_field = 'certificate_id'
    queryset = Certificate.objects.select_related('event', 'student').all()
