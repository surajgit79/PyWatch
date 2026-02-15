from flask import Blueprint, request, jsonify
from app.models.transaction import Transaction
from app.utils.auth import token_required
from datetime import datetime, date

bp = Blueprint('transactions', __name__)

@bp.route('', methods=['GET'])
@token_required
def get_transactions(user_id):
    try:
        filters = {}
        
        if request.args.get('card_id'):
            filters['card_id'] = int(request.args.get('card_id'))
        
        if request.args.get('category'):
            filters['category'] = request.args.get('category')
        
        if request.args.get('transaction_type'):
            filters['transaction_type'] = request.args.get('transaction_type')
        
        if request.args.get('start_date'):
            filters['start_date'] = request.args.get('start_date')
        
        if request.args.get('end_date'):
            filters['end_date'] = request.args.get('end_date')
        
        transactions = Transaction.get_user_transactions(user_id, filters)
        
        return jsonify({'transactions': transactions}), 200
        
    except Exception as e:
        print(f"Get transactions error: {e}")
        return jsonify({'error': 'Failed to get transactions'}), 500

@bp.route('/<int:transaction_id>', methods=['GET'])
@token_required
def get_transaction(user_id, transaction_id):
    try:
        transaction = Transaction.get_transaction_by_id(transaction_id, user_id)
        
        if not transaction:
            return jsonify({'error': 'Transaction not found'}), 404
        
        return jsonify({'transaction': transaction}), 200
        
    except Exception as e:
        print(f"Get transaction error: {e}")
        return jsonify({'error': 'Failed to get transaction'}), 500

@bp.route('', methods=['POST'])
@token_required
def add_transaction(user_id):
    try:
        data = request.get_json()
        required = ['card_id', 'transaction_type', 'merchant_name', 'amount_usd', 'category', 'transaction_date']
        for field in required:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
            
        transaction_date = datetime.strptime(data['transaction_date'], '%Y-%m-%d').date()
        if transaction_date > date.today():
            return jsonify({'error':' Transaction date cannot be in future'}), 400
        
        transaction = Transaction.add_transaction(user_id, data)
        
        if not transaction:
            return jsonify({'error': 'Failed to add transaction'}), 500
        
        return jsonify({
            'message': 'Transaction added successfully',
            'transaction': transaction
        }), 201
        
    except Exception as e:
        print(f"Add transaction error: {e}")
        return jsonify({'error': 'Failed to add transaction'}), 500

@bp.route('/<int:transaction_id>', methods=['DELETE'])
@token_required
def delete_transaction(user_id, transaction_id):
    try:
        success = Transaction.delete_transaction(transaction_id, user_id)
        
        if not success:
            return jsonify({'error': 'Failed to delete transaction'}), 400
        
        return jsonify({'message': 'Transaction deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete transaction error: {e}")
        return jsonify({'error': 'Failed to delete transaction'}), 500

@bp.route('/summary', methods=['GET'])
@token_required
def get_summary(user_id):
    try:
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        summary = Transaction.get_spending_summary(user_id, start_date, end_date)
        
        return jsonify({'summary': summary}), 200
        
    except Exception as e:
        print(f"Get summary error: {e}")
        return jsonify({'error': 'Failed to get summary'}), 500