from django.urls import path
from .views import GroupsView, GroupDetailsView, LeaveGroupView

urlpatterns = [
    path("", GroupsView.as_view()),
    path("group-details/", GroupDetailsView.as_view()),
    path("leave-group/", LeaveGroupView.as_view())
]
