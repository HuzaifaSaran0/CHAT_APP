from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.models import User


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

from django.contrib.auth.decorators import login_required

@login_required
def dashboard(request):
    return render(request, 'accounts/dashboard.html')

