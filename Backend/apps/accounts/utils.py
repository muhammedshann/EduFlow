from django.core.mail import send_mail
from django.conf import settings
from .models import TempUser
from rest_framework.response import Response
from rest_framework import status

def sent_otp_email(mail, otp, subject):
    subject = subject
    message = f'Hello,\n\nYour OTP code is: {otp}\nIt will expire in 5 minutes.\n\nThank you!'
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [mail],
        fail_silently=False,
    )

def verify_otp(email, otp):
    try:
        temp_user = TempUser.objects.get(email=email,otp=otp)
    except TempUser.DoesNotExist:
        return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)
    print('isnide')
    if temp_user.is_expired():
        print('got error in expiry')
        return Response({"error": "OTP expired"}, status=status.HTTP_400_BAD_REQUEST)
    return temp_user