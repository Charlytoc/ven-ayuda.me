from django.http import HttpRequest
from ninja import Router

from core.schemas.auth import (
    AuthLogin,
    AuthMeResponse,
    AuthRegister,
    AuthTokenResponse,
    RescuerProfileResponse,
)
from core.schemas.help_requests import ErrorResponseSchema
from core.services.auth import get_rescuer_profile, get_user_from_request, login_user, register_rescuer
from core.auth import bearer_auth

router = Router(tags=["Auth"])


def _profile_response(user) -> RescuerProfileResponse:
    profile = user.rescuer_profile
    return RescuerProfileResponse(
        phone=profile.phone,
        latitude=profile.latitude,
        longitude=profile.longitude,
        action_radius_km=profile.action_radius_km,
        notifications_enabled=profile.notifications_enabled,
        location_updated_at=profile.location_updated_at,
    )


def _me_response(user) -> AuthMeResponse:
    return AuthMeResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        rescuer_profile=_profile_response(user),
    )


@router.post(
    "/register",
    response={201: AuthTokenResponse, 400: ErrorResponseSchema},
    auth=None,
)
def register(request: HttpRequest, payload: AuthRegister):
    try:
        _, token = register_rescuer(
            email=payload.email,
            password=payload.password,
            first_name=payload.first_name,
            phone=payload.phone,
        )
    except ValueError as exc:
        return 400, ErrorResponseSchema(error=str(exc))

    return 201, AuthTokenResponse(access_token=token)


@router.post(
    "/login",
    response={200: AuthTokenResponse, 401: ErrorResponseSchema},
    auth=None,
)
def login(request: HttpRequest, payload: AuthLogin):
    result = login_user(email=payload.email, password=payload.password)
    if result is None:
        return 401, ErrorResponseSchema(error="Invalid credentials")
    _, token = result
    return 200, AuthTokenResponse(access_token=token)


@router.get(
    "/me",
    response={200: AuthMeResponse, 401: ErrorResponseSchema},
    auth=bearer_auth,
)
def me(request: HttpRequest):
    user = get_user_from_request(request)
    if user is None or get_rescuer_profile(user) is None:
        return 401, ErrorResponseSchema(error="Unauthorized")
    return 200, _me_response(user)
