from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django.db.models import Count, Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Task, CompletionEvent, NfcBinding
from .serializers import TaskSerializer, CompletionEventSerializer, NfcBindingSerializer


def compute_streak(household) -> int:
    today, streak, current = date.today(), 0, date.today()
    while True:
        if not CompletionEvent.objects.filter(
            task__household=household,
            scheduled_date=current,
        ).exists():
            break
        streak += 1
        current -= timedelta(days=1)
    return streak


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(
            household=self.request.user.household,
            is_active=True,
        ).order_by("-critical", "title")

    def perform_create(self, serializer):
        serializer.save(household=self.request.user.household)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        task = self.get_object()
        scheduled_date = request.data.get("scheduled_date", str(date.today()))

        event, created = CompletionEvent.objects.get_or_create(
            task=task,
            scheduled_date=scheduled_date,
            defaults={
                "completed_by": request.user,
                "completed_at": timezone.now(),
                "points": task.points,
                "notes": request.data.get("notes", ""),
                "needs_nfc": task.needs_nfc,
            },
        )

        return Response({
            "task": TaskSerializer(task).data,
            "event": CompletionEventSerializer(event).data,
            "already_completed": not created,
        }, status=status.HTTP_200_OK)


class CompletionEventViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CompletionEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = CompletionEvent.objects.filter(
            task__household=self.request.user.household
        ).select_related("task", "completed_by")

        date_from = self.request.query_params.get("date_from")
        date_to   = self.request.query_params.get("date_to")
        if date_from: qs = qs.filter(scheduled_date__gte=date_from)
        if date_to:   qs = qs.filter(scheduled_date__lte=date_to)

        ordering = self.request.query_params.get("ordering", "-completed_at")
        return qs.order_by(ordering)


class HomeDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        household   = request.user.household
        today       = date.today()
        month_start = today.replace(day=1)
        month_end   = (month_start + relativedelta(months=1)) - timedelta(days=1)

        all_tasks      = Task.objects.filter(household=household, is_active=True)
        monthly_events = CompletionEvent.objects.filter(
            task__household=household,
            scheduled_date__range=(month_start, month_end),
        )
        today_events = CompletionEvent.objects.filter(
            task__household=household,
            scheduled_date=today,
        )

        monthly_goal    = all_tasks.count()
        monthly_done    = monthly_events.values("task").distinct().count()
        today_done      = today_events.count()
        today_total     = all_tasks.filter(
            frequency__in=["daily", "weekly"]
        ).count()

        return Response({
            "monthly_goal": {
                "completed": monthly_done,
                "goal": monthly_goal,
                "percentage": round(monthly_done / max(monthly_goal, 1) * 100),
            },
            "streak_days": compute_streak(household),
            "today": {"done": today_done, "total": today_total},
            "frequency_breakdown": list(
                all_tasks.values("frequency").annotate(count=Count("id"))
            ),
        })


class CalendarDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        household = request.user.household
        period    = request.query_params.get("period", "week")
        date_str  = request.query_params.get("date")
        ref       = date.fromisoformat(date_str) if date_str else date.today()

        if period == "week":
            start = ref - timedelta(days=ref.weekday())
            end   = start + timedelta(days=6)
        else:
            start = ref.replace(day=1)
            end   = (start + relativedelta(months=1)) - timedelta(days=1)

        events = CompletionEvent.objects.filter(
            task__household=household,
            scheduled_date__range=(start, end),
        ).select_related("task")

        tasks_in_period = Task.objects.filter(household=household, is_active=True)
        completed_ids   = set(events.values_list("task_id", flat=True))
        pending_tasks   = tasks_in_period.exclude(id__in=completed_ids)

        return Response({
            "period":   {"start": str(start), "end": str(end)},
            "progress": {
                "completed":  events.count(),
                "total":      tasks_in_period.count(),
                "percentage": round(events.count() / max(tasks_in_period.count(), 1) * 100),
            },
            "summary": {
                "to_do":    pending_tasks.count(),
                "routines": tasks_in_period.filter(frequency__in=["daily", "weekly"]).count(),
                "overdue":  0,
            },
            "planning":  TaskSerializer(
                pending_tasks.order_by("-critical", "title"), many=True
            ).data,
            "completed": CompletionEventSerializer(
                events.order_by("-completed_at"), many=True
            ).data,
        })

class NfcBindingViewSet(viewsets.ModelViewSet):
    serializer_class = NfcBindingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NfcBinding.objects.filter(
            task__household=self.request.user.household
        ).select_related("task").order_by("-linked_at")