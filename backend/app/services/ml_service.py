import os
import joblib
import pandas as pd
import numpy as np
from flask import current_app

class MLService:
    _model = None
    _scaler = None
    _le = None

    @classmethod
    def load_resources(cls):
        if cls._model is None:
            model_dir = current_app.config['ML_MODEL_PATH']
            cls._model = joblib.load(os.path.join(model_dir, 'model.joblib'))
            cls._scaler = joblib.load(os.path.join(model_dir, 'scaler.joblib'))
            cls._le = joblib.load(os.path.join(model_dir, 'label_encoder.joblib'))

    @classmethod
    def predict(cls, data_dict, historical_records=None):
        """
        data_dict: current day's health metrics
        historical_records: list of previous 2 days' records (if available)
        """
        cls.load_resources()

        # Prepare features array (matching training features)
        # ["lh","estrogen","pdg","cramps","fatigue","moodswing","stress","bloating","sleepissue",
        #  "overall_score","deep_sleep_in_minutes","avg_resting_heart_rate","stress_score","daily_steps",
        #  "lh_prev1","lh_prev2","estrogen_prev1","pdg_prev1","stress_prev1"]
        
        features = []
        # Current day features
        current_cols = ["lh","estrogen","pdg","cramps","fatigue","moodswing","stress","bloating","sleepissue",
                        "overall_score","deep_sleep_in_minutes","avg_resting_heart_rate","stress_score","daily_steps"]
        
        for col in current_cols:
            features.append(data_dict.get(col, 0))
            
        # Historical features (defaults to 0 if not available)
        prev1 = historical_records[0] if historical_records and len(historical_records) > 0 else {}
        prev2 = historical_records[1] if historical_records and len(historical_records) > 1 else {}
        
        features.append(prev1.get('lh', 0))
        features.append(prev2.get('lh', 0))
        features.append(prev1.get('estrogen', 0))
        features.append(prev1.get('pdg', 0))
        features.append(prev1.get('stress', 0))
        
        # Convert to numpy and reshape for prediction
        X = np.array(features).reshape(1, -1)
        
        # Scale
        X_scaled = cls._scaler.transform(X)
        
        # Predict
        prediction_encoded = cls._model.predict(X_scaled)[0]
        prediction_label = cls._le.inverse_transform([prediction_encoded])[0]
        
        # Get probability/confidence
        probs = cls._model.predict_proba(X_scaled)[0]
        confidence = float(np.max(probs))
        
        return {
            "phase": prediction_label,
            "confidence": confidence
        }
