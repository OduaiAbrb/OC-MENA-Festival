"""
Custom exception handling for the API.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Customize the response format
        custom_response_data = {
            'success': False,
            'error': {
                'code': response.status_code,
                'message': get_error_message(response.data),
                'details': response.data if isinstance(response.data, dict) else {'detail': response.data}
            }
        }
        response.data = custom_response_data
        return response
    
    # Handle Django validation errors
    if isinstance(exc, DjangoValidationError):
        logger.warning(f"Validation error: {exc}")
        return Response({
            'success': False,
            'error': {
                'code': 400,
                'message': 'Validation error',
                'details': exc.message_dict if hasattr(exc, 'message_dict') else {'detail': str(exc)}
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Handle integrity errors (unique constraint violations, etc.)
    if isinstance(exc, IntegrityError):
        logger.error(f"Database integrity error: {exc}")
        return Response({
            'success': False,
            'error': {
                'code': 409,
                'message': 'A conflict occurred with the current state of the resource',
                'details': {'detail': 'This operation conflicts with existing data'}
            }
        }, status=status.HTTP_409_CONFLICT)
    
    # Log unexpected exceptions
    logger.exception(f"Unexpected exception: {exc}")
    
    return Response({
        'success': False,
        'error': {
            'code': 500,
            'message': 'An unexpected error occurred',
            'details': {'detail': 'Please try again later'}
        }
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def get_error_message(data):
    """Extract a human-readable error message from response data."""
    if isinstance(data, dict):
        if 'detail' in data:
            return str(data['detail'])
        if 'non_field_errors' in data:
            errors = data['non_field_errors']
            return str(errors[0]) if isinstance(errors, list) else str(errors)
        # Get the first field error
        for key, value in data.items():
            if isinstance(value, list) and value:
                return f"{key}: {value[0]}"
            elif isinstance(value, str):
                return f"{key}: {value}"
    elif isinstance(data, list) and data:
        return str(data[0])
    return 'An error occurred'
