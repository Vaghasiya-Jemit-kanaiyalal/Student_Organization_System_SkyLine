from django.utils import timezone
from django.db.models import Q
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.permissions import IsAdmin, IsMember, IsAdminOrReadOnly
from .models import Event, VolunteerApplication, VolunteerAssignment, Certificate, Announcement, Ticket
from .serializers import (
    EventSerializer,
    VolunteerApplicationSerializer,
    ApplyVolunteerSerializer,
    VolunteerApproveSerializer,
    VolunteerRejectSerializer,
    VolunteerAssignmentSerializer,
    CertificateSerializer,
    CertificateGenerateSerializer,
    AnnouncementSerializer,
    TicketSerializer,
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


# ============================================================================
# ANNOUNCEMENTS APIS
# ============================================================================

class AnnouncementListCreateView(generics.ListCreateAPIView):
    """
    GET /api/announcements/
        - Admin: Views all announcements (Sent, Scheduled, Draft, Cancelled)
        - Student / Member: Views official published announcements (Sent)
        - Supports filters: ?status=Sent, ?category=General, ?search=keyword
    POST /api/announcements/
        - Creates a new announcement
    """
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Announcement.objects.all()

        is_admin = bool(user and user.is_authenticated and (getattr(user, 'role', '') == 'ADMIN' or user.is_superuser))

        status_param = self.request.query_params.get('status')
        if not is_admin:
            # Students and non-admin users only see Sent announcements
            if status_param and status_param != 'Sent':
                return Announcement.objects.none()
            queryset = queryset.filter(status=Announcement.Status.SENT)
        else:
            if status_param and status_param != 'ALL':
                queryset = queryset.filter(status=status_param)

        category_param = self.request.query_params.get('category')
        if category_param and category_param != 'ALL':
            queryset = queryset.filter(category__iexact=category_param)

        search_param = self.request.query_params.get('search')
        if search_param:
            queryset = queryset.filter(
                Q(title__icontains=search_param) |
                Q(content__icontains=search_param) |
                Q(author__icontains=search_param)
            )

        return queryset

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        data = self.request.data
        status_val = data.get('status', 'Sent')

        sent_at_val = None
        if status_val == 'Sent':
            sent_at_val = timezone.now()

        serializer.save(
            created_by=user,
            sent_at=sent_at_val
        )


class AnnouncementDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET /api/announcements/<int:pk>/ -> Retrieve announcement details
    PUT / PATCH /api/announcements/<int:pk>/ -> Update announcement
    DELETE /api/announcements/<int:pk>/ -> Delete announcement
    """
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


# ============================================================================
# EVENT ADMISSION TICKETS APIS
# ============================================================================

class TicketBuyView(APIView):
    """
    POST /api/events/<int:event_id>/buy-ticket/ or POST /api/tickets/buy/
    Buys / reserves an admission ticket for the authenticated student.
    Applies membership discount based on student's membership_status.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, event_id=None):
        target_id = event_id or request.data.get('event') or request.data.get('event_id')
        if not target_id:
            return Response(
                {'error': 'Event ID is required to reserve admission.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            event = Event.objects.get(pk=target_id)
        except (Event.DoesNotExist, ValueError):
            return Response(
                {'error': f'Event #{target_id} not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if event.status != Event.Status.PUBLISHED:
            return Response(
                {'error': 'Tickets are only available for published events.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check membership status
        user = request.user
        is_member = (
            getattr(user, 'membership_status', 'NONE') == 'ACTIVE'
            or getattr(user, 'is_active_member', False)
        )

        if is_member:
            tier = 'Member Pass'
            price_paid = event.member_price
        else:
            tier = 'Standard Pass'
            price_paid = event.non_member_price

        ticket = Ticket.objects.create(
            student=user,
            event=event,
            tier=tier,
            price_paid=price_paid,
            status=Ticket.Status.CONFIRMED,
        )

        serializer = TicketSerializer(ticket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class StudentTicketsListView(generics.ListAPIView):
    """
    GET /api/tickets/ or GET /api/tickets/my-tickets/
    Lists all event admission passes for the authenticated student.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TicketSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.filter(student=user).select_related('event')
        status_param = self.request.query_params.get('status')
        if status_param and status_param.upper() != 'ALL':
            queryset = queryset.filter(status__iexact=status_param)
        return queryset


class TicketTransferView(APIView):
    """
    POST /api/tickets/<str:ticket_id>/transfer/
    Transfers an active ticket to another student.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ticket_id):
        user = request.user
        ticket = Ticket.objects.filter(
            Q(ticket_id=ticket_id) | Q(pk=ticket_id if str(ticket_id).isdigit() else 0),
            student=user
        ).first()

        if not ticket:
            return Response({'error': 'Ticket not found.'}, status=status.HTTP_404_NOT_FOUND)

        recipient = request.data.get('recipient') or request.data.get('transferred_to') or request.data.get('transferredTo')
        if not recipient:
            return Response({'error': 'Recipient name or student email is required.'}, status=status.HTTP_400_BAD_REQUEST)

        ticket.status = Ticket.Status.TRANSFERRED
        ticket.transferred_to = recipient
        ticket.save()

        return Response(TicketSerializer(ticket).data, status=status.HTTP_200_OK)


class TicketCancelView(APIView):
    """
    POST /api/tickets/<str:ticket_id>/cancel/
    Cancels an active admission ticket.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ticket_id):
        user = request.user
        ticket = Ticket.objects.filter(
            Q(ticket_id=ticket_id) | Q(pk=ticket_id if str(ticket_id).isdigit() else 0),
            student=user
        ).first()

        if not ticket:
            return Response({'error': 'Ticket not found.'}, status=status.HTTP_404_NOT_FOUND)

        ticket.status = Ticket.Status.CANCELLED
        ticket.save()

        return Response(TicketSerializer(ticket).data, status=status.HTTP_200_OK)


class TicketDetailView(APIView):
    """
    GET /api/tickets/<str:ticket_id>/
    Retrieves full ticket information.
    Authorized for the ticket owner, or organizers / admins.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, ticket_id):
        user = request.user
        ticket = Ticket.objects.filter(
            Q(ticket_id=ticket_id) | Q(pk=ticket_id if str(ticket_id).isdigit() else 0)
        ).select_related('event', 'student', 'payment').first()

        if not ticket:
            return Response({'error': 'Ticket not found.'}, status=status.HTTP_404_NOT_FOUND)

        is_authorized = (
            ticket.student == user
            or user.role in ['ADMIN', 'TREASURER']
            or user.is_staff
            or user.is_superuser
        )
        if not is_authorized:
            return Response({'error': 'Access denied to this ticket.'}, status=status.HTTP_403_FORBIDDEN)

        return Response(TicketSerializer(ticket).data, status=status.HTTP_200_OK)


class TicketPdfDownloadView(APIView):
    """
    GET /api/tickets/<str:ticket_id>/pdf/
    Downloads the official Event Admission Ticket PDF.
    Auto-generates if not present on storage.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, ticket_id):
        from django.http import FileResponse
        from finance.pdf_utils import generate_ticket_pdf

        user = request.user
        ticket = Ticket.objects.filter(
            Q(ticket_id=ticket_id) | Q(pk=ticket_id if str(ticket_id).isdigit() else 0)
        ).select_related('event', 'student', 'payment').first()

        if not ticket:
            return Response({'error': 'Ticket not found.'}, status=status.HTTP_404_NOT_FOUND)

        is_authorized = (
            ticket.student == user
            or user.role in ['ADMIN', 'TREASURER']
            or user.is_staff
            or user.is_superuser
        )
        if not is_authorized:
            return Response({'error': 'Access denied to this ticket PDF.'}, status=status.HTTP_403_FORBIDDEN)

        if not ticket.pdf_file or not ticket.pdf_file.storage.exists(ticket.pdf_file.name):
            pdf_file = generate_ticket_pdf(ticket)
            ticket.pdf_file.save(f"{ticket.ticket_id}.pdf", pdf_file, save=True)

        return FileResponse(
            ticket.pdf_file.open('rb'),
            content_type='application/pdf',
            filename=f"Skyline_Ticket_{ticket.ticket_id}.pdf"
        )


class TicketQrVerifyView(APIView):
    """
    POST /api/tickets/verify-qr/
    Organizer / Admin entry gate scanner endpoint to verify event admission QR token.
    Validates:
      - Valid token exists
      - Event matching (enforces QR system prevents ticket for Event A from being accepted at Event B)
      - Payment verified (PAID)
      - Ticket status (Cancelled check)
      - Already Checked-In check (with participant name, event, and check-in time)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        is_organizer = (
            user.role in ['ADMIN', 'TREASURER']
            or user.is_staff
            or user.is_superuser
        )
        if not is_organizer:
            return Response(
                {"error": "Access denied. Only organizers and administrators can verify admission tickets."},
                status=status.HTTP_403_FORBIDDEN
            )

        qr_token = (request.data.get('qr_token') or request.data.get('token') or request.data.get('ticket_id') or '').strip()
        selected_event_id = request.data.get('event_id') or request.data.get('eventId')

        if not qr_token:
            return Response({"error": "QR code token or Ticket ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Lookup by qr_token or ticket_id
        ticket = Ticket.objects.filter(qr_token=qr_token).select_related('event', 'student', 'payment').first()
        if not ticket:
            clean_token = qr_token.replace('SKYLINE-TICKET:', '').strip()
            ticket = Ticket.objects.filter(
                Q(ticket_id__iexact=clean_token) | Q(qr_token__icontains=clean_token)
            ).select_related('event', 'student', 'payment').first()

        if not ticket:
            return Response({
                'is_valid': False,
                'verification_status': 'INVALID_TICKET',
                'title': 'INVALID TICKET',
                'message': 'No valid ticket found matching this QR code identifier.',
                'ticket': None
            }, status=status.HTTP_200_OK)

        # Event-specific validation: Prevent ticket for Event A from being accepted at Event B
        if selected_event_id:
            try:
                selected_event_id = int(selected_event_id)
                if ticket.event_id != selected_event_id:
                    return Response({
                        'is_valid': False,
                        'verification_status': 'WRONG_EVENT',
                        'title': 'WRONG EVENT',
                        'message': f"This ticket belongs to '{ticket.event.title}' (ID: #{ticket.event_id}), not the currently active scanner event.",
                        'ticket': TicketSerializer(ticket).data
                    }, status=status.HTTP_200_OK)
            except (ValueError, TypeError):
                pass

        # Check Payment Status
        if ticket.payment and ticket.payment.status != 'SUCCESS':
            return Response({
                'is_valid': False,
                'verification_status': 'PAYMENT_NOT_VERIFIED',
                'title': 'PAYMENT NOT VERIFIED',
                'message': f"Payment for ticket #{ticket.ticket_id} has not been verified.",
                'ticket': TicketSerializer(ticket).data
            }, status=status.HTTP_200_OK)

        # Check Ticket Cancellation
        if ticket.status == Ticket.Status.CANCELLED:
            return Response({
                'is_valid': False,
                'verification_status': 'TICKET_CANCELLED',
                'title': 'TICKET CANCELLED',
                'message': f"Ticket #{ticket.ticket_id} has been cancelled by the holder or administration.",
                'ticket': TicketSerializer(ticket).data
            }, status=status.HTTP_200_OK)

        # Check if already checked in
        if ticket.checked_in:
            checkin_time_str = ticket.checked_in_at.strftime('%b %d, %Y • %I:%M %p') if ticket.checked_in_at else 'Earlier'
            checked_by_str = ticket.checked_in_by.full_name if ticket.checked_in_by else 'Gate Staff'
            return Response({
                'is_valid': False,
                'verification_status': 'ALREADY_CHECKED_IN',
                'title': 'ALREADY CHECKED IN',
                'message': f"Ticket was already checked in on {checkin_time_str} by {checked_by_str}.",
                'ticket': TicketSerializer(ticket).data,
                'participant': ticket.student.full_name,
                'event': ticket.event.title,
                'checked_in_at': str(ticket.checked_in_at),
                'original_check_in_time': checkin_time_str
            }, status=status.HTTP_200_OK)

        # Valid ticket!
        return Response({
            'is_valid': True,
            'verification_status': 'VALID',
            'title': 'TICKET VERIFIED',
            'message': 'Official admission ticket verified successfully.',
            'participant': ticket.student.full_name,
            'event': ticket.event.title,
            'ticket_id': ticket.ticket_id,
            'event_date': str(ticket.event.date),
            'event_time': f"{ticket.event.start_time} - {ticket.event.end_time}",
            'payment_status': 'PAID',
            'status': 'VALID',
            'ticket': TicketSerializer(ticket).data
        }, status=status.HTTP_200_OK)


class TicketCheckInView(APIView):
    """
    POST /api/tickets/<str:ticket_id>/check-in/
    Marks ticket as checked in atomically.
    Prevents duplicate check-ins!
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, ticket_id):
        from django.db import transaction
        user = request.user
        is_organizer = (
            user.role in ['ADMIN', 'TREASURER']
            or user.is_staff
            or user.is_superuser
        )
        if not is_organizer:
            return Response({"error": "Unauthorized to perform attendee check-ins."}, status=status.HTTP_403_FORBIDDEN)

        with transaction.atomic():
            ticket = Ticket.objects.select_for_update().filter(
                Q(ticket_id=ticket_id) | Q(pk=ticket_id if str(ticket_id).isdigit() else 0)
            ).first()

            if not ticket:
                return Response({"error": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

            if ticket.checked_in:
                return Response({
                    "error": f"Ticket #{ticket.ticket_id} was already checked in at {ticket.checked_in_at}."
                }, status=status.HTTP_400_BAD_REQUEST)

            ticket.checked_in = True
            ticket.checked_in_at = timezone.now()
            ticket.checked_in_by = user
            ticket.save(update_fields=['checked_in', 'checked_in_at', 'checked_in_by', 'updated_at'])

        return Response({
            'success': True,
            'message': f"Participant {ticket.student.full_name} successfully CHECKED IN for {ticket.event.title}.",
            'ticket': TicketSerializer(ticket).data
        }, status=status.HTTP_200_OK)



