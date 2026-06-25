import uuid

from django.db import models
from model_utils.models import TimeStampedModel

from core.models.user import User


class PushSubscription(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="push_subscriptions",
    )
    endpoint = models.TextField()
    p256dh = models.TextField()
    auth = models.TextField()

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "endpoint"],
                name="unique_push_subscription_per_user_endpoint",
            )
        ]
        indexes = [
            models.Index(fields=["user"]),
        ]

    def __str__(self) -> str:
        return f"PushSubscription {self.id} ({self.user.email})"
