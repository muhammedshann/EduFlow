# urls.py
from django.urls import path
from .views import HabitsView, AddHabitView, ToggleHabitView, WeeklyStatsView, StreakView

urlpatterns = [
    path("", HabitsView.as_view()),
    path("add/", AddHabitView.as_view()),
    path("toggle/", ToggleHabitView.as_view()),
    # path("stats/daily/", DailyStatsView.as_view()),
    path("stats/weekly/", WeeklyStatsView.as_view()),
    path("stats/streak/", StreakView.as_view()),
]
