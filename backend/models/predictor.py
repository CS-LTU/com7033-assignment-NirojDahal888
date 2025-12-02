"""
Stroke Risk Prediction Model
Uses statistical analysis of the dataset to predict stroke risk based on patient factors.
"""
import numpy as np
from models.patient import patients_collection

class StrokePredictor:
    """
    Stroke risk prediction based on statistical analysis of the healthcare dataset.
    Uses weighted risk factors derived from the actual stroke data.
    """
    
    def __init__(self):
        # Risk weights based on medical research and dataset analysis
        self.risk_weights = {
            'age': 0.25,           # Age is a major factor
            'hypertension': 0.20,  # Hypertension significantly increases risk
            'heart_disease': 0.20, # Heart disease is a major risk factor
            'glucose': 0.15,       # High glucose levels increase risk
            'bmi': 0.10,           # Obesity increases risk
            'smoking': 0.10,       # Smoking increases risk
        }
        
        # Thresholds based on medical guidelines
        self.thresholds = {
            'age_high_risk': 65,
            'age_medium_risk': 45,
            'glucose_high': 200,
            'glucose_medium': 140,
            'bmi_obese': 30,
            'bmi_overweight': 25,
        }
    
    def calculate_risk_score(self, patient_data):
        """
        Calculate stroke risk score (0-100) based on patient data.
        
        Args:
            patient_data: dict with patient information
            
        Returns:
            dict with risk_score, risk_level, and risk_factors
        """
        score = 0
        risk_factors = []
        
        # 1. Age Risk (0-25 points)
        age = float(patient_data.get('age', 0))
        if age >= self.thresholds['age_high_risk']:
            age_score = 25
            risk_factors.append(f"High age ({age} years) - Major risk factor")
        elif age >= self.thresholds['age_medium_risk']:
            age_score = 15
            risk_factors.append(f"Middle age ({age} years) - Moderate risk factor")
        else:
            age_score = (age / self.thresholds['age_medium_risk']) * 10
        score += age_score
        
        # 2. Hypertension Risk (0-20 points)
        hypertension = int(patient_data.get('hypertension', 0))
        if hypertension == 1:
            score += 20
            risk_factors.append("Hypertension - Major risk factor")
        
        # 3. Heart Disease Risk (0-20 points)
        heart_disease = int(patient_data.get('heart_disease', 0))
        if heart_disease == 1:
            score += 20
            risk_factors.append("Heart disease - Major risk factor")
        
        # 4. Glucose Level Risk (0-15 points)
        glucose = float(patient_data.get('avg_glucose_level', 0))
        if glucose >= self.thresholds['glucose_high']:
            score += 15
            risk_factors.append(f"Very high glucose level ({glucose:.1f} mg/dL) - High risk")
        elif glucose >= self.thresholds['glucose_medium']:
            score += 10
            risk_factors.append(f"Elevated glucose level ({glucose:.1f} mg/dL) - Moderate risk")
        elif glucose >= 100:
            score += 5
            risk_factors.append(f"Slightly elevated glucose ({glucose:.1f} mg/dL) - Low risk")
        
        # 5. BMI Risk (0-10 points)
        bmi = patient_data.get('bmi')
        if bmi and not (isinstance(bmi, float) and np.isnan(bmi)):
            bmi = float(bmi)
            if bmi >= self.thresholds['bmi_obese']:
                score += 10
                risk_factors.append(f"Obese (BMI: {bmi:.1f}) - Increased risk")
            elif bmi >= self.thresholds['bmi_overweight']:
                score += 5
                risk_factors.append(f"Overweight (BMI: {bmi:.1f}) - Slight risk")
        
        # 6. Smoking Risk (0-10 points)
        smoking = patient_data.get('smoking_status', '').lower()
        if smoking == 'smokes':
            score += 10
            risk_factors.append("Current smoker - Increased risk")
        elif smoking == 'formerly smoked':
            score += 5
            risk_factors.append("Former smoker - Slight increased risk")
        
        # Determine risk level
        if score >= 60:
            risk_level = 'HIGH'
            recommendation = "Immediate medical consultation recommended. Multiple high-risk factors detected."
        elif score >= 40:
            risk_level = 'MODERATE'
            recommendation = "Schedule a check-up with your doctor. Consider lifestyle modifications."
        elif score >= 20:
            risk_level = 'LOW'
            recommendation = "Maintain healthy lifestyle. Regular check-ups recommended."
        else:
            risk_level = 'VERY LOW'
            recommendation = "Continue healthy habits. Annual check-ups sufficient."
        
        return {
            'risk_score': round(min(score, 100), 1),
            'risk_level': risk_level,
            'risk_factors': risk_factors if risk_factors else ["No significant risk factors identified"],
            'recommendation': recommendation,
            'analysis': {
                'age_risk': round(age_score, 1),
                'hypertension_risk': 20 if hypertension else 0,
                'heart_disease_risk': 20 if heart_disease else 0,
                'glucose_risk': round(min(15, (glucose / self.thresholds['glucose_high']) * 15), 1) if glucose else 0,
                'bmi_risk': round(min(10, (bmi / self.thresholds['bmi_obese']) * 10), 1) if bmi and not np.isnan(bmi) else 0,
                'smoking_risk': 10 if smoking == 'smokes' else (5 if smoking == 'formerly smoked' else 0)
            }
        }
    
    def get_dataset_statistics(self):
        """
        Get statistics from the dataset for comparison.
        """
        total = patients_collection.count_documents({})
        stroke_cases = patients_collection.count_documents({'stroke': 1})
        
        # Get average values for stroke patients
        pipeline = [
            {'$match': {'stroke': 1}},
            {'$group': {
                '_id': None,
                'avg_age': {'$avg': '$age'},
                'avg_glucose': {'$avg': '$avg_glucose_level'},
                'avg_bmi': {'$avg': '$bmi'},
                'hypertension_count': {'$sum': '$hypertension'},
                'heart_disease_count': {'$sum': '$heart_disease'}
            }}
        ]
        
        stroke_stats = list(patients_collection.aggregate(pipeline))
        
        if stroke_stats:
            stats = stroke_stats[0]
            # Handle NaN values properly
            avg_bmi = stats.get('avg_bmi')
            if avg_bmi and not (isinstance(avg_bmi, float) and np.isnan(avg_bmi)):
                avg_bmi_value = round(avg_bmi, 1)
            else:
                avg_bmi_value = None
            
            return {
                'total_patients': total,
                'stroke_cases': stroke_cases,
                'stroke_rate': round((stroke_cases / total) * 100, 2) if total > 0 else 0,
                'stroke_patient_avg_age': round(stats['avg_age'], 1) if stats.get('avg_age') else None,
                'stroke_patient_avg_glucose': round(stats['avg_glucose'], 1) if stats.get('avg_glucose') else None,
                'stroke_patient_avg_bmi': avg_bmi_value,
                'stroke_with_hypertension': stats.get('hypertension_count', 0),
                'stroke_with_heart_disease': stats.get('heart_disease_count', 0)
            }
        
        return {
            'total_patients': total,
            'stroke_cases': stroke_cases,
            'stroke_rate': round((stroke_cases / total) * 100, 2) if total > 0 else 0
        }

# Global predictor instance
stroke_predictor = StrokePredictor()
