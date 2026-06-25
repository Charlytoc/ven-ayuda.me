from django.contrib.admin.views.decorators import staff_member_required
from ninja import NinjaAPI
from ninja.errors import HttpError
from config import settings
from core.routers import file_uploads_router, help_requests_router
from core.schemas.help_requests import ErrorResponseSchema

docs_decorator = staff_member_required if not settings.DEBUG else None

api = NinjaAPI(title="ven-ayuda.me", docs_decorator=docs_decorator)


@api.exception_handler(HttpError)
def http_error(request, exc):
    error_code = getattr(exc, "error_code", None)
    return api.create_response(
        request,
        ErrorResponseSchema(error=str(exc), error_code=error_code),
        status=exc.status_code,
    )


api.add_router("/uploads/", file_uploads_router)
api.add_router("/help-requests/", help_requests_router)


@api.get("/health")
def health(request):
    return {"status": "ok"}
