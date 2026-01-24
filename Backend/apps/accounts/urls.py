from django.urls import path
from .views import RegisterView, LoginView, VerifyOtp, GenerateOtpView, ResetPassword, MeView, LogoutView, RefreshView, GoogleLoginView, UpdateProfileView, WalletView,UpdatePasswordView, SettingsView, UpdateProfileImageView, WalletDepositeView, SubscriptionPlanView, NotificationView, CreateRazorpayOrderView, VerifyRazorpayPaymentView, DeleteUser, GenerateOtpEmailView, VerifyOtpEmailView

urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('auth/social/google/', GoogleLoginView.as_view(), name='google_login'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/',LoginView.as_view(), name='login'),
    path('generate-otp/',GenerateOtpView.as_view(), name='generateOTP'),
    path('generate-otp-email/',GenerateOtpEmailView.as_view(), name='generateOTPemail'),
    path('verify-otp/',VerifyOtp.as_view(), name='verifyOTP'),
    path('verify-otp-email/',VerifyOtpEmailView.as_view(), name='VerifyOtpEmailView'),
    path('reset-password/',ResetPassword.as_view(), name='resetPassword'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('delete-user/', DeleteUser.as_view(), name='DeleteUser'),
    path('token/refresh/', RefreshView.as_view(), name='token_refresh'),
    path('update-profile/', UpdateProfileView.as_view(), name='UpdateProfile'),
    path('update-password/', UpdatePasswordView.as_view(), name='UpdatePassword'),
    path('update-profile-image/', UpdateProfileImageView.as_view(), name='UpdateProfileImage'),
    path('wallet/', WalletView.as_view(), name='wallet'),
    path('wallet-deposite/', WalletDepositeView.as_view(), name='walletDeposite'),
    # path('wallet-withdraw/', WalletWithdrawView.as_view(), name='walletWithdraw'),
    path('wallet/create-order/', CreateRazorpayOrderView.as_view(), name='create-order'),
    path('wallet/verify-payment/', VerifyRazorpayPaymentView.as_view(), name='verify-payment'),
    path('settings/', SettingsView.as_view(), name='settings'),
    path('subscription-plans/', SubscriptionPlanView.as_view(), name='SubscriptionPlanView'),
    path('notifications/', NotificationView.as_view(), name='NotificationView')
]