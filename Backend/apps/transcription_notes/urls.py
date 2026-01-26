from django.urls import path
from .views import LiveTranscriptionView, NoteCreateView, NotesView, NoteDetailView, NoteUpdateView, MediaUploadView, MediaDetailView

urlpatterns = [
    path("start/", LiveTranscriptionView.as_view()),
    path('',NoteCreateView.as_view(),name='NoteCreateView'),
    path('notes/',NotesView.as_view(),name='NotesView'),
    path('notes-update/<uuid:pk>/',NoteUpdateView.as_view(),name='NotesView'),
    path("notes/<uuid:pk>/", NoteDetailView.as_view()),
    path("upload/", MediaUploadView.as_view()),
    path("media/<int:pk>/", MediaDetailView.as_view()),
]
