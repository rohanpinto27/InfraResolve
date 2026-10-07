import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from backend.config.database import get_db_connection
from backend.routes.auth import auth_bp
from backend.middleware.auth_middleware import token_required
from backend.routes.complaints import complaints_bp

load_dotenv()


app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
CORS(app)



app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(complaints_bp, url_prefix="/api/complaints")


@app.route("/")
def home():
    return "InfraResolve Backend is Running!"

@app.route("/api/protected")
@token_required
def protected():
    return jsonify({
        "status": "success",
        "message": "You accessed a protected API",
        "user": request.user
    })


@app.route("/api/health")
def health_check():
    return jsonify({
        "status": "success",
        "message": "InfraResolve API is healthy"
    })


@app.route("/api/db-test")
def database_test():
    try:
        connection = get_db_connection()

        if connection.is_connected():
            connection.close()

            return jsonify({
                "status": "success",
                "message": "MySQL database connection successful"
            })

    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)