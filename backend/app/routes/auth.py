import re
from flask import Blueprint, request, jsonify
from app.utils.auth import generate_token, token_required
from app.services.email_service import send_verification_email

bp = Blueprint('auth', __name__)

@bp.route('/register', methods=['POST'])
def register():
    from app.models.user import User
    try:
        data = request.get_json()
        
        required_fields = ['email', 'password', 'full_name']
        for field in required_fields:
            if field not in data:
                print(f"[ERROR] Missing field: {field}")
                return jsonify({'error': f'{field} is required'}), 400
        
        password = data.get('password','')
        regexPass = regexPass = r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'
        
        if not re.match(regexPass, password):
            print(f"[ERROR] Password does not meet the requirements")
            return jsonify({'error': 'Password must be at least 8 characters long, include at least one digit, one uppercase letter, one lowercase letter, and one special character.'}), 400
            
        result = User.create_user(
            email=data['email'],
            password=data['password'],
            full_name=data['full_name']
        )
        
        if not result:
            print("[ERROR] User.create_user returned None")
            return jsonify({'error': 'Registration failed'}), 500
        
        if 'error' in result:
            print(f"[ERROR] User.create_user returned error: {result['error']}")
            return jsonify(result), 400
        
        try:
            send_verification_email( user_email=result['email'], verification_token=result['verification_token'])
            print("[DEBUG] Verification email sent")
        except Exception as email_error:
            print(f"[WARNING] Failed to send email: {email_error}")
        
        response_data = {
            'message': 'Registration successful! Please check your email to verify your account.',
            'user': {
                'id': result['id'],
                'email': result['email'],
                'full_name': result['full_name']
            }
        }
        return jsonify(response_data), 201  
    except Exception as e:
        print(f"[ERROR] Exception in register endpoint: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Registration failed'}), 500
    
@bp.route('/login', methods=['POST'])
def login():
    try:
        from app.models.user import User
        data = request.get_json()

        print(f"Received data: {data}")

        if 'email' not in data or 'password' not in data:
            return jsonify({'error':'Email and password are required'}),400
        
        user = User.verify_password(data['email'], data['password'])

        if not user:
            return jsonify({'error':'Invalid email or password'}), 401
        
        if isinstance(user, dict) and 'error' in user:
            return jsonify({'error' : user['error']}), 403
        
        token = generate_token(user['id'])

        return jsonify({
            'message':'Login Successful',
            'token': token,
            'user': {'id': user['id'], 'email':user['email'],'full_name': user['full_name'], 'is_verified': user['is_verified']}
        }), 200
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error':'Login failed'}),500
    
@bp.route('/verify-email', methods=['POST'])
def verify_email():
    try:
        from app.models.user import User
        data = request.get_json()
        
        if 'token' not in data:
            return jsonify({'error': 'Token is required'}), 400
        
        success = User.verify_email(data['token'])
        
        if success:
            return jsonify({'message': 'Email verified successfully!'}), 200
        else:
            return jsonify({'error': 'Invalid or expired verification token'}), 400
        
    except Exception as e:
        print(f"Verification error: {e}")
        return jsonify({'error': 'Verification failed'}), 500

@bp.route('/me', methods=['GET'])
@token_required
def get_current_user(user_id):
    try:
        from app.models.user import User
        user = User.get_user_by_id(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user}), 200
        
    except Exception as e:
        print(f"Get user error: {e}")
        return jsonify({'error': 'Failed to get user'}), 500
    