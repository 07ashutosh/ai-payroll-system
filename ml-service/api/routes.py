from flask import Blueprint, request, jsonify
from models.expense_classifier import ExpenseClassifier
from models.anomaly_detector import AnomalyDetector
from models.cashflow_predictor import CashFlowPredictor
from models.health_scorer import FinancialHealthScorer
import traceback

ml_bp = Blueprint('ml', __name__)

# Initialize models (lazy loading)
expense_classifier = None
anomaly_detector = None
cashflow_predictor = None
health_scorer = None

def get_expense_classifier():
    global expense_classifier
    if expense_classifier is None:
        expense_classifier = ExpenseClassifier()
    return expense_classifier

def get_anomaly_detector():
    global anomaly_detector
    if anomaly_detector is None:
        anomaly_detector = AnomalyDetector()
    return anomaly_detector

def get_cashflow_predictor():
    global cashflow_predictor
    if cashflow_predictor is None:
        cashflow_predictor = CashFlowPredictor()
    return cashflow_predictor

def get_health_scorer():
    global health_scorer
    if health_scorer is None:
        health_scorer = FinancialHealthScorer()
    return health_scorer

@ml_bp.route('/health', methods=['GET'])
def health():
    """ML Service health check"""
    return jsonify({
        'status': 'healthy',
        'service': 'ML Service',
        'endpoints': {
            'categorize': '/ml/categorize',
            'detect_anomaly': '/ml/detect-anomaly',
            'predict_cashflow': '/ml/predict-cashflow',
            'financial_health': '/ml/financial-health'
        }
    })

@ml_bp.route('/categorize', methods=['POST'])
def categorize_expense():
    """
    Categorize an expense using ML
    
    Request body:
    {
        "title": "Office rent payment",
        "description": "Monthly office space rental",
        "amount": 5000,
        "vendor": "Real Estate Co",
        "date": "2024-02-01"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if 'title' not in data:
            return jsonify({'error': 'Title is required'}), 400
        
        classifier = get_expense_classifier()
        result = classifier.predict(data)
        
        return jsonify({
            'category': result['category'],
            'confidence': result['confidence'],
            'alternatives': result.get('alternatives', [])
        })
        
    except Exception as e:
        print(f"Error in categorize_expense: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/detect-anomaly', methods=['POST'])
def detect_anomalies():
    """
    Detect anomalies in expenses
    
    Request body:
    {
        "expenses": [
            {
                "id": "123",
                "amount": 1000,
                "category": "Travel",
                "date": "2024-02-01",
                "description": "Flight tickets"
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'expenses' not in data:
            return jsonify({'error': 'Expenses array is required'}), 400
        
        expenses = data['expenses']
        
        if len(expenses) < 10:
            return jsonify({
                'anomalies': [],
                'summary': {
                    'total_expenses': len(expenses),
                    'anomalies_detected': 0,
                    'message': 'Need at least 10 expenses for anomaly detection'
                }
            })
        
        detector = get_anomaly_detector()
        result = detector.detect(expenses)
        
        return jsonify({
            'anomalies': result['anomalies'],
            'summary': result['summary']
        })
        
    except Exception as e:
        print(f"Error in detect_anomalies: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/predict-cashflow', methods=['POST'])
def predict_cashflow():
    """
    Predict future cash flow
    
    Request body:
    {
        "historical_data": [
            {
                "date": "2024-01-01",
                "income": 50000,
                "expenses": 30000,
                "net": 20000
            },
            ...
        ],
        "months_ahead": 6
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'historical_data' not in data:
            return jsonify({'error': 'Historical data is required'}), 400
        
        historical_data = data['historical_data']
        months_ahead = data.get('months_ahead', 6)
        
        if len(historical_data) < 6:
            return jsonify({
                'error': 'Need at least 6 months of historical data'
            }), 400
        
        predictor = get_cashflow_predictor()
        result = predictor.predict(historical_data, months_ahead)
        
        return jsonify({
            'predictions': result['predictions'],
            'confidence_interval': result.get('confidence_interval', {}),
            'metrics': result.get('metrics', {})
        })
        
    except Exception as e:
        print(f"Error in predict_cashflow: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/financial-health', methods=['POST'])
def financial_health():
    """
    Calculate financial health score
    
    Request body:
    {
        "cash_reserves": 100000,
        "monthly_revenue": 50000,
        "monthly_expenses": 35000,
        "burn_rate": 15000,
        "runway_months": 6.67,
        "growth_rate": 0.15,
        "debt_ratio": 0.3
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Financial metrics are required'}), 400
        
        scorer = get_health_scorer()
        result = scorer.calculate_score(data)
        
        return jsonify({
            'score': result['score'],
            'grade': result['grade'],
            'insights': result['insights'],
            'recommendations': result['recommendations']
        })
        
    except Exception as e:
        print(f"Error in financial_health: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@ml_bp.route('/analyze-patterns', methods=['POST'])
def analyze_patterns():
    """
    Analyze spending patterns
    
    Request body:
    {
        "expenses": [
            {
                "amount": 1000,
                "category": "Travel",
                "date": "2024-02-01",
                "department": "Sales"
            },
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'expenses' not in data:
            return jsonify({'error': 'Expenses array is required'}), 400
        
        # For now, return basic pattern analysis
        # This can be enhanced with actual ML models
        expenses = data['expenses']
        
        # Simple pattern analysis
        patterns = analyze_expense_patterns(expenses)
        
        return jsonify({
            'patterns': patterns['patterns'],
            'trends': patterns['trends'],
            'insights': patterns['insights']
        })
        
    except Exception as e:
        print(f"Error in analyze_patterns: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

def analyze_expense_patterns(expenses):
    """Helper function for basic pattern analysis"""
    from collections import defaultdict
    import statistics
    
    category_totals = defaultdict(float)
    monthly_totals = defaultdict(float)
    
    for exp in expenses:
        category_totals[exp.get('category', 'Other')] += exp['amount']
        month = exp['date'][:7] if 'date' in exp else 'Unknown'
        monthly_totals[month] += exp['amount']
    
    # Find top categories
    top_categories = sorted(
        category_totals.items(),
        key=lambda x: x[1],
        reverse=True
    )[:5]
    
    # Calculate monthly average
    monthly_avg = statistics.mean(monthly_totals.values()) if monthly_totals else 0
    
    return {
        'patterns': {
            'top_categories': [
                {'category': cat, 'total': total}
                for cat, total in top_categories
            ],
            'monthly_average': monthly_avg
        },
        'trends': {
            'trend_direction': 'stable',  # Can be enhanced with actual trend analysis
            'volatility': 'low'
        },
        'insights': [
            f'Top spending category: {top_categories[0][0] if top_categories else "N/A"}',
            f'Average monthly spending: ${monthly_avg:.2f}'
        ]
    }
