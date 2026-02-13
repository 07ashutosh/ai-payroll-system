import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from config import Config
import joblib
import os

class AnomalyDetector:
    """
    Detects unusual or anomalous expenses using Isolation Forest
    """
    
    def __init__(self):
        self.model = IsolationForest(
            contamination=0.1,  # Expect 10% anomalies
            random_state=42
        )
        self.scaler = StandardScaler()
        self.threshold = Config.ANOMALY_THRESHOLD
        self.model_path = Config.ANOMALY_DETECTOR_MODEL
        
        # Try to load existing model
        self.load_model()
    
    def detect(self, expenses):
        """
        Detect anomalies in a list of expenses
        
        Args:
            expenses (list): List of expense dictionaries
        
        Returns:
            dict: Anomalies detected with scores and reasons
        """
        if len(expenses) < 10:
            return {
                'anomalies': [],
                'summary': {
                    'total_expenses': len(expenses),
                    'anomalies_detected': 0,
                    'message': 'Need at least 10 expenses for detection'
                }
            }
        
        # Convert to DataFrame
        df = pd.DataFrame(expenses)
        
        # Feature engineering
        features = self._prepare_features(df)
        
        # Fit model if not already trained
        if not hasattr(self.model, 'offset_'):
            scaled_features = self.scaler.fit_transform(features)
            self.model.fit(scaled_features)
            self.save_model()
        else:
            scaled_features = self.scaler.transform(features)
        
        # Predict anomalies (-1 for anomalies, 1 for normal)
        predictions = self.model.predict(scaled_features)
        
        # Get anomaly scores (lower is more anomalous)
        scores = self.model.score_samples(scaled_features)
        
        # Identify anomalies
        anomalies = []
        for idx, (pred, score) in enumerate(zip(predictions, scores)):
            if pred == -1:
                expense = expenses[idx]
                reason = self._determine_anomaly_reason(expense, df, idx)
                
                anomalies.append({
                    'expense_id': expense.get('id', idx),
                    'amount': expense['amount'],
                    'category': expense.get('category', 'Unknown'),
                    'date': expense.get('date', ''),
                    'description': expense.get('description', ''),
                    'anomaly_score': float(abs(score)),
                    'reason': reason,
                    'severity': self._get_severity(score)
                })
        
        # Sort by severity
        anomalies.sort(key=lambda x: x['anomaly_score'], reverse=True)
        
        return {
            'anomalies': anomalies,
            'summary': {
                'total_expenses': len(expenses),
                'anomalies_detected': len(anomalies),
                'anomaly_rate': len(anomalies) / len(expenses),
                'average_anomaly_score': float(np.mean([a['anomaly_score'] for a in anomalies])) if anomalies else 0
            }
        }
    
    def _prepare_features(self, df):
        """Prepare features for anomaly detection"""
        features = pd.DataFrame()
        
        # Amount-based features
        features['amount'] = df['amount']
        features['amount_log'] = np.log1p(df['amount'])
        
        # Category encoding (if available)
        if 'category' in df.columns:
            category_dummies = pd.get_dummies(df['category'], prefix='cat')
            features = pd.concat([features, category_dummies], axis=1)
        
        # Date-based features (if available)
        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'], errors='coerce')
            features['day_of_month'] = df['date'].dt.day
            features['day_of_week'] = df['date'].dt.dayofweek
            features['month'] = df['date'].dt.month
        
        # Fill NaN values
        features = features.fillna(0)
        
        return features
    
    def _determine_anomaly_reason(self, expense, df, idx):
        """Determine why an expense is considered anomalous"""
        reasons = []
        
        amount = expense['amount']
        category = expense.get('category', 'Unknown')
        
        # Check if amount is unusually high
        category_expenses = df[df.get('category', pd.Series()) == category]['amount']
        if len(category_expenses) > 1:
            mean = category_expenses.mean()
            std = category_expenses.std()
            
            if amount > mean + 2 * std:
                reasons.append(f"Amount ${amount:.2f} is significantly higher than category average ${mean:.2f}")
        
        # Check overall amount distribution
        overall_mean = df['amount'].mean()
        overall_std = df['amount'].std()
        
        if amount > overall_mean + 3 * overall_std:
            reasons.append(f"Extremely high amount compared to overall spending pattern")
        
        # Check for round numbers (potential manual entry errors)
        if amount % 1000 == 0 and amount > 5000:
            reasons.append("Suspicious round number - may require verification")
        
        # Default reason
        if not reasons:
            reasons.append("Statistical outlier detected in spending pattern")
        
        return "; ".join(reasons)
    
    def _get_severity(self, score):
        """Determine severity based on anomaly score"""
        abs_score = abs(score)
        
        if abs_score > 0.5:
            return "High"
        elif abs_score > 0.3:
            return "Medium"
        else:
            return "Low"
    
    def save_model(self):
        """Save model to disk"""
        try:
            joblib.dump({
                'model': self.model,
                'scaler': self.scaler
            }, self.model_path)
            print(f"Anomaly detector saved to {self.model_path}")
        except Exception as e:
            print(f"Error saving anomaly detector: {e}")
    
    def load_model(self):
        """Load model from disk"""
        try:
            if os.path.exists(self.model_path):
                data = joblib.load(self.model_path)
                self.model = data['model']
                self.scaler = data['scaler']
                print("Anomaly detector loaded successfully!")
                return True
        except Exception as e:
            print(f"Error loading anomaly detector: {e}")
        return False
