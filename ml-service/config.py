import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask settings
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    TESTING = False
    PORT = int(os.getenv('FLASK_PORT', 8000))
    HOST = os.getenv('FLASK_HOST', '0.0.0.0')
    
    # Model paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(BASE_DIR, 'saved_models')
    DATA_PATH = os.path.join(BASE_DIR, 'data')
    
    # Model files
    EXPENSE_CLASSIFIER_MODEL = os.path.join(MODEL_PATH, 'expense_classifier.pkl')
    VECTORIZER_MODEL = os.path.join(MODEL_PATH, 'vectorizer.pkl')
    ANOMALY_DETECTOR_MODEL = os.path.join(MODEL_PATH, 'anomaly_detector.pkl')
    CASHFLOW_MODEL = os.path.join(MODEL_PATH, 'cashflow_model.pkl')
    
    # ML Settings
    ANOMALY_THRESHOLD = float(os.getenv('ANOMALY_THRESHOLD', 2.5))
    PREDICTION_CONFIDENCE_MIN = 0.6
    
    # Categories for expense classification
    EXPENSE_CATEGORIES = [
        'Salary',
        'Rent',
        'Utilities',
        'Marketing',
        'Software',
        'Hardware',
        'Travel',
        'Office Supplies',
        'Insurance',
        'Legal',
        'Training',
        'Entertainment',
        'Maintenance',
        'Other'
    ]
    
    # Financial Health Score Weights
    HEALTH_SCORE_WEIGHTS = {
        'cash_reserves': 0.25,
        'burn_rate': 0.20,
        'runway': 0.20,
        'growth_rate': 0.15,
        'expense_ratio': 0.10,
        'revenue_trend': 0.10
    }
    
    # Create directories if they don't exist
    @staticmethod
    def init_app():
        os.makedirs(Config.MODEL_PATH, exist_ok=True)
        os.makedirs(Config.DATA_PATH, exist_ok=True)

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
