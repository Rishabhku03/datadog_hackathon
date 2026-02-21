# LightDash Setup Guide

This guide walks you through connecting LightDash to BigQuery and creating an analytics dashboard.

## Prerequisites

- A LightDash account (cloud.qlik.com or self-hosted)
- Google Cloud Platform project with BigQuery access

---

## Step 1: Connect BigQuery to LightDash

### Option A: New LightDash Project

1. **Create New Project**
   - Go to your LightDash instance
   - Click "Create new project"
   - Select **BigQuery** as the warehouse

2. **Configure Connection**
   - **Project ID**: `datadog-hackthon`
   - **Dataset**: `image_pipeline`
   - **Method**: Choose one:
     
     **Option 1: Service Account JSON**
     - Download service account key from GCP (IAM > Service Accounts > Keys)
     - Upload the JSON file
     
     **Option 2: OAuth**
     - Click "Connect with Google"
     - Select your Google account
     - Grant BigQuery access

3. **Test Connection**
   - Click "Test connection"
   - Should show "Connected successfully"

4. **Save & Continue**
   - Name your project: "AI Content Detector"
   - Click "Save"

---

## Step 2: Import Tables

1. **Select Tables**
   - LightDash will detect `image_metadata` table
   - Click to select it
   - Click "Import"

2. **Verify Columns**
   - Confirm these columns are detected:
     - `image_id` (STRING)
     - `gcs_url` (STRING)
     - `captured_at` (TIMESTAMP)
     - `platform_name` (STRING)
     - `is_AIgen` (BOOL)

---

## Step 3: Create Metrics

Create these metrics in LightDash for your dashboard:

### Metric 1: Total Images
```yaml
name: total_images
type: count
sql: image_id
```

### Metric 2: AI Detected
```yaml
name: ai_detected
type: count
sql: CASE WHEN is_AIgen THEN image_id END
```

### Metric 3: AI Detection Rate
```yaml
name: ai_detection_rate
type: average
sql: CASE WHEN is_AIgen THEN 1.0 ELSE 0.0 END
```

### Metric 4: By Platform
```yaml
name: images_by_platform
type: count
sql: image_id
group_by: platform_name
```

---

## Step 4: Create Dashboard

### Dashboard 1: Overview

Create a dashboard with these tiles:

1. **Total Images** (Big Number)
   - Metric: `total_images`
   - Label: "Total Images Analyzed"

2. **AI Detection Rate** (Big Number)
   - Metric: `ai_detection_rate`
   - Label: "AI Detection Rate"
   - Format: percentage

3. **AI by Platform** (Bar Chart)
   - X-axis: `platform_name`
   - Y-axis: `ai_detected`
   - Filter: `is_AIgen = TRUE`

4. **Trend Over Time** (Line Chart)
   - X-axis: `captured_at` (truncated to day)
   - Y-axis: `total_images`, `ai_detected`

5. **Recent Detections** (Table)
   - Columns: `captured_at`, `platform_name`, `is_AIgen`, `gcs_url`
   - Sort: `captured_at` DESC
   - Limit: 10

---

## Step 5: Save & Share

1. **Save Dashboard**
   - Click "Save"
   - Name: "AI Content Detector Dashboard"

2. **Share**
   - Click "Share"
   - Generate public link OR
   - Invite team members

---

## Example Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  AI Content Detector Dashboard                          │
├──────────────────────┬──────────────────────────────────┤
│  Total Images        │  AI Detection Rate              │
│  8                  │  62.5%                          │
│  📊                 │  🤖                             │
├──────────────────────┴──────────────────────────────────┤
│                                                         │
│  AI Detections by Platform                             │
│  ┌──────────┬────────────┐                            │
│  │ reddit   │ ████████ 4 │                            │
│  │ twitter  │ ██████   2 │                            │
│  │ facebook │ ████     1 │                            │
│  │ youtube  │ ████     1 │                            │
│  └──────────┴────────────┘                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Detections Over Time                                  │
│  📈                                                   │
│  Feb 20  ▂▃▄▅▆▇█                                      │
│  Feb 21  ██▇▆▅▄▃▂                                     │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Recent Detections                                     │
│  ┌────────────┬──────────┬─────────┐                   │
│  │ Date       │ Platform │ AI?     │                   │
│  ├────────────┼──────────┼─────────┤                   │
│  │ 2026-02-21│ youtube  │ ✓      │                   │
│  │ 2026-02-21│ reddit   │ ✗      │                   │
│  │ 2026-02-21│ facebook │ ✓      │                   │
│  └────────────┴──────────┴─────────┘                   │
└─────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Connection Issues
- Verify service account has BigQuery Viewer role
- Check project ID is correct

### No Data Showing
- Run SQL in BigQuery console to verify data exists
- Check table name matches exactly

### Metrics Not Working
- Verify column names match exactly
- Check data types are correct

---

## Resources

- [LightDash Docs](https://docs.lightdash.com/)
- [BigQuery Integration](https://docs.lightdash.com/docs/connections/bigquery)
- [Creating Metrics](https://docs.lightdash.com/references/metrics)
- [Creating Dashboards](https://docs.lightdash.com/references/dashboards)
