from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import PomodoroSettingsSerializer, PomodoroSessionSerializer
from .models import PomodoroSettings, PomodoroSession, PomodoroDailySummary
from django.utils import timezone


# Create your views here.
class PomodoroView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        promodoro, created = PomodoroSettings.objects.get_or_create(user=request.user)
        serializer = PomodoroSettingsSerializer(promodoro)
        return Response(serializer.data,status=200)
    
    def post(self, request):
        pomodoro, created = PomodoroSettings.objects.get_or_create(user=request.user)

        serializer = PomodoroSettingsSerializer(pomodoro, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Pomodoro settings updated successfully",
                "data": serializer.data
            }, status=200)

        return Response(
            {"error": list(serializer.errors.values())[0][0]},
            status=400
        )

class SavePomodoroSession(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PomodoroSessionSerializer(data=request.data)
        if serializer.is_valid():
            session = serializer.save(user=request.user)

            today = session.started_at.date()

            summary, created = PomodoroDailySummary.objects.get_or_create(
                user=request.user,
                date=today
            )

            if session.session_type == "focus":
                summary.focus_seconds += session.duration_seconds
                if session.completed:
                    summary.sessions_completed += 1
            else:
                summary.break_seconds += session.duration_seconds

            summary.save()

            return Response({"message": "Session saved"}, status=201)

        return Response({"errors": serializer.errors}, status=400)

class PomodoroDailyStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()

        summary = PomodoroDailySummary.objects.filter(
            user=request.user,
            date=today
        ).first()

        data = {
            "date": str(today),
            "sessions_completed": summary.sessions_completed if summary else 0,
            "focus_minutes": (summary.focus_seconds // 60) if summary else 0,
            "break_minutes": (summary.break_seconds // 60) if summary else 0,
        }

        return Response(data)

class PomodoroWeeklyStats(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        week_start = today - timezone.timedelta(days=today.weekday())

        summaries = PomodoroDailySummary.objects.filter(
            user=request.user,
            date__gte=week_start,
            date__lte=today
        )

        data = []
        for i in range(7):
            d = week_start + timezone.timedelta(days=i)
            day_summary = summaries.filter(date=d).first()

            data.append({
                "date": d.strftime("%a"),  # Mon, Tue, etc.
                "focus_minutes": (day_summary.focus_seconds // 60) if day_summary else 0,
                "break_minutes": (day_summary.break_seconds // 60) if day_summary else 0,
            })

        return Response({"week": data})

class PomodoroStreak(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        streak = 0
        day = today

        while True:
            summary = PomodoroDailySummary.objects.filter(user=request.user, date=day).first()

            if not summary or summary.focus_seconds == 0:
                break

            streak += 1
            day -= timezone.timedelta(days=1)

        return Response({"streak": streak})
