from django.contrib import admin

from core.admin.file_upload import FileUploadAdmin
from core.admin.help_request import HelpRequestAdmin
from core.admin.user import UserAdmin
from core.models import FileUpload, HelpRequest, User

admin.site.site_header = "ven-ayuda.me"
admin.site.site_title = "ven-ayuda.me"
admin.site.index_title = "Administration"

admin.site.register(User, UserAdmin)
admin.site.register(FileUpload, FileUploadAdmin)
admin.site.register(HelpRequest, HelpRequestAdmin)
