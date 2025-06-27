from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.contrib import messages
from django.contrib.auth.models import User
from .models import CustomUser
from django.contrib.auth.decorators import login_required
from .models import Conversation, Message
import os
from openai import OpenAI
from dotenv import load_dotenv
from django.contrib.auth import login
from .backends import EmailBackend
import json
from django.views.decorators.csrf import csrf_exempt
# Load environment variables from .env file
from django.utils.safestring import mark_safe



load_dotenv()  # This loads variables from .env


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@csrf_exempt
def api_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': 'Invalid credentials'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def api_signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        age = data.get('age')

        if CustomUser.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'error': 'Email already registered'})
        
        user = CustomUser.objects.create_user(email=email, name=name, password=password, age=age)
        user.backend = 'accounts.backends.EmailBackend'
        login(request, user)
        return JsonResponse({'success': True})

    return JsonResponse({'error': 'Invalid request'}, status=400)


def index(request):
    return render(request, 'accounts/index.html')

# @login_required
# def dashboard(request):
#     return render(request, 'accounts/dashboard.html')

# def login_view(request):
#     if request.user.is_authenticated:
#         return redirect('dashboard')
    
#     if request.method == 'POST':
#         email = request.POST['email']
#         password = request.POST['password']
#         user = authenticate(request, email=email, password=password)
        
#         if user is not None:
#             login(request, user)
#             return redirect('dashboard')
#         else:
#             messages.error(request, 'Invalid email or password')
    
#     return render(request, 'accounts/login.html')

# def signup_view(request):
#     if request.user.is_authenticated:
#         return redirect('dashboard')

#     context = {}

#     if request.method == 'POST':
#         name = request.POST['name']
#         age = request.POST.get('age')  # Optional field
#         email = request.POST['email']
#         password = request.POST['password']
#         confirm_password = request.POST['confirm_password']

#         # Pre-fill form data in context
#         context['name'] = name
#         context['age'] = age
#         context['email'] = email

#         # Check if passwords match
#         if password != confirm_password:
#             messages.error(request, 'Passwords do not match')
#             return render(request, 'accounts/signup.html', context)

#         if CustomUser.objects.filter(email=email).exists():
#             messages.error(request, 'Email already registered')
#             return render(request, 'accounts/signup.html', context)

#         user = CustomUser.objects.create_user(
#             email=email,
#             name=name,
#             age=age,
#             password=password
#         )
#         backend = EmailBackend()
#         user.backend = f"{backend.__module__}.{backend.__class__.__name__}"
#         login(request, user)
        
#         return redirect('dashboard')

#     return render(request, 'accounts/signup.html', context)


def logout_view(request):
    logout(request)
    return redirect('/accounts/')  # Redirect to the index page after logout


@login_required
def dashboard(request):
    print("User authenticated:", request.user.is_authenticated)
    user = request.user
    conversation, _ = Conversation.objects.get_or_create(user=user)
    messages_list = Message.objects.filter(conversation=conversation).order_by('-timestamp')[::-1]

    if request.method == "POST" and request.headers.get("x-requested-with") == "XMLHttpRequest":
        user_input = request.POST.get("message", "")

        if user_input:
            Message.objects.create(conversation=conversation, sender='user', content=user_input)

            try:
                chat_history = [
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": user_input}
                ]

                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=chat_history,
                    max_tokens=100
                )

                reply = response.choices[0].message.content
                Message.objects.create(conversation=conversation, sender='assistant', content=reply)

            except Exception as e:
                reply = f"Error: {str(e)}"

            return JsonResponse({"reply": reply})

    # Prepare messages JSON for JavaScript
    messages_data = [
        {
            "id": str(msg.id),
            "text": msg.content,
            "sender": msg.sender,
            "timestamp": msg.timestamp.strftime('%H:%M')
        }
        for msg in messages_list
    ]
    user_data = {
    "id": request.user.id,
    "email": request.user.email,
    "name": request.user.get_full_name() or request.user.username
}

    return render(request, 'accounts/dashboard.html', {
        "messages_json": mark_safe(json.dumps(messages_data)),
        "user_json": mark_safe(json.dumps(user_data))  # ✅ this is important

    })
