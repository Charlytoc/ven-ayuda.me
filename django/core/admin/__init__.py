from django.contrib import admin

from core.admin.file_upload import FileUploadAdmin
from core.admin.help_request import HelpRequestAdmin
from core.admin.help_request_attachment import HelpRequestAttachmentAdmin
from core.admin.push_subscription import PushSubscriptionAdmin
from core.admin.rescue_participation import (
    RescueParticipationAdmin,
    RescueParticipationInline,
)
from core.admin.rescuer_profile import RescuerProfileAdmin
from core.admin.user import UserAdmin
from core.models import (
    FileUpload,
    HelpRequest,
    HelpRequestAttachment,
    PushSubscription,
    RescueParticipation,
    RescuerProfile,
    User,
)

admin.site.site_header = "VenEmergencias"
admin.site.site_title = "VenEmergencias"
admin.site.index_title = "Administration"

admin.site.register(User, UserAdmin)
admin.site.register(FileUpload, FileUploadAdmin)
admin.site.register(HelpRequest, HelpRequestAdmin)
admin.site.register(HelpRequestAttachment, HelpRequestAttachmentAdmin)
admin.site.register(RescuerProfile, RescuerProfileAdmin)
admin.site.register(RescueParticipation, RescueParticipationAdmin)
admin.site.register(PushSubscription, PushSubscriptionAdmin)
