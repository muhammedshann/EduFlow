from django.urls import path
from .views import PricingView, BundlesView

urlpatterns = [
    path('pricing/',PricingView.as_view(),name='PricingView'),
    path('bundles/',BundlesView.as_view(),name='BundlesView'),

]
