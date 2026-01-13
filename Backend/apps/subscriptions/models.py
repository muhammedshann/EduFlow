from django.db import models
from django.core.exceptions import ValidationError

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