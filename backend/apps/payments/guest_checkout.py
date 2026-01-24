"""
Guest checkout service for allowing purchases without forced registration.
Users can checkout as guests and accounts are created automatically.
"""
import logging
from django.db import transaction
from django.contrib.auth import get_user_model

from apps.accounts.models import UserRole

User = get_user_model()
logger = logging.getLogger(__name__)


class GuestCheckoutService:
    """Service for handling guest checkout flow."""
    
    @staticmethod
    @transaction.atomic
    def get_or_create_user(email: str, full_name: str, phone: str = '') -> tuple[User, bool]:
        """
        Get existing user or create a new one for guest checkout.
        Returns (user, created) tuple.
        
        This allows users to checkout without explicitly registering first.
        If they already have an account, we use it. Otherwise, we create one.
        """
        email = email.lower().strip()
        
        # Check if user already exists
        user = User.objects.filter(email=email).first()
        
        if user:
            # User exists - update name if provided and different
            if full_name and user.full_name != full_name:
                user.full_name = full_name
                user.save(update_fields=['full_name'])
            
            logger.info(f"Existing user found for guest checkout: {email}")
            return user, False
        
        # Create new user account
        # Generate a random password - user can reset it later if they want to login
        import secrets
        temp_password = secrets.token_urlsafe(32)
        
        user = User.objects.create_user(
            email=email,
            password=temp_password,
            full_name=full_name or 'Guest',
            phone=phone,
            role=UserRole.ATTENDEE,
            is_email_verified=False  # They'll verify via email link
        )
        
        logger.info(f"New user created for guest checkout: {email}")
        return user, True
    
    @staticmethod
    def send_account_created_email(user: User, order_number: str) -> bool:
        """
        Send email to guest user informing them an account was created.
        Include link to set password.
        """
        from django.core.mail import EmailMultiAlternatives
        from django.conf import settings
        from django.utils import timezone
        
        try:
            subject = "Your OC MENA Festival Account"
            
            text_content = f"""
Hello {user.full_name}!

Thank you for your ticket purchase (Order #{order_number})!

An account has been created for you at OC MENA Festival.
Email: {user.email}

To access your tickets and set a password, click here:
{settings.FRONTEND_URL}/set-password?email={user.email}

You can view your tickets anytime by logging in:
{settings.FRONTEND_URL}/login

Your tickets have also been sent to you in a separate email.

Questions? Contact us at {settings.DEFAULT_FROM_EMAIL}

Best regards,
OC MENA Festival Team
            """
            
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .info-box {{ background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }}
        .footer {{ text-align: center; color: #666; margin-top: 30px; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to OC MENA Festival!</h1>
            <p>Your account is ready</p>
        </div>
        <div class="content">
            <p>Hello {user.full_name}!</p>
            <p>Thank you for purchasing tickets (Order #{order_number})!</p>
            
            <div class="info-box">
                <p><strong>Your Account Details:</strong></p>
                <p>Email: <strong>{user.email}</strong></p>
                <p>An account has been automatically created for you to manage your tickets.</p>
            </div>
            
            <h3>Next Steps:</h3>
            <ol>
                <li>Set your password to access your account</li>
                <li>View and manage your tickets</li>
                <li>Transfer tickets to friends if needed</li>
            </ol>
            
            <a href="{settings.FRONTEND_URL}/set-password?email={user.email}" class="button">Set Your Password</a>
            
            <p><small>Your tickets have been sent in a separate email with QR codes.</small></p>
            
            <div class="footer">
                <p>Questions? Contact us at {settings.DEFAULT_FROM_EMAIL}</p>
                <p>&copy; {timezone.now().year} OC MENA Festival</p>
            </div>
        </div>
    </div>
</body>
</html>
            """
            
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[user.email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send(fail_silently=False)
            
            logger.info(f"Account creation email sent to {user.email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send account creation email to {user.email}: {e}")
            return False
