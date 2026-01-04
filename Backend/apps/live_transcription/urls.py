from django.urls import path
from .views import LiveTranscriptionView, NotesView, NoteDetailView, NoteUpdateView

urlpatterns = [
    path('',LiveTranscriptionView.as_view(),name='LiveTranscriptionView'),
    path('notes/',NotesView.as_view(),name='NotesView'),
    path('notes-update/<uuid:pk>/',NoteUpdateView.as_view(),name='NotesView'),
    path("notes/<uuid:pk>/", NoteDetailView.as_view()),
]
