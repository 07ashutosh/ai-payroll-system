import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import os
from config import Config

class ExpenseClassifier:
    """
    Machine Learning model to automatically categorize expenses
    Uses TF-IDF vectorization and Random Forest classification
    """
    
    def __init__(self):
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        self.categories = Config.EXPENSE_CATEGORIES
        self.model_path = Config.EXPENSE_CLASSIFIER_MODEL
        self.vectorizer_path = Config.VECTORIZER_MODEL
        
        # Try to load existing model
        self.load_model()
        
        # If model doesn't exist, train with sample data
        if self.model is None:
            self.train_with_sample_data()
    
    def train_with_sample_data(self):
        """Train model with sample/default data"""
        print("Training expense classifier with sample data...")
        
        # Sample training data
        training_data = [
            # Salary
            ("Employee salary payment", "Monthly payroll", "Salary"),
            ("Bonus payment", "Performance bonus", "Salary"),
            ("Overtime payment", "Extra hours payment", "Salary"),
            ("Salary advance", "Employee advance salary", "Salary"),
            
            # Rent
            ("Office rent", "Monthly office space rental", "Rent"),
            ("Building lease", "Commercial property rent", "Rent"),
            ("Warehouse rent", "Storage facility rental", "Rent"),
            
            # Utilities
            ("Electricity bill", "Monthly power consumption", "Utilities"),
            ("Water bill", "Monthly water charges", "Utilities"),
            ("Internet bill", "Broadband connection", "Utilities"),
            ("Phone bill", "Office telephone charges", "Utilities"),
            
            # Marketing
            ("Facebook ads", "Social media marketing", "Marketing"),
            ("Google Adwords", "Online advertising", "Marketing"),
            ("Print advertisement", "Newspaper ad campaign", "Marketing"),
            ("SEO services", "Search engine optimization", "Marketing"),
            ("Content creation", "Blog and article writing", "Marketing"),
            
            # Software
            ("Microsoft 365", "Office software subscription", "Software"),
            ("AWS bill", "Cloud hosting charges", "Software"),
            ("Salesforce subscription", "CRM software", "Software"),
            ("Adobe Creative Cloud", "Design software", "Software"),
            ("Slack subscription", "Team communication tool", "Software"),
            
            # Hardware
            ("Laptop purchase", "Employee workstation", "Hardware"),
            ("Server purchase", "Data center equipment", "Hardware"),
            ("Office furniture", "Desks and chairs", "Hardware"),
            ("Printer purchase", "Office equipment", "Hardware"),
            
            # Travel
            ("Flight tickets", "Business travel", "Travel"),
            ("Hotel booking", "Accommodation", "Travel"),
            ("Uber ride", "Local transportation", "Travel"),
            ("Fuel expense", "Vehicle fuel", "Travel"),
            
            # Office Supplies
            ("Stationery", "Pens, papers, folders", "Office Supplies"),
            ("Printer paper", "Office printing supplies", "Office Supplies"),
            ("Coffee supplies", "Office pantry items", "Office Supplies"),
            
            # Insurance
            ("Health insurance", "Employee medical coverage", "Insurance"),
            ("Property insurance", "Office building insurance", "Insurance"),
            ("Vehicle insurance", "Company vehicle coverage", "Insurance"),
            
            # Legal
            ("Legal consultation", "Attorney fees", "Legal"),
            ("Patent filing", "Intellectual property", "Legal"),
            ("Contract review", "Legal document review", "Legal"),
            
            # Training
            ("Online course", "Employee skill development", "Training"),
            ("Conference ticket", "Professional development", "Training"),
            ("Workshop fees", "Team training program", "Training"),
            
            # Entertainment
            ("Team lunch", "Employee meal", "Entertainment"),
            ("Office party", "Company celebration", "Entertainment"),
            ("Client dinner", "Business entertainment", "Entertainment"),
            
            # Maintenance
            ("AC repair", "Air conditioning service", "Maintenance"),
            ("Computer repair", "IT equipment maintenance", "Maintenance"),
            ("Office cleaning", "Janitorial services", "Maintenance"),
        ]
        
        # Prepare data
        texts = [f"{title} {desc}" for title, desc, _ in training_data]
        labels = [category for _, _, category in training_data]
        
        # Create and train vectorizer
        self.vectorizer = TfidfVectorizer(
            max_features=100,
            ngram_range=(1, 2),
            stop_words='english'
        )
        X = self.vectorizer.fit_transform(texts)
        
        # Encode labels
        self.label_encoder = LabelEncoder()
        y = self.label_encoder.fit_transform(labels)
        
        # Train classifier
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.model.fit(X, y)
        
        # Save model
        self.save_model()
        
        print("Expense classifier trained successfully!")
    
    def predict(self, expense_data):
        """
        Predict category for an expense
        
        Args:
            expense_data (dict): Dictionary with 'title', 'description', etc.
        
        Returns:
            dict: Predicted category, confidence, and alternatives
        """
        # Combine text features
        text = f"{expense_data.get('title', '')} {expense_data.get('description', '')}"
        
        if not text.strip():
            return {
                'category': 'Other',
                'confidence': 0.0,
                'alternatives': []
            }
        
        # Vectorize
        X = self.vectorizer.transform([text])
        
        # Predict with probabilities
        proba = self.model.predict_proba(X)[0]
        predicted_idx = np.argmax(proba)
        confidence = float(proba[predicted_idx])
        
        # Get top 3 predictions
        top_indices = np.argsort(proba)[-3:][::-1]
        alternatives = [
            {
                'category': self.label_encoder.classes_[idx],
                'confidence': float(proba[idx])
            }
            for idx in top_indices[1:]  # Skip the top prediction
            if proba[idx] > 0.1  # Only include if confidence > 10%
        ]
        
        return {
            'category': self.label_encoder.classes_[predicted_idx],
            'confidence': confidence,
            'alternatives': alternatives
        }
    
    def save_model(self):
        """Save model and vectorizer to disk"""
        try:
            joblib.dump(self.model, self.model_path)
            joblib.dump(self.vectorizer, self.vectorizer_path)
            joblib.dump(self.label_encoder, self.model_path.replace('.pkl', '_encoder.pkl'))
            print(f"Model saved to {self.model_path}")
        except Exception as e:
            print(f"Error saving model: {e}")
    
    def load_model(self):
        """Load model and vectorizer from disk"""
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
                self.model = joblib.load(self.model_path)
                self.vectorizer = joblib.load(self.vectorizer_path)
                self.label_encoder = joblib.load(self.model_path.replace('.pkl', '_encoder.pkl'))
                print("Expense classifier loaded successfully!")
                return True
        except Exception as e:
            print(f"Error loading model: {e}")
        return False
    
    def retrain(self, new_data):
        """
        Retrain model with new data
        
        Args:
            new_data (list): List of tuples (title, description, category)
        """
        texts = [f"{title} {desc}" for title, desc, _ in new_data]
        labels = [category for _, _, category in new_data]
        
        X = self.vectorizer.transform(texts)
        y = self.label_encoder.transform(labels)
        
        # Partial fit or retrain
        self.model.fit(X, y)
        self.save_model()
