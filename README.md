-FRAUDSHIELD AI
-Intelligent Credit Card Fraud Detection & Transaction Screening

FraudShield AI is a machine-learning-powered credit card fraud detection project designed to identify suspicious transaction patterns and support safer financial decision-making.

The platform combines a personal transaction safety assistant with a machine-learning-based bank intelligence workspace.

## ✨ Key Features

-1. Personal Shield
-Interactive transaction safety checklist.
-Evaluates payment context and potential warning signs.
-Provides risk levels: Low, Caution, and High.
-Offers practical safety recommendations.

-2. Bank Intelligence
-Individual transaction fraud prediction.
-Batch screening of CSV transaction datasets.
-Model-estimated fraud probabilities.
-Real dataset sample testing.
-Fraud and legitimate transaction analytics.
-Interactive Fraud Constellation visualization.
-Downloadable CSV analysis reports.

## 🧠 Machine Learning Model

The project uses a **Random Forest Classifier** trained on the European Credit Card Fraud Detection dataset.

Model configuration:
-Algorithm: Random Forest
-Number of estimators: 100
-Class balancing: Balanced class weights
-Random state: 42
-Classification threshold: 0.41

The dataset contains 284,807 transactions, including 492 fraudulent transactions.

### Model Performance

Evaluation on the held-out test dataset:

| Metric | Result |
|---|---:|
| Accuracy | 99.95% |
| Precision | 87.91% |
| Recall | 81.63% |
| F1-Score | 84.66% |
| True Positives | 80 |
| False Positives | 11 |
| False Negatives | 18 |
| True Negatives | 56,853 |

These results represent evaluation on the original dataset's test split, not real-world banking performance.

## 📊 Dataset

Dataset: European Credit Card Fraud Detection

The dataset contains:
-Time
-Amount
-V1–V28: anonymized PCA-transformed numerical features
-Class: transaction label (0 = legitimate, 1 = fraud)

The real-world meanings of the individual V1–V28 features are unknown.

The dataset is used for educational and experimental machine learning purposes.

## 🛠️ Technologies Used

-Python
-Flask
-Scikit-learn
-XGBoost
-Pandas
-NumPy
-Joblib
-HTML5
-CSS3
-JavaScript
-Git & GitHub

## 📁 Project Structure

```text
FraudShieldAI/
│
├── data/
│   └── creditcard.csv
│
├── notebooks/
│   └── FraudShield_AI.ipynb
│
├── models/
│   ├── fraudshield_model.pkl
│   ├── fraud_threshold.pkl
│   └── feature_columns.pkl
│
├── templates/
│   ├── index.html
│   ├── personal.html
│   └── bank.html
│
├── static/
│   ├── css/
│   │   ├── style.css
│   │   ├── personal.css
│   │   └── bank.css
│   │
│   └── js/
│       ├── script.js
│       ├── personal.js
│       └── bank.js
│
├── app.py
├── requirements.txt
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd FraudShieldAI
```

### 2. Create a virtual environment

```bash
python -m venv .venv
```

### 3. Activate the environment

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Prepare the dataset

Place the original `creditcard.csv` file inside the `data/` directory.

### 6. Run the application

```bash
python app.py
```

Open your browser and visit:

```text
http://127.0.0.1:5000
```

## 🔍 How It Works

1.The user selects a workspace.
2.Personal Shield provides rule-based transaction safety guidance.
3.Bank Intelligence accepts an individual transaction or CSV dataset.
4.The trained Random Forest model evaluates transaction features.
5.The model returns a classification and estimated fraud probability.
6.Results are displayed through analytics and visualizations.
7.Batch analysis results can be exported as a CSV report.

## ⚠️ Limitations and Disclaimer

-This is an educational machine learning project and not a production banking system.
-It is not connected to real bank accounts or payment gateways.
-Model predictions are estimates, not guarantees of fraud.
-Personal Shield uses rule-based guidance rather than machine learning.
-PCA-transformed features do not have individually known real-world meanings.
-The model has not been validated for deployment in live financial environments.

## Author
**Ayesha Ghayour**