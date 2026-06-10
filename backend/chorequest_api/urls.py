from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from chores.views import TaskViewSet, CompletionEventViewSet, NfcBindingViewSet

router = DefaultRouter()
router.register("tasks", TaskViewSet, basename="task")
router.register("completion-events", CompletionEventViewSet, basename="completion-event")
router.register("nfc-bindings", NfcBindingViewSet, basename="nfc-binding")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
]