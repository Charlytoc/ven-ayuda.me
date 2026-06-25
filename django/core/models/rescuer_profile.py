from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models
from model_utils.models import TimeStampedModel

from core.models.user import User

ACTION_RADIUS_MIN_KM = 1
ACTION_RADIUS_MAX_KM = 50
ACTION_RADIUS_DEFAULT_KM = 25


class RescuerProfile(TimeStampedModel):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="rescuer_profile",
    )
    phone = models.CharField(max_length=40, blank=True)
    latitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    longitude = models.DecimalField(
        max_digits=9, decimal_places=6, null=True, blank=True
    )
    action_radius_km = models.PositiveSmallIntegerField(
        default=ACTION_RADIUS_DEFAULT_KM
    )
    notifications_enabled = models.BooleanField(default=True)
    location_updated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created",)

    def __str__(self) -> str:
        return f"Rescuer: {self.user.email}"

    def clean(self) -> None:
        if not ACTION_RADIUS_MIN_KM <= self.action_radius_km <= ACTION_RADIUS_MAX_KM:
            raise ValidationError(
                {
                    "action_radius_km": (
                        f"Must be between {ACTION_RADIUS_MIN_KM} and "
                        f"{ACTION_RADIUS_MAX_KM} km."
                    )
                }
            )
        if (self.latitude is None) != (self.longitude is None):
            raise ValidationError(
                "latitude and longitude must both be set or both be empty."
            )

    def save(self, *args, **kwargs):
        if self.phone:
            self.phone = self.phone.strip()
        if self.latitude is not None:
            from core.utils.geo import normalize_geo_decimal

            self.latitude = normalize_geo_decimal(self.latitude)
        if self.longitude is not None:
            from core.utils.geo import normalize_geo_decimal

            self.longitude = normalize_geo_decimal(self.longitude)
        if self.latitude is not None and self.longitude is not None:
            from django.utils import timezone

            self.location_updated_at = timezone.now()
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def has_location(self) -> bool:
        return self.latitude is not None and self.longitude is not None

    def distance_km_to(self, lat: Decimal, lng: Decimal) -> float | None:
        if not self.has_location:
            return None
        from core.utils.geo import distance_km

        return distance_km(
            float(self.latitude),
            float(self.longitude),
            float(lat),
            float(lng),
        )
