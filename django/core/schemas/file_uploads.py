from datetime import datetime

from ninja import Schema
from pydantic import Field

_MIN_TTL = 300
_MAX_TTL = 3600


class PresignedUploadRequest(Schema):
    filename: str
    content_type: str
    ttl_seconds: int = Field(ge=_MIN_TTL, le=_MAX_TTL)


class PresignedUploadResponse(Schema):
    file_upload_id: str
    upload_url: str
    expires_at: datetime
