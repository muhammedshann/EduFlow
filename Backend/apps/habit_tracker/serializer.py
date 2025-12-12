# habits/serializers.py
from rest_framework import serializers
from .models import Habit, HabitLog
from django.utils import timezone


class HabitSerializer(serializers.ModelSerializer):
    done_today = serializers.SerializerMethodField()
    streak = serializers.SerializerMethodField()

    class Meta:
        model = Habit
        fields = ["id", "title", "description", "done_today", "streak"]

    def get_done_today(self, habit):
        today = timezone.now().date()
        log = HabitLog.objects.filter(habit=habit, date=today).first()
        return log.completed if log else False

    def get_streak(self, habit):
        today = timezone.now().date()
        streak = 0
        cursor = today

        while True:
            log = HabitLog.objects.filter(
                habit=habit,
                date=cursor,
                completed=True
            ).first()
            if log:
                streak += 1
                cursor -= timezone.timedelta(days=1)
            else:
                break
        return streak

class AddHabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = ['title','description']

class ToggleHabitSerializer(serializers.Serializer):
    habit_id = serializers.UUIDField()
    completed = serializers.BooleanField()

    def validate_habit_id(self, value):
        user = self.context['request'].user
        try :
            habit = Habit.objects.get(id = value, user = user)
        except Habit.DoesNotExist:
            raise serializers.ValidationError("habit not found")
        return value
