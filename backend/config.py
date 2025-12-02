import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-fallback-do-not-use-in-prod'
    MONGO_URI = os.environ.get('MONGO_URI')
    # Ethical: Ensure MONGO_URI uses secure connection (SRV)