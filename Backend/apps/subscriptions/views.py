from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import CreditPricing, CreditBundle, CreditPurchase
from .serializers import CreditPricingSerializer, CreditBundleSerializer, UserCreditsSerializer
import razorpay
from decouple import config 
from django.conf import settings
from apps.accounts.models import UserCredits
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction


class CreditView(RetrieveAPIView):
    serializer_class = UserCreditsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user_credits, created = UserCredits.objects.get_or_create(user=self.request.user)
        return user_credits
    

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
    
client = razorpay.Client(auth=(settings.RZP_KEY_ID, settings.RZP_KEY_SECRET))

class CreateOrderView(APIView):
    def post(self, request):
        try:
            amount_in_inr = request.data.get('amount')
            credits_to_buy = request.data.get('credits')
            bundle_id = request.data.get('bundle_id')

            # 1. Check if amount is valid/empty to prevent float() crash
            if not amount_in_inr or amount_in_inr == "":
                return Response({"error": "Please enter a valid amount"}, status=status.HTTP_400_BAD_REQUEST)
            
            amount_in_paise = int(float(amount_in_inr) * 100) 
            
            bundle_obj = None
            if bundle_id:
                try:
                    bundle_obj = CreditBundle.objects.get(id=bundle_id)
                except CreditBundle.DoesNotExist:
                    pass
            
            # 2. Create Razorpay Order with a nested try-except for the network call
            try:
                razorpay_order = client.order.create({
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "payment_capture": "1" 
                })
            except Exception as e:
                print(f"Razorpay Connection Error: {e}")
                return Response({"error": "Payment gateway unreachable. Please try again."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            # 3. Save the record
            CreditPurchase.objects.create(
                user=request.user,
                payment_id=razorpay_order['id'],
                total_amount=amount_in_inr,
                status='pending',
                Credit_bundle_id=bundle_obj, 
                credits_purchased=credits_to_buy,
                rate_per_credit=float(amount_in_inr) / int(credits_to_buy) if int(credits_to_buy) > 0 else 0
            )

            return Response({
                "order_id": razorpay_order['id'], 
                "amount": amount_in_paise,
                "key": settings.RZP_KEY_ID
            })

        except Exception as e:
            print(f"General Error: {e}")
            return Response({"error": "An internal error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPaymentView(APIView):
    def post(self, request):
        data = request.data 
        
        # Razorpay utility strictly requires these three keys
        params_dict = {
            'razorpay_order_id': data.get('razorpay_order_id'),
            'razorpay_payment_id': data.get('razorpay_payment_id'),
            'razorpay_signature': data.get('razorpay_signature')
        }

        try:
            # Check if any value is missing before verifying
            if not all(params_dict.values()):
                return Response({"status": "Failed", "error": "Missing required parameters"}, status=400)

            # 1. Verify authenticity
            client.utility.verify_payment_signature(params_dict)
            
            # 2. Use the helper function to avoid code duplication and race conditions
            success = self.fulfill_order(params_dict['razorpay_order_id'], params_dict['razorpay_payment_id'])
            
            if success:
                return Response({"status": "Success"})
            else:
                return Response({"status": "Already Processed"}, status=200)

        except Exception as e:
            # Log the specific error to your terminal to see exactly why it failed
            print(f"Signature Verification Error: {e}") 
            return Response({"status": "Failed", "error": str(e)}, status=400)

    # Move fulfill_order logic here so both View and Webhook can use it
    def fulfill_order(self, order_id, payment_id=None):
        from django.db import transaction
        try:
            with transaction.atomic():
                purchase = CreditPurchase.objects.select_for_update().get(payment_id=order_id)
                
                if purchase.status == 'pending':
                    purchase.status = 'success'
                    # Ensure payment_id is stored if your model has a field for it
                    if payment_id:
                        purchase.razorpay_payment_id = payment_id 
                    purchase.save()

                    user_credits, _ = UserCredits.objects.get_or_create(user=purchase.user)
                    user_credits.total_credits += purchase.credits_purchased
                    user_credits.save()
                    return True
            return False
        except CreditPurchase.DoesNotExist:
            return False
        
@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(APIView):
    permission_classes = [] # Allow Razorpay to access without Auth
    authentication_classes = []

    def post(self, request):
        payload = request.body.decode('utf-8')
        signature = request.headers.get('X-Razorpay-Signature')
        secret = settings.RZP_WEBHOOK_SECRET # Define this in your .env

        try:
            # 1. Verify the webhook signature
            client.utility.verify_webhook_signature(payload, signature, secret)
            
            data = json.loads(payload)
            event = data.get('event')

            # 2. Handle 'payment.captured' or 'order.paid'
            if event == "payment.captured":
                order_id = data['payload']['payment']['entity']['order_id']
                payment_id = data['payload']['payment']['entity']['id']
                
                self.fulfill_order(order_id, payment_id)

            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def fulfill_order(self, order_id, payment_id=None):
        with transaction.atomic():
            # Select for update prevents two processes from touching this record at once
            purchase = CreditPurchase.objects.select_for_update().get(payment_id=order_id)
            
            if purchase.status == 'pending':
                purchase.status = 'success'
                # If you want to store the RZP Payment ID (not Order ID)
                if payment_id:
                    purchase.payment_details_id = payment_id 
                purchase.save()

                # Increment User Credits
                user_credits, _ = UserCredits.objects.get_or_create(user=purchase.user)
                user_credits.total_credits += purchase.credits_purchased
                user_credits.save()
                return True
        return False