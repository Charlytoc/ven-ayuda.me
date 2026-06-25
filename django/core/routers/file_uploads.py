from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.http import FileResponse, HttpRequest, HttpResponseRedirect
from django.conf import settings
from ninja import Router

from core.models.file_upload import FileUpload
from core.schemas.file_uploads import PresignedUploadRequest, PresignedUploadResponse
from core.schemas.help_requests import ErrorResponseSchema
from core.services.file_storage_service import (
    ALLOWED_IMAGE_CONTENT_TYPES,
    file_storage_service,
)

router = Router(tags=["Uploads"])


@router.post(
    "/presigned-url/",
    response={
        200: PresignedUploadResponse,
        400: ErrorResponseSchema,
        503: ErrorResponseSchema,
    },
    auth=None,
)
def get_presigned_upload_url(
    request: HttpRequest,
    payload: PresignedUploadRequest,
) -> tuple[int, ErrorResponseSchema] | PresignedUploadResponse:
    if payload.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        return 400, ErrorResponseSchema(
            error=f"Unsupported content type: {payload.content_type}"
        )

    try:
        result = file_storage_service.create_upload_slot(
            filename=payload.filename,
            content_type=payload.content_type,
            ttl_seconds=payload.ttl_seconds,
            user=None,
        )
    except Exception:
        return 503, ErrorResponseSchema(error="Upload service unavailable")

    return PresignedUploadResponse(
        file_upload_id=result["file_upload_id"],
        upload_url=result["upload_url"],
        expires_at=result["expires_at"],
    )


@router.put(
    "/local/{file_upload_id}/",
    response={
        200: dict,
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
        503: ErrorResponseSchema,
    },
    auth=None,
)
def local_upload(
    request: HttpRequest,
    file_upload_id: str,
    token: str,
) -> tuple[int, ErrorResponseSchema] | dict:
    try:
        file_upload = FileUpload.objects.get(id=file_upload_id)
    except (FileUpload.DoesNotExist, ValueError, ValidationError):
        return 404, ErrorResponseSchema(error="Upload not found")

    cache_key = f"upload_token:{token}"
    cached_id = cache.get(cache_key)
    if not cached_id or cached_id != file_upload_id:
        return 400, ErrorResponseSchema(error="Invalid or expired upload token")

    if file_upload.file:
        return 400, ErrorResponseSchema(error="File already uploaded")

    cache.delete(cache_key)

    try:
        file_upload.file.save(
            file_upload.original_filename,
            ContentFile(request.body),
            save=False,
        )
        file_upload.save(update_fields=["file"])
    except Exception:
        return 503, ErrorResponseSchema(error="Failed to store uploaded file")

    return 200, {}


@router.get(
    "/local/{file_upload_id}/download/",
    response={
        400: ErrorResponseSchema,
        404: ErrorResponseSchema,
    },
    auth=None,
)
def local_download(
    request: HttpRequest,
    file_upload_id: str,
    token: str,
) -> FileResponse | tuple[int, ErrorResponseSchema]:
    try:
        file_upload = FileUpload.objects.get(id=file_upload_id)
    except (FileUpload.DoesNotExist, ValueError, ValidationError):
        return 404, ErrorResponseSchema(error="File not found")

    cache_key = f"download_token:{token}"
    cached_id = cache.get(cache_key)
    if not cached_id or cached_id != file_upload_id:
        return 400, ErrorResponseSchema(error="Invalid or expired download token")

    if not file_upload.file:
        return 404, ErrorResponseSchema(error="File not found")

    return FileResponse(
        file_upload.file.open("rb"),
        content_type=file_upload.content_type,
        filename=file_upload.original_filename,
    )


@router.get(
    "/public/{file_upload_id}/",
    response={
        404: ErrorResponseSchema,
    },
    auth=None,
)
def public_attachment(
    request: HttpRequest,
    file_upload_id: str,
) -> FileResponse | HttpResponseRedirect | tuple[int, ErrorResponseSchema]:
    try:
        file_upload = FileUpload.objects.get(id=file_upload_id)
    except (FileUpload.DoesNotExist, ValueError, ValidationError):
        return 404, ErrorResponseSchema(error="File not found")

    if not file_upload.help_requests.exists():
        return 404, ErrorResponseSchema(error="File not found")

    if file_upload.file:
        return FileResponse(
            file_upload.file.open("rb"),
            content_type=file_upload.content_type,
            filename=file_upload.original_filename,
        )

    if file_upload.bucket_key and settings.USE_S3:
        url = file_storage_service._get_s3_client().generate_presigned_url(
            "get_object",
            Params={
                "Bucket": settings.AWS_STORAGE_BUCKET_NAME,
                "Key": file_upload.bucket_key,
            },
            ExpiresIn=3600,
        )
        return HttpResponseRedirect(url)

    return 404, ErrorResponseSchema(error="File not found")
