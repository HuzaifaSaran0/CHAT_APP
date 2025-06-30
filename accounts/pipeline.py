# accounts/pipeline.py
def create_user_with_name(strategy, details, backend, user=None, *args, **kwargs):
    if backend.name == 'google-oauth2' and user is None:
        email = details.get('email')
        name = details.get('fullname') or details.get('first_name') or 'Google User'
        age = None  # You can customize this if needed

        # Directly create your custom user
        user = strategy.create_user(email=email, name=name, age=age)

        return {'user': user}


def save_profile(backend, user, response, *args, **kwargs):
    if backend.name == 'google-oauth2':
        user.name = response.get('name', '') or 'Google User'
        user.age = None  # or set a default like 20
        user.save()
