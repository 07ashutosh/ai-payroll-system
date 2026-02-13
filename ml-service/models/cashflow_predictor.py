import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class CashFlowPredictor:
    """
    Predicts future cash flow using time series analysis
    Uses simple moving average and trend analysis
    """
    
    def __init__(self):
        self.model = None
        self.window_size = 3  # 3-month moving average
    
    def predict(self, historical_data, months_ahead=6):
        """
        Predict cash flow for future months
        
        Args:
            historical_data (list): List of dicts with date, income, expenses, net
            months_ahead (int): Number of months to predict
        
        Returns:
            dict: Predictions with confidence intervals
        """
        if len(historical_data) < 6:
            raise ValueError("Need at least 6 months of historical data")
        
        # Convert to DataFrame
        df = pd.DataFrame(historical_data)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        # Calculate metrics
        income_series = df['income'].values
        expense_series = df['expenses'].values
        net_series = df['net'].values
        
        # Simple prediction using moving average and trend
        predictions = []
        
        # Calculate trends
        income_trend = self._calculate_trend(income_series)
        expense_trend = self._calculate_trend(expense_series)
        net_trend = self._calculate_trend(net_series)
        
        # Get recent averages
        recent_income = np.mean(income_series[-self.window_size:])
        recent_expense = np.mean(expense_series[-self.window_size:])
        recent_net = np.mean(net_series[-self.window_size:])
        
        # Predict future months
        last_date = df['date'].iloc[-1]
        
        for i in range(1, months_ahead + 1):
            # Predict with trend
            predicted_income = recent_income + (income_trend * i)
            predicted_expense = recent_expense + (expense_trend * i)
            predicted_net = predicted_income - predicted_expense
            
            # Add some realistic bounds
            predicted_income = max(0, predicted_income)
            predicted_expense = max(0, predicted_expense)
            
            # Calculate prediction date
            future_date = last_date + timedelta(days=30 * i)
            
            predictions.append({
                'date': future_date.strftime('%Y-%m-%d'),
                'month': future_date.strftime('%B %Y'),
                'predicted_income': round(float(predicted_income), 2),
                'predicted_expenses': round(float(predicted_expense), 2),
                'predicted_net': round(float(predicted_net), 2),
                'confidence': self._calculate_confidence(i, len(historical_data))
            })
        
        # Calculate confidence intervals
        income_std = np.std(income_series)
        expense_std = np.std(expense_series)
        
        confidence_interval = {
            'income': {
                'lower': round(float(recent_income - income_std), 2),
                'upper': round(float(recent_income + income_std), 2)
            },
            'expenses': {
                'lower': round(float(recent_expense - expense_std), 2),
                'upper': round(float(recent_expense + expense_std), 2)
            }
        }
        
        # Calculate metrics
        metrics = {
            'average_monthly_income': round(float(np.mean(income_series)), 2),
            'average_monthly_expenses': round(float(np.mean(expense_series)), 2),
            'average_net_cashflow': round(float(np.mean(net_series)), 2),
            'income_trend': 'increasing' if income_trend > 0 else 'decreasing' if income_trend < 0 else 'stable',
            'expense_trend': 'increasing' if expense_trend > 0 else 'decreasing' if expense_trend < 0 else 'stable',
            'volatility': 'high' if (income_std / recent_income) > 0.2 else 'low'
        }
        
        return {
            'predictions': predictions,
            'confidence_interval': confidence_interval,
            'metrics': metrics
        }
    
    def _calculate_trend(self, series):
        """Calculate linear trend from time series"""
        if len(series) < 2:
            return 0
        
        x = np.arange(len(series))
        y = series
        
        # Simple linear regression
        slope = np.polyfit(x, y, 1)[0]
        return slope
    
    def _calculate_confidence(self, months_ahead, historical_length):
        """Calculate prediction confidence (decreases with distance)"""
        base_confidence = 0.9
        decay_rate = 0.1
        
        confidence = base_confidence * np.exp(-decay_rate * months_ahead / 6)
        
        # Adjust for historical data length
        if historical_length < 12:
            confidence *= 0.8
        
        return round(float(confidence), 2)
