from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.utils.safestring import mark_safe
from django.views.decorators.csrf import csrf_protect

from .models import CustomUser, Conversation, Message
from .backends import EmailBackend

from django.core.mail import send_mail
from .utils import generate_verification_link
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model

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

@csrf_protect
def api_login(request):
    if request.method == 'POST':
        # print(request.body)  # Debugging line to check the request body
        data = json.loads(request.body) # Parse JSON data from the request body
        # print("Received data:", data)  # Debugging line to check received data
        email = data.get('email')
        password = data.get('password')

        user = authenticate(request, email=email, password=password)
        if user is not None:
            if not user.is_email_verified and not user.is_superuser:
                return JsonResponse({'success': False, 'error': 'Please verify your email before logging in.'})
            login(request, user)
            return JsonResponse({'success': True})
        else:
            return JsonResponse({'success': False, 'error': 'Invalid credentials'})
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_protect
def api_signup(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        email = data.get('email')
        password = data.get('password') # with .get() if the key doesn't exist, it will return None
        age = data.get('age')

        if CustomUser.objects.filter(email=email).exists():
            return JsonResponse({'success': False, 'error': 'Email already registered'})
        
        user = CustomUser.objects.create_user(email=email, name=name, password=password, age=age)
        # Generate verification link
        verification_link = generate_verification_link(user, request)
        
        send_mail(
            subject='Verify your email',
            message=f'Click the link to verify your email: {verification_link}',
            from_email=os.getenv("EMAIL_HOST_USER"),
            recipient_list=[user.email],
            fail_silently=False,
        )
        user.backend = 'accounts.backends.EmailBackend'
        request.session['just_signed_up_email'] = email

        # login(request, user)
        # return render(request, 'accounts/email_verification_sent.html', {'email': user.email})
        return JsonResponse({'success': True})

    return JsonResponse({'error': 'Invalid request'}, status=400)

def index(request):
    return render(request, 'accounts/index.html')

def logout_view(request):
    logout(request)
    return redirect('/accounts/')

def email_verification_sent(request):
    email = request.session.get('just_signed_up_email')
    if not email:
        return HttpResponseForbidden("<h1>403 Forbidden</h1><p>You are not allowed to access this page directly.</p>")

    # Clean up session
    del request.session['just_signed_up_email']
    return render(request, 'accounts/email_verification_sent.html', {
        'email': email,
    })

def verify_email(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = get_user_model().objects.get(pk=uid)
    except Exception:
        user = None

    if user and default_token_generator.check_token(user, token):
        user.is_email_verified = True
        user.save()
        # return redirect('/accounts/dashboard/')
        return render(request, 'accounts/email_verified.html')
        # return JsonResponse({'message': 'Email verified successfully!'})
    else:
        return JsonResponse({'error': 'Invalid or expired link'}, status=400)

@login_required
def dashboard(request):
    user = request.user
    conversation, _ = Conversation.objects.get_or_create(user=user)
    messages_list = Message.objects.filter(conversation=conversation).order_by('timestamp')

    if request.method == "POST" and request.headers.get("x-requested-with") == "XMLHttpRequest":
        user_input = request.POST.get("message", "")

        if user_input:
            Message.objects.create(conversation=conversation, sender='user', content=user_input)
            if user_input == "image":
                fixed_image_url = "https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png"  # <-- Replace with your image URL
            elif user_input == "audio":
                fixed_image_url = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            else:
                fixed_image_url = "https://upload.wikimedia.org/wikipedia/commons/3/3f/HST-SM4.jpeg"


            Message.objects.create(conversation=conversation, sender='assistant', content=fixed_image_url)
            return JsonResponse({"reply": fixed_image_url})

        if user_input:
            Message.objects.create(conversation=conversation, sender='user', content=user_input)

            try:
                previous_messages = Message.objects.filter(conversation=conversation).order_by('-timestamp')[:5][::-1]

                chat_history = [{"role": "system", "content": "You are a helpful AI assistant named Lya. Respond in English."}]
                for msg in previous_messages:
                    role = "user" if msg.sender == "user" else "assistant"
                    chat_history.append({"role": role, "content": msg.content})

                chat_history.append({"role": "user", "content": user_input})
                print(chat_history)
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