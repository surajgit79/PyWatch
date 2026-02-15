from app.utils.database import get_db_connection, close_db_connection
from app.services.exchange_rate import get_latest_exchange_rate
from datetime import datetime

class Transaction:
    """Handles transaction-related database operations."""
    
    @staticmethod
    def add_transaction(user_id, transaction_data):
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor()
        
        try:
            cursor.execute("SELECT current_balance FROM cards where id =%s AND user_id = %s",
                           (transaction_data['card_id'], user_id))

            card = cursor.fetchone()

            if not card:
                return {'error': 'Card not found'}

            if transaction_data['transaction_type'] != 'refund' and float(transaction_data['amount_usd'] > card['current_balance']):
                return{
                    'error' : f'Insufficient balance on this card. Card balance: ${card['current_balance']:.2f}. Please load this card or use another card.'
                }    


            exchange_rate = get_latest_exchange_rate()
            amount_usd = float(transaction_data['amount_usd'])
            amount_npr = amount_usd * exchange_rate
            cursor.execute(
                """
                INSERT INTO transactions 
                (user_id, card_id, transaction_type, merchant_name, amount_usd, amount_npr,
                 exchange_rate, category, description, transaction_date, is_recurring)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    user_id,
                    transaction_data['card_id'],
                    transaction_data['transaction_type'],
                    transaction_data['merchant_name'],
                    amount_usd,
                    amount_npr,
                    exchange_rate,
                    transaction_data['category'],
                    transaction_data.get('description'),
                    transaction_data['transaction_date'],
                    transaction_data.get('is_recurring', False)
                )
            )
            
            transaction_id = cursor.lastrowid
            amount = float(transaction_data['amount_usd'])

            if transaction_data['transaction_type'] == 'refund':
                cursor.execute(
                    "UPDATE cards SET current_balance = current_balance + %s WHERE id = %s",
                    (amount, transaction_data['card_id'])
                )
            else:
                cursor.execute(
                    "UPDATE cards SET current_balance = current_balance - %s WHERE id = %s",
                    (amount, transaction_data['card_id'])
                )
            
            conn.commit()
            
            return Transaction.get_transaction_by_id(transaction_id, user_id)
            
        except Exception as e:
            print(f"Error adding transaction: {e}")
            conn.rollback()
            return None
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def get_user_transactions(user_id, filters=None):
        conn = get_db_connection()
        if not conn:
            return []
        
        cursor = conn.cursor()
        
        try:
            query = """
                SELECT t.*, c.card_name, c.last_four_digits
                FROM transactions t
                JOIN cards c ON t.card_id = c.id
                WHERE t.user_id = %s
            """
            params = [user_id]
            if filters:
                if 'card_id' in filters:
                    query += " AND t.card_id = %s"
                    params.append(filters['card_id'])
                
                if 'category' in filters:
                    query += " AND t.category = %s"
                    params.append(filters['category'])
                
                if 'transaction_type' in filters:
                    query += " AND t.transaction_type = %s"
                    params.append(filters['transaction_type'])
                
                if 'start_date' in filters:
                    query += " AND t.transaction_date >= %s"
                    params.append(filters['start_date'])
                
                if 'end_date' in filters:
                    query += " AND t.transaction_date <= %s"
                    params.append(filters['end_date'])
            
            query += " ORDER BY t.transaction_date DESC"
            
            cursor.execute(query, tuple(params))
            return cursor.fetchall()
            
        except Exception as e:
            print(f"Error getting transactions: {e}")
            return []
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def get_transaction_by_id(transaction_id, user_id):
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                SELECT t.*, c.card_name 
                FROM transactions t
                JOIN cards c ON t.card_id = c.id
                WHERE t.id = %s AND t.user_id = %s
                """,
                (transaction_id, user_id)
            )
            
            return cursor.fetchone()
            
        except Exception as e:
            print(f"Error getting transaction: {e}")
            return None
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def get_spending_summary(user_id, start_date=None, end_date=None):
        conn = get_db_connection()
        if not conn:
            return {}
        
        cursor = conn.cursor()
        
        try:
            query = "SELECT * FROM transactions WHERE user_id = %s"
            params = [user_id]
            
            if start_date:
                query += " AND transaction_date >= %s"
                params.append(start_date)
            
            if end_date:
                query += " AND transaction_date <= %s"
                params.append(end_date)
            
            cursor.execute(query, tuple(params))
            transactions = cursor.fetchall()
            
            # Calculate totals
            total_usd = sum(t['amount_usd'] for t in transactions)
            total_npr = sum(t['amount_npr'] for t in transactions)
            
            # By category
            by_category = {}
            for t in transactions:
                cat = t['category']
                if cat not in by_category:
                    by_category[cat] = {'usd': 0, 'npr': 0, 'count': 0}
                by_category[cat]['usd'] += t['amount_usd']
                by_category[cat]['npr'] += t['amount_npr']
                by_category[cat]['count'] += 1
            
            # By card
            by_card = {}
            for t in transactions:
                card_id = t['card_id']
                if card_id not in by_card:
                    by_card[card_id] = {'usd': 0, 'npr': 0, 'count': 0}
                by_card[card_id]['usd'] += t['amount_usd']
                by_card[card_id]['npr'] += t['amount_npr']
                by_card[card_id]['count'] += 1
            
            return {
                'total_usd': total_usd,
                'total_npr': total_npr,
                'transaction_count': len(transactions),
                'by_category': by_category,
                'by_card': by_card
            }
            
        except Exception as e:
            print(f"Error getting summary: {e}")
            return {}
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def delete_transaction(transaction_id, user_id):
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                "SELECT card_id, amount_usd FROM transactions WHERE id = %s AND user_id = %s",
                (transaction_id, user_id)
            )
            transaction = cursor.fetchone()
            
            if not transaction:
                return False
            
            cursor.execute(
                "DELETE FROM transactions WHERE id = %s AND user_id = %s",
                (transaction_id, user_id)
            )
            
            cursor.execute(
                """
                UPDATE cards 
                SET current_balance = current_balance - %s 
                WHERE id = %s
                """,
                (transaction['amount_usd'], transaction['card_id'])
            )
            
            conn.commit()
            return True
            
        except Exception as e:
            print(f"Error deleting transaction: {e}")
            conn.rollback()
            return False
            
        finally:
            close_db_connection(conn, cursor)