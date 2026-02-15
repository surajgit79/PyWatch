from app.utils.database import get_db_connection, close_db_connection
from datetime import datetime

def create_alert(user_id, alert_type, title, message, related_id=None):
    conn = get_db_connection()
    if not conn:
        return False
    
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            """
            INSERT INTO alerts (user_id, alert_type, title, message, related_id)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (user_id, alert_type, title, message, related_id)
        )
        
        conn.commit()
        return True
        
    except Exception as e:
        print(f"Error creating alert: {e}")
        conn.rollback()
        return False
        
    finally:
        close_db_connection(conn, cursor)

def get_user_alerts(user_id, unread_only=False):
    conn = get_db_connection()
    if not conn:
        return []
    
    cursor = conn.cursor()
    
    try:
        if unread_only:
            cursor.execute(
                """
                SELECT * FROM alerts 
                WHERE user_id = %s AND is_read = FALSE
                ORDER BY created_at DESC
                """,
                (user_id,)
            )
        else:
            cursor.execute(
                """
                SELECT * FROM alerts 
                WHERE user_id = %s
                ORDER BY created_at DESC
                """,
                (user_id,)
            )
        
        alerts = cursor.fetchall()
        return alerts
        
    except Exception as e:
        print(f"Error getting alerts: {e}")
        return []
        
    finally:
        close_db_connection(conn, cursor)

def mark_alert_as_read(alert_id, user_id):
    conn = get_db_connection()
    if not conn:
        return False
    
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            """
            UPDATE alerts 
            SET is_read = TRUE 
            WHERE id = %s AND user_id = %s
            """,
            (alert_id, user_id)
        )
        
        conn.commit()
        return True
        
    except Exception as e:
        print(f"Error marking alert as read: {e}")
        conn.rollback()
        return False
        
    finally:
        close_db_connection(conn, cursor)

def mark_all_alerts_as_read(user_id):
    conn = get_db_connection()
    if not conn:
        return False
    
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "UPDATE alerts SET is_read = TRUE WHERE user_id = %s",
            (user_id,)
        )
        
        conn.commit()
        return True
        
    except Exception as e:
        print(f"Error marking all alerts as read: {e}")
        conn.rollback()
        return False
        
    finally:
        close_db_connection(conn, cursor)

def delete_alert(alert_id, user_id):
    conn = get_db_connection()
    if not conn:
        return False
    
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            "DELETE FROM alerts WHERE id = %s AND user_id = %s",
            (alert_id, user_id)
        )
        
        conn.commit()
        return True
        
    except Exception as e:
        print(f"Error deleting alert: {e}")
        conn.rollback()
        return False
        
    finally:
        close_db_connection(conn, cursor)

def get_unread_count(user_id):
    conn = get_db_connection()
    if not conn:
        return 0
    
    cursor = conn.cursor()
    
    try:
        cursor.execute(
            """
            SELECT COUNT(*) as count 
            FROM alerts 
            WHERE user_id = %s AND is_read = FALSE
            """,
            (user_id,)
        )
        
        result = cursor.fetchone()
        return result[0] if result else 0
        
    except Exception as e:
        print(f"Error getting unread count: {e}")
        return 0
        
    finally:
        close_db_connection(conn, cursor)

def create_trial_ending_alert(user_id, subscription_id, service_name, days_remaining):
    title = f"Trial Ending Soon: {service_name}"
    message = f"Your {service_name} trial ends in {days_remaining} day(s). Cancel before you're charged!"
    
    return create_alert(
        user_id=user_id,
        alert_type='trial_ending',
        title=title,
        message=message,
        related_id=subscription_id
    )

def create_credit_limit_alert(user_id, card_id, card_name, utilization):
    title = f"Credit Limit Warning: {card_name}"
    message = f"Your {card_name} has reached {utilization}% of its credit limit."
    
    return create_alert(
        user_id=user_id,
        alert_type='credit_limit',
        title=title,
        message=message,
        related_id=card_id
    )

def create_subscription_renewal_alert(user_id, subscription_id, service_name, amount, date):
    title = f"Subscription Renewal: {service_name}"
    message = f"Your {service_name} subscription (${amount}) will renew on {date}."
    
    return create_alert(
        user_id=user_id,
        alert_type='subscription_renewal',
        title=title,
        message=message,
        related_id=subscription_id
    )

def create_price_change_alert(user_id, subscription_id, service_name, old_price, new_price):
    change = new_price - old_price
    title = f"Price Change: {service_name}"
    message = f"{service_name} price changed from ${old_price} to ${new_price} (${change:+.2f})."
    
    return create_alert(
        user_id=user_id,
        alert_type='price_change',
        title=title,
        message=message,
        related_id=subscription_id
    )