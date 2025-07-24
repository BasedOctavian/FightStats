# FighterData CSV to Firestore Upload Script

This script uploads fighter data from the `FighterData.csv` file to a Firestore database in the `fighterData` collection.

## Prerequisites

1. **Python 3.7+** installed on your system
2. **Firebase project** with Firestore enabled
3. **Service account credentials** for Firebase Admin SDK

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Firebase Authentication Setup

The script is configured to use the service account file: `fightstats-30352-firebase-adminsdk-fbsvc-f8205199b1.json`

**Simply place this file in the same directory as the script.**

#### Alternative Authentication Methods

If you prefer to use different authentication methods:

##### Option A: Environment Variable

```bash
# On Windows
set GOOGLE_APPLICATION_CREDENTIALS=path/to/your/serviceAccountKey.json

# On macOS/Linux
export GOOGLE_APPLICATION_CREDENTIALS=path/to/your/serviceAccountKey.json
```

##### Option B: Google Cloud Platform (GCP)

If running on GCP (Cloud Run, Compute Engine, etc.), the script will automatically use the default service account.

##### Option C: Firebase Emulator (for testing)

For local testing, you can use the Firebase emulator:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Start Firestore emulator
firebase emulators:start --only firestore
```

## Usage

### Basic Usage

```bash
python upload_fighter_data.py
```

The script will:
1. Read the `oldData/FighterData.csv` file
2. Process each row and convert data types appropriately
3. Upload each fighter record to the `fighterData` collection in Firestore
4. Use the `_id` field as the document ID, or fall back to `fighterCode` or auto-generated ID
5. Display progress and results

### Batch Upload (Recommended for Large Datasets)

```bash
python upload_fighter_data_batch.py
```

The batch version:
- Uses Firestore batch operations for better performance
- Processes 500 documents per batch by default
- Provides more detailed progress information
- Has automatic retry mechanism for failed batches

### Custom Collection Name

You can modify the script to use a different collection name by changing the `collection_name` parameter in the `upload_fighter_data()` function call.

## Data Processing

The script automatically:

- **Converts data types**: Strings are converted to integers/floats where appropriate
- **Handles empty values**: Empty fields are excluded from the document
- **Uses proper document IDs**: Uses the `_id` field from CSV as document ID
- **Progress tracking**: Shows upload progress every 10 rows
- **Error handling**: Continues processing even if individual rows fail

## CSV Structure

The script expects a CSV file with the following structure:
- Multiple columns with fighter statistics (all numeric values)
- An `_id` column for document identification
- A `fighterCode` column as fallback identifier

## Output

The script provides detailed output including:
- ✅ Success messages for Firebase initialization
- 📊 Row count and progress updates
- 📈 Progress percentage and success/error counts
- 🎉 Final summary with total uploads and any errors

## Troubleshooting

### Common Issues

1. **Authentication Error**: Ensure your service account has proper Firestore permissions
2. **File Not Found**: Verify the CSV file exists at `oldData/FighterData.csv`
3. **Service Account Not Found**: Make sure `fightstats-30352-firebase-adminsdk-fbsvc-441753a02d.json` is in the same directory
4. **Permission Denied**: Check that your service account has write access to Firestore
5. **Network Issues**: Ensure you have internet connectivity to Firebase

### Debug Mode

For detailed error information, the script will show:
- Specific error messages for failed uploads
- Row data that caused errors
- Firebase initialization status

## Security Notes

- Never commit service account keys to version control
- Use environment variables for sensitive credentials
- Consider using Firebase Security Rules to restrict access
- The script only uploads data - it doesn't delete or modify existing documents

## Performance

- The script processes rows sequentially to avoid overwhelming Firestore
- Progress is shown every 10 rows for monitoring
- Large datasets may take several minutes to upload
- The batch version is recommended for datasets with 100+ rows 