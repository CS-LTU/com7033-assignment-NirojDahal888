import pytest
from app import app
from models.patient import Patient, patients_collection
from models.user import MongoUser, users_collection
from pymongo import MongoClient
from config import Config
from bson import ObjectId
import json

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['WTF_CSRF_ENABLED'] = False
    with app.test_client() as client:
        # Create test user for auth
        test_user = MongoUser.create({"username": "testuser", "password": "testpass123"})
        # Login the test user properly
        client.post('/api/auth/login', json={"username": "testuser", "password": "testpass123"})
        yield client
    # Cleanup - only delete test user, not all users
    mongo_client = MongoClient(Config.MONGO_URI)
    mongo_client['strokedb']['users'].delete_one({"username": "testuser"})
    # Note: Test patients are cleaned by clear_db fixture

@pytest.fixture(autouse=True)
def clear_db():
    """Clear test patients before each test to ensure isolation."""
    # Clear test patients before each test
    patients_collection.delete_many({"test_record": True})
    yield
    # Cleanup test patients after each test
    patients_collection.delete_many({"test_record": True})

def test_create_patient(client):
    """Test create patient."""
    data = {
        "gender": "Male", "age": 50, "hypertension": 0, "heart_disease": 0, "ever_married": "Yes",
        "work_type": "Private", "Residence_type": "Urban", "avg_glucose_level": 100.5,
        "bmi": 25.0, "smoking_status": "Never smoked", "stroke": 0
    }
    rv = client.post('/api/patients', json=data)
    assert rv.status_code == 201
    assert "id" in rv.json
    
    # Mark as test record for cleanup
    pid = rv.json["id"]
    patients_collection.update_one({"_id": ObjectId(pid)}, {"$set": {"test_record": True}})

def test_read_all_patients(client):
    """Test read all."""
    # Create one
    create_data = {"gender": "Female", "age": 45, "hypertension": 1, "heart_disease": 0, "ever_married": "No",
                   "work_type": "Govt_job", "Residence_type": "Rural", "avg_glucose_level": 90.0,
                   "bmi": 22.0, "smoking_status": "Unknown", "stroke": 1}
    
    # Mark as test record and create
    patient_id = Patient.create(create_data)
    patients_collection.update_one({"_id": ObjectId(patient_id)}, {"$set": {"test_record": True}})
    
    rv = client.get('/api/patients?test_records_only=true')
    assert rv.status_code == 200
    # Check paginated response structure
    assert "patients" in rv.json
    assert "total" in rv.json
    assert rv.json["total"] == 1
    assert len(rv.json["patients"]) == 1

def test_update_patient(client):
    """Test update."""
    # Create
    create_data = {"gender": "Male", "age": 50, "hypertension": 0, "heart_disease": 0, "ever_married": "Yes",
                   "work_type": "Private", "Residence_type": "Urban", "avg_glucose_level": 100.5,
                   "bmi": 25.0, "smoking_status": "Never smoked", "stroke": 0}
    create_rv = client.post('/api/patients', json=create_data)
    pid = create_rv.json["id"]
    # Mark as test record
    patients_collection.update_one({"_id": ObjectId(pid)}, {"$set": {"test_record": True}})
    # Update
    update_data = {"age": 51}
    rv = client.put(f'/api/patients/{pid}', json=update_data)
    assert rv.status_code == 200
    assert rv.json["modified"] == 1

def test_delete_patient(client):
    """Test delete."""
    # Create
    create_data = {"gender": "Male", "age": 50, "hypertension": 0, "heart_disease": 0, "ever_married": "Yes",
                   "work_type": "Private", "Residence_type": "Urban", "avg_glucose_level": 100.5,
                   "bmi": 25.0, "smoking_status": "Never smoked", "stroke": 0}
    create_rv = client.post('/api/patients', json=create_data)
    pid = create_rv.json["id"]
    # Mark as test record
    patients_collection.update_one({"_id": ObjectId(pid)}, {"$set": {"test_record": True}})
    # Delete
    rv = client.delete(f'/api/patients/{pid}')
    assert rv.status_code == 200
    # Verify gone
    get_rv = client.get(f'/api/patients/{pid}')
    assert get_rv.status_code == 404