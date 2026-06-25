from uuid import UUID

from django.db import transaction
from django.http import HttpRequest
from ninja import Router

from core.models import FileUpload, HelpRequest
from core.schemas.help_requests import (
    ErrorResponseSchema,
    HelpRequestCreate,
    HelpRequestResponse,
)

router = Router(tags=["Help requests"])


def _to_response(help_request: HelpRequest) -> HelpRequestResponse:
    return HelpRequestResponse(
        id=help_request.id,
        latitude=help_request.latitude,
        longitude=help_request.longitude,
        severity=help_request.severity,
        description=help_request.description,
        contact_name=help_request.contact_name,
        contact_phone=help_request.contact_phone,
        contact_email=help_request.contact_email,
        status=help_request.status,
        attachment_ids=list(help_request.attachments.values_list("id", flat=True)),
        created=help_request.created,
        modified=help_request.modified,
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

    attachments: list[FileUpload] = []
    if payload.attachment_ids:
        attachments = list(FileUpload.objects.filter(id__in=payload.attachment_ids))
        if len(attachments) != len(set(payload.attachment_ids)):
            return 400, ErrorResponseSchema(error="One or more attachments not found")

    with transaction.atomic():
        help_request = HelpRequest.objects.create(
            latitude=payload.latitude,
            longitude=payload.longitude,
            severity=payload.severity,
            description=payload.description.strip(),
            contact_name=payload.contact_name.strip(),
            contact_phone=payload.contact_phone.strip(),
            contact_email=payload.contact_email.strip(),
        )
        if attachments:
            help_request.attachments.set(attachments)

    help_request = HelpRequest.objects.prefetch_related("attachments").get(
        pk=help_request.pk
    )
    return 201, _to_response(help_request)


@router.get("/", response=list[HelpRequestResponse], auth=None)
def list_help_requests(request: HttpRequest, status: str | None = None):
    queryset = HelpRequest.objects.prefetch_related("attachments").order_by("-created")
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
        help_request = HelpRequest.objects.prefetch_related("attachments").get(
            id=help_request_id
        )
    except HelpRequest.DoesNotExist:
        return 404, ErrorResponseSchema(error="Help request not found")
    return 200, _to_response(help_request)
