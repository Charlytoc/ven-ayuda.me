from django.contrib import admin

from core.models import FileUpload


class FileUploadAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "original_filename",
        "content_type",
        "uploaded_by",
        "expires_at",
        "created",
    )
    list_filter = ("content_type",)
    search_fields = ("original_filename", "uploaded_by__email", "bucket_key")
    readonly_fields = ("id", "created", "modified")
    ordering = ("-created",)
