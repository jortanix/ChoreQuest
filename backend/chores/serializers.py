# chores/serializers.py
from rest_framework import serializers
from datetime import date
from .models import Task, CompletionEvent, NfcBinding


class TaskSerializer(serializers.ModelSerializer):
    due_label = serializers.SerializerMethodField()
    # `priority` n'est pas un champ du modèle : il dérive de `critical` /
    # `streak_bonus`. On l'expose en écriture seule (validé via ChoiceField) et on
    # le renvoie en lecture dans `to_representation`.
    priority = serializers.ChoiceField(
        choices=["low", "medium", "high"],
        required=False,
        write_only=True,
    )

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
        read_only_fields = ["id", "due_label", "created_at", "updated_at"]

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

    @staticmethod
    def _apply_priority(validated_data):
        # Traduit priority -> (critical, streak_bonus), inverse exact de la
        # dérivation faite dans to_representation, pour un aller-retour cohérent.
        priority = validated_data.pop("priority", None)
        if priority == "high":
            validated_data["critical"] = True
        elif priority == "medium":
            validated_data["critical"] = False
            validated_data["streak_bonus"] = validated_data.get("streak_bonus") or 1
        elif priority == "low":
            validated_data["critical"] = False
            validated_data["streak_bonus"] = 0
        return validated_data

    def create(self, validated_data):
        return super().create(self._apply_priority(validated_data))

    def update(self, instance, validated_data):
        return super().update(instance, self._apply_priority(validated_data))

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.critical:
            data["priority"] = "high"
        elif instance.streak_bonus:
            data["priority"] = "medium"
        else:
            data["priority"] = "low"
        return data


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