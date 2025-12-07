#!/usr/bin/env python3
"""
Script to verify dataset is loaded and display sample data from MongoDB.
Usage: python verify_data.py
"""
from models.patient import Patient, patients_collection
from pymongo import MongoClient
from config import Config
import json

def verify_and_display_data():
    """Verify dataset is loaded and display statistics."""
    
    # Connect to MongoDB
    client = MongoClient(Config.MONGO_URI)
    db = client['strokedb']
    collection = db['patients']
    
    # Get total count
    total_count = collection.count_documents({})
    print(f"\n{'='*60}")
    print(f"📊 DATASET VERIFICATION")
    print(f"{'='*60}")
    print(f"✅ Total patients in database: {total_count}")
    
    if total_count == 0:
        print("\n❌ No data found in database!")
        print("Run 'python load_data.py' to load the dataset.")
        return
    
    # Display first 5 records
    print(f"\n{'='*60}")
    print(f"📋 SAMPLE PATIENT RECORDS (First 5)")
    print(f"{'='*60}\n")
    
    sample_patients = list(collection.find().limit(5))
    for i, patient in enumerate(sample_patients, 1):
        print(f"Patient {i}:")
        print(f"  ID: {patient.get('_id')}")
        print(f"  Gender: {patient.get('gender')}")
        print(f"  Age: {patient.get('age')}")
        print(f"  Hypertension: {patient.get('hypertension')}")
        print(f"  Ever Married: {patient.get('ever_married')}")
        print(f"  Work Type: {patient.get('work_type')}")
        print(f"  Residence Type: {patient.get('Residence_type')}")
        print(f"  Avg Glucose Level: {patient.get('avg_glucose_level')}")
        print(f"  BMI: {patient.get('bmi')}")
        print(f"  Smoking Status: {patient.get('smoking_status')}")
        print(f"  Stroke: {patient.get('stroke')}")
        print()
    
    # Display statistics
    print(f"{'='*60}")
    print(f"📈 DATASET STATISTICS")
    print(f"{'='*60}\n")
    
    # Gender distribution
    male_count = collection.count_documents({"gender": "Male"})
    female_count = collection.count_documents({"gender": "Female"})
    other_count = collection.count_documents({"gender": "Other"})
    print(f"Gender Distribution:")
    print(f"  Male: {male_count}")
    print(f"  Female: {female_count}")
    print(f"  Other: {other_count}")
    
    # Stroke distribution
    stroke_yes = collection.count_documents({"stroke": 1})
    stroke_no = collection.count_documents({"stroke": 0})
    print(f"\nStroke Distribution:")
    print(f"  Had Stroke: {stroke_yes} ({stroke_yes/total_count*100:.2f}%)")
    print(f"  No Stroke: {stroke_no} ({stroke_no/total_count*100:.2f}%)")
    
    # Hypertension distribution
    hypertension_yes = collection.count_documents({"hypertension": 1})
    hypertension_no = collection.count_documents({"hypertension": 0})
    print(f"\nHypertension Distribution:")
    print(f"  Has Hypertension: {hypertension_yes} ({hypertension_yes/total_count*100:.2f}%)")
    print(f"  No Hypertension: {hypertension_no} ({hypertension_no/total_count*100:.2f}%)")
    
    # Age statistics
    pipeline = [
        {
            "$group": {
                "_id": None,
                "avg_age": {"$avg": "$age"},
                "min_age": {"$min": "$age"},
                "max_age": {"$max": "$age"}
            }
        }
    ]
    age_stats = list(collection.aggregate(pipeline))
    if age_stats:
        stats = age_stats[0]
        print(f"\nAge Statistics:")
        print(f"  Average Age: {stats['avg_age']:.2f} years")
        print(f"  Minimum Age: {stats['min_age']} years")
        print(f"  Maximum Age: {stats['max_age']} years")
    
    # Work type distribution
    print(f"\nWork Type Distribution:")
    work_types = collection.distinct("work_type")
    for work_type in work_types:
        count = collection.count_documents({"work_type": work_type})
        print(f"  {work_type}: {count}")
    
    # Smoking status distribution
    print(f"\nSmoking Status Distribution:")
    smoking_statuses = collection.distinct("smoking_status")
    for status in smoking_statuses:
        count = collection.count_documents({"smoking_status": status})
        print(f"  {status}: {count}")
    
    print(f"\n{'='*60}")
    print(f"✅ Dataset verification complete!")
    print(f"{'='*60}\n")
    
    # Test fetching with pagination
    print(f"{'='*60}")
    print(f"🔍 TESTING PAGINATION (Page 1, 10 records)")
    print(f"{'='*60}\n")
    
    paginated_patients = Patient.read_all(skip=0, limit=10, sort_field='age', sort_order=1)
    print(f"Retrieved {len(paginated_patients)} patients (sorted by age)")
    for i, patient in enumerate(paginated_patients, 1):
        print(f"{i}. Age: {patient.get('age')}, Gender: {patient.get('gender')}, Stroke: {patient.get('stroke')}")
    
    print(f"\n{'='*60}")
    print(f"✅ All data fetched successfully from MongoDB!")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    try:
        verify_and_display_data()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("1. MongoDB is running and accessible")
        print("2. .env file is configured with correct MONGO_URI")
        print("3. Dataset is loaded (run 'python load_data.py')")
