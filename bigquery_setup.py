#!/usr/bin/env python3
"""
BigQuery Setup Script
Run this locally with: python bigquery_setup.py

Requirements:
pip install google-cloud-bigquery google-auth
"""

from google.cloud import bigquery
import uuid
from datetime import datetime

# Initialize client (uses Application Default Credentials)
client = bigquery.Client()

def setup_bigquery():
    print("=== BigQuery Setup ===\n")
    
    # Step 1: Add columns
    print("Step 1: Adding columns to table...")
    try:
        alter_query = """
        ALTER TABLE `datadog-hackthon.image_pipeline.image_metadata`
        ADD COLUMN IF NOT EXISTS platform_name STRING,
        ADD COLUMN IF NOT EXISTS is_AIgen BOOL
        """
        job = client.query(alter_query)
        job.result()
        print("  ✓ Columns added successfully!")
    except Exception as e:
        print(f"  Note: {e}")
        print("  (Columns might already exist)")
    
    # Step 2: Insert dummy data
    print("\nStep 2: Inserting dummy data...")
    
    dummy_data = [
        {
            'image_id': str(uuid.uuid4()),
            'gcs_url': 'gs://datadog-bucket-ai-detector/reddit_abc123.jpg',
            'captured_at': datetime(2026, 2, 20, 10, 0, 0).isoformat(),
            'platform_name': 'reddit',
            'is_AIgen': True
        },
        {
            'image_id': str(uuid.uuid4()),
            'gcs_url': 'gs://datadog-bucket-ai-detector/twitter_def456.jpg',
            'captured_at': datetime(2026, 2, 20, 11, 30, 0).isoformat(),
            'platform_name': 'twitter',
            'is_AIgen': False
        },
        {
            'image_id': str(uuid.uuid4()),
            'gcs_url': 'gs://datadog-bucket-ai-detector/reddit_ghi789.jpg',
            'captured_at': datetime(2026, 2, 20, 14, 15, 0).isoformat(),
            'platform_name': 'reddit',
            'is_AIgen': True
        },
        {
            'image_id': str(uuid.uuid4()),
            'gcs_url': 'gs://datadog-bucket-ai-detector/instagram_jkl012.jpg',
            'captured_at': datetime(2026, 2, 21, 9, 0, 0).isoformat(),
            'platform_name': 'instagram',
            'is_AIgen': False
        },
        {
            'image_id': str(uuid.uuid4()),
            'gcs_url': 'gs://datadog-bucket-ai-detector/twitter_mno345.jpg',
            'captured_at': datetime(2026, 2, 21, 12, 45, 0).isoformat(),
            'platform_name': 'twitter',
            'is_AIgen': True
        },
        {
            'image_id': str(uuid.uuid4()),
            'gcs_url': 'gs://datadog-bucket-ai-detector/facebook_pqr678.jpg',
            'captured_at': datetime(2026, 2, 21, 15, 30, 0).isoformat(),
            'platform_name': 'facebook',
            'is_AIgen': True
        },
        {
            'image_id': str(uuid.uuid4()),
            'gcs_url': 'gs://datadog-bucket-ai-detector/reddit_stu901.jpg',
            'captured_at': datetime(2026, 2, 21, 16, 0, 0).isoformat(),
            'platform_name': 'reddit',
            'is_AIgen': False
        },
        {
            'image_id': str(uuid.uuid4()),
            'gcs_url': 'gs://datadog-bucket-ai-detector/youtube_vwx234.jpg',
            'captured_at': datetime(2026, 2, 21, 18, 20, 0).isoformat(),
            'platform_name': 'youtube',
            'is_AIgen': True
        },
    ]
    
    errors = client.insert_rows_json(
        'datadog-hackthon.image_pipeline.image_metadata', 
        dummy_data
    )
    
    if errors == []:
        print(f"  ✓ Inserted {len(dummy_data)} rows successfully!")
    else:
        print(f"  Error: {errors}")
    
    # Step 3: Verify
    print("\nStep 3: Verifying data...")
    query = """
    SELECT platform_name, is_AIgen, COUNT(*) as count
    FROM `datadog-hackthon.image_pipeline.image_metadata`
    GROUP BY platform_name, is_AIgen
    ORDER BY platform_name
    """
    job = client.query(query)
    
    print("\n  Data Summary:")
    for row in job.result():
        ai_status = "AI" if row.is_AIgen else "Real"
        print(f"    {row.platform_name}: {ai_status} = {row.count}")
    
    # Stats
    total_query = """
    SELECT COUNT(*) as total, 
           SUM(CASE WHEN is_AIgen THEN 1 ELSE 0 END) as ai_count 
    FROM `datadog-hackthon.image_pipeline.image_metadata`
    """
    job = client.query(total_query)
    for row in job.result():
        pct = (row.ai_count / row.total * 100) if row.total > 0 else 0
        print(f"\n  Total: {row.total} images, {row.ai_count} AI-generated ({pct:.1f}%)")
    
    print("\n=== Setup Complete! ===")

if __name__ == "__main__":
    setup_bigquery()
