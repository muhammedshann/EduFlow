from django.urls import path
from .views import RegisterView, LoginView, VerifyOtp, GenerateOtpView, ResetPassword, MeView, LogoutView, RefreshView, GoogleLoginView

urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('auth/social/google/', GoogleLoginView.as_view(), name='google_login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/',LoginView.as_view(), name='login'),
    path('generate-otp/',GenerateOtpView.as_view(), name='generateOTP'),
    path('verify-otp/',VerifyOtp.as_view(), name='verifyOTP'),
    path('reset-password/',ResetPassword.as_view(), name='resetPassword'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', RefreshView.as_view(), name='token_refresh')
]