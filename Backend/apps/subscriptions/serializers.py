from rest_framework import serializers
from .models import CreditBundle, CreditPricing

class CreditPricingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditPricing
        fields = [
            'id',
            'rate_per_credit',
            'updated_at'
        ]

class CreditBundleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditBundle
        fields = [
            'id',
            'name',
            'credits',
            'price',
            'description',
            'active',
            'created_at'
        ]
