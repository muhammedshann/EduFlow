from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate
from .models import TempUser
from django.contrib.auth.hashers import make_password
import random
from .utils import sent_otp_email
import logging
from dj_rest_auth.registration.serializers import SocialLoginSerializer
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings


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
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = TempUser
        fields = ['first_name', 'last_name', 'username', 'email', 'password']
    
    def create(self, validated_data):
        otp = str(random.randint(100000, 999999))
        validated_data['password'] = make_password(validated_data['password'])
        temp_user = TempUser.objects.create(**validated_data, otp=otp)
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
        if not TempUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email not registered")
        return value


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        user = authenticate(username=username, password=password)
        if not user:
            raise serializers.ValidationError('Invalid username or password!')
        
        data['user'] = user
        return data

class ResetPasswordSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True)
    email = serializers.CharField()

    def validate_email(self,value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError('No active account founds!')
        return value

    def update(self,instance,validated_data):
        instance.password = make_password(validated_data['password'])
        instance.save()
        return instance
