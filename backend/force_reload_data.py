#!/usr/bin/env python3
"""
Force reload the dataset from CSV file.
Usage: python force_reload_data.py
"""
from pymongo import MongoClient
from config import Config
import pandas as pd
from utils import logger

def force_reload_dataset():
    """Clear existing data and reload from CSV."""
    
    # Connect to MongoDB
    client = MongoClient(Config.MONGO_URI)
    db = client['strokedb']
    patients_collection = db['patients']
    
    # Clear existing data
    print("🗑️  Clearing existing patient data...")
    result = patients_collection.delete_many({})
    print(f"   Deleted {result.deleted_count} existing records")
    
    # Load CSV file
    csv_path = 'healthcare-dataset-stroke-data.csv'
    print(f"\n📂 Loading dataset from {csv_path}...")
    
    try:
        df = pd.read_csv(csv_path)
        print(f"   Found {len(df)} records in CSV file")
        
        # Drop the 'id' column if it exists (we'll use MongoDB's _id)
        if 'id' in df.columns:
            df = df.drop(columns=['id'])
            print(f"   Dropped 'id' column (using MongoDB _id instead)")
        
        # Convert DataFrame to list of dictionaries
        records = df.to_dict('records')
        
        # Insert into MongoDB
        print(f"\n💾 Inserting {len(records)} records into MongoDB...")
        result = patients_collection.insert_many(records)
        print(f"   ✅ Successfully inserted {len(result.inserted_ids)} records")
        
        # Create indexes for better performance
        print(f"\n🔍 Creating indexes...")
        patients_collection.create_index("age")
        patients_collection.create_index("stroke")
        patients_collection.create_index("gender")
        print(f"   ✅ Indexes created on: age, stroke, gender")
        
        # Verify the data
        total_count = patients_collection.count_documents({})
        print(f"\n{'='*60}")
        print(f"✅ Dataset loaded successfully!")
        print(f"{'='*60}")
        print(f"Total records in database: {total_count}")
        
        # Show sample
        print(f"\n📋 Sample record:")
        sample = patients_collection.find_one()
        if sample:
            for key, value in sample.items():
                if key != '_id':
                    print(f"   {key}: {value}")
        
        logger.info(f"Dataset reloaded: {total_count} records")
        
    except FileNotFoundError:
        print(f"\n❌ Error: CSV file '{csv_path}' not found!")
        print("   Make sure the file is in the backend directory.")
    except Exception as e:
        print(f"\n❌ Error loading dataset: {e}")
        logger.error(f"Dataset reload failed: {e}")

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🔄 FORCE RELOAD DATASET")
    print("="*60 + "\n")
    force_reload_dataset()
    print("\n" + "="*60 + "\n")
