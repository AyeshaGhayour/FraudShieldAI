from flask import Flask, render_template, request, jsonify
import joblib
import pandas as pd
import numpy as np
import os

app = Flask(__name__)

# ==========================================
# PROJECT PATHS
# ==========================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ==========================================
# LOAD TRAINED MODEL
# ==========================================

model = joblib.load(
    os.path.join(BASE_DIR, "models", "fraudshield_model.pkl")
)

threshold = joblib.load(
    os.path.join(BASE_DIR, "models", "fraud_threshold.pkl")
)

feature_columns = joblib.load(
    os.path.join(BASE_DIR, "models", "feature_columns.pkl")
)
# ==========================================
# LOAD DATASET
# ==========================================

dataset_path = os.path.join(
    BASE_DIR, "data", "creditcard.csv"
)

demo_data = pd.read_csv(dataset_path)

# ==========================================
# PERSONAL SHIELD DEMO SAMPLES
# ==========================================

demo_samples = (
    demo_data[feature_columns]
    .sample(n=3, random_state=42)
    .reset_index(drop=True)
)

# ==========================================
# BANK INTELLIGENCE TEST SAMPLES
# ==========================================

if "Class" not in demo_data.columns:
    raise ValueError("Dataset must contain a Class column.")

fraud_row = (
    demo_data[demo_data["Class"] == 1]
    .sample(n=1, random_state=42)
    .iloc[0]
)

legitimate_row = (
    demo_data[demo_data["Class"] == 0]
    .sample(n=1, random_state=42)
    .iloc[0]
)

bank_test_samples = {
    "fraud": {
        "actual_label": 1,
        "features": {
            column: float(fraud_row[column])
            for column in feature_columns
        }
    },

    "legitimate": {
        "actual_label": 0,
        "features": {
            column: float(legitimate_row[column])
            for column in feature_columns
        }
    }
}
# ==========================================
# HOME PAGE
# ==========================================
@app.route("/")
def home():
    return render_template("index.html")
# ==========================================
# PERSONAL SHIELD
# ==========================================

@app.route("/personal")
def personal():
    return render_template("personal.html")
# ==========================================
# BANK INTELLIGENCE
# ==========================================

@app.route("/bank")
def bank():
    return render_template("bank.html")
# ==========================================
# BANK INTELLIGENCE - FRAUD TEST SAMPLES
# ==========================================

@app.route("/bank/test-samples", methods=["GET"])
def get_test_samples():

    return jsonify({
        "samples": bank_test_samples
    })
# ==========================================
# INDIVIDUAL TRANSACTION PREDICTION
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid transaction data."
        }), 400

    missing_features = [
        column for column in feature_columns
        if column not in data
    ]

    if missing_features:
        return jsonify({
            "error": "Missing transaction features.",
            "missing_features": missing_features
        }), 400

    try:

        transaction = pd.DataFrame(
            [[data[column] for column in feature_columns]],
            columns=feature_columns
        )

        transaction = transaction.astype(float)

        if not np.isfinite(transaction.to_numpy()).all():
            return jsonify({
                "error": "Transaction contains invalid numerical values."
            }), 400

        probability = model.predict_proba(transaction)[0][1]

        prediction = int(probability >= threshold)

        return jsonify({
            "prediction": prediction,
            "fraud_probability": round(
                float(probability) * 100, 2
            )
        })

    except (ValueError, TypeError):
        return jsonify({
            "error": "Transaction features must contain valid numbers."
        }), 400
# ==========================================
# PERSONAL SHIELD SAMPLE PREDICTION
# ==========================================

@app.route("/personal/predict", methods=["POST"])
def personal_predict():

    data = request.get_json()

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid sample request."
        }), 400

    try:

        sample_id = int(data.get("sample_id"))

        if sample_id not in [1, 2, 3]:
            return jsonify({
                "error": "Invalid sample selection."
            }), 400

        transaction = demo_samples.iloc[[sample_id - 1]]

        probability = model.predict_proba(transaction)[0][1]

        prediction = int(probability >= threshold)

        return jsonify({
            "prediction": prediction,
            "fraud_probability": round(
                float(probability) * 100, 2
            )
        })

    except (ValueError, TypeError):
        return jsonify({
            "error": "Unable to process selected sample."
        }), 400
# ==========================================
# BANK INTELLIGENCE - CSV BATCH PREDICTION
# ==========================================

@app.route("/bank/batch-predict", methods=["POST"])
def batch_predict():

    if "file" not in request.files:
        return jsonify({
            "error": "No CSV file uploaded."
        }), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({
            "error": "Please select a CSV file."
        }), 400

    if not file.filename.lower().endswith(".csv"):
        return jsonify({
            "error": "Only CSV files are supported."
        }), 400

    try:

        uploaded_data = pd.read_csv(file)

        if uploaded_data.empty:
            return jsonify({
                "error": "The uploaded CSV is empty."
            }), 400

        if len(uploaded_data) > 10000:
            return jsonify({
                "error": "Maximum upload limit is 10,000 transactions."
            }), 400

        missing_features = [
            column for column in feature_columns
            if column not in uploaded_data.columns
        ]

        if missing_features:
            return jsonify({
                "error": "Required model features are missing.",
                "missing_features": missing_features
            }), 400

        # Only model features are used for predictions.
        # Class, if present, is not a model input.

        transactions = uploaded_data[feature_columns].copy()

        transactions = transactions.apply(
            pd.to_numeric,
            errors="raise"
        )

        if not np.isfinite(transactions.to_numpy()).all():
            return jsonify({
                "error": "CSV contains missing or infinite values."
            }), 400

        probabilities = model.predict_proba(transactions)[:, 1]

        predictions = (probabilities >= threshold).astype(int)

        fraud_count = int((predictions == 1).sum())

        legitimate_count = int((predictions == 0).sum())

        # Generate downloadable report

        report_data = uploaded_data.copy()

        report_data["Model Classification"] = [
            "Potential Fraud" if prediction == 1 else "Legitimate"
            for prediction in predictions
        ]

        report_data["Model Estimated Fraud Probability (%)"] = [
            round(float(probability) * 100, 2)
            for probability in probabilities
        ]

        report_rows = report_data.to_dict(orient="records")

        return jsonify({

            "total_transactions": len(transactions),

            "fraud_count": fraud_count,

            "legitimate_count": legitimate_count,

            "report_rows": report_rows

        })

    except (ValueError, TypeError):
        return jsonify({
            "error": "CSV contains invalid numerical values."
        }), 400

    except Exception:
        return jsonify({
            "error": "Unable to process this CSV file."
        }), 500
# ==========================================
# RUN APPLICATION
# ==========================================
if __name__ == "__main__":
    app.run(debug=True)
