from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings

from core.models import User


class JWTService:
    ACCESS_TOKEN_LIFETIME = timedelta(hours=24)
    ALGORITHM = "HS256"
    TOKEN_TYPE_ACCESS = "access"

    def issue_access_token(self, user: User) -> str:
        now = datetime.now(tz=timezone.utc)
        payload = {
            "user_id": user.id,
            "type": self.TOKEN_TYPE_ACCESS,
            "iat": now,
            "exp": now + self.ACCESS_TOKEN_LIFETIME,
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=self.ALGORITHM)

    def validate_access_token(self, token: str) -> User | None:
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[self.ALGORITHM]
            )
        except jwt.PyJWTError:
            return None

        if payload.get("type") != self.TOKEN_TYPE_ACCESS:
            return None

        user_id = payload.get("user_id")
        if not user_id:
            return None

        try:
            return User.objects.get(pk=user_id, is_active=True)
        except User.DoesNotExist:
            return None
