from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import ReviewSerializer
from .models import Review
from django.utils import timezone
from django.shortcuts import get_object_or_404



# Create your views here.
class ReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        reviews = Review.objects.select_related("user").order_by("-created_at")
        serializer = ReviewSerializer(
            reviews,
            many=True,
            context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ReviewSerializer(
            data=request.data,
            context={"request": request}
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer.save(user=request.user)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )
    
class DeleteReview(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)