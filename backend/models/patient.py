from pymongo import MongoClient, ASCENDING, DESCENDING
from config import Config
import pandas as pd
from utils import validate_and_sanitize, to_objectid, logger
from bson.objectid import ObjectId

client = MongoClient(Config.MONGO_URI)
db = client['strokedb']
patients_collection = db['patients']

class Patient:
    """Patient model with CRUD operations and paginated queries."""
    
    @staticmethod
    def create(data):
        data = validate_and_sanitize(data)
        required = ['gender', 'age', 'hypertension', 'heart_disease', 'ever_married', 'work_type', 
                    'Residence_type', 'avg_glucose_level', 'bmi', 'smoking_status', 'stroke']
        for field in required:
            if field not in data:
                from flask import abort
                abort(400, description=f"Missing required field: {field}")
        result = patients_collection.insert_one(data)
        logger.info("New patient record created.")
        return str(result.inserted_id)

    @staticmethod
    def read_all(skip=0, limit=20, sort_field='age', sort_order=1, query={}):
        """
        Fetch patients with pagination, sorting, and optional filtering.
        - skip: number of records to skip
        - limit: number of records to return
        - sort_field: field to sort
        - sort_order: 1=ascending, -1=descending
        - query: dict filter
        """
        sort = ASCENDING if sort_order == 1 else DESCENDING
        cursor = patients_collection.find(query).sort(sort_field, sort).skip(skip).limit(limit)
        return list(cursor)

    @staticmethod
    def count_all(query={}):
        """Count patients with optional filter."""
        return patients_collection.count_documents(query)

    @staticmethod
    def read_one(patient_id):
        return patients_collection.find_one({"_id": to_objectid(patient_id)})

    @staticmethod
    def update(patient_id, data):
        data = validate_and_sanitize(data)
        result = patients_collection.update_one(
            {"_id": to_objectid(patient_id)},
            {"$set": data}
        )
        if result.matched_count == 0:
            from flask import abort
            abort(404, description="Patient not found.")
        logger.info(f"Patient {patient_id} updated.")
        return result

    @staticmethod
    def delete(patient_id):
        result = patients_collection.delete_one({"_id": to_objectid(patient_id)})
        if result.deleted_count == 0:
            from flask import abort
            abort(404, description="Patient not found.")
        logger.info(f"Patient {patient_id} deleted.")
        return result

def load_dataset(csv_path='healthcare-dataset-stroke-data.csv'):
    if patients_collection.count_documents({}) > 0:
        print("Dataset already loaded. Skipping.")
        return
    try:
        df = pd.read_csv(csv_path)
        if 'id' in df.columns:
            df = df.drop(columns=['id'])
        records = df.to_dict('records')
        patients_collection.insert_many(records)
        print(f"Successfully loaded {len(records)} anonymized patient records.")
        patients_collection.create_index("age")
        patients_collection.create_index("stroke")
        logger.info("Dataset loaded with indexes for performance.")
    except FileNotFoundError:
        print("CSV not found. Download from Kaggle and place in root.")
    except Exception as e:
        logger.error(f"Load failed: {e}")
