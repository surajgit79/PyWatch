from app.utils.database import get_db_connection, close_db_connection
from datetime import datetime
from decimal import Decimal

class Card:

    @staticmethod
    def add_card(user_id, card_data):
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor()
        
        try:
            current_year = datetime.now().year
            initial_balance = float(card_data.get('current_balance', 0))
            credit_limit = float(card_data['credit_limit'])
            
            if initial_balance > credit_limit:
                return {'error': f'Initial balance (${initial_balance:.2f}) cannot exceed yearly limit (${credit_limit:.2f})'}
            
            cursor.execute(
                """INSERT INTO cards 
                (user_id, card_name, card_type, last_four_digits, credit_limit, 
                    current_balance, expiry_date, issuing_bank, card_color, 
                    total_loaded_this_year, year_started)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                (user_id, card_data['card_name'], card_data['card_type'],
                card_data['last_four_digits'], credit_limit,
                initial_balance, card_data['expiry_date'],
                card_data.get('issuing_bank'), card_data.get('card_color', '#10b981'),
                initial_balance, current_year)
            )
            
            card_id = cursor.lastrowid
            conn.commit()
            
            return Card.get_card_by_id(card_id, user_id)
            
        except Exception as e:
            conn.rollback()
            print(f"Error adding card: {e}")
            return None
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def get_user_cards(user_id):
        conn = get_db_connection()
        if not conn:
            return []
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                SELECT id, card_name, card_type, last_four_digits, credit_limit,
                       current_balance, expiry_date, issuing_bank, card_color, is_active
                FROM cards 
                WHERE user_id = %s AND is_active = TRUE
                ORDER BY created_at DESC
                """,
                (user_id,)
            )
            
            cards = cursor.fetchall()
            
            for card in cards:
                card['utilization'] = (card['current_balance'] / card['credit_limit'] * 100) if card['credit_limit'] > 0 else 0
                card['available_credit'] = card['credit_limit'] - card['current_balance']
            
            return cards
            
        except Exception as e:
            print(f"Error getting cards: {e}")
            return []
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def get_card_by_id(card_id, user_id):
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                SELECT * FROM cards 
                WHERE id = %s AND user_id = %s
                """,
                (card_id, user_id)
            )
            
            card = cursor.fetchone()
            
            if card:
                card['utilization'] = (card['current_balance'] / card['credit_limit'] * 100) if card['credit_limit'] > 0 else 0
                card['available_credit'] = card['credit_limit'] - card['current_balance']
            
            return card
            
        except Exception as e:
            print(f"Error getting card: {e}")
            return None
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def update_balance(card_id, user_id, new_balance):
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                UPDATE cards 
                SET current_balance = %s 
                WHERE id = %s AND user_id = %s
                """,
                (new_balance, card_id, user_id)
            )
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            print(f"Error updating balance: {e}")
            conn.rollback()
            return False
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def update_card(card_id, user_id, card_data):
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                UPDATE cards 
                SET card_name = %s, card_type = %s, last_four_digits = %s,
                    credit_limit = %s, expiry_date = %s, issuing_bank = %s, card_color = %s
                WHERE id = %s AND user_id = %s
                """,
                (
                    card_data.get('card_name'),
                    card_data.get('card_type'),
                    card_data.get('last_four_digits'),
                    card_data.get('credit_limit'),
                    card_data.get('expiry_date'),
                    card_data.get('issuing_bank'),
                    card_data.get('card_color'),
                    card_id,
                    user_id
                )
            )
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            print(f"Error updating card: {e}")
            conn.rollback()
            return False
            
        finally:
            close_db_connection(conn, cursor)
    
    @staticmethod
    def load_balance(card_id, user_id, amount):
        conn = get_db_connection()
        if not conn:
            return {'error': 'Database connection failed'}
        
        cursor = conn.cursor()
        amount = Decimal(amount)
        print(type(amount))
        try:
            current_year = datetime.now().year
            cursor.execute(
                """SELECT credit_limit, total_loaded_this_year, year_started, current_balance
                FROM cards WHERE id = %s AND user_id = %s""",
                (card_id, user_id)
            )
            card = cursor.fetchone()

            if not card:
                return {'error': 'Card not found'}
            
            total_loaded = card['total_loaded_this_year']
            print(f"total_loaded:{total_loaded}")
            if card['year_started'] < current_year:
                total_loaded = 0
                cursor.execute(
                    "UPDATE cards SET year_started = %s, total_loaded_this_year = 0 WHERE id = %s",
                    (current_year, card_id)
                )
            
            if total_loaded + amount > card['credit_limit']:
                remaining = card['credit_limit'] - total_loaded
                return {
                    'error': f'Yearly limit exceeded. You can only load ${remaining:.2f} more this year (Yearly limit: ${card["credit_limit"]:.2f})'
                }
            
            new_balance = card['current_balance'] + amount
            if new_balance > card['credit_limit']:
                max_loadable = card['credit_limit'] - card['current_balance']
                return {
                    'error': f'Cannot exceed card limit. You can load maximum ${max_loadable:.2f} more (Current: ${card["current_balance"]:.2f}, Limit: ${card["credit_limit"]:.2f})'
                }
            
            cursor.execute(
                """UPDATE cards 
                SET current_balance = current_balance + %s,
                    total_loaded_this_year = total_loaded_this_year + %s
                WHERE id = %s""",
                (amount, amount, card_id)
            )
            
            conn.commit()
            return {
                'success': True, 
                'new_balance': new_balance,
                'remaining_yearly_limit': card['credit_limit'] - (total_loaded + amount)
            }
            
        except Exception as e:
            conn.rollback()
            return {'error': str(e)}
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def get_limit_info(card_id, user_id):
        conn = get_db_connection()
        if not conn:
            return None
        
        cursor = conn.cursor()
        
        try:
            current_year = datetime.now().year
            
            cursor.execute(
                """SELECT credit_limit, total_loaded_this_year, year_started, current_balance
                FROM cards WHERE id = %s AND user_id = %s""",
                (card_id, user_id)
            )
            card = cursor.fetchone()
            
            if not card:
                return None
            
            total_loaded = card['total_loaded_this_year']
            if card['year_started'] < current_year:
                total_loaded = 0
            
            return {
                'yearly_limit': card['credit_limit'],
                'total_loaded_this_year': total_loaded,
                'remaining_yearly_limit': card['credit_limit'] - total_loaded,
                'current_balance': card['current_balance'],
                'available_to_load': min(
                    card['credit_limit'] - total_loaded,  # Remaining yearly
                    card['credit_limit'] - card['current_balance']  # Remaining on card
                )
            }
            
        finally:
            close_db_connection(conn, cursor)

    @staticmethod
    def delete_card(card_id, user_id):
        conn = get_db_connection()
        if not conn:
            return False
        
        cursor = conn.cursor()
        
        try:
            cursor.execute(
                """
                UPDATE cards 
                SET is_active = FALSE 
                WHERE id = %s AND user_id = %s
                """,
                (card_id, user_id)
            )
            
            conn.commit()
            return cursor.rowcount > 0
            
        except Exception as e:
            print(f"Error deleting card: {e}")
            conn.rollback()
            return False
            
        finally:
            close_db_connection(conn, cursor)
