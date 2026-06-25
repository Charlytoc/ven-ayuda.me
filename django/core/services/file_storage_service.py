import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import TypedDict

import boto3
from django.conf import settings
from django.core.cache import cache
from django.core.files.base import ContentFile
from django.db import transaction

from core.models.file_upload import FileUpload
from core.models.user import User

MAX_PERMANENT_IMAGE_BYTES = 10 * 1024 * 1024

ALLOWED_IMAGE_CONTENT_TYPES = frozenset(
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
    }
)

_PRESIGNED_PUT_EXPIRY_SECONDS = 300


class UploadSlotResult(TypedDict):
    file_upload_id: str
    upload_url: str
    expires_at: datetime


class FileStorageService:
    def _get_s3_client(self):
        kwargs: dict = {"region_name": settings.AWS_S3_REGION_NAME}
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
            kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
        return boto3.client("s3", **kwargs)

    @staticmethod
    def _sanitize_original_filename(filename: str) -> str:
        base = os.path.basename(filename.replace("\\", "/"))
        if not base or base in (".", ".."):
            return "attachment"
        return base[:255]

    def create_upload_slot(
        self,
        filename: str,
        content_type: str,
        ttl_seconds: int,
        user: User | None,
    ) -> UploadSlotResult:
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds)
        safe_name = self._sanitize_original_filename(filename)

        if settings.USE_S3:
            bucket_key = f"temp/{uuid.uuid4()}/{safe_name}"
            upload_url: str = self._get_s3_client().generate_presigned_url(
                "put_object",
                Params={
                    "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
                    "Key": bucket_key,
                    "ContentType": content_type,
                },
                ExpiresIn=_PRESIGNED_PUT_EXPIRY_SECONDS,
            )
            file_upload = FileUpload.objects.create(
                original_filename=safe_name,
                content_type=content_type,
                uploaded_by=user,
                bucket_key=bucket_key,
                expires_at=expires_at,
            )
        else:
            upload_token = secrets.token_urlsafe(32)
            file_upload = FileUpload.objects.create(
                original_filename=safe_name,
                content_type=content_type,
                uploaded_by=user,
                expires_at=expires_at,
            )
            cache.set(
                f"upload_token:{upload_token}",
                str(file_upload.id),
                timeout=ttl_seconds,
            )
            upload_url = (
                f"{settings.SITE_URL}/api/uploads/local/{file_upload.id}/"
                f"?token={upload_token}"
            )

        return UploadSlotResult(
            file_upload_id=str(file_upload.id),
            upload_url=upload_url,
            expires_at=expires_at,
        )

    def delete_file_upload(self, file_upload: FileUpload) -> None:
        if file_upload.bucket_key and settings.USE_S3:
            self._get_s3_client().delete_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=file_upload.bucket_key,
            )
        elif file_upload.file:
            file_upload.file.delete(save=False)
        file_upload.delete()

    def store_permanent_image_bytes(
        self,
        filename: str,
        content_type: str,
        data: bytes,
        uploaded_by: User | None,
    ) -> FileUpload:
        if content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
            raise ValueError("Unsupported image content type")
        if len(data) > MAX_PERMANENT_IMAGE_BYTES:
            raise ValueError("Image exceeds maximum allowed size")

        safe_name = self._sanitize_original_filename(filename)

        if settings.USE_S3:
            bucket_key = f"uploads/{uuid.uuid4()}/{safe_name}"
            self._get_s3_client().put_object(
                Bucket=settings.AWS_STORAGE_BUCKET_NAME,
                Key=bucket_key,
                Body=data,
                ContentType=content_type,
            )
            return FileUpload.objects.create(
                original_filename=safe_name,
                content_type=content_type,
                uploaded_by=uploaded_by,
                bucket_key=bucket_key,
                expires_at=None,
            )

        with transaction.atomic():
            file_upload = FileUpload.objects.create(
                original_filename=safe_name,
                content_type=content_type,
                uploaded_by=uploaded_by,
                expires_at=None,
            )
            file_upload.file.save(safe_name, ContentFile(data), save=True)
            return file_upload


file_storage_service = FileStorageService()
