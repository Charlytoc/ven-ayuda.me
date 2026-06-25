from datetime import datetime
from decimal import Decimal
from uuid import UUID

from ninja import Schema
from pydantic import Field


class ErrorResponseSchema(Schema):
    error: str
    error_code: str | None = None


class HelpRequestCreate(Schema):
    latitude: Decimal = Field(ge=-90, le=90)
    longitude: Decimal = Field(ge=-180, le=180)
    severity: str
    description: str
    contact_name: str = ""
    contact_phone: str = ""
    contact_email: str = ""
    attachment_ids: list[UUID] = []


class HelpRequestResponse(Schema):
    id: UUID
    latitude: Decimal
    longitude: Decimal
    severity: str
    description: str
    contact_name: str
    contact_phone: str
    contact_email: str
    status: str
    attachment_ids: list[UUID]
    created: datetime
    modified: datetime
