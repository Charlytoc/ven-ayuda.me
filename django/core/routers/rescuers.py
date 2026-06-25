from django.conf import settings
from django.http import HttpRequest
from ninja import Router

from core.auth import bearer_auth
from core.models import PushSubscription, RescuerProfile
from core.schemas.auth import (
    PushSubscriptionCreate,
    PushSubscriptionDelete,
    RescuerProfileResponse,
    RescuerProfileUpdate,
    VapidPublicKeyResponse,
)
from core.schemas.help_requests import ErrorResponseSchema
from core.services.auth import get_rescuer_profile, get_user_from_request, require_rescuer_profile

router = Router(tags=["Rescuers"])


def _profile_response(profile: RescuerProfile) -> RescuerProfileResponse:
    return RescuerProfileResponse(
        phone=profile.phone,
        latitude=profile.latitude,
        longitude=profile.longitude,
        action_radius_km=profile.action_radius_km,
        notifications_enabled=profile.notifications_enabled,
        location_updated_at=profile.location_updated_at,
    )


@router.get(
    "/vapid-public-key",
    response={200: VapidPublicKeyResponse, 503: ErrorResponseSchema},
    auth=None,
)
def vapid_public_key(request: HttpRequest):
    public_key = settings.WEB_PUSH_VAPID_PUBLIC_KEY
    if not public_key:
        return 503, ErrorResponseSchema(error="Web Push is not configured")
    return 200, VapidPublicKeyResponse(public_key=public_key)


@router.patch(
    "/me",
    response={200: RescuerProfileResponse, 400: ErrorResponseSchema, 401: ErrorResponseSchema},
    auth=bearer_auth,
)
def update_profile(request: HttpRequest, payload: RescuerProfileUpdate):
    user = get_user_from_request(request)
    if user is None:
        return 401, ErrorResponseSchema(error="Unauthorized")

    try:
        profile = require_rescuer_profile(user)
    except ValueError:
        return 401, ErrorResponseSchema(error="Rescuer profile required")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        return 200, _profile_response(profile)

    if "phone" in update_data and update_data["phone"] is not None:
        profile.phone = update_data["phone"].strip()
    if "latitude" in update_data:
        profile.latitude = update_data["latitude"]
    if "longitude" in update_data:
        profile.longitude = update_data["longitude"]
    if "action_radius_km" in update_data and update_data["action_radius_km"] is not None:
        profile.action_radius_km = update_data["action_radius_km"]
    if "notifications_enabled" in update_data and update_data["notifications_enabled"] is not None:
        profile.notifications_enabled = update_data["notifications_enabled"]

    lat_provided = "latitude" in update_data
    lng_provided = "longitude" in update_data
    if lat_provided != lng_provided:
        return 400, ErrorResponseSchema(
            error="latitude and longitude must be provided together"
        )

    try:
        profile.save()
    except Exception as exc:
        return 400, ErrorResponseSchema(error=str(exc))

    return 200, _profile_response(profile)


@router.post(
    "/push-subscriptions",
    response={201: None, 400: ErrorResponseSchema, 401: ErrorResponseSchema},
    auth=bearer_auth,
)
def create_push_subscription(request: HttpRequest, payload: PushSubscriptionCreate):
    user = get_user_from_request(request)
    if user is None:
        return 401, ErrorResponseSchema(error="Unauthorized")

    if get_rescuer_profile(user) is None:
        return 401, ErrorResponseSchema(error="Rescuer profile required")

    PushSubscription.objects.update_or_create(
        user=user,
        endpoint=payload.endpoint,
        defaults={
            "p256dh": payload.p256dh,
            "auth": payload.auth,
        },
    )
    return 201, None


@router.delete(
    "/push-subscriptions",
    response={204: None, 401: ErrorResponseSchema},
    auth=bearer_auth,
)
def delete_push_subscription(request: HttpRequest, payload: PushSubscriptionDelete):
    user = get_user_from_request(request)
    if user is None:
        return 401, ErrorResponseSchema(error="Unauthorized")

    PushSubscription.objects.filter(user=user, endpoint=payload.endpoint).delete()
    return 204, None
