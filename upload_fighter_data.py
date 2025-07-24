#!/usr/bin/env python3
"""
Script to upload FighterData CSV rows to Firestore database.
This script reads the FighterData.csv file and uploads each row to the 'fighterData' collection in Firestore.
"""

import csv
import json
import os
import sys
from typing import Dict, Any
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import firestore as gc_firestore

def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials."""
    try:
        # Try to initialize with default credentials (if running on GCP)
        firebase_admin.initialize_app()
        print("✅ Firebase initialized with default credentials")
    except ValueError:
        # If already initialized, get the app
        try:
            firebase_admin.get_app()
            print("✅ Firebase already initialized")
        except ValueError:
            # Initialize with service account file
            service_account_path = "fightstats-30352-firebase-adminsdk-fbsvc-f8205199b1.json"
            
            if os.path.exists(service_account_path):
                cred = credentials.Certificate(service_account_path)
                firebase_admin.initialize_app(cred)
                print(f"✅ Firebase initialized with service account: {service_account_path}")
            else:
                print(f"❌ Service account file not found: {service_account_path}")
                print("❌ Firebase initialization failed. Please ensure you have proper credentials.")
                print("   You can either:")
                print("   1. Place the service account JSON file in the current directory")
                print("   2. Set GOOGLE_APPLICATION_CREDENTIALS environment variable")
                print("   3. Run this on Google Cloud Platform with proper permissions")
                sys.exit(1)

def get_firestore_client():
    """Get Firestore client instance."""
    try:
        db = firestore.client()
        return db
    except Exception as e:
        print(f"❌ Failed to get Firestore client: {e}")
        sys.exit(1)

def convert_value_to_proper_type(value: str) -> Any:
    """
    Convert CSV string values to appropriate Python types.
    
    Args:
        value: String value from CSV
        
    Returns:
        Converted value with proper type
    """
    if value == '' or value is None:
        return None
    
    # Try to convert to integer
    try:
        return int(value)
    except ValueError:
        pass
    
    # Try to convert to float
    try:
        return float(value)
    except ValueError:
        pass
    
    # Return as string if no numeric conversion works
    return value

def process_csv_row(row: Dict[str, str]) -> Dict[str, Any]:
    """
    Process a CSV row and convert values to appropriate types.
    
    Args:
        row: Dictionary representing a CSV row
        
    Returns:
        Processed dictionary with proper data types
    """
    processed_row = {}
    
    for key, value in row.items():
        # Skip empty keys
        if not key or key.strip() == '':
            continue
            
        # Convert value to proper type
        processed_value = convert_value_to_proper_type(value)
        
        # Only add non-None values to reduce document size
        if processed_value is not None:
            processed_row[key] = processed_value
    
    return processed_row

def upload_fighter_data(csv_file_path: str, collection_name: str = 'fighterData'):
    """
    Upload fighter data from CSV to Firestore.
    
    Args:
        csv_file_path: Path to the CSV file
        collection_name: Name of the Firestore collection
    """
    # Initialize Firebase
    initialize_firebase()
    
    # Get Firestore client
    db = get_firestore_client()
    collection_ref = db.collection(collection_name)
    
    # Check if CSV file exists
    if not os.path.exists(csv_file_path):
        print(f"❌ CSV file not found: {csv_file_path}")
        sys.exit(1)
    
    print(f"📁 Reading CSV file: {csv_file_path}")
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            # Read CSV with DictReader to get column names
            reader = csv.DictReader(csvfile)
            
            # Get total number of rows for progress tracking
            rows = list(reader)
            total_rows = len(rows)
            
            print(f"📊 Found {total_rows} rows to upload")
            
            # Upload each row
            success_count = 0
            error_count = 0
            
            for i, row in enumerate(rows, 1):
                try:
                    # Process the row
                    processed_data = process_csv_row(row)
                    
                    # Use the _id field as document ID if available, otherwise auto-generate
                    document_id = processed_data.get('_id')
                    if not document_id:
                        # If no _id, use fighterCode or auto-generate
                        document_id = processed_data.get('fighterCode', f"fighter_{i}")
                    
                    # Remove _id from data since it's used as document ID
                    if '_id' in processed_data:
                        del processed_data['_id']
                    
                    # Upload to Firestore
                    doc_ref = collection_ref.document(str(document_id))
                    doc_ref.set(processed_data)
                    
                    success_count += 1
                    
                    # Print progress every 10 rows
                    if i % 10 == 0 or i == total_rows:
                        print(f"📈 Progress: {i}/{total_rows} ({i/total_rows*100:.1f}%) - Success: {success_count}, Errors: {error_count}")
                
                except Exception as e:
                    error_count += 1
                    print(f"❌ Error uploading row {i}: {e}")
                    print(f"   Row data: {row}")
                    continue
            
            print(f"\n🎉 Upload completed!")
            print(f"✅ Successfully uploaded: {success_count} documents")
            if error_count > 0:
                print(f"❌ Failed uploads: {error_count} documents")
            else:
                print(f"🎯 All documents uploaded successfully!")
                
    except Exception as e:
        print(f"❌ Error reading CSV file: {e}")
        sys.exit(1)

def main():
    """Main function to run the upload script."""
    print("🚀 Starting FighterData CSV to Firestore upload...")
    print("=" * 50)
    
    # CSV file path
    csv_file_path = "oldData/FighterData.csv"
    
    # Upload the data
    upload_fighter_data(csv_file_path)
    
    print("=" * 50)
    print("✨ Script completed!")

if __name__ == "__main__":
    main() 