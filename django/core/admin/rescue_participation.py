from django.contrib import admin

from core.models import RescueParticipation


class RescueParticipationInline(admin.TabularInline):
    model = RescueParticipation
    extra = 0
    raw_id_fields = ("rescuer_profile",)
    readonly_fields = ("created", "modified")


class RescueParticipationAdmin(admin.ModelAdmin):
    list_display = ("help_request", "rescuer_profile", "created")
    raw_id_fields = ("help_request", "rescuer_profile")
    readonly_fields = ("id", "created", "modified")
