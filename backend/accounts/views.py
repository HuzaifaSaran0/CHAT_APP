from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from .models import Conversation, Message
import os
from openai import OpenAI
from dotenv import load_dotenv


load_dotenv()  # This loads variables from .env


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')  # or any page you want
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('dashboard')  # Change this to your desired view
        else:
            messages.error(request, 'Invalid username or password')
    return render(request, 'accounts/login.html')

def signup_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    context = {}  # dictionary to pass data back to the template

    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']

        # Pre-fill form data in context
        context['username'] = username
        context['email'] = email

        # Check if passwords match
        if password != confirm_password:
            messages.error(request, 'Passwords do not match')
            return render(request, 'accounts/signup.html', context)

        # Check if username already exists
        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already taken')
            return render(request, 'accounts/signup.html', context)

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already registered')
            return render(request, 'accounts/signup.html', context)

        # Create user
        user = User.objects.create_user(username=username, email=email, password=password)
        user.save()
        login(request, user)
        return redirect('dashboard')

    return render(request, 'accounts/signup.html', context)



def logout_view(request):
    logout(request)
    return redirect('login')


@login_required
def dashboard(request):
    user = request.user
    conversation, _ = Conversation.objects.get_or_create(user=user)
    messages_list = Message.objects.filter(conversation=conversation)

    reply = None

    if request.method == "POST":
        user_input = request.POST.get("message", "")

        if user_input:
            # Save user message
            Message.objects.create(conversation=conversation, sender='user', content=user_input)

            try:
                # Prepare chat history for OpenAI
                chat_history = [{"role": msg.sender, "content": msg.content} for msg in messages_list]
                chat_history.append({"role": "user", "content": user_input})

                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=chat_history,
                    max_tokens=100
                )

                reply = response.choices[0].message.content

                # Save bot reply
                Message.objects.create(conversation=conversation, sender='assistant', content=reply)

            except Exception as e:
                reply = f"Error: {str(e)}"

    messages_list = Message.objects.filter(conversation=conversation)  # reload all including new ones

    return render(request, 'accounts/dashboard.html', {
        "messages": messages_list
    })
