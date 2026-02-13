import numpy as np
from config import Config

class FinancialHealthScorer:
    """
    Calculates overall financial health score based on multiple metrics
    """
    
    def __init__(self):
        self.weights = Config.HEALTH_SCORE_WEIGHTS
    
    def calculate_score(self, metrics):
        """
        Calculate financial health score (0-100)
        
        Args:
            metrics (dict): Financial metrics
                - cash_reserves: Current cash available
                - monthly_revenue: Average monthly revenue
                - monthly_expenses: Average monthly expenses
                - burn_rate: Monthly cash burn
                - runway_months: Months until cash runs out
                - growth_rate: Revenue growth rate
                - debt_ratio: Debt to assets ratio
        
        Returns:
            dict: Score, grade, insights, and recommendations
        """
        scores = {}
        insights = []
        recommendations = []
        
        # 1. Cash Reserves Score (0-100)
        cash_score = self._score_cash_reserves(
            metrics.get('cash_reserves', 0),
            metrics.get('monthly_expenses', 1)
        )
        scores['cash_reserves'] = cash_score
        
        # 2. Burn Rate Score (0-100)
        burn_score = self._score_burn_rate(
            metrics.get('burn_rate', 0),
            metrics.get('monthly_revenue', 0)
        )
        scores['burn_rate'] = burn_score
        
        # 3. Runway Score (0-100)
        runway_score = self._score_runway(
            metrics.get('runway_months', 0)
        )
        scores['runway'] = runway_score
        
        # 4. Growth Rate Score (0-100)
        growth_score = self._score_growth(
            metrics.get('growth_rate', 0)
        )
        scores['growth_rate'] = growth_score
        
        # 5. Expense Ratio Score (0-100)
        expense_ratio_score = self._score_expense_ratio(
            metrics.get('monthly_expenses', 0),
            metrics.get('monthly_revenue', 1)
        )
        scores['expense_ratio'] = expense_ratio_score
        
        # 6. Revenue Trend Score (0-100)
        revenue_trend_score = 70  # Default score, can be calculated with historical data
        scores['revenue_trend'] = revenue_trend_score
        
        # Calculate weighted overall score
        overall_score = (
            cash_score * self.weights['cash_reserves'] +
            burn_score * self.weights['burn_rate'] +
            runway_score * self.weights['runway'] +
            growth_score * self.weights['growth_rate'] +
            expense_ratio_score * self.weights['expense_ratio'] +
            revenue_trend_score * self.weights['revenue_trend']
        )
        
        overall_score = round(overall_score, 1)
        
        # Determine grade
        grade = self._get_grade(overall_score)
        
        # Generate insights
        insights = self._generate_insights(metrics, scores)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(metrics, scores, overall_score)
        
        return {
            'score': overall_score,
            'grade': grade,
            'component_scores': scores,
            'insights': insights,
            'recommendations': recommendations
        }
    
    def _score_cash_reserves(self, cash, monthly_expenses):
        """Score based on months of runway from cash reserves"""
        if monthly_expenses == 0:
            return 50
        
        months_coverage = cash / monthly_expenses
        
        if months_coverage >= 12:
            return 100
        elif months_coverage >= 6:
            return 80
        elif months_coverage >= 3:
            return 60
        elif months_coverage >= 1:
            return 40
        else:
            return 20
    
    def _score_burn_rate(self, burn_rate, monthly_revenue):
        """Score based on burn rate relative to revenue"""
        if monthly_revenue == 0:
            return 30 if burn_rate == 0 else 20
        
        burn_ratio = burn_rate / monthly_revenue
        
        if burn_ratio <= 0:
            return 100  # Profitable
        elif burn_ratio <= 0.2:
            return 90
        elif burn_ratio <= 0.5:
            return 70
        elif burn_ratio <= 1.0:
            return 50
        else:
            return 30
    
    def _score_runway(self, runway_months):
        """Score based on months of runway"""
        if runway_months >= 24:
            return 100
        elif runway_months >= 12:
            return 80
        elif runway_months >= 6:
            return 60
        elif runway_months >= 3:
            return 40
        else:
            return 20
    
    def _score_growth(self, growth_rate):
        """Score based on growth rate"""
        if growth_rate >= 0.3:  # 30%+ growth
            return 100
        elif growth_rate >= 0.2:  # 20%+ growth
            return 90
        elif growth_rate >= 0.1:  # 10%+ growth
            return 75
        elif growth_rate >= 0:   # Positive growth
            return 60
        elif growth_rate >= -0.1:  # Small decline
            return 40
        else:
            return 20
    
    def _score_expense_ratio(self, expenses, revenue):
        """Score based on expense to revenue ratio"""
        if revenue == 0:
            return 30
        
        ratio = expenses / revenue
        
        if ratio <= 0.5:  # 50% or less
            return 100
        elif ratio <= 0.7:  # 70% or less
            return 80
        elif ratio <= 0.9:  # 90% or less
            return 60
        elif ratio <= 1.0:  # Break even
            return 40
        else:
            return 20
    
    def _get_grade(self, score):
        """Convert score to letter grade"""
        if score >= 90:
            return 'A+'
        elif score >= 85:
            return 'A'
        elif score >= 80:
            return 'A-'
        elif score >= 75:
            return 'B+'
        elif score >= 70:
            return 'B'
        elif score >= 65:
            return 'B-'
        elif score >= 60:
            return 'C+'
        elif score >= 55:
            return 'C'
        elif score >= 50:
            return 'C-'
        elif score >= 40:
            return 'D'
        else:
            return 'F'
    
    def _generate_insights(self, metrics, scores):
        """Generate key insights from the data"""
        insights = []
        
        # Cash reserves insight
        cash_months = metrics.get('cash_reserves', 0) / metrics.get('monthly_expenses', 1)
        if cash_months < 3:
            insights.append({
                'type': 'warning',
                'message': f'Low cash reserves: Only {cash_months:.1f} months of runway'
            })
        elif cash_months >= 12:
            insights.append({
                'type': 'positive',
                'message': f'Strong cash position: {cash_months:.1f} months of runway'
            })
        
        # Growth insight
        growth = metrics.get('growth_rate', 0)
        if growth > 0.2:
            insights.append({
                'type': 'positive',
                'message': f'Excellent growth rate: {growth*100:.1f}%'
            })
        elif growth < 0:
            insights.append({
                'type': 'warning',
                'message': f'Negative growth: {growth*100:.1f}%'
            })
        
        # Expense ratio insight
        expense_ratio = metrics.get('monthly_expenses', 0) / metrics.get('monthly_revenue', 1)
        if expense_ratio > 1.0:
            insights.append({
                'type': 'critical',
                'message': f'Expenses exceed revenue: {expense_ratio*100:.1f}% ratio'
            })
        elif expense_ratio < 0.6:
            insights.append({
                'type': 'positive',
                'message': f'Healthy expense ratio: {expense_ratio*100:.1f}%'
            })
        
        return insights
    
    def _generate_recommendations(self, metrics, scores, overall_score):
        """Generate actionable recommendations"""
        recommendations = []
        
        # Cash reserves recommendations
        if scores['cash_reserves'] < 60:
            recommendations.append({
                'priority': 'high',
                'category': 'Cash Management',
                'action': 'Increase cash reserves to at least 6 months of operating expenses'
            })
        
        # Burn rate recommendations
        if scores['burn_rate'] < 50:
            recommendations.append({
                'priority': 'high',
                'category': 'Cost Control',
                'action': 'Reduce monthly burn rate by optimizing expenses or increasing revenue'
            })
        
        # Growth recommendations
        if scores['growth_rate'] < 60:
            recommendations.append({
                'priority': 'medium',
                'category': 'Growth',
                'action': 'Focus on strategies to increase revenue growth rate'
            })
        
        # Expense ratio recommendations
        if scores['expense_ratio'] < 50:
            recommendations.append({
                'priority': 'high',
                'category': 'Expense Management',
                'action': 'Review and reduce operating expenses to improve profitability'
            })
        
        # Overall recommendations
        if overall_score < 50:
            recommendations.append({
                'priority': 'critical',
                'category': 'General',
                'action': 'Financial situation requires immediate attention and strategic planning'
            })
        elif overall_score >= 80:
            recommendations.append({
                'priority': 'low',
                'category': 'General',
                'action': 'Maintain current financial practices and look for expansion opportunities'
            })
        
        return recommendations
