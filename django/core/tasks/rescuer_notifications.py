import logging

from celery import shared_task
from django.conf import settings

from core.models import HelpRequest, RescuerProfile
from core.services.push_notifications import send_push
from core.utils.geo import distance_km

logger = logging.getLogger(__name__)


@shared_task(name="core.tasks.rescuer_notifications.notify_rescuers_nearby")
def notify_rescuers_nearby(help_request_id: str) -> int:
    try:
        help_request = HelpRequest.objects.get(pk=help_request_id)
    except HelpRequest.DoesNotExist:
        logger.warning("Help request %s not found for notification", help_request_id)
        return 0

    alert_lat = float(help_request.latitude)
    alert_lng = float(help_request.longitude)
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    alert_url = f"{frontend_url}/alerta/{help_request.id}"

    sent = 0
    profiles = RescuerProfile.objects.filter(
        notifications_enabled=True,
        latitude__isnull=False,
        longitude__isnull=False,
    ).select_related("user")

    for profile in profiles:
        dist = distance_km(
            float(profile.latitude),
            float(profile.longitude),
            alert_lat,
            alert_lng,
        )
        if dist > profile.action_radius_km:
            continue

        payload = {
            "title": f"Nueva alerta: {help_request.title}",
            "body": f"{help_request.get_severity_display()} — a {dist:.1f} km de ti",
            "url": alert_url,
        }

        subscriptions = profile.user.push_subscriptions.all()
        for subscription in subscriptions:
            if send_push(subscription, payload):
                sent += 1

    return sent
