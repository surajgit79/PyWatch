from flask import Blueprint, request, jsonify, send_file
from app.models.transaction import Transaction
from app.models.card import Card
from app.models.user import User
from app.services.pdf_generator import generate_monthly_statement
from app.utils.auth import token_required
from datetime import datetime
import os

bp = Blueprint('statements', __name__)

@bp.route('/generate', methods=['POST'])
@token_required
def generate_statement(user_id):
    try:
        data = request.get_json()
        print(f"Retrieved: {data}")
        data['card_id'] = int(data['card_id'])
        data['year'] = int(data['year'])
        if 'card_id' not in data or 'month' not in data or 'year' not in data:
            print(f"Card id: {data['card_id']}, Month: {data['month']}")
            return jsonify({'error': 'card_id, month, and year are required'}), 400
        
        card_id = data['card_id']
        month = data['month']
        year = data['year']
        
        user = User.get_user_by_id(user_id)
        
        card = Card.get_card_by_id(card_id, user_id)
        
        if not card:
            return jsonify({'error': 'Card not found'}), 404
        
        from datetime import date
        import calendar
        
        start_date = date(year, month, 1)
        last_day = calendar.monthrange(year, month)[1]
        end_date = date(year, month, last_day)
        
        filters = {
            'card_id': card_id,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat()
        }
        
        transactions = Transaction.get_user_transactions(user_id, filters)
        
        card_data = {
            'card_name': card['card_name'],
            'current_balance': card['current_balance'],
            'credit_limit': card['credit_limit'],
            'opening_balance': card['current_balance'] + sum(t['amount_usd'] for t in transactions)
        }
        
        filename = f"statement_{card['card_name']}_{year}_{month:02d}.pdf"
        output_path = os.path.join(r"C:\Users\D E L L\OneDrive\Desktop\Refined-PyWatch\StatementDownloads", filename)

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        success = generate_monthly_statement(user, transactions, card_data, output_path)
        
        if not success:
            return jsonify({'error': 'Failed to generate statement'}), 500
        
        return send_file(
            output_path,
            as_attachment=True,
            download_name=filename,
            mimetype='application/pdf'
        )
        
    except Exception as e:
        print(f"Generate statement error: {e}")
        return jsonify({'error': 'Failed to generate statement'}), 500