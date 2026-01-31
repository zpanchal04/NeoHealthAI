import pandas as pd
from ..models import User, HealthRecord, Prediction, db
from datetime import datetime, timedelta
import os

def seed_data(user_id):
    csv_path = os.path.join(os.path.dirname(__file__), '../../../data/processed/final_dataset.csv')
    if not os.path.exists(csv_path):
        print(f"CSV not found at {csv_path}")
        return

    df = pd.read_csv(csv_path)
    # Take first 30 days of data for the user
    user_data = df.head(30)
    
    start_date = datetime.utcnow().date() - timedelta(days=30)
    
    records = []
    for i, row in user_data.iterrows():
        date = start_date + timedelta(days=i)
        record = HealthRecord(
            user_id=user_id,
            date=date,
            lh=row.get('lh'),
            estrogen=row.get('estrogen'),
            pdg=row.get('pdg'),
            cramps=int(row.get('cramps', 0)),
            fatigue=int(row.get('fatigue', 0)),
            moodswing=int(row.get('moodswing', 0)),
            stress=int(row.get('stress', 0)),
            bloating=int(row.get('bloating', 0)),
            sleepissue=int(row.get('sleepissue', 0)),
            overall_score=row.get('overall_score'),
            deep_sleep_in_minutes=row.get('deep_sleep_in_minutes'),
            avg_resting_heart_rate=row.get('avg_resting_heart_rate'),
            stress_score=row.get('stress_score'),
            daily_steps=row.get('daily_steps')
        )
        records.append(record)
        
        # Also add prediction if phase info is available
        phase = row.get('phase_simple')
        if phase:
            pred = Prediction(
                user_id=user_id,
                date=date,
                predicted_phase=phase,
                confidence=0.95
            )
            db.session.add(pred)

    db.session.add_all(records)
    db.session.commit()
    print(f"Imported {len(records)} records for user {user_id}")
