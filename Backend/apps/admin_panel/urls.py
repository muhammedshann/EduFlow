from django.urls import path
from .views import adminLoginView, GetUsers, CreateUser, EditUser, DeleteUser, WalletDetailView, PomodoroView, AdminGroupView, AdminGroupDeleteView, AdminHabitView, AdminFetchNotesView

urlpatterns = [
    path('login/',adminLoginView.as_view(),name='adminLogin'),
    path('users/',GetUsers.as_view(),name='getUsers'),
    path('users/create/',CreateUser.as_view(),name='CreateUser'),
    path('users/edit/<int:pk>/',EditUser.as_view(),name='EditUser'),
    path('users/delete/<int:pk>/',DeleteUser.as_view(),name='DeleteUser'),
    path('wallet/',WalletDetailView.as_view(),name='WalletDetail'),
    path('pomodoro/',PomodoroView.as_view(),name='PomodoroView'),
    path('groups/',AdminGroupView.as_view(),name='PomodoroView'),
    path('groups/delete/',AdminGroupDeleteView.as_view(),name='AdminGroupDeleteView'),
    path('habits/',AdminHabitView.as_view(),name='AdminHabitView'),
    path('notes/', AdminFetchNotesView.as_view(), name="fetch-all-notes"),
]
