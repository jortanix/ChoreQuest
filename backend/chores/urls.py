from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, CompletionEventViewSet, NfcBindingViewSet
from .views import HomeDashboardView, CalendarDashboardView

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")
router.register("completion-events", CompletionEventViewSet, basename="completion-event")
router.register("nfc-bindings", NfcBindingViewSet, basename="nfc-binding")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard/home/", HomeDashboardView.as_view()),
    path("dashboard/calendar/", CalendarDashboardView.as_view()),
]