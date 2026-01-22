"""
Account services for business logic.
"""
import secrets
import hashlib
import logging
from datetime import timedelta
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.core.cache import cache
from .models import User, AuditLog

logger = logging.getLogger(__name__)


class AuditService:
    """Service for creating audit log entries."""
    
    @staticmethod
    def log(
        actor: User,
        action_type: str,
        target_type: str,
        target_id: str,
        metadata: dict = None,
        request=None
    ) -> AuditLog:
        """Create an audit log entry."""
        ip_address = None
        user_agent = None
        
        if request:
            ip_address = AuditService._get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        
        return AuditLog.objects.create(
            actor=actor,
            action_type=action_type,
            target_type=target_type,
            target_id=str(target_id),
            metadata=metadata or {},
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    @staticmethod
    def _get_client_ip(request):
        """Get client IP from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class PasswordResetService:
    """Service for handling password reset operations."""
    
    TOKEN_EXPIRY_HOURS = 24
    CACHE_PREFIX = 'password_reset_'
    
    @classmethod
    def create_reset_token(cls, user: User) -> str:
        """Create a password reset token for a user."""
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        # Store in cache with expiry
        cache_key = f"{cls.CACHE_PREFIX}{token_hash}"
        cache.set(
            cache_key,
            {'user_id': str(user.id)},
            timeout=cls.TOKEN_EXPIRY_HOURS * 3600
        )
        
        return token
    
    @classmethod
    def validate_token(cls, token: str) -> User | None:
        """Validate a reset token and return the user."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        cache_key = f"{cls.CACHE_PREFIX}{token_hash}"
        
        data = cache.get(cache_key)
        if not data:
            return None
        
        try:
            return User.objects.get(id=data['user_id'])
        except User.DoesNotExist:
            return None
    
    @classmethod
    def invalidate_token(cls, token: str) -> None:
        """Invalidate a reset token after use."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        cache_key = f"{cls.CACHE_PREFIX}{token_hash}"
        cache.delete(cache_key)
    
    @classmethod
    def send_reset_email(cls, user: User, token: str) -> None:
        """Send password reset email."""
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        subject = "Reset Your Password - OC MENA Festival"
        message = f"""
Hello {user.full_name},

You requested a password reset for your OC MENA Festival account.

Click the link below to reset your password:
{reset_url}

This link will expire in {cls.TOKEN_EXPIRY_HOURS} hours.

If you did not request this reset, please ignore this email.

Best regards,
OC MENA Festival Team
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            logger.info(f"Password reset email sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send password reset email to {user.email}: {e}")
            raise


class EmailVerificationService:
    """Service for handling email verification."""
    
    TOKEN_EXPIRY_HOURS = 48
    CACHE_PREFIX = 'email_verify_'
    
    @classmethod
    def create_verification_token(cls, user: User) -> str:
        """Create an email verification token."""
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        cache_key = f"{cls.CACHE_PREFIX}{token_hash}"
        cache.set(
            cache_key,
            {'user_id': str(user.id)},
            timeout=cls.TOKEN_EXPIRY_HOURS * 3600
        )
        
        return token
    
    @classmethod
    def verify_token(cls, token: str) -> bool:
        """Verify email verification token and activate user."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        cache_key = f"{cls.CACHE_PREFIX}{token_hash}"
        
        data = cache.get(cache_key)
        if not data:
            return False
        
        try:
            user = User.objects.get(id=data['user_id'])
            user.is_email_verified = True
            user.save(update_fields=['is_email_verified'])
            cache.delete(cache_key)
            return True
        except User.DoesNotExist:
            return False
    
    @classmethod
    def send_verification_email(cls, user: User, token: str) -> None:
        """Send email verification."""
        verify_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        
        subject = "Verify Your Email - OC MENA Festival"
        message = f"""
Hello {user.full_name},

Thank you for registering for OC MENA Festival!

Please click the link below to verify your email address:
{verify_url}

This link will expire in {cls.TOKEN_EXPIRY_HOURS} hours.

Best regards,
OC MENA Festival Team
        """
        
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            logger.info(f"Verification email sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send verification email to {user.email}: {e}")
