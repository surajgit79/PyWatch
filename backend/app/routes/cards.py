from flask import Blueprint, request, jsonify
from app.models.card import Card
from app.utils.auth import token_required

bp = Blueprint('cards', __name__)

@bp.route('', methods=['GET'])
@token_required
def get_cards(user_id):
    try:
        cards = Card.get_user_cards(user_id)
        return jsonify({'cards': cards}), 200
    except Exception as e:
        print(f"Get cards error: {e}")
        return jsonify({'error': 'Failed to get cards'}), 500

@bp.route('/<int:card_id>', methods=['GET'])
@token_required
def get_card(user_id, card_id):
    try:
        card = Card.get_card_by_id(card_id, user_id)
        
        if not card:
            return jsonify({'error': 'Card not found'}), 404
        
        return jsonify({'card': card}), 200
    except Exception as e:
        print(f"Get card error: {e}")
        return jsonify({'error': 'Failed to get card'}), 500

@bp.route('', methods=['POST'])
@token_required
def add_card(user_id):
    try:
        data = request.get_json()
        
        required = ['card_name', 'card_type', 'last_four_digits', 'credit_limit', 'expiry_date']
        for field in required:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
        
        card = Card.add_card(user_id, data)
        
        if not card:
            return jsonify({'error': 'Failed to add card'}), 500
        
        return jsonify({
            'message': 'Card added successfully',
            'card': card
        }), 201
        
    except Exception as e:
        print(f"Add card error: {e}")
        return jsonify({'error': 'Failed to add card'}), 500

@bp.route('/<int:card_id>', methods=['PUT'])
@token_required
def update_card(user_id, card_id):
    try:
        data = request.get_json()
        
        success = Card.update_card(card_id, user_id, data)
        
        if not success:
            return jsonify({'error': 'Failed to update card'}), 400
        
        return jsonify({'message': 'Card updated successfully'}), 200
        
    except Exception as e:
        print(f"Update card error: {e}")
        return jsonify({'error': 'Failed to update card'}), 500

@bp.route('/<int:card_id>', methods=['DELETE'])
@token_required
def delete_card(user_id, card_id):
    try:
        success = Card.delete_card(card_id, user_id)
        
        if not success:
            return jsonify({'error': 'Failed to delete card'}), 400
        
        return jsonify({'message': 'Card deleted successfully'}), 200
        
    except Exception as e:
        print(f"Delete card error: {e}")
        return jsonify({'error': 'Failed to delete card'}), 500

@bp.route('/<int:card_id>/load', methods=['POST'])
@token_required
def load_card_balance(user_id, card_id):
    from app.models.card import Card
    
    data = request.get_json()
    amount = float(data.get('amount', 0))
    
    if amount <= 0:
        return jsonify({'error': 'Amount must be positive'}), 400
    
    
    result = Card.load_balance(card_id, user_id, amount)
    
    if 'error' in result:
        return jsonify(result), 400
    
    updated_card = Card.get_card_by_id(card_id, user_id)
    
    return jsonify({
        'message': f'Successfully loaded ${amount:.2f} to your card!',
        'data': {
            **result,
            'card': updated_card
        }
    }), 200