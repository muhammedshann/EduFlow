from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('default/admin/', admin.site.urls),
    path('api/accounts/', include('apps.accounts.urls')),
    path('api/admin/', include('apps.admin_panel.urls')),
    path('api/pomodoro/', include('apps.pomodoro.urls')),
    path('api/habit/', include('apps.habit_tracker.urls')),
    path('api/groups/', include('apps.groups.urls')),
    path('api/live-transcription/', include('apps.live_transcription.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/accounts/auth/', include('dj_rest_auth.urls')),
    path('api/accounts/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('accounts/', include('allauth.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
