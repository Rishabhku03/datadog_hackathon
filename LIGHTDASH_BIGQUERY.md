# LightDash Setup for AI Content Detector

This guide helps you set up a LightDash dashboard connected to BigQuery for the AI Content Detector project.

---

## Prerequisites

1. **LightDash Account**: Go to https://app.lightdash.cloud and sign up
2. **BigQuery Project**: `datadog-hackthon` with table `image_pipeline.image_metadata`

---

## Step 1: Install LightDash CLI

```bash
npm install -g @lightdash/cli
```

---

## Step 2: Create LightDash Project

Create a new folder for your LightDash project:

```bash
mkdir ai-detector-lightdash
cd ai-detector-lightdash
```

---

## Step 3: Create Configuration Files

### lightdash.config.yml
```yaml
projects:
  - name: ai-content-detector
    project_uuid: your-project-uuid-here
    warehouse_connection:
      type: bigquery
      project: datadog-hackthon
      dataset: image_pipeline
      # Credentials will be set via UI or environment
```

### lightdash/models/image_metadata.yml
```yaml
version: 2

models:
  - name: image_metadata
    description: "AI Content Detector - Image metadata table"
    meta:
      label: "Image Metadata"
    schema: image_pipeline
    
    columns:
      - name: image_id
        description: "Unique identifier for the image"
        meta:
          label: "Image ID"
          hidden: false
        
      - name: gcs_url
        description: "Google Cloud Storage URL"
        meta:
          label: "GCS URL"
        
      - name: captured_at
        description: "Timestamp when image was captured"
        meta:
          label: "Captured At"
          dimension:
            timeInterval: day
        
      - name: platform_name
        description: "Platform where image was captured (reddit, twitter, etc)"
        meta:
          label: "Platform"
          dimension:
            categories:
              - reddit
              - twitter
              - facebook
              - instagram
              - youtube
              - linkedin
              - tiktok
        
      - name: is_AIgen
        description: "Whether the image was detected as AI-generated"
        meta:
          label: "AI Generated"
          dimension:
            type: yesno

    metrics:
      total_images:
        type: count
        label: "Total Images"
        description: "Total number of images analyzed"

      ai_detected:
        type: count
        label: "AI Detected"
        description: "Number of images detected as AI-generated"
        filters:
          - field: is_AIgen
            operator: is_true

      ai_detection_rate:
        type: average
        label: "AI Detection Rate"
        description: "Percentage of images detected as AI-generated"
        sql: "CASE WHEN {is_AIgen} THEN 1.0 ELSE 0.0 END"

      images_by_platform:
        type: count
        label: "Images by Platform"
        group_by: platform_name

      ai_by_platform:
        type: count
        label: "AI Detections by Platform"
        filters:
          - field: is_AIgen
            operator: is_true
        group_by: platform_name
```

---

## Step 4: Connect BigQuery

1. Go to your LightDash project
2. Navigate to **Project Settings** → **Connections**
3. Add a new warehouse connection
4. Select **BigQuery**
5. Enter:
   - Project ID: `datadog-hackthon`
   - Dataset: `image_pipeline`
   - Use service account authentication

---

## Step 5: Deploy and Create Dashboard

```bash
# Lint your project
lightdash lint

# Deploy
lightdash deploy --create

# Upload charts/dashboards
lightdash upload
```

---

## Alternative: Manual Setup (No CLI)

If you prefer not to use the CLI:

1. **Connect BigQuery** in LightDash UI
2. **Import Tables**: Select `image_metadata` table
3. **Create Metrics** using the UI:
   - Total Images: `COUNT(image_id)`
   - AI Detected: `COUNT(image_id)` where `is_AIgen = TRUE`
   - AI Rate: `AVG(CASE WHEN is_AIgen THEN 1 ELSE 0 END)`
4. **Create Dashboard** with charts:
   - Big number: Total Images
   - Big number: AI Detection Rate %
   - Bar chart: AI by Platform
   - Line chart: Images over time

---

## Dashboard Layout Example

```
┌─────────────────────────────────────────────────────────┐
│  AI Content Detector Dashboard                          │
├──────────────────────┬──────────────────────────────────┤
│  Total Images        │  AI Detection Rate              │
│  8                  │  62.5%                          │
├──────────────────────┴──────────────────────────────────┤
│  AI Detections by Platform                              │
│  ┌──────────┬────────────┐                           │
│  │ reddit   │ ████████ 4 │                           │
│  │ twitter  │ ██████   2 │                           │
│  │ facebook │ ████     1 │                           │
│  │ youtube  │ ████     1 │                           │
│  └──────────┴────────────┘                           │
├─────────────────────────────────────────────────────────┤
│  Images Over Time                                      │
│  ████████████████████                                  │
│  Feb 20 ─────────── Feb 21                            │
└─────────────────────────────────────────────────────────┘
```

---

## Useful Commands

```bash
# Download existing content
lightdash download

# Lint check
lightdash lint

# Deploy changes
lightdash deploy

# Upload charts/dashboards
lightdash upload
```

---

## Support

- LightDash Docs: https://docs.lightdash.com
- BigQuery Connection: https://docs.lightdash.com/docs/connections-bigquery
