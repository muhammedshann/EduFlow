from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

class TempUser(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    username = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # hashed or plain
    otp = models.CharField(max_length=6)
    otp_created_at = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)

    def is_expired(self):
        return (timezone.now() - self.otp_created_at).total_seconds() > 300  # Fixed: use otp_created_at

    def __str__(self):
        return f"{self.username} ({self.email})"
    
    class Meta:
        app_label = 'accounts'

class User(AbstractUser):
    def __str__(self):
        return self.username

class UserDetails(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='details')
    credits = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.credits} credits"  # Fixed this line

# REMOVE THIS LINE: from .models import TempUser