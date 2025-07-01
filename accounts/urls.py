from django.urls import path, include
from accounts import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # path('', views.index, name='index'),
    path('', views.login_page, name='login_page'),
    path('signup-page/', views.signup_page, name='signup_page'),
    path('login/', views.api_login, name='login'),
    path('signup/', views.api_signup, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('verify/<uidb64>/<token>/', views.verify_email, name='verify_email'),
    path('email-verification-sent/', views.email_verification_sent, name='email_verification_sent'),
    path('dashboard/', views.dashboard),
    # path('oauth/', include('social_django.urls', namespace='social')),  # Add this

]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    # You might also need to serve STATICFILES_DIRS directly for development,
    # or more commonly, collectstatic will handle it.
    # For simplicity during development, you can also do:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.BASE_DIR / 'static')
