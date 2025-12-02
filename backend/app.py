from flask import Flask, jsonify, request, redirect, url_for
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_wtf.csrf import CSRFProtect
from flask_cors import CORS
from config import Config
from models.user import MongoUser
from models.predictor import stroke_predictor

from models.patient import Patient
from utils import secure_route, validate_and_sanitize, logger
from bson import ObjectId
import re
import math

# ==========================
# Initialize Flask App
# ==========================
app = Flask(__name__)
app.config.from_object(Config)

# --------------------------
# Secret key for sessions
# --------------------------
app.config['SECRET_KEY'] = "your_super_secret_key_here"

# --------------------------
# Session / Cookie Settings (dev localhost)
# --------------------------
app.config['SESSION_COOKIE_NAME'] = "session"
app.config['SESSION_COOKIE_HTTPONLY'] = True      # JS cannot access
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'     # Works for localhost cross-site POST
app.config['SESSION_COOKIE_SECURE'] = False       # HTTP dev only, set True in production

# ==========================
# Enable CORS for React frontend
# ==========================
CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
)

# ==========================
# CSRF Protection
# ==========================
csrf = CSRFProtect(app)

# ==========================
# Login Manager Setup
# ==========================
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = None  # API-only

@login_manager.user_loader
def load_user(user_id):
    return MongoUser.get_by_id(user_id)

@login_manager.unauthorized_handler
def unauthorized():
    if 'api' in request.path or request.headers.get('Accept') == 'application/json':
        return jsonify({"error": "Unauthorized - please log in"}), 401
    return redirect(url_for(login_manager.login_view))

# ==========================
# Helper: Get POST data (JSON or Form)
# ==========================
def get_post_data():
    """
    Returns POST data from request.
    Accepts JSON or form-encoded data.
    """
    if request.is_json:
        return validate_and_sanitize(request.get_json() or {})
    else:
        return validate_and_sanitize(request.form.to_dict())

# ==========================
# AUTH ROUTES
# ==========================
@app.route('/api/auth/register', methods=['POST'])
@secure_route
@csrf.exempt
def register():
    data = get_post_data()
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    # Validate username
    if not re.match(r'^[A-Za-z0-9]+$', username):
        return jsonify({"error": "Username can only contain alphabets and numbers."}), 400

    try:
        user = MongoUser.create(data)
        login_user(user)
        return jsonify({"message": "User registered and logged in"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/auth/login', methods=['POST'])
@secure_route
@csrf.exempt
def login():
    data = get_post_data()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    user, _ = MongoUser.get_by_username(username)
    if user and user.check_password(password):
        login_user(user)
        return jsonify({"message": "Logged in successfully"}), 200

    return jsonify({"error": "Invalid credentials"}), 401

@app.route('/api/auth/logout', methods=['POST'])
@login_required
@secure_route
@csrf.exempt
def logout():
    logout_user()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/auth/current_user', methods=['GET'])
@login_required
@secure_route
def get_current_user():
    user = current_user
    if user:
        return jsonify({"user": {"username": user.username}}), 200
    return jsonify({"user": None}), 200



# ==========================
# RUN APP
# ==========================
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
