import pandas as pd
import numpy as np
import os
import joblib
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler
from xgboost import XGBClassifier

# Constants
DATA_PATH = "../data/processed/final_dataset.csv"
MODEL_DIR = "ml_models"

def train():
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)

    # Load data
    df = pd.read_csv(DATA_PATH)
    
    # Encode Target
    le = LabelEncoder()
    df["phase_encoded"] = le.fit_transform(df["phase_simple"])
    
    # Save LabelEncoder
    joblib.dump(le, os.path.join(MODEL_DIR, "label_encoder.joblib"))
    
    # Select Features (as per notebook)
    features = [
        "lh","estrogen","pdg",
        "cramps","fatigue","moodswing",
        "stress","bloating","sleepissue",
        "overall_score","deep_sleep_in_minutes",
        "avg_resting_heart_rate","stress_score","daily_steps",
        "lh_prev1","lh_prev2","estrogen_prev1","pdg_prev1","stress_prev1"
    ]
    
    X = df[features].astype(float)
    y = df["phase_encoded"].astype(int)
    
    # Scalers
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Save Scaler
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.joblib"))
    
    # Train Model (BestParams roughly from notebook)
    model = XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        objective="multi:softmax",
        num_class=len(le.classes_),
        eval_metric="mlogloss",
        random_state=42
    )
    
    model.fit(X_scaled, y)
    
    # Save Model
    joblib.dump(model, os.path.join(MODEL_DIR, "model.joblib"))
    print("Model, Scaler, and LabelEncoder saved successfully in", MODEL_DIR)

if __name__ == "__main__":
    # Ensure we are in the backend directory context
    train()
