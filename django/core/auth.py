from django.http import HttpRequest
from ninja.security import HttpBearer

from core.models import User
from core.services.jwt_service import JWTService

_jwt_service = JWTService()


class BearerAuth(HttpBearer):
    def authenticate(self, request: HttpRequest, token: str) -> User | None:
        return _jwt_service.validate_access_token(token)


bearer_auth = BearerAuth()
