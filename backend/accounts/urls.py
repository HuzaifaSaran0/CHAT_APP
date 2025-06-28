from django.urls import path
from accounts import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # path('login/', views.login_view, name='login'),
    # path('signup/', views.signup_view, name='signup'),
    path('', views.index, name='index'),
    path('login/', views.api_login, name='login'),
    path('signup/', views.api_signup, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # You might also need to serve STATICFILES_DIRS directly for development,
    # or more commonly, collectstatic will handle it.
    # For simplicity during development, you can also do:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / 'static')
