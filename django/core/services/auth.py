from django.contrib.auth import authenticate
from django.db import transaction
from django.http import HttpRequest

from core.models import RescuerProfile, User
from core.services.jwt_service import JWTService

_jwt_service = JWTService()


def get_bearer_token(request: HttpRequest) -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None
    token = auth_header[7:].strip()
    return token or None


def get_user_from_request(request: HttpRequest) -> User | None:
    token = get_bearer_token(request)
    if not token:
        return None
    return _jwt_service.validate_access_token(token)


def get_rescuer_profile(user: User) -> RescuerProfile | None:
    try:
        return user.rescuer_profile
    except RescuerProfile.DoesNotExist:
        return None


def require_rescuer_profile(user: User) -> RescuerProfile:
    profile = get_rescuer_profile(user)
    if profile is None:
        raise ValueError("Rescuer profile required")
    return profile


@transaction.atomic
def register_rescuer(
    *,
    email: str,
    password: str,
    first_name: str,
    phone: str = "",
) -> tuple[User, str]:
    email = User.objects.normalize_email(email)
    if User.objects.filter(email=email).exists():
        raise ValueError("A user with this email already exists.")

    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name.strip(),
    )
    RescuerProfile.objects.create(user=user, phone=phone.strip())
    token = _jwt_service.issue_access_token(user)
    return user, token


def login_user(*, email: str, password: str) -> tuple[User, str] | None:
    user = authenticate(username=email, password=password)
    if user is None or not user.is_active:
        return None
    if get_rescuer_profile(user) is None:
        return None
    return user, _jwt_service.issue_access_token(user)
