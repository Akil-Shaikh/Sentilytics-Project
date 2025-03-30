import re

def is_valid_password(password):
    """Validate password strength"""
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if not any(char.isupper() for char in password):
        return "Password must contain at least one uppercase letter."
    if not any(char.islower() for char in password):
        return "Password must contain at least one lowercase letter."
    if not any(char.isdigit() for char in password):
        return "Password must contain at least one number."
    return None

def is_valid_username(username):
    """Validate username format"""
    if len(username) < 4:
        return "Username must be at least 4 characters long."
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return "Username can only contain letters, numbers, and underscores (_)."
    return None

def is_valid_email(email):
    """Validate email format"""
    if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", email):
        return "Invalid email format."
    return None