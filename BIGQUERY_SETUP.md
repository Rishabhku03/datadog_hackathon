# BigQuery Setup SQL Commands

## 1. Add New Columns to Existing Table

Run this in BigQuery Console (https://console.cloud.google.com/bigquery):

```sql
ALTER TABLE `datadog-hackthon.image_pipeline.image_metadata`
ADD COLUMN platform_name STRING,
ADD COLUMN is_AIgen BOOL;
```

## 2. Insert Dummy Data

```sql
INSERT INTO `datadog-hackthon.image_pipeline.image_metadata` 
  (image_id, gcs_url, captured_at, platform_name, is_AIgen)
VALUES
  (GENERATE_UUID(), 'gs://datadog-bucket-ai-detector/reddit_abc123.jpg', TIMESTAMP('2026-02-20 10:00:00'), 'reddit', TRUE),
  (GENERATE_UUID(), 'gs://datadog-bucket-ai-detector/twitter_def456.jpg', TIMESTAMP('2026-02-20 11:30:00'), 'twitter', FALSE),
  (GENERATE_UUID(), 'gs://datadog-bucket-ai-detector/reddit_ghi789.jpg', TIMESTAMP('2026-02-20 14:15:00'), 'reddit', TRUE),
  (GENERATE_UUID(), 'gs://datadog-bucket-ai-detector/instagram_jkl012.jpg', TIMESTAMP('2026-02-21 09:00:00'), 'instagram', FALSE),
  (GENERATE_UUID(), 'gs://datadog-bucket-ai-detector/twitter_mno345.jpg', TIMESTAMP('2026-02-21 12:45:00'), 'twitter', TRUE),
  (GENERATE_UUID(), 'gs://datadog-bucket-ai-detector/facebook_pqr678.jpg', TIMESTAMP('2026-02-21 15:30:00'), 'facebook', TRUE),
  (GENERATE_UUID(), 'gs://datadog-bucket-ai-detector/reddit_stu901.jpg', TIMESTAMP('2026-02-21 16:00:00'), 'reddit', FALSE),
  (GENERATE_UUID(), 'gs://datadog-bucket-ai-detector/youtube_vwx234.jpg', TIMESTAMP('2026-02-21 18:20:00'), 'youtube', TRUE);
```

## 3. Verify Data

```sql
SELECT * FROM `datadog-hackthon.image_pipeline.image_metadata` ORDER BY captured_at DESC LIMIT 10;
```

## 4. Analytics Queries

### Total & AI Rate
```sql
SELECT 
  COUNT(*) as total_images,
  SUM(CASE WHEN is_AIgen THEN 1 ELSE 0 END) as ai_detected,
  ROUND(SUM(CASE WHEN is_AIgen THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as ai_percentage
FROM `datadog-hackthon.image_pipeline.image_metadata`;
```

### By Platform
```sql
SELECT 
  platform_name,
  COUNT(*) as total,
  SUM(CASE WHEN is_AIgen THEN 1 ELSE 0 END) as ai_detected,
  ROUND(SUM(CASE WHEN is_AIgen THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as ai_percentage
FROM `datadog-hackthon.image_pipeline.image_metadata`
GROUP BY platform_name
ORDER BY ai_detected DESC;
```

### By Date
```sql
SELECT 
  DATE(captured_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN is_AIgen THEN 1 ELSE 0 END) as ai_detected
FROM `datadog-hackthon.image_pipeline.image_metadata`
GROUP BY DATE(captured_at)
ORDER BY date;
```
