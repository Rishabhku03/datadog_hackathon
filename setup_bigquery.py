from google.cloud import bigquery
import uuid
from datetime import datetime, timedelta

client = bigquery.Client()

# Add columns to table
print("Adding columns to table...")
try:
    alter_query = """
    ALTER TABLE `datadog-hackthon.image_pipeline.image_metadata`
    ADD COLUMN platform_name STRING,
    ADD COLUMN is_AIgen BOOL
    """
    query_job = client.query(alter_query)
    query_job.result()
    print("Columns added successfully!")
except Exception as e:
    print(f"Error adding columns: {e}")
    print("Columns might already exist, continuing...")

# Insert dummy data
print("\nInserting dummy data...")
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

errors = client.insert_rows_json('datadog-hackthon.image_pipeline.image_metadata', dummy_data)
if errors == []:
    print(f"Successfully inserted {len(dummy_data)} rows!")
else:
    print(f"Errors: {errors}")

# Verify data
print("\nVerifying data...")
query = """
SELECT platform_name, is_AIgen, COUNT(*) as count
FROM `datadog-hackthon.image_pipeline.image_metadata`
GROUP BY platform_name, is_AIgen
ORDER BY platform_name
"""
query_job = client.query(query)
print("\nData summary:")
for row in query_job.result():
    print(f"  {row.platform_name}: AI={row.is_AIgen} -> {row.count} images")

# Total stats
total_query = "SELECT COUNT(*) as total, SUM(CASE WHEN is_AIgen THEN 1 ELSE 0 END) as ai_count FROM `datadog-hackthon.image_pipeline.image_metadata`"
query_job = client.query(total_query)
for row in query_job.result():
    ai_pct = (row.ai_count / row.total * 100) if row.total > 0 else 0
    print(f"\nTotal: {row.total} images, {row.ai_count} AI-generated ({ai_pct:.1f}%)")
