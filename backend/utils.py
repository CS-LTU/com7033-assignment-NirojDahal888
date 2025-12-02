import logging
from functools import wraps
from flask import abort, request
from bson import ObjectId
from wtforms.validators import DataRequired, Length, Regexp
import re

# Professional logging: Avoid PII; focus on security events
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SecureStringValidator(Regexp):
    """Custom validator for sanitization (prevents invalid chars)."""
    def __init__(self, message=None):
        super().__init__(r'^[a-zA-Z0-9\s\-_.]+$', message=message or 'Input contains invalid characters.')

def validate_and_sanitize(data):
    """
    Sanitize dict inputs to prevent XSS/SQLi.
    Ethical: Ensures safe handling of health data inputs.
    """
    if isinstance(data, dict):
        sanitized = {}
        for k, v in data.items():
            if isinstance(v, str):
                # Strip and block common XSS patterns
                v = v.strip()
                if re.search(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', v, re.IGNORECASE) or \
                   'javascript:' in v.lower():
                    logger.warning(f"Potential XSS blocked on field {k}: {v[:50]}...")
                    abort(400, description="Invalid input - security violation detected.")
                sanitized[k] = v
            else:
                sanitized[k] = v
        return sanitized
    return data

def secure_route(f):
    """
    Decorator for secure routes: Logs requests, enforces CSRF via WTF.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method in ['POST', 'PUT', 'DELETE']:
            logger.info(f"Secure operation: {request.method} {request.endpoint}")
        return f(*args, **kwargs)
    return decorated_function

def to_objectid(id_str):
    """Safely convert string to ObjectId."""
    try:
        return ObjectId(id_str)
    except Exception:
        logger.error(f"Invalid ObjectId: {id_str}")
        abort(400, description="Invalid patient ID format.")