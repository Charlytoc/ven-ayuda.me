from django.contrib import admin

from core.models import HelpRequestAttachment


class HelpRequestAttachmentAdmin(admin.ModelAdmin):
    list_display = ("id", "help_request", "file_upload", "created")
    list_filter = ("created",)
    search_fields = (
        "help_request__title",
        "file_upload__original_filename",
    )
    readonly_fields = ("id", "created", "modified")
    raw_id_fields = ("help_request", "file_upload")
    ordering = ("-created",)
