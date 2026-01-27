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
from apps.accounts.models import UserCredits, Wallet
import json
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.db import transaction
from django.shortcuts import get_object_or_404
from decimal import Decimal
import uuid


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

            if not amount_in_inr or amount_in_inr == "":
                return Response({"error": "Please enter a valid amount"}, status=status.HTTP_400_BAD_REQUEST)
            
            amount_in_paise = int(float(amount_in_inr) * 100) 
            
            bundle_obj = None
            if bundle_id:
                try:
                    bundle_obj = CreditBundle.objects.get(id=bundle_id)
                except CreditBundle.DoesNotExist:
                    pass
            
            try:
                razorpay_order = client.order.create({
                    "amount": amount_in_paise,
                    "currency": "INR",
                    "payment_capture": "1" 
                })
            except Exception as e:
                return Response({"error": "Payment gateway unreachable. Please try again."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            CreditPurchase.objects.create(
                user=request.user,
                payment_id=razorpay_order['id'],
                total_amount=amount_in_inr,
                method='online',
                status='pending',
                credit_bundle=bundle_obj, 
                credits_purchased=credits_to_buy,
                rate_per_credit=float(amount_in_inr) / int(credits_to_buy) if int(credits_to_buy) > 0 else 0
            )

            return Response({
                "order_id": razorpay_order['id'], 
                "amount": amount_in_paise,
                "key": settings.RZP_KEY_ID
            })

        except Exception as e:
            return Response({"error": "An internal error occurred"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyPaymentView(APIView):
    def post(self, request):
        data = request.data 
        
        params_dict = {
            'razorpay_order_id': data.get('razorpay_order_id'),
            'razorpay_payment_id': data.get('razorpay_payment_id'),
            'razorpay_signature': data.get('razorpay_signature')
        }

        try:
            if not all(params_dict.values()):
                return Response({"status": "Failed", "error": "Missing required parameters"}, status=400)

            client.utility.verify_payment_signature(params_dict)
            
            success = self.fulfill_order(params_dict['razorpay_order_id'], params_dict['razorpay_payment_id'])
            
            if success:
                return Response({"status": "Success"})
            else:
                return Response({"status": "Already Processed"}, status=200)

        except Exception as e:
            return Response({"status": "Failed", "error": str(e)}, status=400)

    def fulfill_order(self, order_id, payment_id=None):
        from django.db import transaction
        try:
            with transaction.atomic():
                purchase = CreditPurchase.objects.select_for_update().get(payment_id=order_id)
                
                if purchase.status == 'pending':
                    purchase.status = 'success'
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
    permission_classes = []
    authentication_classes = []

    def post(self, request):
        payload = request.body.decode('utf-8')
        signature = request.headers.get('X-Razorpay-Signature')
        secret = settings.RZP_WEBHOOK_SECRET 

        try:
            client.utility.verify_webhook_signature(payload, signature, secret)
            
            data = json.loads(payload)
            event = data.get('event')

            if event == "payment.captured":
                order_id = data['payload']['payment']['entity']['order_id']
                payment_id = data['payload']['payment']['entity']['id']
                
                self.fulfill_order(order_id, payment_id)

            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def fulfill_order(self, order_id, payment_id=None):
        with transaction.atomic():
            purchase = CreditPurchase.objects.select_for_update().get(payment_id=order_id)
            
            if purchase.status == 'pending':
                purchase.status = 'success'
                if payment_id:
                    purchase.payment_details_id = payment_id 
                purchase.save()

                user_credits, _ = UserCredits.objects.get_or_create(user=purchase.user)
                user_credits.total_credits += purchase.credits_purchased
                user_credits.save()
                return True
        return False

class WalletPurchaseView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        
        bundle_id = request.data.get('bundle_id')
        bundle = None
        
        # Scenario A: Preset Bundle
        if bundle_id:
            bundle = get_object_or_404(CreditBundle, id=bundle_id)
            amount_required = bundle.price
            credits_to_add = bundle.credits
        
        # Scenario B: Custom Purchase
        else:
            # For custom credits, we must trust the input amount/credits 
            # (Ensure you have backend logic to validate min/max if needed)
            try:
                amount_required = Decimal(str(request.data.get('amount', '0')))
                credits_to_add = int(request.data.get('credits', 0))
            except (ValueError, TypeError):
                return Response({"error": "Invalid amount or credits format"}, status=400)

        if amount_required <= 0 or credits_to_add <= 0:
            return Response({"error": "Amount and credits must be greater than zero"}, status=400)

        try:
            with transaction.atomic():
                # Lock the wallet row to prevent double-spending
                wallet = Wallet.objects.select_for_update().get(user=request.user)

                if wallet.balance < amount_required:
                    return Response({"error": "Insufficient wallet balance"}, status=400)

                # 1. Deduct from Wallet
                wallet.balance -= amount_required
                wallet.save()

                # 2. Create Purchase Record
                # payment_id includes a UUID to prevent "Duplicate Entry" errors
                unique_id = uuid.uuid4().hex[:10].upper()
                purchase = CreditPurchase.objects.create(
                    user=request.user,
                    credit_bundle=bundle, # Will be None for custom purchases
                    credits_purchased=credits_to_add,
                    total_amount=amount_required,
                    rate_per_credit=amount_required / credits_to_add if credits_to_add > 0 else 0,
                    method='wallet',
                    status='success',
                    payment_id=f"WAL-{request.user.id}-{unique_id}"
                )

                # 3. Add Credits to User Account
                user_credits, _ = UserCredits.objects.select_for_update().get_or_create(user=request.user)
                user_credits.total_credits += credits_to_add
                user_credits.save()

            return Response({
                "status": "Success",
                "message": f"Added {credits_to_add} credits to your account",
                "new_balance": float(wallet.balance)
            }, status=200)

        except Exception as e:
            return Response({"error": "An error occurred during the transaction"}, status=500)