import base64
import uuid

from django.core.exceptions import ValidationError
from django.db import models
from model_utils.models import TimeStampedModel

from core.models.user import User


def _local_upload_path(instance: "FileUpload", filename: str) -> str:
    return f"uploads/{instance.id}/{filename}"


class FileUpload(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    original_filename = models.CharField(max_length=255)
    content_type = models.CharField(max_length=100)
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="file_uploads",
    )
    expires_at = models.DateTimeField(null=True, blank=True)
    bucket_key = models.CharField(max_length=1024, null=True, blank=True)
    file = models.FileField(upload_to=_local_upload_path, null=True, blank=True)

    class Meta:
        ordering = ["-created"]

    def clean(self) -> None:
        if self.bucket_key and self.file:
            raise ValidationError(
                "A file upload cannot have both bucket_key and file set."
            )

    def get_as_b64_url(self) -> str | None:
        if not self.file:
            return None
        try:
            data = self.file.read()
        finally:
            self.file.close()
        b64 = base64.b64encode(data).decode("ascii")
        return f"data:{self.content_type};base64,{b64}"

    def __str__(self) -> str:
        return self.original_filename
