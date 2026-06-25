from django.contrib import admin

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
        "created",
    )
    list_filter = ("severity", "status", "created")
    search_fields = ("title", "description", "contact_name", "contact_email", "contact_phone")
    readonly_fields = ("id", "created", "modified")
    inlines = (HelpRequestAttachmentInline,)
    ordering = ("-created",)
