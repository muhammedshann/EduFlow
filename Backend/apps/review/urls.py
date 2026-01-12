from django.urls import path
from.views import ReviewView, DeleteReview

urlpatterns = [
    path('',ReviewView.as_view(),name='ReviewView'),
    path('<uuid:pk>/',DeleteReview.as_view(),name='DeleteReview'),
]
