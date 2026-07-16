from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Household, Task

User = get_user_model()


class TaskCreationTests(APITestCase):
    def setUp(self):
        self.household = Household.objects.create(name="Maison Test")
        self.user = User.objects.create_user(
            username="parent",
            password="secret123",
            household=self.household,
        )
        self.client.force_authenticate(user=self.user)

    def test_create_task_success(self):
        payload = {
            "title": "Ranger la chambre",
            "description": "Avant le dîner",
            "category": "bedroom",
            "priority": "high",
            "frequency": "daily",
            "points": 30,
            "due_date": "2026-08-01",
            "needs_nfc": False,
        }

        response = self.client.post("/api/tasks/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Ranger la chambre")
        # priority=high doit se traduire en critical=True et se relire "high".
        self.assertTrue(response.data["critical"])
        self.assertEqual(response.data["priority"], "high")

        task = Task.objects.get(id=response.data["id"])
        self.assertEqual(task.household, self.household)
        self.assertEqual(task.frequency, "daily")
        self.assertEqual(task.points, 30)

    def test_create_task_priority_medium_maps_to_streak_bonus(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "Nourrir le chat", "priority": "medium", "category": "pet"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertFalse(response.data["critical"])
        self.assertEqual(response.data["priority"], "medium")

    def test_create_task_missing_title_is_rejected(self):
        response = self.client.post(
            "/api/tasks/",
            {"description": "Sans titre", "priority": "low"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", response.data)

    def test_create_task_invalid_priority_is_rejected(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "Tâche", "priority": "urgent"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("priority", response.data)
