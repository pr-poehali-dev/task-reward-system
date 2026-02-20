import json
import os
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для регистрации и авторизации пользователей (v3)'''
    
    print(f"[AUTH] Incoming request: method={event.get('httpMethod')}, headers={event.get('headers')}")
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return error_response('Database configuration error', 500)
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            print(f"[AUTH] POST request: action={action}, body_keys={list(body.keys())}")
            
            if action == 'register':
                return handle_register(cursor, conn, body)
            elif action == 'login':
                return handle_login(cursor, body)
            elif action == 'verify':
                return handle_verify(cursor, event)
            else:
                return error_response('Invalid action', 400)
        
        return error_response('Method not allowed', 405)
        
    except Exception as e:
        return error_response(str(e), 500)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def handle_register(cursor, conn, body: dict) -> dict:
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    username = body.get('username', '').strip()
    
    if not email or not password or not username:
        return error_response('Email, password and username are required', 400)
    
    if len(password) < 6:
        return error_response('Password must be at least 6 characters', 400)
    
    cursor.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cursor.fetchone():
        return error_response('User already exists', 400)
    
    password_hash = hash_password(password)
    
    cursor.execute(
        "INSERT INTO users (email, password_hash, username) VALUES (%s, %s, %s) RETURNING id, email, username",
        (email, password_hash, username)
    )
    user = cursor.fetchone()
    
    cursor.execute(
        "INSERT INTO earned_rewards (user_id, points, minutes, rubles) VALUES (%s, 0, 0, 0)",
        (user['id'],)
    )
    
    cursor.execute(
        "INSERT INTO categories (user_id, name, icon, color) VALUES "
        "(%s, 'Работа', 'Briefcase', 'bg-blue-500'), "
        "(%s, 'Личное', 'User', 'bg-green-500'), "
        "(%s, 'Здоровье', 'Heart', 'bg-red-500'), "
        "(%s, 'Обучение', 'BookOpen', 'bg-purple-500'), "
        "(%s, 'Дом', 'Home', 'bg-orange-500')",
        (user['id'], user['id'], user['id'], user['id'], user['id'])
    )
    
    cursor.execute(
        "INSERT INTO projects (user_id, name, icon, color) VALUES (%s, 'Главный проект', 'Folder', 'bg-blue-500') RETURNING id",
        (user['id'],)
    )
    
    conn.commit()
    
    token = generate_token(user['id'])
    
    return success_response({
        'user': {
            'id': user['id'],
            'email': user['email'],
            'username': user['username']
        },
        'token': token
    })

def handle_login(cursor, body: dict) -> dict:
    email = body.get('email', '').strip().lower()
    password = body.get('password', '')
    
    print(f"[LOGIN] Attempt for email: {email}")
    
    if not email or not password:
        print(f"[LOGIN] Missing credentials: email={bool(email)}, password={bool(password)}")
        return error_response('Email and password are required', 400)
    
    cursor.execute(
        "SELECT id, email, password_hash, username FROM users WHERE email = %s",
        (email,)
    )
    user = cursor.fetchone()
    
    print(f"[LOGIN] User found: {bool(user)}")
    
    if not user:
        print(f"[LOGIN] User not found for email: {email}")
        return error_response('Invalid email or password', 401)
    
    password_valid = verify_password(password, user['password_hash'])
    print(f"[LOGIN] Password valid: {password_valid}")
    
    if not password_valid:
        print(f"[LOGIN] Invalid password for email: {email}")
        return error_response('Invalid email or password', 401)
    
    token = generate_token(user['id'])
    print(f"[LOGIN] Success for user_id: {user['id']}, token generated")
    
    return success_response({
        'user': {
            'id': user['id'],
            'email': user['email'],
            'username': user['username']
        },
        'token': token
    })

def handle_verify(cursor, event: dict) -> dict:
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
    
    print(f"[VERIFY] Token from headers: {token[:20] if token else 'EMPTY'}...")
    
    if not token:
        print(f"[VERIFY] No token provided")
        return error_response('Token required', 401)
    
    user_id = verify_token(token)
    print(f"[VERIFY] Token decoded user_id: {user_id}")
    
    if not user_id:
        print(f"[VERIFY] Invalid token")
        return error_response('Invalid token', 401)
    
    cursor.execute(
        "SELECT id, email, username FROM users WHERE id = %s",
        (user_id,)
    )
    user = cursor.fetchone()
    
    print(f"[VERIFY] User found: {bool(user)}")
    
    if not user:
        print(f"[VERIFY] User not found for id: {user_id}")
        return error_response('User not found', 404)
    
    print(f"[VERIFY] Success for user: {user['email']}")
    return success_response({'user': dict(user)})

def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${pw_hash.hex()}"

def verify_password(password: str, password_hash: str) -> bool:
    try:
        salt, hash_hex = password_hash.split('$')
        pw_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return pw_hash.hex() == hash_hex
    except:
        return False

def generate_token(user_id: int) -> str:
    secret = os.environ.get('JWT_SECRET', 'default-secret-change-in-production')
    expiry = int((datetime.now() + timedelta(days=30)).timestamp())
    payload = f"{user_id}:{expiry}"
    signature = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
    return f"{payload}:{signature}"

def verify_token(token: str) -> int | None:
    try:
        secret = os.environ.get('JWT_SECRET', 'default-secret-change-in-production')
        payload, signature = token.rsplit(':', 1)
        expected_signature = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            return None
        
        user_id_str, expiry_str = payload.split(':')
        if int(expiry_str) < int(datetime.now().timestamp()):
            return None
        
        return int(user_id_str)
    except:
        return None

def success_response(data: dict) -> dict:
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps(data),
        'isBase64Encoded': False
    }

def error_response(message: str, status_code: int) -> dict:
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': message}),
        'isBase64Encoded': False
    }