"""
Account serializers for authentication and user management.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, UserRole, UserAddress


class RegisterSerializer(serializers.Serializer):
    """Serializer for user registration."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    
    def validate_email(self, value):
        email = value.lower()
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return email
    
    def validate_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            phone=validated_data.get('phone', ''),
            role=UserRole.ATTENDEE
        )
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email', '').lower()
        password = data.get('password', '')
        
        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")
        
        user = authenticate(username=email, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        
        if not user.is_active:
            raise serializers.ValidationError("This account has been deactivated.")
        
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'phone', 'role', 'is_email_verified', 'created_at']
        read_only_fields = ['id', 'email', 'role', 'is_email_verified', 'created_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile."""
    
    class Meta:
        model = User
        fields = ['full_name', 'phone']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password."""
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request."""
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data


class UserAddressSerializer(serializers.ModelSerializer):
    """Serializer for user addresses."""
    
    class Meta:
        model = UserAddress
        fields = [
            'id', 'label', 'address_type', 'first_name', 'last_name',
            'street_address', 'street_address_2', 'city', 'state',
            'postal_code', 'country', 'phone', 'is_default', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserAddressCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating addresses."""
    
    class Meta:
        model = UserAddress
        fields = [
            'label', 'address_type', 'first_name', 'last_name',
            'street_address', 'street_address_2', 'city', 'state',
            'postal_code', 'country', 'phone', 'is_default'
        ]
