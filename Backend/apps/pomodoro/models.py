from django.db import models
from apps.accounts.models import User

class PomodoroSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="pomodoro_settings")

    focus_minutes = models.IntegerField(default=25)
    break_minutes = models.IntegerField(default=5)
    status = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)


class PomodoroSession(models.Model):
    SESSION_TYPES = (
        ("focus", "Focus"),
        ("break", "Break"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pomodoro_sessions")
    session_type = models.CharField(max_length=10, choices=SESSION_TYPES)
    duration_seconds = models.IntegerField()
    completed = models.BooleanField(default=False)

    started_at = models.DateTimeField()
    ended_at = models.DateTimeField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.user.username} - {self.session_type} ({self.duration_seconds}s)"

class PomodoroDailySummary(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="pomodoro_daily")
    date = models.DateField()

    focus_seconds = models.IntegerField(default=0)
    break_seconds = models.IntegerField(default=0)
    sessions_completed = models.IntegerField(default=0)

    class Meta:
        unique_together = ("user", "date")
        ordering = ["-date"]

    def __str__(self):
        return f"{self.user.username} - {self.date}"
