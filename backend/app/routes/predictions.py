from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import HealthRecord, Prediction, db
from ..services.ml_service import MLService
from datetime import datetime, timedelta

bp = Blueprint('predictions', __name__)

@bp.route('/predict', methods=['POST'])
@jwt_required()
def predict():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    date_str = data.get('date', datetime.utcnow().strftime('%Y-%m-%d'))
    target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    
    # Get current record for this date
    record = HealthRecord.query.filter_by(user_id=user_id, date=target_date).first()
    if not record:
        return jsonify({"msg": "No health record found for this date. Please submit health data first."}), 400
        
    # Get previous 2 days records for historical features
    prev1_date = target_date - timedelta(days=1)
    prev2_date = target_date - timedelta(days=2)
    
    prev1 = HealthRecord.query.filter_by(user_id=user_id, date=prev1_date).first()
    prev2 = HealthRecord.query.filter_by(user_id=user_id, date=prev2_date).first()
    
    def record_to_dict(r):
        if not r: return {}
        return {
            "lh": r.lh or 0,
            "estrogen": r.estrogen or 0,
            "pdg": r.pdg or 0,
            "cramps": r.cramps or 0,
            "fatigue": r.fatigue or 0,
            "moodswing": r.moodswing or 0,
            "stress": r.stress or 0,
            "bloating": r.bloating or 0,
            "sleepissue": r.sleepissue or 0,
            "overall_score": r.overall_score or 0,
            "deep_sleep_in_minutes": r.deep_sleep_in_minutes or 0,
            "avg_resting_heart_rate": r.avg_resting_heart_rate or 0,
            "stress_score": r.stress_score or 0,
            "daily_steps": r.daily_steps or 0
        }
        
    current_data = record_to_dict(record)
    historical_data = [record_to_dict(prev1), record_to_dict(prev2)]
    
    # Run ML Prediction
    try:
        result = MLService.predict(current_data, historical_data)
    except Exception as e:
        print(f"DEBUG: ML Prediction Error: {str(e)}")
        return jsonify({"msg": "AI Prediction failed", "error": str(e)}), 500
    
    # Store Prediction
    prediction = Prediction.query.filter_by(user_id=user_id, date=target_date).first()
    if prediction:
        prediction.predicted_phase = result['phase']
        prediction.confidence = result['confidence']
    else:
        prediction = Prediction(
            user_id=user_id,
            record_id=record.id,
            date=target_date,
            predicted_phase=result['phase'],
            confidence=result['confidence']
        )
        db.session.add(prediction)
        
    db.session.commit()
    
    return jsonify(result), 200

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_prediction_history():
    user_id = int(get_jwt_identity())
    history = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.date.desc()).all()
    
    return jsonify([{
        "date": p.date.strftime('%Y-%m-%d'),
        "phase": p.predicted_phase,
        "confidence": p.confidence
    } for p in history])
