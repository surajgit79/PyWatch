from app.utils.database import get_db_connection, close_db_connection
from datetime import datetime, timedelta

class Subscription:
    
    @staticmethod
    def add_subscription(user_id, subscription_data):
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor()
        
        try:
            status = 'trial' if subscription_data.get('trial_end_date') else 'active'
            
            cursor.execute(
                """
                INSERT INTO subscriptions 
                (user_id, card_id, service_name, category, amount_usd, billing_cycle,
                 next_billing_date, trial_end_date, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    user_id,
                    subscription_data['card_id'],
                    subscription_data['service_name'],
                    subscription_data['category'],
                    subscription_data['amount_usd'],
                    subscription_data['billing_cycle'],
                    subscription_data['next_billing_date'],
                    subscription_data.get('trial_end_date'),
                    status
                )
            )
            
            subscription_id = cursor.lastrowid
            conn.commit()
            
            return Subscription.get_subscription_by_id(subscription_id, user_id)
            
        except Exception as e:
            print(f"Error adding subscription: {e}")
            conn.rollback()
            return None
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def get_user_subscriptions(user_id, status=None):
        conn = get_db_connection()
        if not conn:
            return []
        
        cursor = conn.cursor()
        
        try:
            query = """
                SELECT s.*, c.card_name, c.last_four_digits
                FROM subscriptions s
                JOIN cards c ON s.card_id = c.id
                WHERE s.user_id = %s
            """
            params = [user_id]
            
            if status:
                query += " AND s.status = %s"
                params.append(status)
            
            query += " ORDER BY s.next_billing_date ASC"
            
            cursor.execute(query, tuple(params))
            subscriptions = cursor.fetchall()
            
            today = datetime.now().date()
            for sub in subscriptions:
                if sub['trial_end_date']:
                    days_until_trial_end = (sub['trial_end_date'] - today).days
                    sub['days_until_trial_end'] = max(0, days_until_trial_end)
                
                days_until_renewal = (sub['next_billing_date'] - today).days
                sub['days_until_renewal'] = max(0, days_until_renewal)
            
            return subscriptions
            
        except Exception as e:
            print(f"Error getting subscriptions: {e}")
            return []
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def get_subscription_by_id(subscription_id, user_id):
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                SELECT s.*, c.card_name 
                FROM subscriptions s
                JOIN cards c ON s.card_id = c.id
                WHERE s.id = %s AND s.user_id = %s
                """,
                (subscription_id, user_id)
            )
            
            return cursor.fetchone()
            
        except Exception as e:
            print(f"Error getting subscription: {e}")
            return None
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def update_subscription(subscription_id, user_id, subscription_data):
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                UPDATE subscriptions 
                SET service_name = %s, category = %s, amount_usd = %s,
                    billing_cycle = %s, next_billing_date = %s, status = %s
                WHERE id = %s AND user_id = %s
                """,
                (
                    subscription_data.get('service_name'),
                    subscription_data.get('category'),
                    subscription_data.get('amount_usd'),
                    subscription_data.get('billing_cycle'),
                    subscription_data.get('next_billing_date'),
                    subscription_data.get('status'),
                    subscription_id,
                    user_id
                )
            )
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            print(f"Error updating subscription: {e}")
            conn.rollback()
            return False
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def cancel_subscription(subscription_id, user_id):
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                UPDATE subscriptions 
                SET status = 'cancelled' 
                WHERE id = %s AND user_id = %s
                """,
                (subscription_id, user_id)
            )
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            print(f"Error cancelling subscription: {e}")
            conn.rollback()
            return False
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def increment_usage(subscription_id, user_id):
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                UPDATE subscriptions 
                SET usage_count = usage_count + 1 
                WHERE id = %s AND user_id = %s
                """,
                (subscription_id, user_id)
            )
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            print(f"Error updating usage: {e}")
            conn.rollback()
            return False
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def get_subscription_summary(user_id):
        conn = get_db_connection()
        if not conn:
            return {}
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                SELECT * FROM subscriptions 
                WHERE user_id = %s AND status IN ('active', 'trial')
                """,
                (user_id,)
            )
            
            subscriptions = cursor.fetchall()
            
            monthly_cost = 0
            yearly_cost = 0
            
            for sub in subscriptions:
                amount = sub['amount_usd']
                cycle = sub['billing_cycle']
                
                if cycle == 'monthly':
                    monthly_cost += amount
                    yearly_cost += amount * 12
                elif cycle == 'yearly':
                    yearly_cost += amount
                    monthly_cost += amount / 12
                elif cycle == 'weekly':
                    monthly_cost += amount * 4.33
                    yearly_cost += amount * 52
                elif cycle == 'quarterly':
                    monthly_cost += amount / 3
                    yearly_cost += amount * 4
            
            today = datetime.now().date()
            trials_ending_soon = [
                sub for sub in subscriptions 
                if sub['trial_end_date'] and (sub['trial_end_date'] - today).days <= 7
            ]
            
            return {
                'total_subscriptions': len(subscriptions),
                'monthly_cost_usd': round(monthly_cost, 2),
                'yearly_cost_usd': round(yearly_cost, 2),
                'trials_ending_soon': len(trials_ending_soon),
                'trial_details': trials_ending_soon
            }
            
        except Exception as e:
            print(f"Error getting summary: {e}")
            return {}
            
        finally:
            close_db_connection(conn, cursor)

    