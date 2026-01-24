from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import AdminUserSerializer, AdminUserListSerializer, AdminCreateUserSerializer, AdminEditUserSerializer, WalletSerializer, AdminGroupSerializer, AdminNotesSerializer, AdminLiveTranscriptionSerializer,AdminUploadStatsSerializer, RecentPurchaseSerializer, CreditUsageHistorySerializer, AdminCreditPurchaseSerializer
from rest_framework.permissions import IsAdminUser, IsAuthenticated

from apps.accounts.models import User, Wallet, UserCredits
from apps.pomodoro.models import PomodoroSession, PomodoroDailySummary
from apps.habit_tracker.models import Habit, HabitLog
from apps.groups.models import Group
from apps.transcription_notes.models import Notes, LiveTranscription, UploadTranscription
from apps.chat_bot.models import ChatBot, ChatBotMessage
from apps.subscriptions.models import CreditPurchase, CreditUsageHistory

from django.contrib.auth import login
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Notification
from django.shortcuts import get_object_or_404

# Create your views here.
class adminLoginView(APIView):
    def post(self,request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response({"error": "Username and password required"}, status=400)

        # Authenticate user
        user = authenticate(username=username, password=password)
        if user is None:
            return Response({"error": "Invalid credentials"}, status=401)
        if not user.is_superuser:
            return Response({"error": "Access denied"}, status=403)
        login(request, user)

        refresh = RefreshToken.for_user(user)
        accessToken = str(refresh.access_token)
        refreshToken = str(refresh)

        serialized_user = AdminUserSerializer(user).data
        
        response = Response({
            'message': "Admin logged in successfully",
            'user': serialized_user,
            'access': accessToken,
            'refresh': refreshToken,
        })

        # Set cookies
        response.set_cookie(
            key='access',
            value=accessToken,
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=15*60
        )
        response.set_cookie(
            key='refresh',
            value=refreshToken,
            httponly=True,
            samesite='Lax',
            max_age=7*24*60*60,
            secure=False,
        )
        return response

class GetUsers(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        serializer = AdminUserListSerializer(users, many=True)
        return Response(serializer.data, status=200)

class CreateUser(APIView):
    permission_classes = [IsAdminUser]
    def post(self,request):
        serializer = AdminCreateUserSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully",}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EditUser(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        serializer = AdminEditUserSerializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User updated", "user": serializer.data})
        return Response(serializer.errors, status=400)
    
class DeleteUser(APIView):
    permission_classes = [IsAdminUser]
    def delete(self,request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.delete()
            return Response({"message": "User Deleted successfully"})
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
            
class WalletDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        wallet = Wallet.objects.all()
        serializer = WalletSerializer(wallet, many=True)
        return Response(serializer.data)
    

class PomodoroView(APIView):
    permission_classes = [IsAdminUser]

    def get(self,request):
        users = User.objects.all()
        data = []

        for user in users:
            summary = PomodoroDailySummary.objects.filter(user=user).aggregate(
                total_focus=Sum("focus_seconds"),
                total_break=Sum("break_seconds"),
                sessions=Sum("sessions_completed")
            )

            data.append({
                "user_id": user.id,
                "username": user.username,
                "focus_minutes": (summary["total_focus"] or 0) // 60,
                "break_minutes": (summary["total_break"] or 0) // 60,
                "sessions_completed": summary["sessions"] or 0
            })

        return Response({"users": data}, status=200)


class AdminGroupView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        groups = (
            Group.objects
            .select_related("created_by")
            .annotate(
                total_members=Count("members", distinct=True),
                total_messages=Count("messages", distinct=True),
            )
            .order_by("-created_at")
        )

        serializer = AdminGroupSerializer(groups, many=True)
        return Response({"groups": serializer.data}, status=200)
    
class AdminGroupDeleteView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        group_id = request.data.get("id")

        if not group_id:
            return Response({"error": "Group ID is required"}, status=400)

        try:
            group = Group.objects.get(id=group_id)
        except Group.DoesNotExist:
            return Response({"error": "Group not found"}, status=404)

        group.delete()

        return Response(
            {"message": "Group has been deleted successfully"},
            status=200
        )

class AdminHabitView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):

        users_data = []
        all_habits = Habit.objects.all()
        all_logs = HabitLog.objects.all()

        for user in User.objects.all():
            habits = Habit.objects.filter(user=user)
            logs = HabitLog.objects.filter(habit__user=user)

            total_habits = habits.count()
            total_logs = logs.count()
            completed_logs = logs.filter(completed=True).count()

            completion_rate = (completed_logs / total_logs * 100) if total_logs else 0

            users_data.append({
                "id": user.id,
                "username": user.username,
                "total_habits": total_habits,
                "total_logs": total_logs,
                "completed_logs": completed_logs,
                "completion_rate": round(completion_rate, 2),
            })

        dashboard = {
            "total_users": User.objects.count(),
            "total_habits": all_habits.count(),
            "total_logs": all_logs.count(),
            "avg_completion_rate": round(
                (all_logs.filter(completed=True).count() / all_logs.count() * 100)
                if all_logs.count()
                else 0,
                2
            ),
            "users": users_data
        }

        return Response(dashboard)

class AdminFetchNotesView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        notes = Notes.objects.select_related("user").all()
        serializer = AdminNotesSerializer(notes, many=True)
        return Response(serializer.data)
    
class AdminLiveTranscriptionView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = (
            LiveTranscription.objects
            .values("user_id", "user__username")
            .annotate(total_count=Sum("count"))
            .order_by("-total_count")
        )

        return Response({
            "users": [
                {
                    "user_id": u["user_id"],
                    "username": u["user__username"],
                    "total_count": u["total_count"],
                }
                for u in users
            ]
        })

    
class AdminChatBotView(APIView):
    permission_classes = [IsAdminUser]

    def get(self,request):
        users = (
            ChatBot.objects
            .values("user_id", "user__username")
            .annotate(total_requests=Sum("request_count"))
            .order_by("-total_requests")
        )

        return Response({
            "users": [
                {
                    "user_id": u["user_id"],
                    "username": u["user__username"],
                    "total_count": u["total_requests"],
                }
                for u in users
            ]
        })
    
class AdminUploadTranscriptionView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users_data = User.objects.annotate(
            total_count=Count('upload_Transcription') 
        ).filter(total_count__gt=0).order_by('-total_count')

        serializer = AdminUploadStatsSerializer(users_data, many=True)
        return Response({"users": serializer.data})
    
class AdminNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_users = User.objects.count()
        total_notifications_sent = Notification.objects.count()
        
        campaign_count = Notification.objects.values('title', 'created_at').distinct().count()

        history = Notification.objects.values(
            'title', 'message', 'notification_type', 'created_at'
        ).annotate(
            recipient_count=Count('id'),
        ).order_by('-created_at')

        return Response({
            "stats": {
                "totalSent": campaign_count,
                "totalReads": 0,
                "totalUsers": total_users,
                "readRate": 0
            },
            "history": history
        })

    def post(self, request):
        title = request.data.get('title')
        message = request.data.get('message')
        n_type = request.data.get('notification_type')
        target_type = request.data.get('target_type')
        username = request.data.get('username')

        if target_type == 'personal':
            user = get_object_or_404(User, username=username)
            Notification.objects.create(
                recipient=user,
                title=title,
                message=message,
                notification_type=n_type
            )
            return Response({"message": f"Notification sent to {username}"}, status=status.HTTP_201_CREATED)
        
        else:
            users = User.objects.all()
            notifications = [
                Notification(
                    recipient=user,
                    title=title,
                    message=message,
                    notification_type=n_type
                ) for user in users
            ]
            Notification.objects.bulk_create(notifications)
            return Response({"message": "Broadcast sent to all users"}, status=status.HTTP_201_CREATED)
        
class AdminDashboardStatsView(APIView):
    permission_classes = [IsAdminUser] # Ensure only admins see this

    def get(self, request):
        today = timezone.now().date()
        
        # --- GENERAL USER STATS ---
        total_users = User.objects.count()
        new_users_today = User.objects.filter(date_joined__date=today).count()

        # --- REVENUE & CREDIT ECONOMY ---
        total_revenue = CreditPurchase.objects.filter(status='success').aggregate(
            total=Sum('total_amount'))['total'] or 0
            
        # Total Credits Bought (Sum of credits from all successful purchases)
        total_credits_bought = CreditPurchase.objects.filter(status='success').aggregate(
            total=Sum('credit_bundle__credits'))['total'] or 0
            
        total_credits_used = UserCredits.objects.aggregate(
            total=Sum('used_credits'))['total'] or 0

        # --- PRODUCTIVITY METRICS ---
        completed_pomodoros_today = PomodoroSession.objects.filter(
            completed=True, 
            ended_at__date=today
        ).count()

        total_active_habits = Habit.objects.count()
        habits_completed_today = HabitLog.objects.filter(date=today, completed=True).count()
        
        # Calculate Average Habit Completion Rate
        # (How many logs are completed vs total logs created today)
        total_logs_today = HabitLog.objects.filter(date=today).count()
        completion_rate = (habits_completed_today / total_logs_today * 100) if total_logs_today > 0 else 0

        # --- RECENT ACTIVITY ---
        recent_purchases_qs = CreditPurchase.objects.select_related('user', 'credit_bundle').order_by('-created_at')[:5]
        recent_purchases = RecentPurchaseSerializer(recent_purchases_qs, many=True).data

        # --- SYSTEM ENGAGEMENT ---
        last_7_days = timezone.now() - timedelta(days=7)
        chatbot_engagement = ChatBotMessage.objects.filter(created_at__gte=last_7_days).count()
        
        # Total files processed ever
        total_files_processed = UploadTranscription.objects.filter(status='completed').count()

        return Response({
            "stats": {
                "total_users": total_users,
                "new_users_today": new_users_today,
                "total_revenue": total_revenue,
                "credits_bought": total_credits_bought,
                "credits_used": total_credits_used,
            },
            "product_metrics": {
                "pomodoros_today": completed_pomodoros_today,
                "active_habits": total_active_habits,
                "habits_completed_today": habits_completed_today,
                "habit_success_rate": round(completion_rate, 2),
            },
            "usage_metrics": {
                "chatbot_7d_requests": chatbot_engagement,
                "total_files_processed": total_files_processed,
            },
            "recent_purchases": recent_purchases,
        })

class AdminCreditUsageListView(generics.ListAPIView):

    queryset = CreditUsageHistory.objects.all().order_by('-created_at')
    serializer_class = CreditUsageHistorySerializer
    permission_classes = [IsAdminUser]

class AdminRecentPurchasesListView(generics.ListAPIView):
    """
    Returns all credit purchases for the admin transaction history log.
    """
    queryset = CreditPurchase.objects.select_related('user', 'credit_bundle').all().order_by('-created_at')
    serializer_class = AdminCreditPurchaseSerializer
    permission_classes = [IsAdminUser]

class AdminSubscriptionStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):

        total_revenue = CreditPurchase.objects.filter(status='success').aggregate(
            total=Sum('total_amount')
        )['total'] or 0

        total_credits_bought = CreditPurchase.objects.filter(status='success').aggregate(
            total=Sum('credits_purchased')
        )['total'] or 0

        total_credits_used = CreditUsageHistory.objects.aggregate(
            total=Sum('credits_used')
        )['total'] or 0

        return Response({
            "stats": {
                "total_revenue": float(total_revenue),
                "credits_bought": total_credits_bought,
                "credits_used": total_credits_used,
            }
        })