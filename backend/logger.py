import logging
import sys

# Configure structured logging
# In production (Cloud Run), these logs are captured by Cloud Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)

def get_logger(name: str):
    return logging.getLogger(f"clearslot.{name}")

def log_event(event_name: str, data: dict, level: str = "INFO"):
    logger = logging.getLogger("clearslot")
    # Structured logging for Cloud Run
    import json
    
    payload = {
        "severity": level.upper(),
        "message": f"{event_name}: {data}",
        "event": event_name,
        "data": data,
        "component": "backend"
    }
    print(json.dumps(payload))
