from datetime import datetime
from decimal import Decimal
from uuid import UUID

from ninja import Schema
from pydantic import Field, field_validator

from core.utils.geo import normalize_geo_decimal

from core.models.rescuer_profile import (
    ACTION_RADIUS_MAX_KM,
    ACTION_RADIUS_MIN_KM,
)


class AuthRegister(Schema):
    email: str
    password: str = Field(min_length=8)
    first_name: str = Field(min_length=1, max_length=100)
    phone: str = ""


class AuthLogin(Schema):
    email: str
    password: str


class AuthTokenResponse(Schema):
    access_token: str
    token_type: str = "bearer"


class RescuerProfileResponse(Schema):
    phone: str
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    action_radius_km: int
    notifications_enabled: bool
    location_updated_at: datetime | None = None


class AuthMeResponse(Schema):
    id: int
    email: str
    first_name: str
    last_name: str
    rescuer_profile: RescuerProfileResponse


class RescuerProfileUpdate(Schema):
    phone: str | None = None
    latitude: Decimal | None = None
    longitude: Decimal | None = None
    action_radius_km: int | None = None
    notifications_enabled: bool | None = None

    @field_validator("action_radius_km")
    @classmethod
    def validate_radius(cls, value: int | None) -> int | None:
        if value is None:
            return value
        if not ACTION_RADIUS_MIN_KM <= value <= ACTION_RADIUS_MAX_KM:
            raise ValueError(
                f"action_radius_km must be between {ACTION_RADIUS_MIN_KM} "
                f"and {ACTION_RADIUS_MAX_KM}"
            )
        return value

    @field_validator("latitude", "longitude", mode="before")
    @classmethod
    def normalize_coordinates(cls, value: Decimal | float | int | str | None):
        if value is None:
            return value
        return normalize_geo_decimal(value)


class PushSubscriptionCreate(Schema):
    endpoint: str
    p256dh: str
    auth: str


class PushSubscriptionDelete(Schema):
    endpoint: str


class VapidPublicKeyResponse(Schema):
    public_key: str
