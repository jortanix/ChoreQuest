from rest_framework import serializers
from .models import Task, CompletionEvent, NfcBinding


class NfcBindingSerializer(serializers.ModelSerializer):
    task_id = serializers.IntegerField(source="task.id", read_only=True)

    class Meta:
        model = NfcBinding
        fields = ["id", "task_id", "tag_id", "tag_label", "linked_at"]


class CompletionEventSerializer(serializers.ModelSerializer):
    task_id = serializers.IntegerField(source="task.id", read_only=True)

    class Meta:
        model = CompletionEvent
        fields = [
            "id",
            "task_id",
            "task_title",
            "assignee",
            "points",
            "completed_at",
            "frequency",
            "needs_nfc",
        ]


class TaskSerializer(serializers.ModelSerializer):
    nfc_binding = NfcBindingSerializer(read_only=True)
    completion_events = CompletionEventSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "frequency",
            "points",
            "due_label",
            "category",
            "assignee",
            "needs_nfc",
            "nfc_label",
            "critical",
            "penalty_label",
            "streak_bonus",
            "completed",
            "completed_today",
            "completed_this_period",
            "current_streak",
            "best_streak",
            "last_completed_at",
            "created_at",
            "updated_at",
            "nfc_binding",
            "completion_events",
        ]