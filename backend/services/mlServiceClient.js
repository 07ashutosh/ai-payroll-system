const axios = require('axios');

class MLServiceClient {
  constructor() {
    this.baseURL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.timeout = process.env.ML_SERVICE_TIMEOUT || 30000;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Categorize an expense using ML
   * @param {Object} expenseData - Expense data to categorize
   * @returns {Object} Category and confidence score
   */
  async categorizeExpense(expenseData) {
    try {
      const response = await this.client.post('/ml/categorize', {
        title: expenseData.title,
        description: expenseData.description,
        amount: expenseData.amount,
        vendor: expenseData.vendor,
        date: expenseData.date
      });

      return {
        success: true,
        category: response.data.category,
        confidence: response.data.confidence,
        alternatives: response.data.alternatives || []
      };
    } catch (error) {
      console.error('ML categorization error:', error.message);
      return {
        success: false,
        category: 'Other',
        confidence: 0,
        error: error.message
      };
    }
  }

  /**
   * Detect anomalies in expenses
   * @param {Array} expenses - Array of expense objects
   * @returns {Object} Anomalies detected
   */
  async detectAnomalies(expenses) {
    try {
      const response = await this.client.post('/ml/detect-anomaly', {
        expenses: expenses.map(exp => ({
          id: exp._id,
          amount: exp.amount,
          category: exp.category,
          date: exp.date,
          description: exp.title
        }))
      });

      return {
        success: true,
        anomalies: response.data.anomalies,
        summary: response.data.summary
      };
    } catch (error) {
      console.error('Anomaly detection error:', error.message);
      return {
        success: false,
        anomalies: [],
        error: error.message
      };
    }
  }

  /**
   * Predict cash flow for upcoming months
   * @param {Object} historicalData - Historical financial data
   * @returns {Object} Cash flow predictions
   */
  async predictCashFlow(historicalData) {
    try {
      const response = await this.client.post('/ml/predict-cashflow', {
        historical_data: historicalData.map(data => ({
          date: data.date,
          income: data.income || 0,
          expenses: data.expenses || 0,
          net: data.net || 0
        })),
        months_ahead: historicalData.months_ahead || 6
      });

      return {
        success: true,
        predictions: response.data.predictions,
        confidence_interval: response.data.confidence_interval,
        metrics: response.data.metrics
      };
    } catch (error) {
      console.error('Cash flow prediction error:', error.message);
      return {
        success: false,
        predictions: [],
        error: error.message
      };
    }
  }

  /**
   * Calculate financial health score
   * @param {Object} financialMetrics - Various financial metrics
   * @returns {Object} Financial health score and insights
   */
  async calculateFinancialHealth(financialMetrics) {
    try {
      const response = await this.client.post('/ml/financial-health', {
        cash_reserves: financialMetrics.cashReserves,
        monthly_revenue: financialMetrics.monthlyRevenue,
        monthly_expenses: financialMetrics.monthlyExpenses,
        burn_rate: financialMetrics.burnRate,
        runway_months: financialMetrics.runwayMonths,
        growth_rate: financialMetrics.growthRate,
        debt_ratio: financialMetrics.debtRatio
      });

      return {
        success: true,
        score: response.data.score,
        grade: response.data.grade,
        insights: response.data.insights,
        recommendations: response.data.recommendations
      };
    } catch (error) {
      console.error('Financial health calculation error:', error.message);
      return {
        success: false,
        score: 0,
        grade: 'Unknown',
        error: error.message
      };
    }
  }

  /**
   * Analyze spending patterns
   * @param {Array} expenses - Historical expenses
   * @returns {Object} Spending pattern analysis
   */
  async analyzeSpendingPatterns(expenses) {
    try {
      const response = await this.client.post('/ml/analyze-patterns', {
        expenses: expenses.map(exp => ({
          amount: exp.amount,
          category: exp.category,
          date: exp.date,
          department: exp.department
        }))
      });

      return {
        success: true,
        patterns: response.data.patterns,
        trends: response.data.trends,
        insights: response.data.insights
      };
    } catch (error) {
      console.error('Pattern analysis error:', error.message);
      return {
        success: false,
        patterns: [],
        error: error.message
      };
    }
  }

  /**
   * Check if ML service is available
   * @returns {Boolean} Service availability
   */
  async isAvailable() {
    try {
      const response = await this.client.get('/ml/health');
      return response.status === 200;
    } catch (error) {
      console.error('ML service unavailable:', error.message);
      return false;
    }
  }

  /**
   * Get ML service status
   * @returns {Object} Service status and info
   */
  async getStatus() {
    try {
      const response = await this.client.get('/ml/health');
      return {
        available: true,
        ...response.data
      };
    } catch (error) {
      return {
        available: false,
        error: error.message
      };
    }
  }
}

// Export singleton instance
module.exports = new MLServiceClient();
