import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from app.config import Config

def generate_token(user_id):
    expiration = datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_HOURS)
    payload = {
        'user_id' : user_id,
        'exp': int(expiration.timestamp()),
        'iat': int(datetime.utcnow().timestamp()) # token issue time
    }

    token = jwt.encode(payload, 
                       Config.JWT_SECRET_KEY, 
                       algorithm = Config.JWT_ALGORITHM)
    
    return token

def verify_token(token):
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=[Config.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'error': 'Invalid token format. Expected "Bearer <token>"'}), 401
            
        if not token:
            return jsonify({'error': 'Token is missing'}), 401 

        payload = verify_token(token)

        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        return f(user_id=payload['user_id'], *args, **kwargs)
    
    return decorated
        