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


def logout_view(request):
    logout(request)
    return redirect('/accounts/')  # Redirect to the index page after logout


@login_required
def dashboard(request):
    user = request.user
    conversation, _ = Conversation.objects.get_or_create(user=user)
    messages_list = Message.objects.filter(conversation=conversation).order_by('timestamp')

    if request.method == "POST" and request.headers.get("x-requested-with") == "XMLHttpRequest":
        user_input = request.POST.get("message", "")

        if user_input:
            # Save user message
            Message.objects.create(conversation=conversation, sender='user', content=user_input)

            try:
                # Get previous messages (excluding the one we just saved if DB is slow)
                previous_messages = Message.objects.filter(conversation=conversation).order_by('-timestamp')[:5][::-1]

                chat_history = [{"role": "system", "content": "You are a helpful AI assistant named Lya. Respond in English."}]

                for msg in previous_messages:
                    role = "user" if msg.sender == "user" else "assistant"
                    chat_history.append({"role": role, "content": msg.content})

                # ✅ Always append the current message at the end
                chat_history.append({"role": "user", "content": user_input})

                # Get AI response
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=chat_history,
                    max_tokens=500,
                    temperature=0.7
                )

                reply = response.choices[0].message.content

                # Save AI response
                Message.objects.create(conversation=conversation, sender='assistant', content=reply)

                return JsonResponse({"reply": reply})

            except Exception as e:
                return JsonResponse({"reply": f"Sorry, an error occurred: {str(e)}"})


    # Prepare messages JSON for JavaScript
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