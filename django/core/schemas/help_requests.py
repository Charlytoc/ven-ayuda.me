from datetime import datetime
from decimal import Decimal
from uuid import UUID

from ninja import Schema
from pydantic import Field, field_validator

from core.utils.geo import normalize_geo_decimal


class ErrorResponseSchema(Schema):
    error: str
    error_code: str | None = None


class HelpRequestParticipant(Schema):
    rescuer_profile_id: int
    display_name: str
    joined_at: datetime


class HelpRequestCreate(Schema):
    title: str = Field(min_length=3, max_length=255)
    latitude: Decimal = Field(ge=-90, le=90)
    longitude: Decimal = Field(ge=-180, le=180)
    severity: str
    description: str = ""
    contact_name: str = ""
    contact_phone: str = ""
    contact_email: str = ""
    attachment_ids: list[UUID] = []

    @field_validator("latitude", "longitude", mode="before")
    @classmethod
    def normalize_coordinates(cls, value: Decimal | float | int | str):
        return normalize_geo_decimal(value)


class HelpRequestResolve(Schema):
    resolution_note: str = ""


class HelpRequestResponse(Schema):
    id: UUID
    title: str
    latitude: Decimal
    longitude: Decimal
    severity: str
    description: str
    contact_name: str
    contact_phone: str
    contact_email: str
    status: str
    attachment_ids: list[UUID]
    participants: list[HelpRequestParticipant]
    resolved_by_name: str | None = None
    resolved_at: datetime | None = None
    resolution_note: str = ""
    created: datetime
    modified: datetime
