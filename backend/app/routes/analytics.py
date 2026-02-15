from flask import Blueprint, request, jsonify
from app.models.transaction import Transaction
from app.models.card import Card
from app.models.subscription import Subscription
from app.utils.auth import token_required

bp = Blueprint('analytics', __name__)

@bp.route('/dashboard', methods=['GET'])
@token_required
def get_dashboard_data(user_id):
    try:
        cards = Card.get_user_cards(user_id)
        
        all_transactions = Transaction.get_user_transactions(user_id)
        recent_transactions = all_transactions[:10] if all_transactions else []
        
        from datetime import datetime, date
        today = date.today()
        start_of_month = date(today.year, today.month, 1)
        
        spending_summary = Transaction.get_spending_summary(
            user_id,
            start_date=start_of_month.isoformat(),
            end_date=today.isoformat()
        )
        
        active_subscriptions = Subscription.get_user_subscriptions(user_id, status='active')
        
        subscription_summary = Subscription.get_subscription_summary(user_id)
        
        total_balance = sum(card['current_balance'] for card in cards)
        total_limit = sum(card['credit_limit'] for card in cards)
        total_available = total_limit - total_balance
        
        return jsonify({
            'cards': cards,
            'recent_transactions': recent_transactions,
            'spending_summary': spending_summary,
            'active_subscriptions': active_subscriptions[:5],  # Top 5
            'subscription_summary': subscription_summary,
            'totals': {
                'total_balance_usd': total_balance,
                'total_limit_usd': total_limit,
                'total_available_usd': total_available,
                'card_count': len(cards)
            }
        }), 200
        
    except Exception as e:
        print(f"Dashboard error: {e}")
        return jsonify({'error': 'Failed to get dashboard data'}), 500

@bp.route('/spending-trends', methods=['GET'])
@token_required
def get_spending_trends(user_id):
    try:
        from datetime import datetime, timedelta, date
        
        period = request.args.get('period', 'month')
        today = date.today()
        
        if period == 'week':
            start_date = today - timedelta(days=7)
        elif period == 'year':
            start_date = date(today.year, 1, 1)
        else:  # month
            start_date = date(today.year, today.month, 1)
        
        summary = Transaction.get_spending_summary(
            user_id,
            start_date=start_date.isoformat(),
            end_date=today.isoformat()
        )
        
        return jsonify({'trends': summary}), 200
        
    except Exception as e:
        print(f"Trends error: {e}")
        return jsonify({'error': 'Failed to get trends'}), 500