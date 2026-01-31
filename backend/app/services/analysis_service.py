import pandas as pd
import os
from flask import current_app

class DataAnalysisService:
    @staticmethod
    def get_global_summary():
        raw_dir = os.path.join(current_app.root_path, '../../data/raw')
        processed_dir = os.path.join(current_app.root_path, '../../data/processed')
        
        summary = {
            "total_records": 0,
            "avg_heart_rate": 0,
            "total_steps": 0,
            "phase_distribution": {},
            "symptom_averages": {}
        }
        
        try:
            # 1. Prediction Phase Distribution (from processed dataset)
            df_final = pd.read_csv(os.path.join(processed_dir, 'final_dataset.csv'))
            summary["total_records"] = len(df_final)
            summary["phase_distribution"] = df_final['phase'].value_counts().to_dict()
            
            # 2. Avg Heart Rate
            df_heart = pd.read_csv(os.path.join(raw_dir, 'resting_heart_rate.csv'))
            summary["avg_heart_rate"] = float(df_heart['value'].mean())
            
            # 3. Steps (Summarized from large file)
            # Instead of reading the whole 227MB steps.csv, we take a sample or use the processed daily_steps
            summary["total_steps"] = float(df_final['daily_steps'].sum())
            summary["avg_steps"] = float(df_final['daily_steps'].mean())

            # 4. Symptoms
            symptoms = ["cramps", "fatigue", "moodswing", "stress"]
            # Map the Likert strings to numbers for averaging if they aren't already
            # Our processed data already has them as numeric (0-4)
            for s in symptoms:
                if s in df_final.columns:
                    summary["symptom_averages"][s] = float(df_final[s].mean())

            return summary
        except Exception as e:
            print(f"Analysis Error: {e}")
            return None
