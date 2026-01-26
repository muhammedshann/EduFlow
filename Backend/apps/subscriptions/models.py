from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings

class CreditPricing(models.Model):
    rate_per_credit = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=1.00,
        help_text="Cost of 1 credit in INR"
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "System Credit Pricing"
        verbose_name_plural = "System Credit Pricing"

    def save(self, *args, **kwargs):
        if not self.pk and CreditPricing.objects.exists():
            raise ValidationError("You can only have one pricing configuration. Please edit the existing one.")
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"Current Rate: ₹{self.rate_per_credit}"


class CreditBundle(models.Model):
    name = models.CharField(max_length=100)
    credits = models.PositiveIntegerField()
    price = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        help_text="Price in INR"
    )
    description = models.TextField(null=True, blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Credit Bundle"
        verbose_name_plural = "Credit Bundles"
        ordering = ['price']  # Show cheapest bundles first

    def __str__(self):
        return f"{self.name} ({self.credits} Credits - ₹{self.price})"

class CreditPurchase(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    PAYMENT_METHOD = [
        ('online', 'Online'),
        ('wallet', 'Wallet'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='credit_purchases'
    )
    payment_id = models.CharField(max_length=255, null=True, blank=True) 
    credit_bundle = models.ForeignKey(
        CreditBundle, 
        on_delete=models.SET_NULL,
        null=True, 
        blank=True,
        related_name='purchases'
    )
    credits_purchased = models.IntegerField()
    rate_per_credit = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHOD,db_index=True, default='online')
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'credit_purchases'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.credits_purchased} Credits ({self.status})"

class CreditUsageHistory(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    credits_used = models.IntegerField()
    purpose = models.CharField(max_length=100) 
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'credit_usage_history'