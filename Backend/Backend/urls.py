from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('default/admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/admin/', include('admin_panel.urls')),
    path('api/pomodoro/', include('pomodoro.urls')),
    path('api/habit/', include('habit_tracker.urls')),
    path('api/groups/', include('groups.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/accounts/auth/', include('dj_rest_auth.urls')),
    path('api/accounts/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('accounts/', include('allauth.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
