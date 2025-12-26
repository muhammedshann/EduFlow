from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import ReviewSerializer
from .models import Review
from django.utils import timezone


# Create your views here.
class ReviewView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        review = Review.objects.all()
        serializer = ReviewSerializer(review)
        return Response(serializer.data,status=200)