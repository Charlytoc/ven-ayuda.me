import json
import logging
import os

from django.conf import settings
from pywebpush import WebPushException, webpush

from core.models import PushSubscription

logger = logging.getLogger(__name__)


def _vapid_claims() -> dict:
    subject = os.getenv("WEB_PUSH_VAPID_SUBJECT", "mailto:admin@ven-emergencias.com")
    return {"sub": subject}


def send_push(subscription: PushSubscription, payload: dict) -> bool:
    private_key = os.getenv("WEB_PUSH_VAPID_PRIVATE_KEY", "")
    public_key = os.getenv("WEB_PUSH_VAPID_PUBLIC_KEY", "")
    if not private_key or not public_key:
        logger.warning("Web Push VAPID keys not configured; skipping notification")
        return False

    subscription_info = {
        "endpoint": subscription.endpoint,
        "keys": {
            "p256dh": subscription.p256dh,
            "auth": subscription.auth,
        },
    }

    try:
        webpush(
            subscription_info=subscription_info,
            data=json.dumps(payload),
            vapid_private_key=private_key,
            vapid_claims=_vapid_claims(),
        )
        return True
    except WebPushException as exc:
        status_code = getattr(exc.response, "status_code", None)
        if status_code in (404, 410):
            subscription.delete()
            logger.info("Removed expired push subscription %s", subscription.id)
        else:
            logger.exception("Web Push failed for subscription %s", subscription.id)
        return False
