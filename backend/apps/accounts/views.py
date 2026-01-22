"""
Account views for authentication and user management.
"""
import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from drf_spectacular.utils import extend_schema, OpenApiResponse

from .models import User
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    UserProfileUpdateSerializer,
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)
from .services import PasswordResetService, AuditService

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    """User registration endpoint."""
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Register a new user",
        request=RegisterSerializer,
        responses={
            201: OpenApiResponse(description="User registered successfully"),
            400: OpenApiResponse(description="Validation error"),
        }
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        logger.info(f"New user registered: {user.email}")
        
        return Response({
            'success': True,
            'message': 'Account created successfully',
            'data': {
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """User login endpoint."""
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Login user",
        request=LoginSerializer,
        responses={
            200: OpenApiResponse(description="Login successful"),
            400: OpenApiResponse(description="Invalid credentials"),
        }
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        
        logger.info(f"User logged in: {user.email}")
        
        return Response({
            'success': True,
            'message': 'Login successful',
            'data': {
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """User logout endpoint - blacklists refresh token."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Logout user",
        request={"type": "object", "properties": {"refresh": {"type": "string"}}},
        responses={
            200: OpenApiResponse(description="Logout successful"),
        }
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            logger.info(f"User logged out: {request.user.email}")
            
            return Response({
                'success': True,
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.warning(f"Logout error for {request.user.email}: {e}")
            return Response({
                'success': True,
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    """User profile endpoint."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Get current user profile",
        responses={200: UserSerializer}
    )
    def get(self, request):
        return Response({
            'success': True,
            'data': UserSerializer(request.user).data
        })
    
    @extend_schema(
        summary="Update current user profile",
        request=UserProfileUpdateSerializer,
        responses={200: UserSerializer}
    )
    def patch(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'data': UserSerializer(request.user).data
        })


class ChangePasswordView(APIView):
    """Change password endpoint."""
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Change user password",
        request=ChangePasswordSerializer,
        responses={
            200: OpenApiResponse(description="Password changed successfully"),
            400: OpenApiResponse(description="Invalid current password"),
        }
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        if not user.check_password(serializer.validated_data['current_password']):
            return Response({
                'success': False,
                'error': {
                    'code': 400,
                    'message': 'Current password is incorrect'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        AuditService.log(
            actor=user,
            action_type='USER_UPDATE',
            target_type='User',
            target_id=str(user.id),
            metadata={'action': 'password_changed'},
            request=request
        )
        
        logger.info(f"Password changed for user: {user.email}")
        
        return Response({
            'success': True,
            'message': 'Password changed successfully'
        })


class PasswordResetRequestView(APIView):
    """Request password reset endpoint."""
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Request password reset",
        request=PasswordResetRequestSerializer,
        responses={
            200: OpenApiResponse(description="Reset email sent if account exists"),
        }
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email'].lower()
        
        # Always return success to prevent email enumeration
        try:
            user = User.objects.get(email=email)
            token = PasswordResetService.create_reset_token(user)
            PasswordResetService.send_reset_email(user, token)
        except User.DoesNotExist:
            pass  # Don't reveal if email exists
        
        return Response({
            'success': True,
            'message': 'If an account exists with this email, you will receive a password reset link.'
        })


class PasswordResetConfirmView(APIView):
    """Confirm password reset endpoint."""
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Confirm password reset",
        request=PasswordResetConfirmSerializer,
        responses={
            200: OpenApiResponse(description="Password reset successfully"),
            400: OpenApiResponse(description="Invalid or expired token"),
        }
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        token = serializer.validated_data['token']
        user = PasswordResetService.validate_token(token)
        
        if not user:
            return Response({
                'success': False,
                'error': {
                    'code': 400,
                    'message': 'Invalid or expired reset token'
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        PasswordResetService.invalidate_token(token)
        
        logger.info(f"Password reset completed for user: {user.email}")
        
        return Response({
            'success': True,
            'message': 'Password has been reset successfully'
        })
