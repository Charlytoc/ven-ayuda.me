from uuid import UUID

from django.db import transaction
from django.http import HttpRequest
from django.utils import timezone
from ninja import Router

from core.auth import bearer_auth
from core.models import FileUpload, HelpRequest, RescueParticipation
from core.schemas.help_requests import (
    ErrorResponseSchema,
    HelpRequestCreate,
    HelpRequestParticipant,
    HelpRequestResolve,
    HelpRequestResponse,
)
from core.services.auth import get_user_from_request, require_rescuer_profile
from core.tasks.rescuer_notifications import notify_rescuers_nearby

router = Router(tags=["Help requests"])


def _participant_rows(help_request: HelpRequest) -> list[HelpRequestParticipant]:
    participations = help_request.rescue_participations.select_related(
        "rescuer_profile__user"
    ).order_by("created")
    return [
        HelpRequestParticipant(
            rescuer_profile_id=participation.rescuer_profile_id,
            display_name=(
                participation.rescuer_profile.user.first_name
                or participation.rescuer_profile.user.email
            ),
            joined_at=participation.created,
        )
        for participation in participations
    ]


def _to_response(help_request: HelpRequest) -> HelpRequestResponse:
    resolved_by_name = None
    if help_request.resolved_by_id:
        resolved_by_name = (
            help_request.resolved_by.first_name or help_request.resolved_by.email
        )

    return HelpRequestResponse(
        id=help_request.id,
        title=help_request.title,
        latitude=help_request.latitude,
        longitude=help_request.longitude,
        severity=help_request.severity,
        description=help_request.description,
        contact_name=help_request.contact_name,
        contact_phone=help_request.contact_phone,
        contact_email=help_request.contact_email,
        status=help_request.status,
        attachment_ids=list(help_request.attachments.values_list("id", flat=True)),
        participants=_participant_rows(help_request),
        resolved_by_name=resolved_by_name,
        resolved_at=help_request.resolved_at,
        resolution_note=help_request.resolution_note,
        created=help_request.created,
        modified=help_request.modified,
    )


def _prefetch_help_request(pk: UUID) -> HelpRequest:
    return (
        HelpRequest.objects.prefetch_related("attachments")
        .select_related("resolved_by")
        .prefetch_related("rescue_participations__rescuer_profile__user")
        .get(pk=pk)
    )


@router.post(
    "/",
    response={201: HelpRequestResponse, 400: ErrorResponseSchema},
    auth=None,
)
def create_help_request(request: HttpRequest, payload: HelpRequestCreate):
    valid_severities = {choice.value for choice in HelpRequest.Severity}
    if payload.severity not in valid_severities:
        return 400, ErrorResponseSchema(error=f"Invalid severity: {payload.severity}")

    user = get_user_from_request(request)
    reported_by = user if user is not None else None

    attachments: list[FileUpload] = []
    if payload.attachment_ids:
        attachments = list(FileUpload.objects.filter(id__in=payload.attachment_ids))
        if len(attachments) != len(set(payload.attachment_ids)):
            return 400, ErrorResponseSchema(error="One or more attachments not found")

    with transaction.atomic():
        help_request = HelpRequest.objects.create(
            title=payload.title.strip(),
            latitude=payload.latitude,
            longitude=payload.longitude,
            severity=payload.severity,
            description=payload.description.strip(),
            contact_name=payload.contact_name.strip(),
            contact_phone=payload.contact_phone.strip(),
            contact_email=payload.contact_email.strip(),
            reported_by=reported_by,
        )
        if attachments:
            help_request.attachments.set(attachments)
            FileUpload.objects.filter(id__in=[a.id for a in attachments]).update(
                expires_at=None
            )

    notify_rescuers_nearby.delay(str(help_request.pk))

    help_request = _prefetch_help_request(help_request.pk)
    return 201, _to_response(help_request)


@router.get("/", response=list[HelpRequestResponse], auth=None)
def list_help_requests(request: HttpRequest, status: str | None = None):
    queryset = (
        HelpRequest.objects.prefetch_related(
            "attachments",
            "rescue_participations__rescuer_profile__user",
        )
        .select_related("resolved_by")
        .order_by("-created")
    )
    if status:
        queryset = queryset.filter(status=status)
    else:
        queryset = queryset.exclude(status=HelpRequest.Status.RESOLVED)
    return [_to_response(item) for item in queryset]


@router.get(
    "/{help_request_id}/",
    response={200: HelpRequestResponse, 404: ErrorResponseSchema},
    auth=None,
)
def get_help_request(request: HttpRequest, help_request_id: UUID):
    try:
        help_request = _prefetch_help_request(help_request_id)
    except HelpRequest.DoesNotExist:
        return 404, ErrorResponseSchema(error="Help request not found")
    return 200, _to_response(help_request)


@router.post(
    "/{help_request_id}/join",
    response={200: HelpRequestResponse, 400: ErrorResponseSchema, 401: ErrorResponseSchema, 404: ErrorResponseSchema},
    auth=bearer_auth,
)
def join_help_request(request: HttpRequest, help_request_id: UUID):
    user = get_user_from_request(request)
    if user is None:
        return 401, ErrorResponseSchema(error="Unauthorized")

    try:
        profile = require_rescuer_profile(user)
    except ValueError:
        return 401, ErrorResponseSchema(error="Rescuer profile required")

    try:
        help_request = HelpRequest.objects.get(id=help_request_id)
    except HelpRequest.DoesNotExist:
        return 404, ErrorResponseSchema(error="Help request not found")

    if help_request.status == HelpRequest.Status.RESOLVED:
        return 400, ErrorResponseSchema(error="Help request is already resolved")

    with transaction.atomic():
        RescueParticipation.objects.get_or_create(
            help_request=help_request,
            rescuer_profile=profile,
        )
        if help_request.status == HelpRequest.Status.OPEN:
            help_request.status = HelpRequest.Status.IN_PROGRESS
            help_request.save(update_fields=["status", "modified"])

    help_request = _prefetch_help_request(help_request_id)
    return 200, _to_response(help_request)


@router.post(
    "/{help_request_id}/resolve",
    response={200: HelpRequestResponse, 400: ErrorResponseSchema, 401: ErrorResponseSchema, 404: ErrorResponseSchema},
    auth=bearer_auth,
)
def resolve_help_request(
    request: HttpRequest,
    help_request_id: UUID,
    payload: HelpRequestResolve,
):
    user = get_user_from_request(request)
    if user is None:
        return 401, ErrorResponseSchema(error="Unauthorized")

    try:
        require_rescuer_profile(user)
    except ValueError:
        return 401, ErrorResponseSchema(error="Rescuer profile required")

    try:
        help_request = HelpRequest.objects.get(id=help_request_id)
    except HelpRequest.DoesNotExist:
        return 404, ErrorResponseSchema(error="Help request not found")

    if help_request.status == HelpRequest.Status.RESOLVED:
        return 400, ErrorResponseSchema(error="Help request is already resolved")

    now = timezone.now()
    help_request.status = HelpRequest.Status.RESOLVED
    help_request.resolved_by = user
    help_request.resolved_at = now
    help_request.resolution_note = payload.resolution_note.strip()
    help_request.save(
        update_fields=[
            "status",
            "resolved_by",
            "resolved_at",
            "resolution_note",
            "modified",
        ]
    )

    help_request = _prefetch_help_request(help_request_id)
    return 200, _to_response(help_request)
