# ClearSlot Backend Service (GCP Cloud Run)

This service acts as a proxy and data processor for the AviationWeather.gov API. It is designed to be deployed to Google Cloud Run.

## Local Development

1.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run Locally**:
    ```bash
    uvicorn main:app --reload --port 8080
    ```

3.  **Test Endpoints**:
    -   METAR: `http://localhost:8080/api/v1/weather/metar?ids=EGLL`
    -   TAF: `http://localhost:8080/api/v1/weather/taf?ids=EGLL`
    -   Station Info: `http://localhost:8080/api/v1/airport/info?ids=EGLL`

## Deployment to Google Cloud Run

1.  **Build Container**:
    ```bash
    gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/clearslot-backend
    ```

2.  **Deploy**:
    ```bash
    gcloud run deploy clearslot-backend \
      --image gcr.io/YOUR_PROJECT_ID/clearslot-backend \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated
    ```

## API References
-   Based on [AviationWeather.gov Data API](https://aviationweather.gov/data/api/)
