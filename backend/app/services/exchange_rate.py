import requests
from datetime import date
from app.config import Config
from app.utils.database import get_db_connection, close_db_connection

def fetch_current_exchange_rate():
    try:
        api_key = Config.EXCHANGE_RATE_API_KEY
        api_url = f"{Config.EXCHANGE_RATE_API_URL}/{api_key}/latest/USD"
        
        response = requests.get(api_url, timeout=10)
        response.raise_for_status() 
        
        data = response.json()
        npr_rate = data['conversion_rates']['NPR']
        print(f"rate: {npr_rate}")
        
        return float(npr_rate)
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching exchange rate: {e}")
        return None
    except KeyError as e:
        print(f"Error parsing exchange rate data: {e}")
        return None

def save_exchange_rate(rate):
    conn = get_db_connection()
    if not conn:
        return False
    
    cursor = conn.cursor()
    
    try:
        today = date.today()
        cursor.execute(
            "SELECT id FROM exchange_rates WHERE fetch_date = %s",
            (today,)
        )
        existing = cursor.fetchone()
        
        if existing:
            cursor.execute(
                "UPDATE exchange_rates SET rate = %s WHERE fetch_date = %s",
                (rate, today)
            )
        else:
            cursor.execute(
                "INSERT INTO exchange_rates (rate, fetch_date) VALUES (%s, %s)",
                (rate, today)
            )
        
        conn.commit()
        return True
        
    except Exception as e:
        print(f"Error saving exchange rate: {e}")
        conn.rollback() 
        return False
        
    finally:
        close_db_connection(conn, cursor)

def get_latest_exchange_rate():
    conn = get_db_connection()
    if not conn:
        return 133.0  # Fallback rate if database unavailable
    
    cursor = conn.cursor()
    
    try:
        today = date.today()
        cursor.execute(
            "SELECT rate FROM exchange_rates WHERE fetch_date = %s",
            (today,)
        )
        result = cursor.fetchone()
        print(f"{result}:cp1")
        
        if result:
            return float(result['rate'])
        else:
            new_rate = fetch_current_exchange_rate()
            
            if new_rate:
                save_exchange_rate(new_rate)
                return new_rate
            else:
                cursor.execute(
                    "SELECT rate FROM exchange_rates ORDER BY fetch_date DESC LIMIT 1"
                )
                fallback = cursor.fetchone()
                return float(fallback[0]) if fallback else 133.0
                
    except Exception as e:
        print(f"Error getting exchange rate: {e}")
        return 133.0  # Fallback rate
        
    finally:
        close_db_connection(conn, cursor)