from rest_framework import serializers
from .models import CreditBundle, CreditPricing
from apps.accounts.models import UserCredits

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
    
class UserCreditsSerializer(serializers.ModelSerializer):
    balance = serializers.IntegerField(source='total_credits')

    class Meta:
        model = UserCredits
        fields = ['balance','remaining_credits']
