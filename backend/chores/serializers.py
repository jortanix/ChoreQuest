# chores/serializers.py
from rest_framework import serializers
from datetime import date
from .models import Task, CompletionEvent, NfcBinding


class TaskSerializer(serializers.ModelSerializer):
    due_label = serializers.SerializerMethodField()
    priority  = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "household",
            "assigned_to",
            "title",
            "description",
            "frequency",
            "points",
            "category",
            "needs_nfc",
            "nfc_label",
            "critical",
            "streak_bonus",
            "is_active",
            "due_date",
            "due_label",
            "priority",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "due_label", "priority", "created_at", "updated_at"]

    def get_due_label(self, obj) -> str | None:
        if not obj.due_date:
            return None
        today = date.today()
        delta = (obj.due_date - today).days
        if delta < 0:
            return "En retard"
        elif delta == 0:
            return "Aujourd'hui"
        elif delta == 1:
            return "Demain"
        else:
            return f"Dans {delta} jours"

    def get_priority(self, obj) -> str:
        if obj.critical:
            return "high"
        if obj.streak_bonus:
            return "medium"
        return "low"


class CompletionEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompletionEvent
        fields = [
            "id",
            "task",
            "completed_by",
            "scheduled_date",
            "completed_at",
            "points",
            "notes",
            "needs_nfc",
        ]
        read_only_fields = ["id", "completed_at"]


class NfcBindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = NfcBinding
        fields = [
            "id",
            "task",
            "tag_id",
            "tag_label",
            "linked_at",
        ]
        read_only_fields = ["id", "linked_at"]