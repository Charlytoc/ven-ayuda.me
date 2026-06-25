from datetime import datetime, timezone

from django.db.models import Q

from config.celery import app
from core.models import FileUpload
from core.services.file_storage_service import file_storage_service


@app.task
def cleanup_expired_file_uploads() -> int:
    now = datetime.now(tz=timezone.utc)
    expired = FileUpload.objects.filter(
        Q(expires_at__isnull=False) & Q(expires_at__lt=now)
    )
    count = 0
    for file_upload in expired.iterator():
        try:
            file_storage_service.delete_file_upload(file_upload)
            count += 1
        except Exception:
            pass
    return count
