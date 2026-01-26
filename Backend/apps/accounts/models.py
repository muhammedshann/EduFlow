from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings
import uuid
from datetime import timedelta


class TempUser(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    username = models.CharField(max_length=50)
    email = models.EmailField()
    password = models.CharField(max_length=128)  # Store only hashed passwords
    otp = models.CharField(max_length=6)
    otp_created_at = models.DateTimeField(default=timezone.now)
    verified = models.BooleanField(default=False)

    def is_expired(self):
        expiry_time = self.otp_created_at + timedelta(minutes=5)
        return timezone.now() > expiry_time

    def __str__(self):
        return f"{self.username} ({self.email})"

    class Meta:
        app_label = 'accounts'
        indexes = [
            models.Index(fields=["email"]),
        ]


class User(AbstractUser):
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    def __str__(self):
        return self.username


class UserDetails(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='details')
    credits = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.credits} credits"


class Wallet(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallets')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Wallet({self.user.username}): {self.balance}"
    
class WalletHistory(models.Model):

    TRANSACTION_TYPES = (
        ("credit", "Credit"),
        ("debit", "Debit"),
    )

    PURPOSE_TYPES = (
        ("top-up", "Top Up"),
        ("refund", "Refund"),
        ("credit-purchase", "Credit Purchase"),
        ("subscription", "Subscription"),
        ("usage", "Usage"),
        ("withdraw", "Withdraw"),
    )

    STATUS_TYPES = (
        ("pending", "Pending"),
        ("success", "Success"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
    )
    id = models.AutoField(primary_key=True)
    wallet = models.ForeignKey(Wallet,on_delete=models.CASCADE,related_name="history")
    user = models.ForeignKey(User,on_delete=models.CASCADE,related_name="wallet_transactions")
    transaction_type = models.CharField(max_length=10,choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=10,decimal_places=2)
    purpose = models.CharField(max_length=30,choices=PURPOSE_TYPES)
    reference_id = models.CharField(max_length=100,null=True,blank=True)
    status = models.CharField(max_length=15,choices=STATUS_TYPES,default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_type} - {self.amount} ({self.status})"


class UserCredits(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='credits'
    )
    total_credits = models.IntegerField(default=0)
    used_credits = models.IntegerField(default=0)
    remaining_credits = models.IntegerField(default=0)
    last_purchase_date = models.DateField(auto_now=True)    
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_credits'
        verbose_name_plural = "User Credits"

    def save(self, *args, **kwargs):
        # Automatically calculate remaining credits before saving
        self.remaining_credits = self.total_credits - self.used_credits
        super(UserCredits, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.email} - Balance: {self.remaining_credits}"


# class SubscriptionHistory(models.Model):
#     STATUS_CHOICES = UserSubscription.STATUS_CHOICES

#     id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscription_histories')
#     plan = models.ForeignKey(SubscriptionPlan, on_delete=models.CASCADE, related_name='subscription_histories')
#     added_credits = models.IntegerField(default=0)
#     start_date = models.DateField()
#     end_date = models.DateField()
#     status = models.CharField(max_length=20, choices=STATUS_CHOICES)

#     def __str__(self):
#         return f"{self.user.username} - {self.plan.name} ({self.status})"


class Settings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='settings'
    )
    email_notification = models.BooleanField(default=True)
    pomodoro_alert = models.BooleanField(default=True)
    habit_reminder = models.BooleanField(default=True)
    group_messages = models.BooleanField(default=True)
    dark_mode = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username}'s Settings"
