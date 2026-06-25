from django.contrib import admin

from core.models import RescuerProfile


class RescuerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "phone",
        "action_radius_km",
        "notifications_enabled",
        "latitude",
        "longitude",
        "location_updated_at",
    )
    list_filter = ("notifications_enabled",)
    search_fields = ("user__email", "user__first_name", "phone")
    raw_id_fields = ("user",)
    readonly_fields = ("location_updated_at", "created", "modified")
