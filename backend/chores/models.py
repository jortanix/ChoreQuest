import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class Household(models.Model):
    id   = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self): return self.name


class User(AbstractUser):
    id        = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    household = models.ForeignKey(
        Household, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="members"
    )

    groups = models.ManyToManyField(
        "auth.Group",
        blank=True,
        related_name="chores_user_set",
        related_query_name="chores_user",
    )
    user_permissions = models.ManyToManyField(
        "auth.Permission",
        blank=True,
        related_name="chores_user_set",
        related_query_name="chores_user",
    )

    class Meta:
        db_table = "user"


class TaskFrequency(models.TextChoices):
    DAILY    = "daily",    "Daily"
    WEEKLY   = "weekly",   "Weekly"
    BIWEEKLY = "biweekly", "Biweekly"
    MONTHLY  = "monthly",  "Monthly"
    SEASONAL = "seasonal", "Seasonal"
    YEARLY   = "yearly",   "Yearly"


class TaskCategory(models.TextChoices):
    PET         = "pet",         "Pet"
    KITCHEN     = "kitchen",     "Kitchen"
    BATHROOM    = "bathroom",    "Bathroom"
    BEDROOM     = "bedroom",     "Bedroom"
    LIVING_ROOM = "living-room", "Living room"
    GENERAL     = "general",     "General"


class Task(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    household   = models.ForeignKey(
        Household, on_delete=models.CASCADE,
        related_name="tasks", null=True, blank=True
    )
    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="tasks"
    )
    title           = models.CharField(max_length=150)
    description     = models.TextField(blank=True)
    frequency       = models.CharField(max_length=20, choices=TaskFrequency.choices, default=TaskFrequency.WEEKLY)
    points          = models.PositiveIntegerField(default=0)
    category        = models.CharField(max_length=20, choices=TaskCategory.choices, blank=True)
    needs_nfc       = models.BooleanField(default=False)
    nfc_label       = models.CharField(max_length=100, blank=True)
    critical        = models.BooleanField(default=False)
    streak_bonus    = models.PositiveIntegerField(default=0)
    is_active       = models.BooleanField(default=True)
    due_date        = models.DateField(null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self): return self.title


class CompletionEvent(models.Model):
    id             = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task           = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="completion_events")
    completed_by   = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    scheduled_date = models.DateField()
    completed_at   = models.DateTimeField()
    points         = models.PositiveIntegerField(default=0)
    notes          = models.TextField(blank=True)
    needs_nfc      = models.BooleanField(default=False)

    class Meta:
        unique_together = [("task", "scheduled_date")]
        ordering = ["-completed_at"]

    def __str__(self): return f"{self.task.title} — {self.scheduled_date}"


class NfcBinding(models.Model):
    task      = models.OneToOneField(Task, on_delete=models.CASCADE, related_name="nfc_binding")
    tag_id    = models.CharField(max_length=150, unique=True)
    tag_label = models.CharField(max_length=150, blank=True)
    linked_at = models.DateTimeField(auto_now_add=True)