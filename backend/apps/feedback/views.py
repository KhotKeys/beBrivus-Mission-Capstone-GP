import logging
import traceback
from django.conf import settings
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Feedback
from .serializers import FeedbackSerializer

logger = logging.getLogger(__name__)


def _safe(text):
    """ASCII-safe for Windows terminal — prevents UnicodeEncodeError."""
    return str(text).encode('ascii', 'replace').decode('ascii')


def _get_admin_emails():
    from django.contrib.auth import get_user_model
    User = get_user_model()
    emails = list(
        User.objects.filter(is_staff=True, is_active=True)
        .exclude(email='')
        .values_list('email', flat=True)
    )
    if 'ethxkeys@gmail.com' not in emails:
        emails.append('ethxkeys@gmail.com')
    return emails


def _send_email(subject, html, plain, to_list):
    """Send email — never raises, always logs result with ASCII-safe subject."""
    from django.core.mail import EmailMultiAlternatives
    from django.conf import settings
    try:
        if not to_list:
            logger.warning(_safe('[FEEDBACK EMAIL] No recipients — skipping'))
            return
        safe_subject = _safe(subject)
        msg = EmailMultiAlternatives(
            subject=safe_subject,
            body=plain,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=to_list if isinstance(to_list, list) else [to_list],
        )
        msg.attach_alternative(html, 'text/html')
        msg.send(fail_silently=False)
        logger.info(_safe(f'[FEEDBACK EMAIL OK] {subject} to {to_list}'))
    except Exception:
        logger.error(
            _safe(f'[FEEDBACK EMAIL FAILED] {subject}') +
            f'\n{traceback.format_exc()}'
        )


class FeedbackViewSet(viewsets.ModelViewSet):
    serializer_class = FeedbackSerializer

    def get_permissions(self):
        if self.action in ['create', 'my_feedbacks']:
            return [permissions.IsAuthenticated()]
        if self.action in ['list', 'retrieve', 'update_status', 'stats', 'partial_update']:
            return [permissions.IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_staff:
            qs = Feedback.objects.select_related('user', 'resolved_by').all()
            status_f   = self.request.query_params.get('status')
            category_f = self.request.query_params.get('category')
            priority_f = self.request.query_params.get('priority')
            search_f   = self.request.query_params.get('search')
            if status_f:
                qs = qs.filter(status=status_f)
            if category_f:
                qs = qs.filter(category=category_f)
            if priority_f:
                qs = qs.filter(priority=priority_f)
            if search_f:
                from django.db.models import Q
                qs = qs.filter(
                    Q(subject__icontains=search_f) |
                    Q(message__icontains=search_f) |
                    Q(name__icontains=search_f) |
                    Q(email__icontains=search_f)
                )
            return qs
        return Feedback.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        feedback = serializer.save(
            user=user,
            name=user.get_full_name() or user.username,
            email=user.email,
        )

        stars = '⭐' * feedback.rating if feedback.rating else ''
        rating_row = f'<p><strong>Rating:</strong> {stars} ({feedback.rating}/5)</p>' if feedback.rating else ''
        admin_login_url = getattr(settings, 'FRONTEND_ADMIN_LOGIN_URL', 'https://bebrivus.com/admin/login')

        # Email A — Admin notification
        _send_email(
            subject=f'New Feedback: {feedback.get_category_display()} — "{feedback.subject[:50]}"',
            html=f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#6366f1,#4f46e5);padding:24px;border-radius:12px 12px 0 0;">
                <h2 style="color:white;margin:0;">New User Feedback Received</h2>
                <p style="color:rgba(255,255,255,0.85);margin:6px 0 0;">Category: {feedback.get_category_display()}</p>
              </div>
              <div style="padding:24px;background:#f9fafb;border-radius:0 0 12px 12px;">
                <div style="background:white;border-radius:10px;padding:16px;border:1px solid #e5e7eb;margin-bottom:16px;">
                  <p style="margin:0 0 8px;"><strong>From:</strong> {feedback.name} ({feedback.email})</p>
                  <p style="margin:0 0 8px;"><strong>Subject:</strong> {feedback.subject}</p>
                  <p style="margin:0 0 8px;"><strong>Category:</strong> {feedback.get_category_display()}</p>
                  <p style="margin:0 0 8px;"><strong>Priority:</strong> {feedback.get_priority_display()}</p>
                  {rating_row}
                </div>
                <div style="background:#f8f9ff;border-radius:10px;padding:16px;border:1px solid #e0e7ff;margin-bottom:20px;">
                  <p style="margin:0;color:#374151;line-height:1.6;">{feedback.message}</p>
                </div>
                <div style="text-align:center;">
                                                                        <a href="{admin_login_url}"
                     style="background:#6366f1;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block;">
                    Review in Admin Panel
                  </a>
                </div>
                <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:20px;">beBrivus Feedback System</p>
              </div>
            </div>""",
            plain=f'New feedback from {feedback.name} ({feedback.email}). Subject: {feedback.subject}. Category: {feedback.get_category_display()}. Message: {feedback.message[:300]}',
            to_list=_get_admin_emails(),
        )

        # Email B — User confirmation
        _send_email(
            subject='We received your feedback — beBrivus',
            html=f"""
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#10b981,#059669);padding:24px;border-radius:12px 12px 0 0;text-align:center;">
                <h1 style="color:white;margin:0;">beBrivus</h1>
              </div>
              <div style="padding:28px;background:#f9fafb;border-radius:0 0 12px 12px;">
                <h2 style="color:#111827;">Thank you for your feedback!</h2>
                <p>Hi {feedback.name},</p>
                <p>We have received your feedback and our team will review it shortly.</p>
                <div style="background:white;border-radius:10px;padding:16px;border:1px solid #e5e7eb;margin:16px 0;">
                  <p style="margin:0 0 8px;"><strong>Subject:</strong> {feedback.subject}</p>
                  <p style="margin:0 0 8px;"><strong>Category:</strong> {feedback.get_category_display()}</p>
                  <p style="margin:0;"><strong>Status:</strong> <span style="color:#f59e0b;font-weight:600;">Open — Under Review</span></p>
                </div>
                <p style="color:#6b7280;">We will notify you once your feedback has been reviewed. Thank you for helping us improve beBrivus!</p>
                <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:20px;">beBrivus — Empowering African Students</p>
              </div>
            </div>""",
            plain=f'Hi {feedback.name}, we received your feedback: "{feedback.subject}". We will review it and get back to you shortly.',
            to_list=[feedback.email],
        )

    @action(detail=False, methods=['get'])
    def my_feedbacks(self, request):
        qs = Feedback.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        if not request.user.is_staff:
            return Response({'error': 'Admin only.'}, status=403)

        feedback   = self.get_object()
        new_status = request.data.get('status')
        priority   = request.data.get('priority')
        admin_note = request.data.get('admin_note', '').strip()

        valid_statuses = ['open', 'in_review', 'resolved', 'closed']
        if new_status and new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Must be one of: {valid_statuses}'}, status=400)

        if new_status:
            feedback.status = new_status
        if priority:
            feedback.priority = priority
        if admin_note:
            feedback.admin_note = admin_note
        if new_status == 'resolved':
            feedback.resolved_by = request.user
            feedback.resolved_at = timezone.now()

        feedback.save()
        logger.info(_safe(f'[FEEDBACK] Admin {request.user.username} updated feedback {feedback.id} to {new_status}'))

        # Notify user when resolved or closed
        if new_status in ['resolved', 'closed'] and feedback.email:
            status_config = {
                'resolved': ('#10b981', 'Your Feedback Has Been Resolved', 'Great news! Your feedback has been reviewed and resolved by our team.'),
                'closed':   ('#6b7280', 'Your Feedback Has Been Closed', 'Your feedback submission has been reviewed and closed by our team.'),
            }
            color, title, body_msg = status_config[new_status]
            note_html = f'<div style="background:#f0fdf4;border-left:3px solid {color};border-radius:8px;padding:12px;margin:12px 0;"><p style="margin:0 0 4px;font-weight:600;font-size:13px;color:{color};">Admin Response:</p><p style="margin:0;color:#374151;">{admin_note}</p></div>' if admin_note else ''
            _send_email(
                subject=f'{title} — beBrivus',
                html=f"""
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
                  <div style="background:{color};padding:24px;border-radius:12px 12px 0 0;text-align:center;">
                    <h1 style="color:white;margin:0;">beBrivus</h1>
                  </div>
                  <div style="padding:28px;background:#f9fafb;border-radius:0 0 12px 12px;">
                    <h2 style="color:#111827;">{title}</h2>
                    <p>Hi {feedback.name},</p>
                    <p>{body_msg}</p>
                    <div style="background:white;border-radius:10px;padding:16px;border:1px solid #e5e7eb;margin:16px 0;">
                      <p style="margin:0 0 8px;"><strong>Your feedback:</strong> {feedback.subject}</p>
                      <p style="margin:0;"><strong>Status:</strong> <span style="color:{color};font-weight:600;">{new_status.replace('_',' ').title()}</span></p>
                    </div>
                    {note_html}
                    <p style="color:#6b7280;">Thank you for helping us improve beBrivus!</p>
                    <p style="font-size:12px;color:#9ca3af;text-align:center;margin-top:20px;">beBrivus — Empowering African Students</p>
                  </div>
                </div>""",
                plain=f'{title}. Feedback: {feedback.subject}. {body_msg} {admin_note or ""}',
                to_list=[feedback.email],
            )

        serializer = self.get_serializer(feedback)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        if not request.user.is_staff:
            return Response({'error': 'Admin only.'}, status=403)
        from django.db.models import Count, Avg
        total       = Feedback.objects.count()
        open_count  = Feedback.objects.filter(status='open').count()
        in_review   = Feedback.objects.filter(status='in_review').count()
        resolved    = Feedback.objects.filter(status='resolved').count()
        closed      = Feedback.objects.filter(status='closed').count()
        urgent      = Feedback.objects.filter(priority='urgent').count()
        avg_rating  = Feedback.objects.filter(rating__isnull=False).aggregate(avg=Avg('rating'))['avg']
        by_category = list(
            Feedback.objects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        return Response({
            'total':       total,
            'open':        open_count,
            'in_review':   in_review,
            'resolved':    resolved,
            'closed':      closed,
            'urgent':      urgent,
            'avg_rating':  round(avg_rating, 1) if avg_rating else None,
            'by_category': by_category,
        })
