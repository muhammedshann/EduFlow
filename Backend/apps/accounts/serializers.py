from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate
from .models import TempUser, Wallet, WalletHistory, Settings, UserCredits
from apps.admin_panel.models import Notification
from django.contrib.auth.hashers import make_password
import random
from .utils import sent_otp_email
import logging
from dj_rest_auth.registration.serializers import SocialLoginSerializer
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.utils import timezone


User = get_user_model()

logger = logging.getLogger(__name__)


class GoogleLoginSerializer(SocialLoginSerializer):
    """
    Custom serializer for Google OAuth that handles ID tokens
    """
    id_token = serializers.CharField(required=False, allow_blank=True)
    access_token = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        # Get the ID token from either field
        token = attrs.get('id_token') or attrs.get('access_token')
        
        if not token:
            raise serializers.ValidationError(
                "Either id_token or access_token is required"
            )

        try:
            # Verify the ID token with Google
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
            )

            # Token is valid, extract user info
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise ValueError('Wrong issuer.')

            # Store the verified user info
            self.user_info = idinfo
            
            # Don't call parent validate, we're handling verification ourselves
            return attrs

        except ValueError as e:
            logger.error(f"Token verification failed: {str(e)}")
            raise serializers.ValidationError(f"Invalid token: {str(e)}")

class TempRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )

    class Meta:
        model = TempUser
        fields = ['first_name', 'last_name', 'username', 'email', 'password']

    def validate(self, attrs):
        email = attrs['email']
        username = attrs['username']

        # Block only if TRUE user already exists
        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({'email': 'A user with this email already exists.'})

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError({'username': 'A user with this username already exists.'})

        return attrs

    def create(self, validated_data):
        email = validated_data['email']

        # Generate OTP
        otp = str(random.randint(100000, 999999))
        print("Generated OTP:", otp)

        # Hash password
        validated_data['password'] = make_password(validated_data['password'])

        # Create OR update TempUser
        temp_user, created = TempUser.objects.update_or_create(
            email=email,
            defaults={
                **validated_data,
                'otp': otp,
                'otp_created_at': timezone.now()
            }
        )

        # Send OTP
        sent_otp_email(temp_user.email, otp)

        return temp_user


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email', 'password']

    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Invalid email format.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("email already exists !")
        return value
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("username already exists .")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
    
class GenerateOtpSerializer(serializers.Serializer):
    email = serializers.CharField()

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email not registered")
        return value

class VerifyAccountSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    register = serializers.BooleanField()

    def validate(self, attrs):
        email = attrs.get('email')
        otp = attrs.get('otp')
        register = attrs.get('register')

        try :
            self.temp_user = TempUser.objects.get(email=email)
        except TempUser.DoesNotExist:
            raise serializers.ValidationError('User not found. Please register again.')

        if self.temp_user.is_expired():
            self.temp_user.delete()
            raise serializers.ValidationError('OTP has expired. Please register again.')
        
        if self.temp_user.otp != otp:
            raise serializers.ValidationError('Invalid OTP.')
        if register:
            if User.objects.filter(email=self.temp_user.email):
                raise serializers.ValidationError('A user with this email already exists.')
        
        return attrs
    
    def save(self):
        user = User.objects.create(
                first_name=self.temp_user.first_name,
                last_name=self.temp_user.last_name,
                username=self.temp_user.username,
                email=self.temp_user.email,
                password=self.temp_user.password
            )
        self.temp_user.delete()
        return user 


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError("Invalid username or password!")

        # 2. Check if user is active
        if not user.is_active:
            raise serializers.ValidationError("Your account is inactive. Please contact support.")

        # 3. Check password manually
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid username or password!")
        
        data['user'] = user
        return data

class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, validators=[validate_password], required=True)
    email = serializers.CharField()
    otp = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        otp = attrs.get('otp')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
        
        try:
            temp_user = TempUser.objects.get(email=email)
        except TempUser.DoesNotExist:
            raise serializers.ValidationError("Invalid request. Please request a new OTP.")
        
        if temp_user.otp != otp:
            raise serializers.ValidationError("Invalid request.")
        
        self.user = user
        temp_user.delete()
        return attrs
    
    def save(self):
        password = self.validated_data['password']
        self.user.set_password(password)
        self.user.save()

        return self.user

class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'username', 'email']

    def validate_email(self, value):
        user = self.context["request"].user
        if User.objects.filter(email = value).exclude(id = user.id).exists():
            raise serializers.ValidationError('email already exists.')
        return value
    
    def validate_username(self, value):
        user = self.context["request"].user
        if User.objects.filter(username = value).exclude(id = user.id).exists():
            raise serializers.ValidationError('username already exists.')
        return value
    
class UpdatePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
    def validate_new_password(self, value):
        validate_password(value)
        return value

class WalletHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WalletHistory
        fields = ['id', 'transaction_type', 'amount', 'purpose', 'reference_id', 'status', 'created_at']

class WalletSerializer(serializers.ModelSerializer):
    history = WalletHistorySerializer(many=True, read_only=True)
    class Meta:
        model = Wallet
        fields = ['id','balance','history']

class SettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Settings
        fields = [
            "email_notification",
            "pomodoro_alert",
            "habit_reminder",
            "group_messages",
            "dark_mode"
        ]

class UpdateProfileImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['profile_pic']

class UserCreditsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserCredits
        fields = ['total_credits', 'used_credits', 'remaining_credits', 'last_purchase_date']

class UserNotificationSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'created_at', 'time_ago']

    def get_time_ago(self, obj):
        return obj.created_at.strftime("%b %d, %Y")