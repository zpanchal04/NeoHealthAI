import os
import pandas as pd
from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required
from ..services.analysis_service import DataAnalysisService

bp = Blueprint('datasets', __name__)

@bp.route('/summary', methods=['GET'])
def get_global_summary():
    stats = DataAnalysisService.get_global_summary()
    if stats:
        return jsonify(stats)
    return jsonify({"msg": "Error calculating stats"}), 500

@bp.route('/list', methods=['GET'])
@jwt_required()
def list_datasets():
    # Root paths
    raw_path = os.path.join(current_app.root_path, '../../data/raw')
    processed_path = os.path.join(current_app.root_path, '../../data/processed')
    
    files = []
    
    # Raw Files
    if os.path.exists(raw_path):
        for f in os.listdir(raw_path):
            if f.endswith('.csv'):
                stat = os.stat(os.path.join(raw_path, f))
                files.append({
                    "name": f,
                    "type": "raw",
                    "size": f"{stat.st_size / (1024*1024):.2f} MB",
                    "path": os.path.join(raw_path, f)
                })

    # Processed Files
    if os.path.exists(processed_path):
        for f in os.listdir(processed_path):
            if f.endswith('.csv'):
                stat = os.stat(os.path.join(processed_path, f))
                files.append({
                    "name": f,
                    "type": "processed",
                    "size": f"{stat.st_size / (1024*1024):.2f} MB",
                    "path": os.path.join(processed_path, f)
                })
                
    return jsonify(files)

@bp.route('/stats/<filename>', methods=['GET'])
@jwt_required()
def get_dataset_stats(filename):
    # Search in both raw and processed
    raw_path = os.path.join(current_app.root_path, '../../data/raw', filename)
    processed_path = os.path.join(current_app.root_path, '../../data/processed', filename)
    
    target_path = raw_path if os.path.exists(raw_path) else processed_path
    
    if not os.path.exists(target_path):
        return jsonify({"msg": "File not found"}), 404
        
    # Read a sample to get columns and summary (don't read huge files entirely)
    try:
        if filename == 'steps.csv':
             # Huge file, just get header
             df = pd.read_csv(target_path, nrows=100)
             total_rows = "2,000,000+" # Estimated or calculated via stat
        else:
             df = pd.read_csv(target_path)
             total_rows = len(df)
             
        return jsonify({
            "name": filename,
            "columns": list(df.columns),
            "rows": total_rows,
            "sample": df.head(5).to_dict(orient='records')
        })
    except Exception as e:
        return jsonify({"msg": str(e)}), 500
