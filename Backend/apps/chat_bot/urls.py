from django.urls import path
from .views import ChatBotView,ChatHistoryView, ChatClearView

urlpatterns = [
    # path("", ChatBotView.as_view()),
    path("", ChatHistoryView.as_view()),
    path("delete/", ChatClearView.as_view())
]
