import pytest
from app import app
from models.user import MongoUser, users_collection
from pymongo import MongoClient
from config import Config

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False  # Disable CSRF for tests
    with app.test_client() as client:
        yield client
    # Cleanup after each test - only delete test users, not all users
    mongo_client = MongoClient(Config.MONGO_URI)
    # Delete only test users created during tests
    mongo_client['strokedb']['users'].delete_one({"username": "testuser"})
    mongo_client['strokedb']['users'].delete_one({"username": "sunil"})

def test_register(client):
    """Test user registration."""
    data = {"username": "testuser", "password": "testpass123"}
    rv = client.post('/api/auth/register', json=data)
    assert rv.status_code == 201
    assert "registered" in rv.json["message"]

def test_login_success(client):
    """Test successful login."""
    # Register first
    client.post('/api/auth/register', json={"username": "sunil", "password": "123456789"})
    rv = client.post('/api/auth/login', json={"username": "sunil", "password": "123456789"})
    assert rv.status_code == 200

def test_login_fail(client):
    """Test failed login."""
    rv = client.post('/api/auth/login', json={"username": "nonexistent", "password": "wrong"})
    assert rv.status_code == 401