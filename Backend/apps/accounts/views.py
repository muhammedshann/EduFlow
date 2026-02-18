from rest_framework.views import APIView
from django.contrib.auth import logout
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from .serializers import TempRegisterSerializer, LoginSerializer, GenerateOtpSerializer, ResetPasswordSerializer, VerifyAccountSerializer, UpdateProfileSerializer, WalletSerializer,UpdatePasswordSerializer, SettingsSerializer, UpdateProfileImageSerializer, UserCreditsSerializer, UserNotificationSerializer, VerifyOtpEmailSerializer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from .models import TempUser, Wallet, WalletHistory,Settings, UserCredits
from apps.admin_panel.models import Notification
from django.contrib.auth import get_user_model
from .utils import sent_otp_email
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
import requests
from django.core.files.base import ContentFile
from google.auth.transport import requests as google_requests
from rest_framework.parsers import MultiPartParser, FormParser
from decimal import Decimal
from django.contrib.auth import login
from rest_framework.decorators import api_view
import razorpay
from django.db import transaction
from django.contrib.auth.models import update_last_login


logger = logging.getLogger(__name__)
User = get_user_model()

class GoogleLoginView(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = "http://localhost:5173"

    def post(self, request, *args, **kwargs):
        try:
            token = request.data.get('access_token') or request.data.get('id_token')
            if not token:
                return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

            # Verify Google token
            try:
                idinfo = id_token.verify_oauth2_token(
                    token,
                    google_requests.Request(),
                    settings.SOCIALACCOUNT_PROVIDERS['google']['APP']['client_id']
                )
                logger.info(f"Token verified for email: {idinfo.get('email')}")
            except ValueError as e:
                return Response({'error': f'Invalid token: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

            email = idinfo.get('email')
            google_id = idinfo.get('sub')
            picture_url = idinfo.get('picture')

            if not email:
                return Response({'error': 'Email not provided by Google'}, status=status.HTTP_400_BAD_REQUEST)

            # Get or create user
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': idinfo.get('given_name', ''),
                    'last_name': idinfo.get('family_name', ''),
                }
            )
            if created:
                user.set_unusable_password()
                user.save()
                logger.info(f"New user created: {email}")

            update_last_login(None, user)

            # Save profile picture if not exists
            if picture_url and not user.profile_pic:
                try:
                    response = requests.get(picture_url)
                    if response.status_code == 200:
                        file_name = f"{user.username}_google.jpg"
                        user.profile_pic.save(file_name, ContentFile(response.content), save=True)
                        logger.info(f"Saved Google profile pic for {user.username}")
                except Exception as e:
                    logger.error(f"Error saving Google profile pic: {str(e)}")

            # Create or update social account
            social_account, created = SocialAccount.objects.get_or_create(
                user=user,
                provider='google',
                defaults={'uid': google_id, 'extra_data': idinfo}
            )
            if not created and social_account.uid != google_id:
                social_account.uid = google_id
                social_account.extra_data = idinfo
                social_account.save()

            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Response with user info
            response = Response({
                'message': "Google login successful",
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'firstname': user.first_name,
                    'lastname': user.last_name,
                    'profilePic': request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else None
                }
            }, status=status.HTTP_200_OK)

            # Set JWT cookies
            response.set_cookie('access', access_token, httponly=True, max_age=15*60, samesite='Lax')
            response.set_cookie('refresh', refresh_token, httponly=True, max_age=7*24*60*60, samesite='Lax')

            return response

        except Exception as e:
            logger.error(f"Google login error: {str(e)}", exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MeView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile_pic_url = request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else None

        user_data = {
            'id': user.id,
            'username': user.username,
            'firstname': user.first_name,
            'lastname': user.last_name,
            'email': user.email,
            'profilePic': profile_pic_url,
            'is_superuser': user.is_superuser,
            'is_active': user.is_active,
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
            samesite='Lax',
            max_age=15 * 60     # 15 min expiry
        )

        return response


class RegisterView(APIView):
    def post(self, request):
        serializer = TempRegisterSerializer(data=request.data)

        if serializer.is_valid():
            temp_user = serializer.save()

            return Response({
                "message": "OTP sent to your email",
                "created_time": temp_user.otp_created_at
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class GenerateOtpView(APIView):
    def post(self, request):
        serializer = GenerateOtpSerializer(data=request.data)
        if not serializer.is_valid():
            # This will now only return 400 if the email is truly unknown
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        otp = str(random.randint(100000, 999999))
        now = timezone.now()

        # 1. Check User Table First (Priority: Password Reset)
        user = User.objects.filter(email=email).first()
        
        if user:
            # Logic for Password Reset
            TempUser.objects.update_or_create(
                email=email,
                defaults={
                    'username': user.username,
                    'otp': otp,
                    'otp_created_at': now
                }
            )
            subject = 'Your Password Reset OTP'

        else:
            # 2. Check TempUser Table (Priority: Registration Resend)
            temp_user = TempUser.objects.filter(email=email).first()
            
            if temp_user:
                # Logic for Registration Resend
                temp_user.otp = otp
                temp_user.otp_created_at = now
                temp_user.save()
                subject = 'Your Registration Verification OTP'
            else:
                # Should not happen because Serializer already checked, but good for safety
                return Response({"message": "Email not found."}, status=404)

        try:
            sent_otp_email(email, otp, subject)
            return Response({
                "message": "OTP sent successfully",
                "created_at": now,
            }, status=status.HTTP_200_OK)
        except Exception:
            return Response({"message": "Failed to send email."}, status=503)

        # return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class VerifyOtp(APIView):
    def post(self, request):
        serializer = VerifyAccountSerializer(data=request.data)
        if serializer.is_valid():
            register = serializer.validated_data.get('register')
            if register:
                user = serializer.save()
                return Response({"message": "User verified and registered successfully"}, status=status.HTTP_201_CREATED)
            return Response({"message": "User verified "}, status=status.HTTP_201_CREATED)
        return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
class VerifyOtpEmailView(APIView):
    def post(self, request):
        serializer = VerifyOtpEmailSerializer(data=request.data)
        if serializer.is_valid():
            serializer.delete()
            return Response({"message": "User verified "}, status=status.HTTP_201_CREATED)
        return Response({"message": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            user.last_login = timezone.now()
            user.save(update_fields=["last_login"])

            profile_pic_url = request.build_absolute_uri(user.profile_pic.url) if user.profile_pic else None

            user_data = {
                'id': user.id,
                'username': user.username,
                'firstname': user.first_name,
                'lastname': user.last_name,
                'email': user.email,
                'profilePic': profile_pic_url,
                'isActive': user.is_active,
            }

            refresh = RefreshToken.for_user(user)
            accessToken = str(refresh.access_token)
            refreshToken = str(refresh)
            
            response = Response({
                'message': "User logged in successfully",
                'user': user_data,
                'access': accessToken,
                'refresh': refreshToken,
            })

            response.set_cookie(
                key="access",
                value=accessToken,
                httponly=True,
                secure=True,
                samesite="None",
                domain=".fresheasy.online",
                max_age=15 * 60,
            )

            response.set_cookie(
                key="refresh",
                value=refreshToken,
                httponly=True,
                secure=True,
                samesite="None",
                domain=".fresheasy.online",
                max_age=7 * 24 * 60 * 60,
            )
            return response

        return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    
class DeleteUser(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        refresh_token = request.COOKIES.get('refresh')

        if not refresh_token:
            return Response({"error": "No refresh token found"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Blacklist the current refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Capture the user instance before deletion
        user = request.user
        user.delete()

        # 3. Create the response
        response = Response(
            {"message": "Account deleted successfully"}, 
            status=status.HTTP_200_OK
        )

        # 4. Clear the cookies on the SAME response object being returned
        response.delete_cookie('access')
        response.delete_cookie('refresh')
        
        return response
    
class ResetPassword(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logout(request)
        refresh_token = request.COOKIES.get('refresh')

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except TokenError:
                pass

        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)

        # FIXED: Must match the domain and path used in LoginView
        cookie_settings = {
            'domain': ".fresheasy.online",
            'path': "/",
            'samesite': "None",
        }

        response.delete_cookie('access', **cookie_settings)
        response.delete_cookie('refresh', **cookie_settings)
        response.delete_cookie('sessionid', path='/') # For Django Admin sessions

        return response


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self,request):
        serializer = UpdateProfileSerializer(
            instance = request.user,
            data = request.data,
            partial = True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully"}, status=200)

        return Response({"errors": serializer.errors}, status=400)
    
class UpdatePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        serializer = UpdatePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        old_password = serializer.validated_data["old_password"]
        new_password = serializer.validated_data["new_password"]

        if not user.check_password(old_password):
            return Response(
                {"error": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password updated successfully"},
            status=status.HTTP_200_OK
        )

class UpdateProfileImageView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def put(self,request):
        user = request.user
        serializer = UpdateProfileImageSerializer(user,data=request.data , partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Profile picture updated successfully",
                "profilePic": request.build_absolute_uri(serializer.data["profile_pic"])
            })
        return Response({"errors": serializer.errors}, status=400)


class WalletView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        wallet, created = Wallet.objects.get_or_create(user=request.user)
        
        serializer = WalletSerializer(wallet)
        return Response(serializer.data, status=200)
    
class WalletDepositeView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        amount = request.data.get('amount')
        wallet = Wallet.objects.get(user=request.user)
        if not amount:
            return Response({"error": "Amount is required"}, status=400)
        amount = Decimal(amount)
        if amount <= 0:
            return Response({"error": "Amount must be positive"}, status=400)
        wallet.balance += amount
        wallet.save()
        WalletHistory.objects.create(
            wallet = wallet,
            user = request.user,
            transaction_type = 'credit',
            amount = amount,
            purpose = 'top-up',
            status = 'success'
        )
        return Response({
            "message": "Deposit successful",
            "balance": wallet.balance
        }, status=200)
    
class GenerateOtpEmailView(APIView):
    permission_classes = [IsAuthenticated] 

    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(email = email).exists():
            return Response({"error": "Email already exists. Please use another email."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = request.user
            
            otp = str(random.randint(100000, 999999))
            
            temp_user, created = TempUser.objects.update_or_create(
                email=email,
                defaults={
                    'username': user.username, 
                    'otp': otp,
                    'otp_created_at': timezone.now()
                }
            )
            
            sent_otp_email(email, otp, 'Your OTP Code for EduFlow Password Reset.')
            
            return Response({
                "email": email, 
                "message": "OTP sent successfully",
            }, status=status.HTTP_200_OK)

        except User.DoesNotExist:

            return Response({"error": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)
            
        except Exception as e:
            return Response(
                {"message": "Failed to send email."}, 
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
 
# class WalletWithdrawView(APIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request):
#         amount = request.data.get('amount')
#         if not amount:
#             return Response({"error": "Amount is required"}, status=400)
#         wallet = Wallet.objects.get(user=request.user)
#         amount = Decimal(amount)
#         if amount <= 0:
#             return Response({"error": "Amount must be positive"}, status=400)
#         if amount > wallet.balance:
#             return Response({"error": "inefficient balance."}, status=400)
#         wallet.balance -= amount
#         wallet.save()
#         WalletHistory.objects.create(
#             wallet = wallet,
#             user = request.user,
#             transaction_type = 'debit',
#             amount = amount,
#             purpose = 'withdraw',
#             status = 'success'
#         )
#         return Response({
#             "message": "withdraw successful",
#             "balance": wallet.balance
#         }, status=200)
    
client = razorpay.Client(auth=(settings.RZP_KEY_ID, settings.RZP_KEY_SECRET))

class CreateRazorpayOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        amount = request.data.get('amount')
        if not amount:
            return Response({"error": "Amount is required"}, status=400)
        
        amount_in_paise = int(Decimal(amount) * 100)

        data = {
            "amount": amount_in_paise,
            "currency": "INR",
            "payment_capture": "1"
        }

        try:
            order = client.order.create(data=data)
            return Response({
                "order_id": order['id'],
                "amount": order['amount'],
                "currency": order['currency'],
                "key_id": settings.RZP_KEY_ID
            }, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class VerifyRazorpayPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        try:
            params_dict = {
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            }
            client.utility.verify_payment_signature(params_dict)

            order_details = client.order.fetch(razorpay_order_id)
            amount = Decimal(order_details['amount']) / 100

            with transaction.atomic():
                wallet = Wallet.objects.select_for_update().get(user=request.user)
                wallet.balance += amount
                wallet.save()

                WalletHistory.objects.create(
                    wallet=wallet,
                    user=request.user,
                    transaction_type='credit',
                    amount=amount,
                    purpose='top-up',
                    reference_id=razorpay_payment_id,
                    status='success'
                )

            return Response({"message": "Payment verified and wallet updated", "balance": wallet.balance}, status=200)

        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Invalid signature. Payment verification failed."}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class SettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        setting, created = Settings.objects.get_or_create(user=request.user)
        serializer = SettingsSerializer(setting)
        return Response(serializer.data)

class SubscriptionPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        credits, created = UserCredits.objects.get_or_create(user=request.user)
        serializer = UserCreditsSerializer(credits)
        return Response(serializer.data)
    
class NotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
        serializer = UserNotificationSerializer(notifications, many=True)
        return Response(serializer.data)