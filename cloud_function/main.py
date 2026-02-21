from google.cloud import storage
from google.cloud import bigquery
import uuid
from datetime import datetime
import base64

def upload_image(request):
    if request.method == 'OPTIONS':
        return ('', 204, {'Access-Control-Allow-Origin': '*'})

    request_json = request.get_json()
    image_data = request_json.get('image_data')
    platform = request_json.get('platform', 'unknown')
    api_key = request_json.get('api_key')
    
    if api_key != 'AIzaSyBQTCpDOWoXL57QqnpSjOBjDZVLXQQKc24':
        return ({'error': 'Invalid API key'}, 401, {'Access-Control-Allow-Origin': '*'})
    
    client = storage.Client()
    bucket = client.bucket('datadog-bucket-ai-detector')
    
    image_id = str(uuid.uuid4())
    filename = f"{platform}_{image_id}.jpg"
    
    blob = bucket.blob(filename)
    blob.upload_from_string(base64.b64decode(image_data), content_type='image/jpeg')
    
    gcs_path = f"gs://datadog-bucket-ai-detector/{filename}"
    
    bq_client = bigquery.Client()
    bq_client.insert_rows_json('datadog-hackthon.image_pipeline.image_metadata', [{
        'image_id': image_id,
        'gcs_url': gcs_path,
        'captured_at': datetime.now().isoformat(),
        'platform_name': platform,
        'is_AIgen': None  # To be updated by Airia integration
    }])
    
    return ({'success': True, 'image_id': image_id, 'gcs_url': gcs_path}, 200, 
            {'Access-Control-Allow-Origin': '*'})
