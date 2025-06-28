from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.utils.safestring import mark_safe
from django.views.decorators.csrf import csrf_exempt

from .models import CustomUser, Conversation, Message
from .backends import EmailBackend

import os
import json
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env file
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def login_page(request):
    if request.user.is_authenticated:
        return redirect('/accounts/dashboard/')
    return render(request, 'accounts/login.html')

def signup_page(request):
    return render(request, 'accounts/signup.html')

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

def logout_view(request):
    logout(request)
    return redirect('/accounts/')

@login_required
def dashboard(request):
    user = request.user
    conversation, _ = Conversation.objects.get_or_create(user=user)
    messages_list = Message.objects.filter(conversation=conversation).order_by('timestamp')

    if request.method == "POST" and request.headers.get("x-requested-with") == "XMLHttpRequest":
        user_input = request.POST.get("message", "")

        if user_input:
            Message.objects.create(conversation=conversation, sender='user', content=user_input)

            try:
                previous_messages = Message.objects.filter(conversation=conversation).order_by('-timestamp')[:5][::-1]

                chat_history = [{"role": "system", "content": "You are a helpful AI assistant named Lya. Respond in English."}]
                for msg in previous_messages:
                    role = "user" if msg.sender == "user" else "assistant"
                    chat_history.append({"role": role, "content": msg.content})

                chat_history.append({"role": "user", "content": user_input})

                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=chat_history,
                    max_tokens=500,
                    temperature=0.7
                )

                reply = response.choices[0].message.content
                Message.objects.create(conversation=conversation, sender='assistant', content=reply)

                return JsonResponse({"reply": reply})

            except Exception as e:
                return JsonResponse({"reply": f"Sorry, an error occurred: {str(e)}"})

    messages_data = [
        {
            "id": str(msg.id),
            "text": msg.content,
            "sender": "bot" if msg.sender == "assistant" else "user",
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
        "user_json": mark_safe(json.dumps(user_data)),
        "theme": "dark",
        "csrf_token": request.META.get('CSRF_COOKIE', ''),
    })
def handle_404(request, exception):
    return render(request, 'accounts/404.html', status=404)