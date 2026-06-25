from core.routers.auth import router as auth_router
from core.routers.file_uploads import router as file_uploads_router
from core.routers.help_requests import router as help_requests_router
from core.routers.rescuers import router as rescuers_router

__all__ = [
    "auth_router",
    "file_uploads_router",
    "help_requests_router",
    "rescuers_router",
]
