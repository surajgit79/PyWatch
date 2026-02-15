from flask import Blueprint, request, jsonify
from app.models.subscription import Subscription
from app.utils.auth import token_required
from datetime import datetime, date

bp = Blueprint('subscriptions', __name__)

@bp.route('', methods=['GET'])
@token_required
def get_subscriptions(user_id):
    try:
        status = request.args.get('status')
        subscriptions = Subscription.get_user_subscriptions(user_id, status)
        
        return jsonify({'subscriptions': subscriptions}), 200
        
    except Exception as e:
        print(f"Get subscriptions error: {e}")
        return jsonify({'error': 'Failed to get subscriptions'}), 500

@bp.route('/<int:subscription_id>', methods=['GET'])
@token_required
def get_subscription(user_id, subscription_id):
    try:
        subscription = Subscription.get_subscription_by_id(subscription_id, user_id)
        
        if not subscription:
            return jsonify({'error': 'Subscription not found'}), 404
        
        return jsonify({'subscription': subscription}), 200
        
    except Exception as e:
        print(f"Get subscription error: {e}")
        return jsonify({'error': 'Failed to get subscription'}), 500

@bp.route('', methods=['POST'])
@token_required
def add_subscription(user_id):
    try:
        data = request.get_json()
        
        required = ['card_id', 'service_name', 'category', 'amount_usd', 'billing_cycle', 'next_billing_date']
        for field in required:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
            
        next_billing = datetime.strptime(data['next_billing_date'], '%Y-%m-%d').date()
        if next_billing < date.today():
            return jsonify({'error': 'Next billing date cannot be in the past'}), 400
        
        if data.get('trial_end_date'):
            trial_end = datetime.strptime(data['trial_end_date'], '%Y-%m-%d').date()
            if trial_end < date.today():
                return jsonify({'error': 'Trial end date cannot be in the past'}), 400
        
        subscription = Subscription.add_subscription(user_id, data)
        
        if not subscription:
            return jsonify({'error': 'Failed to add subscription'}), 500
        
        return jsonify({
            'message': 'Subscription added successfully',
            'subscription': subscription
        }), 201
        
    except Exception as e:
        print(f"Add subscription error: {e}")
        return jsonify({'error': 'Failed to add subscription'}), 500

@bp.route('/<int:subscription_id>', methods=['PUT'])
@token_required
def update_subscription(user_id, subscription_id):
    try:
        data = request.get_json()
        
        success = Subscription.update_subscription(subscription_id, user_id, data)
        
        if not success:
            return jsonify({'error': 'Failed to update subscription'}), 400
        
        return jsonify({'message': 'Subscription updated successfully'}), 200
        
    except Exception as e:
        print(f"Update subscription error: {e}")
        return jsonify({'error': 'Failed to update subscription'}), 500

@bp.route('/<int:subscription_id>/cancel', methods=['POST'])
@token_required
def cancel_subscription(user_id, subscription_id):
    try:
        success = Subscription.cancel_subscription(subscription_id, user_id)
        
        if not success:
            return jsonify({'error': 'Failed to cancel subscription'}), 400
        
        return jsonify({'message': 'Subscription cancelled successfully'}), 200
        
    except Exception as e:
        print(f"Cancel subscription error: {e}")
        return jsonify({'error': 'Failed to cancel subscription'}), 500

@bp.route('/<int:subscription_id>/usage', methods=['POST'])
@token_required
def increment_usage(user_id, subscription_id):
    try:
        success = Subscription.increment_usage(subscription_id, user_id)
        
        if not success:
            return jsonify({'error': 'Failed to update usage'}), 400
        
        return jsonify({'message': 'Usage updated successfully'}), 200
        
    except Exception as e:
        print(f"Update usage error: {e}")
        return jsonify({'error': 'Failed to update usage'}), 500

@bp.route('/summary', methods=['GET'])
@token_required
def get_summary(user_id):
    try:
        summary = Subscription.get_subscription_summary(user_id)
        
        return jsonify({'summary': summary}), 200
        
    except Exception as e:
        print(f"Get summary error: {e}")
        return jsonify({'error': 'Failed to get summary'}), 500