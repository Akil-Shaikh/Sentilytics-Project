from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import userSerializer
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token

@api_view(['POST', 'GET'])
def register(request):
    if request.method == "GET":
        users = User.objects.all()
        serialized = userSerializer(users, many=True)
        return Response(serialized.data)

    elif request.method == "POST":
        data = request.data
        if User.objects.filter(username=data.get("username")).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=data.get("email")).exists():
            return Response({"error": "Email already registered"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=data.get("username"),
            email=data.get("email"),
            password=data.get("password")
        )
        token, created = Token.objects.get_or_create(user=user)
        return Response({"success": "Registered successfully", "token": token.key})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    request.user.auth_token.delete()
    return Response({"success": "Logged out successfully"})
