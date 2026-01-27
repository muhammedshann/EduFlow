from django.urls import path
from .views import CreditView, PricingView, BundlesView, CreateOrderView, VerifyPaymentView, RazorpayWebhookView, WalletPurchaseView

urlpatterns = [
    path('credit/',CreditView.as_view(),name='CreditView'),
    path('pricing/',PricingView.as_view(),name='PricingView'),
    path('bundles/',BundlesView.as_view(),name='BundlesView'),
    path('create-order/', CreateOrderView.as_view(), name='create-order'),
    path('verify-payment/', VerifyPaymentView.as_view(), name='verify-payment'),
    path('webhook/razorpay/', RazorpayWebhookView.as_view(), name='razorpay-webhook'),
    path('wallet-payment/', WalletPurchaseView.as_view(), name='wallet_payment'),
]
