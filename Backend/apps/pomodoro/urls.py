from django.urls import path
from.views import PomodoroView, SavePomodoroSession, PomodoroDailyStats, PomodoroWeeklyStats, PomodoroStreak, PomodoroAnalyticsView

urlpatterns = [
    path('',PomodoroView.as_view(),name='PomodoroView'),
    path('save/', SavePomodoroSession.as_view()),
    path('stats/daily/', PomodoroDailyStats.as_view()),
    path('stats/weekly/', PomodoroWeeklyStats.as_view()),
    path('stats/streak/', PomodoroStreak.as_view()),
    path('stats/analytics/', PomodoroAnalyticsView.as_view()),
]
