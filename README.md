# NeoHealth AI - Healthcare Analytics Platform

NeoHealth AI is a production-grade healthcare platform that uses machine learning to predict menstrual phases and provide health insights.

## Project Structure
- `backend/`: Flask API, ML Model services, and Database models.
- `frontend/`: React + Vite dashboard with modern aesthetics.
- `data/`: Original datasets and processed files.
- `notebook/`: Original research notebooks.

## Features
- **User Authentication**: Secure JWT-based login and registration.
- **Health Data Logging**: Track hormones (LH, Estrogen, PdG), vitals, and symptoms.
- **AI Prediction Engine**: Real-time phase prediction using pre-trained XGBoost models.
- **Interactive Dashboard**: Visualize trends in heart rate, sleep, steps, and hormones.

## Tech Stack
- **Backend**: Python, Flask, SQLAlchemy, Scikit-learn, XGBoost.
- **Frontend**: React, Recharts, Lucide-React, Framer Motion.
- **Database**: PostgreSQL (Compatible) / SQLite (Default).

## Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python train_and_save_model.py  # Trains the model using existing data
python run.py
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## AI Workflow
1. **Preprocessing**: Raw health metrics are cleaned, aggregated daily, and normalized.
2. **Feature Engineering**: Time-series features (previous 2 days) are generated to capture hormonal cycles.
3. **Model**: An XGBoost classifier trained on historical clinical data predicts the cycle phase.
4. **Integration**: The backend service loads the model on demand to provide instant predictions for new user entries.
