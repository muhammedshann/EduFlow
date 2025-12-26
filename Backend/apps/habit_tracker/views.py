# views.py
from django.utils.timezone import now
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.timezone import now
from django.utils import timezone
from.serializer import HabitSerializer, AddHabitSerializer, ToggleHabitSerializer
from datetime import timedelta


from .models import Habit, HabitLog
class HabitsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        habits = Habit.objects.filter(user=request.user)
        serializer = HabitSerializer(habits, many=True)
        return Response(serializer.data)

class AddHabitView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        serializer = AddHabitSerializer(data = request.data)
        if serializer.is_valid():
            serializer.save(user = request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
class ToggleHabitView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request):
        serializer = ToggleHabitSerializer(data = request.data, context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        
        habit_id = serializer.validated_data['habit_id']
        completed = serializer.validated_data['completed']

        habit = Habit.objects.get(id=habit_id,user = request.user)
        today = timezone.now().date()

        log, created = HabitLog.objects.get_or_create(
            habit = habit,
            date = today,
            defaults=False
        )

        if not created:
            log.completed = completed
            log.save()
        
        message = "Task completed" if completed else "Task not completed"

        return Response({
            "message": message,
            "habit_id": str(habit.id),
            "completed": log.completed,
            "date": str(today),
        }, status=200)


class WeeklyStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = now().date()
        week_start = today - timedelta(days=today.weekday())  # Monday
        
        habits = Habit.objects.filter(user=user)
        total_habits = habits.count()

        days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

        # If no habits → return 0% for the entire week
        if total_habits == 0:
            return Response([
                {"date": day, "completion_percent": 0}
                for day in days
            ])

        # Fetch all logs for this week in one query
        logs = HabitLog.objects.filter(
            habit__user=user,
            date__range=[week_start, week_start + timedelta(days=6)],
            completed=True
        ).values("date")

        # Count logs per day
        completion_map = {}
        for log in logs:
            day = log["date"]
            completion_map[day] = completion_map.get(day, 0) + 1

        results = []
        for i in range(7):
            day_date = week_start + timedelta(days=i)
            completed = completion_map.get(day_date, 0)
            percent = round((completed / total_habits) * 100)

            results.append({
                "date": days[i],
                "completion_percent": percent
            })

        return Response(results)


# views.py
class StreakView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = now().date()

        habits = Habit.objects.filter(user=user)
        total_habits = habits.count()
        if total_habits == 0:
            return Response({"streak": 0})

        streak = 0

        # count backwards day-by-day
        day = today
        while True:
            completed = HabitLog.objects.filter(
                habit__user=user,
                date=day,
                completed=True
            ).count()

            if completed == total_habits:
                streak += 1
                day -= timedelta(days=1)
            else:
                break

        return Response({"streak": streak})
