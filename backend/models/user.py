from pymongo import MongoClient
from config import Config
import bcrypt  # Use direct bcrypt for secure hashing
from flask_login import UserMixin
from utils import validate_and_sanitize, logger  # Logger for secure events
from bson.objectid import ObjectId

client = MongoClient(Config.MONGO_URI)
db = client['strokedb']
users_collection = db['users']  # Separate collection: Isolates auth from health data for security

class MongoUser(UserMixin):
    """
    User model for Flask-Login.
    Ethical: Passwords hashed with bcrypt; no PII beyond username (demo only).
    """
    def __init__(self, user_id, username):
        self.id = user_id
        self.username = username

    @staticmethod
    def create(user_data):
        """Create user with validation and bcrypt hashing."""
        data = validate_and_sanitize(user_data)
        if 'username' not in data or 'password' not in data:
            raise ValueError("Username and password required.")
        if users_collection.find_one({"username": data["username"]}):  # Check uniqueness
            raise ValueError("Username already exists.")
        # Use bcrypt directly (secure, salted)
        password_bytes = data["password"].encode('utf-8')
        salt = bcrypt.gensalt()
        data["password_hash"] = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        del data["password"]  # Never store plain password
        result = users_collection.insert_one(data)
        logger.info(f"User created: {data['username']}")  # Now imports correctly
        return MongoUser(str(result.inserted_id), data['username'])

    @staticmethod
    def get_by_username(username):
        """Retrieve user for authentication."""
        user_doc = users_collection.find_one({"username": username})
        if user_doc:
            return MongoUser(str(user_doc["_id"]), user_doc["username"]), user_doc.get("password_hash")
        return None, None

    @staticmethod
    def get_by_id(user_id):
        """Loader for Flask-Login."""
        user_doc = users_collection.find_one({"_id": ObjectId(user_id)})
        if user_doc:
            return MongoUser(user_id, user_doc["username"])
        return None

    def check_password(self, password):
        """Verify hashed password with bcrypt."""
        user_doc = users_collection.find_one({"_id": ObjectId(self.id)})
        if not user_doc:
            return False
        password_bytes = password.encode('utf-8')
        hash_bytes = user_doc["password_hash"].encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)