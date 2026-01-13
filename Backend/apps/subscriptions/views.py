from rest_framework import viewsets, status, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CreditPricing, CreditBundle
from .serializers import CreditPricingSerializer, CreditBundleSerializer

class PricingView(APIView):
    def get(self, request):
        pricing = CreditPricing.objects.first()
        if not pricing:
            pricing = CreditPricing.objects.create(rate_per_credit=1.00)
        serializer = CreditPricingSerializer(pricing)
        return Response(serializer.data)

    def patch(self, request):
        pricing = CreditPricing.objects.first()
        serializer = CreditPricingSerializer(pricing, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class BundlesView(APIView):
    def get(self, request):
        bundles = CreditBundle.objects.all().order_by('price')
        serializer = CreditBundleSerializer(bundles, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CreditBundleSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def patch(self, request):

        bundle_id = request.data.get('id')
        bundle = CreditBundle.objects.filter(id=bundle_id).first()
        
        if not bundle:
            return Response({"error": "Bundle not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CreditBundleSerializer(bundle, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        bundle_id = request.data.get('id')
        bundle = CreditBundle.objects.filter(id=bundle_id).first()
        
        if not bundle:
            return Response({'error': 'Bundle does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        bundle.delete()
        return Response({'message': 'Bundle deleted successfully'}, status=status.HTTP_200_OK)