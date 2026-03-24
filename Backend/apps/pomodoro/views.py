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

class PomodoroAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        timeframe = request.query_params.get("range", "weekly")
        today = timezone.now().date()
        results = []

        if timeframe == "weekly":
            week_start = today - timezone.timedelta(days=today.weekday())
            summaries = PomodoroDailySummary.objects.filter(
                user=request.user,
                date__gte=week_start,
                date__lte=today
            )
            for i in range(7):
                d = week_start + timezone.timedelta(days=i)
                day_summary = summaries.filter(date=d).first()
                results.append({
                    "date": d.strftime("%a"),
                    "focus_minutes": (day_summary.focus_seconds // 60) if day_summary else 0,
                    "break_minutes": (day_summary.break_seconds // 60) if day_summary else 0,
                })

        elif timeframe == "monthly":
            first_day = today.replace(day=1)
            if first_day.month == 12:
                last_day = today.replace(year=today.year+1, month=1, day=1) - timezone.timedelta(days=1)
            else:
                last_day = today.replace(month=first_day.month+1, day=1) - timezone.timedelta(days=1)
            
            summaries = PomodoroDailySummary.objects.filter(
                user=request.user,
                date__range=[first_day, last_day]
            )
            
            week_stats = {w: {"focus": 0, "break": 0} for w in range(1, 6)}
            for s in summaries:
                week_num = min(((s.date.day - 1) // 7) + 1, 5)
                week_stats[week_num]["focus"] += s.focus_seconds
                week_stats[week_num]["break"] += s.break_seconds
                
            for w in range(1, 6):
                results.append({
                    "date": f"Week {w}",
                    "focus_minutes": week_stats[w]["focus"] // 60,
                    "break_minutes": week_stats[w]["break"] // 60,
                })

        elif timeframe == "yearly":
            jan_1 = today.replace(month=1, day=1)
            dec_31 = today.replace(month=12, day=31)
            
            summaries = PomodoroDailySummary.objects.filter(
                user=request.user,
                date__range=[jan_1, dec_31]
            )
            
            months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            month_stats = {m: {"focus": 0, "break": 0} for m in range(1, 13)}
            
            for s in summaries:
                month_stats[s.date.month]["focus"] += s.focus_seconds
                month_stats[s.date.month]["break"] += s.break_seconds
                
            for m in range(1, 13):
                results.append({
                    "date": months[m-1],
                    "focus_minutes": (month_stats[m]["focus"] // 60),
                    "break_minutes": (month_stats[m]["break"] // 60),
                })
                
        return Response(results)
