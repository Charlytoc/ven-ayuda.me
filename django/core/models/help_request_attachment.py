import uuid

from django.db import models
from model_utils.models import TimeStampedModel

from core.models.file_upload import FileUpload
from core.models.help_request import HelpRequest


class HelpRequestAttachment(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    help_request = models.ForeignKey(
        HelpRequest,
        on_delete=models.CASCADE,
        related_name="help_request_attachments",
    )
    file_upload = models.ForeignKey(
        FileUpload,
        on_delete=models.CASCADE,
        related_name="help_request_attachments",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["help_request", "file_upload"],
                name="unique_help_request_file_upload",
            ),
        ]
        ordering = ("created",)

    def __str__(self) -> str:
        return f"{self.help_request_id} → {self.file_upload.original_filename}"
