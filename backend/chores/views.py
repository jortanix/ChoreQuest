from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Task, CompletionEvent, NfcBinding
from .serializers import (
    TaskSerializer,
    CompletionEventSerializer,
    NfcBindingSerializer,
)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by("-created_at")
    serializer_class = TaskSerializer

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        task = self.get_object()

        if task.completed_today:
            latest_event = task.completion_events.order_by("-completed_at").first()

            return Response(
                {
                    "task": TaskSerializer(task).data,
                    "event": (
                        CompletionEventSerializer(latest_event).data
                        if latest_event
                        else None
                    ),
                    "already_completed": True,
                },
                status=status.HTTP_200_OK,
            )

        now = timezone.now()

        task.completed = True
        task.completed_today = True
        task.completed_this_period = True
        task.current_streak += 1
        task.best_streak = max(task.best_streak, task.current_streak)
        task.last_completed_at = now
        task.save()

        event = CompletionEvent.objects.create(
            task=task,
            task_title=task.title,
            assignee=task.assignee,
            points=task.points,
            completed_at=now,
            frequency=task.frequency,
            needs_nfc=task.needs_nfc,
        )

        return Response(
            {
                "task": TaskSerializer(task).data,
                "event": CompletionEventSerializer(event).data,
                "already_completed": False,
            },
            status=status.HTTP_200_OK,
        )


class CompletionEventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CompletionEvent.objects.all().order_by("-completed_at")
    serializer_class = CompletionEventSerializer


class NfcBindingViewSet(viewsets.ModelViewSet):
    queryset = NfcBinding.objects.select_related("task").all().order_by("-linked_at")
    serializer_class = NfcBindingSerializer