from django.contrib import admin

from core.admin.rescue_participation import RescueParticipationInline
from core.models import HelpRequest, HelpRequestAttachment


class HelpRequestAttachmentInline(admin.TabularInline):
    model = HelpRequestAttachment
    extra = 0
    raw_id_fields = ("file_upload",)
    readonly_fields = ("created",)


class HelpRequestAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "severity",
        "status",
        "contact_name",
        "contact_phone",
        "latitude",
        "longitude",
        "resolved_by",
        "resolved_at",
        "created",
    )
    list_filter = ("severity", "status", "created")
    search_fields = ("title", "description", "contact_name", "contact_email", "contact_phone")
    readonly_fields = ("id", "created", "modified", "resolved_at")
    inlines = (HelpRequestAttachmentInline, RescueParticipationInline)
    ordering = ("-created",)
