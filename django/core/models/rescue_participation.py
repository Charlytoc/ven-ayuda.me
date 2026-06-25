import uuid

from django.db import models
from model_utils.models import TimeStampedModel

from core.models.help_request import HelpRequest
from core.models.rescuer_profile import RescuerProfile


class RescueParticipation(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    help_request = models.ForeignKey(
        HelpRequest,
        on_delete=models.CASCADE,
        related_name="rescue_participations",
    )
    rescuer_profile = models.ForeignKey(
        RescuerProfile,
        on_delete=models.CASCADE,
        related_name="rescue_participations",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["help_request", "rescuer_profile"],
                name="unique_rescue_participation_per_request",
            )
        ]
        ordering = ("created",)

    def __str__(self) -> str:
        return f"{self.rescuer_profile} → {self.help_request_id}"
