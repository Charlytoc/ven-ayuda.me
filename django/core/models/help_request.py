import uuid

from django.db import models
from model_utils.models import TimeStampedModel

from core.models.file_upload import FileUpload
from core.models.user import User


class HelpRequest(TimeStampedModel):
    class Severity(models.TextChoices):
        CRITICAL = "critical", "Critical"
        URGENT = "urgent", "Urgent"
        MODERATE = "moderate", "Moderate"
        LOW = "low", "Low"

    class Status(models.TextChoices):
        OPEN = "open", "Open"
        IN_PROGRESS = "in_progress", "In progress"
        RESOLVED = "resolved", "Resolved"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    severity = models.CharField(max_length=20, choices=Severity.choices)
    description = models.TextField(blank=True)
    contact_name = models.CharField(max_length=255, blank=True)
    contact_phone = models.CharField(max_length=40, blank=True)
    contact_email = models.EmailField(blank=True)
    reported_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="help_requests",
    )
    attachments = models.ManyToManyField(
        FileUpload,
        through="HelpRequestAttachment",
        blank=True,
        related_name="help_requests",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
    )

    class Meta:
        ordering = ("-created",)

    def __str__(self) -> str:
        return f"{self.get_severity_display()} — {self.title}"
