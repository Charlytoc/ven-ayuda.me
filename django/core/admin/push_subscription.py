from django.contrib import admin

from core.models import PushSubscription


class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "endpoint", "created")
    search_fields = ("user__email", "endpoint")
    raw_id_fields = ("user",)
    readonly_fields = ("id", "created", "modified")
