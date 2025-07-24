#!/usr/bin/env python3
"""
Optimized batch upload script for FighterData CSV to Firestore database.
This script uses batch operations for better performance with large datasets.
"""

import csv
import json
import os
import sys
from typing import Dict, Any, List
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import firestore as gc_firestore

def initialize_firebase():
    """Initialize Firebase Admin SDK with service account credentials."""
    # Check if Firebase is already initialized
    try:
        firebase_admin.get_app()
        print("✅ Firebase already initialized")
        return
    except ValueError:
        pass  # Not initialized yet, continue with initialization
    
    # Try to initialize with service account file first (more reliable)
    service_account_path = "fightstats-30352-firebase-adminsdk-fbsvc-f8205199b1.json"
    
    if os.path.exists(service_account_path):
        try:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print(f"✅ Firebase initialized with service account: {service_account_path}")
            return
        except Exception as e:
            print(f"❌ Failed to initialize with service account: {e}")
    
    # Try to initialize with default credentials (if running on GCP)
    try:
        firebase_admin.initialize_app()
        print("✅ Firebase initialized with default credentials")
    except Exception as e:
        print(f"❌ Failed to initialize with default credentials: {e}")
    
    # If we get here, both methods failed
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
    Also categorizes related stats into arrays for easier traversal.
    
    Args:
        row: Dictionary representing a CSV row
        
    Returns:
        Processed dictionary with proper data types and categorized arrays
    """
    processed_row = {}
    
    # Define categories for better organization
    categories = {
        'submission_stats': [
            'AmericanaAttempts', 'AmericanaLosses', 'AmericanaWins',
            'AnacondaAttempt', 'AnacondaLoss', 'AnacondaWin',
            'BulldogAttempt', 'BulldogLoss', 'BulldogWin',
            'CalfSlicerAttempts', 'CalfSlicerLosses', 'CalfSlicerWins',
            'EzekielAttempt', 'EzekielLoss', 'EzekielWin',
            'GogoplataAttempts', 'GogoplataLosses', 'GogoplataWins',
            'KneebarAttempt', 'KneebarLoss', 'KneebarWin',
            'LeglockAttempt', 'LeglockLoss', 'LeglockWin',
            'NeckCrankAttempt', 'OmoplataAttempt', 'OmoplataAttempts', 'OmoplataLoss', 'OmoplataLosses', 'OmoplataWin', 'OmoplataWins',
            'OtherSubAttempt', 'OtherSubLoss', 'OtherSubWin',
            'SUBRNCAttempt', 'SUBRNCLoss', 'SUBRNCWin',
            'SubArmTriangleAttempt', 'SubArmTriangleLoss', 'SubArmTriangleWin',
            'SubAttempts', 'SubDarceAttempt', 'SubDarceLoss', 'SubDarceWin',
            'SubGuillotineAttempt', 'SubGuillotineLoss', 'SubGuillotineWin',
            'SubHeelHookAttempt', 'SubHeelHookLoss', 'SubHeelHookWin',
            'SubKimuraAttempt', 'SubKimuraLoss', 'SubKimuraWin',
            'SubNeckCrankAttempt', 'SubNeckCrankWin',
            'SubStraightArmLockAttempt', 'SubStraightArmLockLoss', 'SubStraightArmLockWin',
            'SubSulovStretchAttempt', 'SubSulovStretchLoss', 'SubSulovStretchWin',
            'SubTriangleArmbarAttempt', 'SubTriangleArmbarLoss', 'SubTriangleArmbarWin',
            'SubTriangleAttempt', 'SubTriangleLoss', 'SubTriangleWin',
            'TwisterAttempts', 'TwisterLosses', 'TwisterWins',
            'VonFlueAttempt', 'VonFlueLoss', 'VonFlueWin'
        ],
        'takedown_stats': [
            'AnklePickDefends', 'AttemptedAnklePickTD', 'FailedAnklePickTD', 'SuccessfulAnklePickTD',
            'AttemptedImanariTD', 'FailedImanariTD', 'ImanariDefends', 'SuccessfulImanariTD',
            'AttemptedThrowTD', 'FailedThrowTD', 'SuccessfulThrowTD',
            'BodyLockDefends', 'BodyLockTakedownAttempts', 'BodyLockTakedownFail', 'BodyLockTakedownSuccess',
            'DoubleLegDefends', 'DoubleLegTakedownAttempts', 'DoubleLegTakedownFail', 'DoubleLegTakedownSuccess',
            'SingleLegDefends', 'SingleLegTakedownAttempts', 'SingleLegTakedownFail', 'SingleLegTakedownSuccess',
            'TripDefends', 'TripTakedownAttempts', 'TripTakedownFail', 'TripTakedownSuccess',
            'ThrowDefends', 'TakedownsAA'
        ],
        'striking_stats': [
            'BodyKicksAA', 'BodyKicksAbsorbed', 'HeadKicksAA', 'HeadKicksAbsorbed',
            'CrossesAA', 'CrossesAbsorbed', 'HooksAA', 'HooksAbsorbed',
            'JabsAA', 'JabsAbsorbed', 'StraightsAA', 'StraightsAbsorbed',
            'UppercutsAA', 'UppercutsAbsorbed', 'LegKicksAA', 'LegKicksAbsorbed',
            'OverhandsAbsorbed', 'KnockdownsAA', 'StunsAA', 'TimesStunnedAA'
        ],
        'clinch_stats': [
            'BeingClinched', 'InClinch', 'ClinchStrikeHiMake', 'ClinchStrikeHiMiss',
            'ClinchStrikeLoMake', 'ClinchStrikeLoMiss', 'TotalClinchStrikesMade',
            'TotalClinchStrikesMissed', 'TotalClinchStrikesThrown'
        ],
        'ground_stats': [
            'GroundStrikeHiMake', 'GroundStrikeHiMiss', 'GroundStrikeLoMake', 'GroundStrikeLoMiss',
            'OnBottomGround', 'OnTopGround', 'TotalGroundStrikesMade', 'TotalGroundStrikesMissed', 'TotalGroundStrikesThrown'
        ],
        'left_hand_stats': [
            'LeftBodyKickMake', 'LeftBodyKickMiss', 'LeftCrossAttempts', 'LeftCrossMake', 'LeftCrossMissed',
            'LeftElbowMake', 'LeftElbowMiss', 'LeftHighKickMake', 'LeftHighKickMiss',
            'LeftHookHiMake', 'LeftHookHiMiss', 'LeftHookLoMake', 'LeftHookLoMiss',
            'LeftJabHiMake', 'LeftJabHiMiss', 'LeftJabLoMake', 'LeftJabLoMiss',
            'LeftLegKickMake', 'LeftLegKickMiss', 'LeftOverhandMake', 'LeftOverhandMiss',
            'LeftSpinBackFistMake', 'LeftSpinBackFistMiss', 'LeftStraightHiMake', 'LeftStraightHiMiss',
            'LeftStraightLoMake', 'LeftStraightLoMiss', 'LeftUppercutHiMake', 'LeftUppercutHiMiss',
            'LeftUppercutLoMake', 'LeftUppercutLoMiss'
        ],
        'right_hand_stats': [
            'RightBodyKickMake', 'RightBodyKickMiss', 'RightCrossAttempts', 'RightCrossMake', 'RightCrossMissed',
            'RightElbowMake', 'RightElbowMiss', 'RightHighKickMake', 'RightHighKickMiss',
            'RightHookHiMake', 'RightHookHiMiss', 'RightHookLoMake', 'RightHookLoMiss',
            'RightJabHiMake', 'RightJabHiMiss', 'RightJabLoMake', 'RightJabLoMiss',
            'RightLegKickMake', 'RightLegKickMiss', 'RightOverhandMake', 'RightOverhandMiss',
            'RightSpinBackFistMake', 'RightSpinBackFistMiss', 'RightStraightHiMake', 'RightStraightHiMiss',
            'RightStraightLoMake', 'RightStraightLoMiss', 'RightUppercutHiMake', 'RightUppercutHiMiss',
            'RightUppercutLoMake', 'RightUppercutLoMiss'
        ],
        'round_stats': [
            'Round1StrikesLanded', 'Round1StrikesThrown', 'Round2StrikesLanded', 'Round2StrikesThrown',
            'Round3StrikesLanded', 'Round3StrikesThrown', 'Round4StrikesLanded', 'Round4StrikesThrown',
            'Round5StrikesLanded', 'Round5StrikesThrown'
        ],
        'knockout_stats': [
            'KnockoutLossviaBodyKick', 'KnockoutLossviaBodyShot', 'KnockoutLossviaHeadKick',
            'KnockoutLossviaHook', 'KnockoutLossviaJab', 'KnockoutLossviaLegKick',
            'KnockoutLossviaStraight', 'KnockoutLossviaUppercut', 'KnockoutWinviaLeftElbow',
            'KnockoutWinviaLeftFoot', 'KnockoutWinviaLeftHand', 'KnockoutWinviaLeftKnee',
            'KnockoutWinviaRightElbow', 'KnockoutWinviaRightFoot', 'KnockoutWinviaRightHand',
            'KnockoutWinviaRightKnee'
        ],
        'fight_outcome_stats': [
            'FighterWins', 'FighterLoss', 'FighterDraw', 'FighterNC',
            'FighterKOWins', 'FighterKOLoss', 'FighterTKOWins', 'FighterTKOLoss',
            'FighterSUBWin', 'FighterSUBLoss', 'FighterUDWins', 'FighterUDLoss',
            'FighterMajDecWin', 'FighterMajDecLoss', 'FighterSplitDecWin', 'FighterSplitDecLoss',
            'WinsInThe4thRd', 'WinsInThe5thRd', 'WinsInTitleFights',
            'LossesInThe4thRd', 'LossesInThe5thRd', 'LossesInTitleFights'
        ],
        'stance_matchup_stats': [
            'WinsVsOrthodox', 'WinsVsSouthpaw', 'WinsVsSwitch',
            'LossesVsOrthodox', 'LossesVsSouthpaw', 'LossesVsSwitch',
            'OrthodoxWins', 'OrthodoxLosses', 'SouthpawWins', 'SouthpawLosses', 'SwitchWins', 'SwitchLosses'
        ],
        'total_stats': [
            'TotalBodyKicksMade', 'TotalBodyKicksMissed', 'TotalBodyKicksThrown',
            'TotalCrossAttempts', 'TotalCrossMake', 'TotalCrossMissed',
            'TotalElbowsMade', 'TotalElbowsMissed', 'TotalElbowsThrown',
            'TotalHighKicksMade', 'TotalHighKicksMissed', 'TotalHighKicksThrown',
            'TotalHooksMade', 'TotalHooksMissed', 'TotalHooksThrown',
            'TotalJabsMade', 'TotalJabsMissed', 'TotalJabsThrown',
            'TotalKicksLanded', 'TotalKicksThrown',
            'TotalLegKicksMade', 'TotalLegKicksMissed', 'TotalLegKicksThrown',
            'TotalOverhandsMade', 'TotalOverhandsMissed', 'TotalOverhandsThrown',
            'TotalPunchesLanded', 'TotalPunchesThrown',
            'TotalSpinBackFistsMade', 'TotalSpinBackFistsMissed', 'TotalSpinBackFistsThrown',
            'TotalStraightsMade', 'TotalStraightsMissed', 'TotalStraightsThrown',
            'TotalStrikesLanded', 'TotalUppercutsMade', 'TotalUppercutsMissed', 'TotalUppercutsThrown'
        ],
        'gameplan_stats': [
            'GrapplingGameplans', 'GrapplingGameplanWins', 'GrapplingGameplanLoss',
            'StrikingGameplans', 'StrikingGameplanWins', 'StrikingGameplanLoss'
        ],
        'defensive_stats': [
            'TimesAnklePicked', 'TimesBodyLocked', 'TimesDoubleLegged', 'TimesImanaried',
            'TimesKnockedDown', 'TimesSingleLegged', 'TimesStunned', 'TimesThrown', 'TimesTripped'
        ]
    }
    
    # Process regular fields first
    for key, value in row.items():
        # Skip empty keys
        if not key or key.strip() == '':
            continue
            
        # Convert value to proper type
        processed_value = convert_value_to_proper_type(value)
        
        # Only add non-None values to reduce document size
        if processed_value is not None:
            processed_row[key] = processed_value
    
    # Organize stats into categories
    for category_name, field_list in categories.items():
        category_stats = {}
        for field in field_list:
            if field in processed_row:
                category_stats[field] = processed_row[field]
                # Remove from main row to avoid duplication
                del processed_row[field]
        
        # Only add category if it has data
        if category_stats:
            processed_row[category_name] = category_stats
    
    return processed_row

def load_fighter_names(fighter_names_csv_path: str) -> Dict[str, str]:
    """
    Load fighter names from FighterNames CSV file.
    
    Args:
        fighter_names_csv_path: Path to the FighterNames CSV file
        
    Returns:
        Dictionary mapping fighterCode to fighterName
    """
    fighter_names = {}
    
    if not os.path.exists(fighter_names_csv_path):
        print(f"⚠️  FighterNames CSV not found: {fighter_names_csv_path}")
        return fighter_names
    
    try:
        with open(fighter_names_csv_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                fighter_code = row.get('fighterCode', '').strip()
                fighter_name = row.get('fighterName', '').strip()
                
                if fighter_code and fighter_name:
                    fighter_names[fighter_code] = fighter_name
        
        print(f"📋 Loaded {len(fighter_names)} fighter names from {fighter_names_csv_path}")
        return fighter_names
        
    except Exception as e:
        print(f"❌ Error loading fighter names: {e}")
        return fighter_names

def upload_fighter_data_batch(csv_file_path: str, collection_name: str = 'fighterData', batch_size: int = 500):
    """
    Upload fighter data from CSV to Firestore using batch operations.
    
    Args:
        csv_file_path: Path to the CSV file
        collection_name: Name of the Firestore collection
        batch_size: Number of documents to upload in each batch
    """
    # Initialize Firebase
    initialize_firebase()
    
    # Get Firestore client
    db = get_firestore_client()
    collection_ref = db.collection(collection_name)
    
    # Load fighter names
    fighter_names_csv_path = "oldData/FighterNames.csv"
    fighter_names = load_fighter_names(fighter_names_csv_path)
    
    # Check if CSV file exists
    if not os.path.exists(csv_file_path):
        print(f"❌ CSV file not found: {csv_file_path}")
        sys.exit(1)
    
    print(f"📁 Reading CSV file: {csv_file_path}")
    print(f"⚡ Using batch size: {batch_size}")
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            # Read CSV with DictReader to get column names
            reader = csv.DictReader(csvfile)
            
            # Get total number of rows for progress tracking
            rows = list(reader)
            total_rows = len(rows)
            
            print(f"📊 Found {total_rows} rows to upload")
            
            # Process rows in batches
            success_count = 0
            error_count = 0
            batch_count = 0
            
            for i in range(0, total_rows, batch_size):
                batch_count += 1
                batch_end = min(i + batch_size, total_rows)
                batch_rows = rows[i:batch_end]
                
                print(f"\n🔄 Processing batch {batch_count} (rows {i+1}-{batch_end})")
                
                # Create a new batch
                batch = db.batch()
                batch_errors = []
                
                for j, row in enumerate(batch_rows):
                    try:
                        # Process the row
                        processed_data = process_csv_row(row)
                        
                        # Add fighter name if available
                        fighter_code = processed_data.get('fighterCode')
                        if fighter_code and fighter_code in fighter_names:
                            processed_data['fighterName'] = fighter_names[fighter_code]
                        
                        # Use the _id field as document ID if available, otherwise auto-generate
                        document_id = processed_data.get('_id')
                        if not document_id:
                            # If no _id, use fighterCode or auto-generate
                            document_id = processed_data.get('fighterCode', f"fighter_{i+j+1}")
                        
                        # Remove _id from data since it's used as document ID
                        if '_id' in processed_data:
                            del processed_data['_id']
                        
                        # Add to batch
                        doc_ref = collection_ref.document(str(document_id))
                        batch.set(doc_ref, processed_data)
                        
                    except Exception as e:
                        error_count += 1
                        batch_errors.append(f"Row {i+j+1}: {e}")
                        continue
                
                # Commit the batch
                try:
                    batch.commit()
                    batch_success = len(batch_rows) - len(batch_errors)
                    success_count += batch_success
                    
                    print(f"✅ Batch {batch_count} committed: {batch_success} successful, {len(batch_errors)} errors")
                    
                    if batch_errors:
                        print("   Errors in this batch:")
                        for error in batch_errors:
                            print(f"   - {error}")
                    
                except Exception as e:
                    error_count += len(batch_rows)
                    print(f"❌ Batch {batch_count} failed: {e}")
                    print("   All rows in this batch will be retried individually")
                    
                    # Retry individual documents
                    for j, row in enumerate(batch_rows):
                        try:
                            processed_data = process_csv_row(row)
                            
                            # Add fighter name if available
                            fighter_code = processed_data.get('fighterCode')
                            if fighter_code and fighter_code in fighter_names:
                                processed_data['fighterName'] = fighter_names[fighter_code]
                            
                            document_id = processed_data.get('_id')
                            if not document_id:
                                document_id = processed_data.get('fighterCode', f"fighter_{i+j+1}")
                            
                            if '_id' in processed_data:
                                del processed_data['_id']
                            
                            doc_ref = collection_ref.document(str(document_id))
                            doc_ref.set(processed_data)
                            success_count += 1
                            error_count -= 1  # Adjust error count
                            
                        except Exception as retry_error:
                            print(f"   ❌ Retry failed for row {i+j+1}: {retry_error}")
                
                # Print overall progress
                progress = batch_end / total_rows * 100
                print(f"📈 Overall Progress: {batch_end}/{total_rows} ({progress:.1f}%) - Success: {success_count}, Errors: {error_count}")
            
            print(f"\n🎉 Upload completed!")
            print(f"✅ Successfully uploaded: {success_count} documents")
            print(f"📦 Processed in {batch_count} batches")
            if error_count > 0:
                print(f"❌ Failed uploads: {error_count} documents")
            else:
                print(f"🎯 All documents uploaded successfully!")
                
    except Exception as e:
        print(f"❌ Error reading CSV file: {e}")
        sys.exit(1)

def main():
    """Main function to run the batch upload script."""
    print("🚀 Starting FighterData CSV to Firestore batch upload...")
    print("=" * 60)
    
    # CSV file path
    csv_file_path = "oldData/FighterData.csv"
    
    # Upload the data with batch processing
    upload_fighter_data_batch(csv_file_path, batch_size=500)
    
    print("=" * 60)
    print("✨ Script completed!")

if __name__ == "__main__":
    main() 