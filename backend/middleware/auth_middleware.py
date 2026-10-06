import os
import jwt
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Get JWT secret from environment
SECRET_KEY = os.getenv("SECRET_KEY")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not configured in the .env file")


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        token = None

        auth_header = request.headers.get("Authorization")

        if auth_header:
            parts = auth_header.split(" ")

            if len(parts) == 2 and parts[0] == "Bearer":
                token = parts[1]

        if not token:
            return jsonify({
                "status": "error",
                "message": "Authentication token is required"
            }), 401

        try:
            decoded_token = jwt.decode(
                token,
                SECRET_KEY,
                algorithms=["HS256"]
            )

            request.user = decoded_token

        except jwt.ExpiredSignatureError:
            return jsonify({
                "status": "error",
                "message": "Token has expired"
            }), 401

        except jwt.InvalidTokenError:
            return jsonify({
                "status": "error",
                "message": "Invalid authentication token"
            }), 401

        return f(*args, **kwargs)

    return decorated


def role_required(required_role):

    def decorator(f):

        @wraps(f)
        def decorated(*args, **kwargs):

            if request.user.get("role") != required_role:
                return jsonify({
                    "status": "error",
                    "message": "Access denied"
                }), 403

            return f(*args, **kwargs)

        return decorated

    return decorator