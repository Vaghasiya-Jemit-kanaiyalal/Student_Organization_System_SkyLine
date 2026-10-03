from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    """
    Custom exception handler to provide unified, standard JSON response structure:
    {
        "success": False,
        "error": "Error description / code",
        "details": {...} or "..."
    }
    """
    response = exception_handler(exc, context)

    if response is not None:
        custom_data = {
            "success": False,
            "error": exc.__class__.__name__,
            "details": response.data,
            "status_code": response.status_code,
        }
        response.data = custom_data
    else:
        # Fallback for unhandled 500 exceptions
        return Response({
            "success": False,
            "error": "InternalServerError",
            "details": str(exc),
            "status_code": status.HTTP_500_INTERNAL_SERVER_ERROR
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
