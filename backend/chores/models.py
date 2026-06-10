from django.db import models


class TaskFrequency(models.TextChoices):
    DAILY = "daily", "Daily"
    WEEKLY = "weekly", "Weekly"
    BIWEEKLY = "biweekly", "Biweekly"
    MONTHLY = "monthly", "Monthly"
    SEASONAL = "seasonal", "Seasonal"
    YEARLY = "yearly", "Yearly"


class TaskCategory(models.TextChoices):
    PET = "pet", "Pet"
    KITCHEN = "kitchen", "Kitchen"
    BATHROOM = "bathroom", "Bathroom"
    BEDROOM = "bedroom", "Bedroom"
    LIVING_ROOM = "living-room", "Living room"
    GENERAL = "general", "General"


class Task(models.Model):
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    frequency = models.CharField(
        max_length=20,
        choices=TaskFrequency.choices,
        default=TaskFrequency.WEEKLY,
    )
    points = models.PositiveIntegerField(default=0)
    due_label = models.CharField(max_length=100, blank=True)
    category = models.CharField(
        max_length=20,
        choices=TaskCategory.choices,
        blank=True,
    )
    assignee = models.CharField(max_length=100, blank=True)
    needs_nfc = models.BooleanField(default=False)
    nfc_label = models.CharField(max_length=100, blank=True)
    critical = models.BooleanField(default=False)
    penalty_label = models.CharField(max_length=100, blank=True)
    streak_bonus = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    completed_today = models.BooleanField(default=False)
    completed_this_period = models.BooleanField(default=False)
    current_streak = models.PositiveIntegerField(default=0)
    best_streak = models.PositiveIntegerField(default=0)
    last_completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class CompletionEvent(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="completion_events",
    )
    task_title = models.CharField(max_length=150)
    assignee = models.CharField(max_length=100, blank=True)
    points = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField()
    frequency = models.CharField(
        max_length=20,
        choices=TaskFrequency.choices,
    )
    needs_nfc = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.task_title} - {self.completed_at}"


class NfcBinding(models.Model):
    task = models.OneToOneField(
        Task,
        on_delete=models.CASCADE,
        related_name="nfc_binding",
    )
    tag_id = models.CharField(max_length=150, unique=True)
    tag_label = models.CharField(max_length=150, blank=True)
    linked_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.task.title} <-> {self.tag_id}"