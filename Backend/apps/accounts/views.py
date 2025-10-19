from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from .serializers import TempRegisterSerializer, LoginSerializer, GenerateOtpSerializer, ResetPasswordSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import TempUser
from django.contrib.auth import get_user_model
from .utils import sent_otp_email, verify_otp
import random
from django.utils import timezone
from .authentication import CookieJWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenRefreshView
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
import logging
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from allauth.socialaccount.models import SocialLogin, SocialAccount


logger = logging.getLogger(__name__)
User = get_user_model()

class GoogleLoginView(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = "http://localhost:5173"

    def post(self, request, *args, **kwargs):
        try:
            # Get the token from request
            token = request.data.get('access_token') or request.data.get('id_token')
            
            if not token:
                return Response(
                    {'error': 'Token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Verify the ID token with Google
            try:
                idinfo = id_token.verify_oauth2_token(
                    token,
                    requests.Request(),
                    settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
                )
                
                logger.info(f"Token verified for email: {idinfo.get('email')}")
            except ValueError as e:
                logger.error(f"Token verification failed: {str(e)}")
                return Response(
                    {'error': f'Invalid token: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get or create user
            email = idinfo.get('email')
            google_id = idinfo.get('sub')
            
            if not email:
                return Response(
                    {'error': 'Email not provided by Google'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Try to get existing user by email
            try:
                user = User.objects.get(email=email)
                logger.info(f"Existing user found: {email}")
            except User.DoesNotExist:
                # Create new user
                user = User.objects.create_user(
                    username=email.split('@')[0],  # Use email prefix as username
                    email=email,
                    first_name=idinfo.get('given_name', ''),
                    last_name=idinfo.get('family_name', ''),
                )
                user.set_unusable_password()  # Google users don't need password
                user.save()
                logger.info(f"New user created: {email}")

            # Get or create social account
            social_account, created = SocialAccount.objects.get_or_create(
                user=user,
                provider='google',
                defaults={
                    'uid': google_id,
                    'extra_data': idinfo
                }
            )
            
            if not created and social_account.uid != google_id:
                social_account.uid = google_id
                social_account.extra_data = idinfo
                social_account.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Create response
            response = Response({
                'message': "Google login successful",
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            }, status=status.HTTP_200_OK)

            # Set access token cookie (15 minutes)
            response.set_cookie(
                key='access',
                value=access_token,
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite='Lax',
                max_age=15 * 60
            )

            # Set refresh token cookie (7 days)
            response.set_cookie(
                key='refresh',
                value=refresh_token,
                httponly=True,
                secure=False,  # Set to True in production with HTTPS
                samesite='Lax',
                max_age=7 * 24 * 60 * 60
            )

            logger.info(f"Google login successful for user: {email}")
            return response

        except Exception as e:
            logger.error(f"Google login error: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )



class MeView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self,request):
        user = request.user
        user_data = {
            'id':user.id,
            'username':user.username,
            'firstname':user.first_name,
            'lastname':user.last_name,
            'email':user.email
        }
        return Response(user_data)

class RefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token missing'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data={'refresh': refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

        access_token = serializer.validated_data['access']

        response = Response(
            {"access": access_token},
            status=status.HTTP_200_OK
        )

        # ✅ Re-set the new access token in the cookie
        response.set_cookie(
            key='access',
            value=access_token,
            httponly=True,
            secure=False,       # True in production
            samesite='Strict',
            max_age=15 * 60     # 15 min expiry
        )

        return response


class RegisterView(APIView):
    def post(self, request):
        serializer = TempRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "OTP sent to your email"}, status=status.HTTP_201_CREATED)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
class GenerateOtpView(APIView):
    def post(self, request):
        serializer = GenerateOtpSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            temp_user = TempUser.objects.get(email=email)
            
            # Generate OTP
            otp = str(random.randint(100000, 999999))
            temp_user.otp = otp
            temp_user.otp_created_at = timezone.now()
            temp_user.save()

            # Send OTP via email (implement your function)
            sent_otp_email(email, otp)

            return Response({"email": email, "message": "OTP sent successfully"}, status=status.HTTP_200_OK)

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class VerifyOtp(APIView):
    def post(self, request):
        print("Request data:", request.data)
        email = request.data.get('email')
        otp = request.data.get('otp')
        register = request.data.get('register')
        print('verifiy otp',email,otp,register)
        temp_user = verify_otp(email,otp)
        if register:
            user = User.objects.create(
                first_name=temp_user.first_name,
                last_name=temp_user.last_name,
                username=temp_user.username,
                email=temp_user.email,
                password=temp_user.password
            )
            temp_user.verified = True
            temp_user.save()
        return Response({"message": "User verified and registered successfully"}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            user_data = {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            }

            refresh = RefreshToken.for_user(user)
            accessToken = str(refresh.access_token)
            refreshToken = str(refresh)
            
            response = Response({
                'message': "User logged in successfully",
                'user': user_data,
                'access': accessToken,  # ✅ Add to response body
                'refresh': refreshToken, # ✅ Add to response body
            })
            
            # Still set cookies for automatic authentication
            response.set_cookie(
                key='access',
                value=accessToken,
                httponly=True,
                secure=False,
                samesite='Strict',
                max_age=15*60
            )
            response.set_cookie(
                key='refresh',
                value=refreshToken,
                httponly=True,
                samesite='Strict',
                max_age=7*24*60*60
            )
            return response
        print("Serializer errors:", serializer.errors)
        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
class ResetPassword(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data = request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            try:
                user = User.objects.get(email=email)
                user.set_password(password)
                user.save()
                return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        # Clear both tokens
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        return response
