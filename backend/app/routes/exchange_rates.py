from flask import jsonify, Blueprint
from app.services.exchange_rate import get_latest_exchange_rate

bp = Blueprint('exchange_rates', __name__)

@bp.route('', methods=['GET'])
def get_exchange_rate():
    try:
        rate = get_latest_exchange_rate()
        print(f"fetched:{rate}")
        return jsonify({'rate': rate}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
