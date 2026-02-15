import bcrypt
from app.utils.database import get_db_connection, close_db_connection
import secrets

class User:

    @staticmethod
    def create_user(email, password, full_name):
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor()

        try:
            cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cursor.fetchone():
                return {'error': 'Email already exists'}
            
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            verification_token = secrets.token_urlsafe(32)

            cursor.execute(
                """
                INSERT INTO users (email, password_hash, full_name, verification_token)
                VALUES (%s, %s, %s, %s)
                """,
                (email, password_hash, full_name, verification_token)
            )
            
            user_id = cursor.lastrowid
            conn.commit()
            return {
                'id': user_id,
                'email': email,
                'full_name': full_name,
                'verification_token': verification_token
            }
            
        except Exception as e:
            print(f"Error creating user: {e}")
            conn.rollback()
            return None
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def verify_password(email, password):
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "SELECT id, email, password_hash, full_name, is_verified FROM users WHERE email = %s",
                (email,)
            )
            user = cursor.fetchone()
            
            if not user:
                return None  # User not found
            
            if not user['is_verified']:
                return {'error': 'Please verify your email before logging in'}
            
            if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                return {
                    'id': user['id'],
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'is_verified': user['is_verified']
                }
            else:
                return None  # Wrong password
                
        except Exception as e:
            print(f"Error verifying password: {e}")
            return None
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def get_user_by_id(user_id):
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "SELECT id, email, full_name, is_verified FROM users WHERE id = %s",
                (user_id,)
            )
            return cursor.fetchone()
            
        except Exception as e:
            print(f"Error getting user: {e}")
            return None
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def verify_email(verification_token):
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                UPDATE users 
                SET is_verified = TRUE, verification_token = NULL 
                WHERE verification_token = %s
                """,
                (verification_token,)
            )
            
            conn.commit()
            return cursor.rowcount > 0  # True if a row was updated
            
        except Exception as e:
            print(f"Error verifying email: {e}")
            conn.rollback()
            return False
            
        finally:
            close_db_connection(conn, cursor)
