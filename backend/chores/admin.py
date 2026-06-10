from django.contrib import admin
from .models import Task, CompletionEvent, NfcBinding

admin.site.register(Task)
admin.site.register(CompletionEvent)
admin.site.register(NfcBinding)