from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models import HealthRecord, db
from datetime import datetime

bp = Blueprint('health', __name__)

@bp.route('/record', methods=['POST'])
@jwt_required()
def add_record():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    date_str = data.get('date', datetime.utcnow().strftime('%Y-%m-%d'))
    record_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    
    # Clean data for HealthRecord model
    cleaned_data = {}
    numeric_fields = ['lh', 'estrogen', 'pdg', 'overall_score', 'deep_sleep_in_minutes', 
                      'avg_resting_heart_rate', 'stress_score', 'daily_steps']
    integer_fields = ['cramps', 'fatigue', 'moodswing', 'stress', 'bloating', 'sleepissue']
    
    for field in numeric_fields:
        if field in data and data[field] != '':
            try:
                cleaned_data[field] = float(data[field])
            except:
                pass
                
    for field in integer_fields:
        if field in data and data[field] != '':
            try:
                cleaned_data[field] = int(data[field])
            except:
                pass

    # Check if record for this date already exists
    record = HealthRecord.query.filter_by(user_id=user_id, date=record_date).first()
    if record:
        # Update existing
        for key, value in cleaned_data.items():
            setattr(record, key, value)
    else:
        # Create new
        record = HealthRecord(user_id=user_id, date=record_date, **cleaned_data)
        db.session.add(record)
        
    db.session.commit()
    return jsonify({"msg": "Record saved", "id": record.id}), 201

@bp.route('/records', methods=['GET'])
@jwt_required()
def get_records():
    user_id = get_jwt_identity()
    records = HealthRecord.query.filter_by(user_id=user_id).order_by(HealthRecord.date.desc()).all()
    
    return jsonify([{
        "id": r.id,
        "date": r.date.strftime('%Y-%m-%d'),
        "lh": r.lh,
        "estrogen": r.estrogen,
        "pdg": r.pdg,
        "cramps": r.cramps,
        "fatigue": r.fatigue,
        "moodswing": r.moodswing,
        "stress": r.stress,
        "bloating": r.bloating,
        "sleepissue": r.sleepissue,
        "overall_score": r.overall_score,
        "deep_sleep_in_minutes": r.deep_sleep_in_minutes,
        "avg_resting_heart_rate": r.avg_resting_heart_rate,
        "stress_score": r.stress_score,
        "daily_steps": r.daily_steps
    } for r in records])
