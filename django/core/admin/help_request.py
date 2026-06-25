from django.contrib import admin

from core.models import HelpRequest


class HelpRequestAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "severity",
        "status",
        "contact_name",
        "contact_phone",
        "latitude",
        "longitude",
        "created",
    )
    list_filter = ("severity", "status", "created")
    search_fields = ("description", "contact_name", "contact_email", "contact_phone")
    readonly_fields = ("id", "created", "modified")
    filter_horizontal = ("attachments",)
    ordering = ("-created",)
