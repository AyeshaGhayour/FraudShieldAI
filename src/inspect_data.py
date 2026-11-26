
import pandas as pd
import numpy as np

DATA_PATH = "data/creditcard.csv"
df = pd.read_csv(DATA_PATH)
print("\n========== FRAUDSHIELD AI ==========")
print("       DATASET INSPECTION")
print("====================================")
# 1. Dataset dimensions
print("\n1. DATASET SHAPE")
print(df.shape)
# 2. First five rows
print("\n2. FIRST FIVE ROWS")
print(df.head())
# 3. Column names
print("\n3. COLUMN NAMES")
print(df.columns.tolist())
# 4. Data types
print("\n4. DATA TYPES")
print(df.dtypes)
# 5. Missing values
print("\n5. MISSING VALUES")
print(df.isnull().sum())
# 6. Duplicate records
print("\n6. DUPLICATE RECORDS")
print(df.duplicated().sum())
# 7. Target distribution
print("\n7. FRAUD DISTRIBUTION")
print(df["Class"].value_counts())
# 8. Fraud percentages
print("\n8. FRAUD PERCENTAGES")
print(
    df["Class"].value_counts(normalize=True) * 100
)
# 9. Statistical summary
print("\n9. STATISTICAL SUMMARY")
print(df.describe())

print("\n========== INSPECTION COMPLETE ==========")
