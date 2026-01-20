import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для работы с задачами, проектами и категориями пользователя'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    user_id = get_user_id_from_token(event)
    if not user_id:
        return error_response('Unauthorized', 401)
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return error_response('Database configuration error', 500)
    
    try:
        conn = psycopg2.connect(dsn)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            return handle_get_all_data(cursor, user_id)
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            return handle_sync_data(cursor, conn, user_id, body)
        
        return error_response('Method not allowed', 405)
        
    except Exception as e:
        return error_response(str(e), 500)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def handle_get_all_data(cursor, user_id: int) -> dict:
    cursor.execute("SELECT * FROM categories WHERE user_id = %s ORDER BY created_at", (user_id,))
    categories = [dict(row) for row in cursor.fetchall()]
    
    cursor.execute("SELECT * FROM projects WHERE user_id = %s ORDER BY created_at", (user_id,))
    projects = [dict(row) for row in cursor.fetchall()]
    
    cursor.execute(
        "SELECT s.* FROM sections s "
        "JOIN projects p ON s.project_id = p.id "
        "WHERE p.user_id = %s ORDER BY s.created_at",
        (user_id,)
    )
    sections = [dict(row) for row in cursor.fetchall()]
    
    for project in projects:
        project['sections'] = [s for s in sections if s['project_id'] == project['id']]
    
    cursor.execute("SELECT * FROM tasks WHERE user_id = %s ORDER BY created_at DESC", (user_id,))
    tasks = []
    for row in cursor.fetchall():
        task = dict(row)
        if task['scheduled_date']:
            task['scheduled_date'] = task['scheduled_date'].isoformat()
        task['created_at'] = task['created_at'].isoformat()
        if task['completed_at']:
            task['completed_at'] = task['completed_at'].isoformat()
        tasks.append(task)
    
    cursor.execute("SELECT * FROM earned_rewards WHERE user_id = %s", (user_id,))
    rewards_row = cursor.fetchone()
    rewards = dict(rewards_row) if rewards_row else {'points': 0, 'minutes': 0, 'rubles': 0}
    
    cursor.execute(
        "SELECT * FROM activity_logs WHERE user_id = %s ORDER BY created_at DESC LIMIT 100",
        (user_id,)
    )
    activity_logs = []
    for row in cursor.fetchall():
        log = dict(row)
        log['created_at'] = log['created_at'].isoformat()
        activity_logs.append(log)
    
    return success_response({
        'categories': categories,
        'projects': projects,
        'tasks': tasks,
        'rewards': rewards,
        'activityLogs': activity_logs
    })

def handle_sync_data(cursor, conn, user_id: int, data: dict) -> dict:
    categories = data.get('categories', [])
    projects = data.get('projects', [])
    tasks = data.get('tasks', [])
    rewards = data.get('rewards', {})
    activity_logs = data.get('activityLogs', [])
    
    cursor.execute("SELECT id FROM categories WHERE user_id = %s", (user_id,))
    existing_cat_ids = set(row['id'] for row in cursor.fetchall())
    
    for cat in categories:
        if cat['id'] in existing_cat_ids:
            cursor.execute(
                "UPDATE categories SET name = %s, icon = %s, color = %s WHERE id = %s AND user_id = %s",
                (cat['name'], cat['icon'], cat['color'], cat['id'], user_id)
            )
        else:
            cursor.execute(
                "INSERT INTO categories (id, user_id, name, icon, color) VALUES (%s, %s, %s, %s, %s)",
                (cat['id'], user_id, cat['name'], cat['icon'], cat['color'])
            )
    
    cursor.execute("SELECT id FROM projects WHERE user_id = %s", (user_id,))
    existing_proj_ids = set(row['id'] for row in cursor.fetchall())
    
    for proj in projects:
        if proj['id'] in existing_proj_ids:
            cursor.execute(
                "UPDATE projects SET name = %s, icon = %s, color = %s WHERE id = %s AND user_id = %s",
                (proj['name'], proj['icon'], proj['color'], proj['id'], user_id)
            )
        else:
            cursor.execute(
                "INSERT INTO projects (id, user_id, name, icon, color) VALUES (%s, %s, %s, %s, %s)",
                (proj['id'], user_id, proj['name'], proj['icon'], proj['color'])
            )
        
        cursor.execute("SELECT id FROM sections WHERE project_id = %s", (proj['id'],))
        existing_section_ids = set(row['id'] for row in cursor.fetchall())
        
        for section in proj.get('sections', []):
            if section['id'] not in existing_section_ids:
                cursor.execute(
                    "INSERT INTO sections (id, project_id, name) VALUES (%s, %s, %s)",
                    (section['id'], proj['id'], section['name'])
                )
    
    cursor.execute("SELECT id FROM tasks WHERE user_id = %s", (user_id,))
    existing_task_ids = set(row['id'] for row in cursor.fetchall())
    
    for task in tasks:
        scheduled_date = task.get('scheduledDate')
        completed_at = task.get('completedAt')
        
        if task['id'] in existing_task_ids:
            cursor.execute(
                "UPDATE tasks SET title = %s, description = %s, category_id = %s, "
                "reward_type = %s, reward_amount = %s, completed = %s, "
                "scheduled_date = %s, completed_at = %s, project_id = %s, section_id = %s "
                "WHERE id = %s AND user_id = %s",
                (task['title'], task['description'], task['category'], 
                 task['rewardType'], task['rewardAmount'], task['completed'],
                 scheduled_date, completed_at, task['projectId'], task.get('sectionId'),
                 task['id'], user_id)
            )
        else:
            cursor.execute(
                "INSERT INTO tasks (id, user_id, project_id, section_id, category_id, "
                "title, description, reward_type, reward_amount, completed, scheduled_date, completed_at) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (task['id'], user_id, task['projectId'], task.get('sectionId'), task['category'],
                 task['title'], task['description'], task['rewardType'], task['rewardAmount'],
                 task['completed'], scheduled_date, completed_at)
            )
    
    cursor.execute(
        "INSERT INTO earned_rewards (user_id, points, minutes, rubles) "
        "VALUES (%s, %s, %s, %s) "
        "ON CONFLICT (user_id) DO UPDATE SET "
        "points = EXCLUDED.points, minutes = EXCLUDED.minutes, rubles = EXCLUDED.rubles",
        (user_id, rewards.get('points', 0), rewards.get('minutes', 0), rewards.get('rubles', 0))
    )
    
    for log in activity_logs[-50:]:
        cursor.execute(
            "INSERT INTO activity_logs (id, user_id, action, description, created_at) "
            "VALUES (%s, %s, %s, %s, %s) ON CONFLICT (id) DO NOTHING",
            (log['id'], user_id, log['action'], log['description'], log.get('timestamp'))
        )
    
    conn.commit()
    
    return success_response({'message': 'Data synced successfully'})

def get_user_id_from_token(event: dict) -> int | None:
    import hmac
    import hashlib
    from datetime import datetime
    
    token = event.get('headers', {}).get('X-Authorization', '').replace('Bearer ', '')
    if not token:
        return None
    
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