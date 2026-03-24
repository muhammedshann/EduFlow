# urls.py
from django.urls import path
from .views import HabitsView, AddHabitView, ToggleHabitView, WeeklyStatsView, StreakView, DeleteHabitView, HabitAnalyticsView

urlpatterns = [
    path("", HabitsView.as_view()),
    path("add/", AddHabitView.as_view()),
    path("toggle/", ToggleHabitView.as_view()),
    path('delete/<uuid:pk>/', DeleteHabitView.as_view(), name='delete-habit'),
    path("stats/weekly/", WeeklyStatsView.as_view()),
    path("stats/streak/", StreakView.as_view()),
    path("stats/analytics/", HabitAnalyticsView.as_view(), name='habit-analytics'),
]
