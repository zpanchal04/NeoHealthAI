from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import User, Prediction, HealthRecord, db

bp = Blueprint('admin', __name__)

@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    # Simple check: only user with ID 1 is admin for this demo
    user_id = get_jwt_identity()
    if user_id != 1:
        return jsonify({"msg": "Admin access required"}), 403
        
    user_count = User.query.count()
    prediction_count = Prediction.query.count()
    record_count = HealthRecord.query.count()
    
    recent_predictions = Prediction.query.order_by(Prediction.created_at.desc()).limit(10).all()
    
    return jsonify({
        "users": user_count,
        "predictions": prediction_count,
        "records": record_count,
        "recent_logs": [{
            "id": p.id,
            "user_id": p.user_id,
            "phase": p.predicted_phase,
            "confidence": p.confidence,
            "date": p.created_at.strftime('%Y-%m-%d %H:%M')
        } for p in recent_predictions]
    })

@bp.route('/seed', methods=['POST'])
@jwt_required()
def trigger_seed():
    user_id = get_jwt_identity()
    from ..utils.seeder import seed_data
    seed_data(user_id)
    return jsonify({"msg": "Data seeded successfully"}), 200
