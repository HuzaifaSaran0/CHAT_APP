# accounts/pipeline.py
from accounts.models import CustomUser

# def create_user_with_name(strategy, details, backend, user=None, *args, **kwargs):
#     if backend.name == 'google-oauth2' and user is None:
#         email = details.get('email')
#         name = details.get('fullname') or details.get('first_name') or 'Google User'
#         age = None  # Customize if needed

#         # ✅ Check if user already exists
#         existing_user = CustomUser.objects.filter(email=email).first()
#         if existing_user:
#             return {'user': existing_user}

#         # ✅ Only create if not found
#         user = strategy.create_user(email=email, name=name, age=age)
#         return {'user': user}
from django.contrib.auth import get_user_model
from social_core.exceptions import AuthForbidden

def create_user_with_name(strategy, details, backend, user=None, *args, **kwargs):
    if backend.name == 'google-oauth2' and user is None:
        email = details.get('email')
        name = details.get('fullname') or details.get('first_name') or 'Google User'
        age = None

        # Check if user already exists
        User = get_user_model()
        try:
            existing_user = User.objects.get(email=email)
            if not existing_user.is_email_verified:
                # Prevent login if not verified
                raise AuthForbidden(backend, "Please verify your email first.")
            return {'user': existing_user}
        except User.DoesNotExist:
            # Create user only if it doesn't exist
            user = strategy.create_user(email=email, name=name, age=age)
            return {'user': user}



def save_profile(backend, user, response, *args, **kwargs):
    if backend.name == 'google-oauth2':
        user.name = response.get('name', '') or 'Google User'
        user.age = None  # or set a default like 20
        user.save()
