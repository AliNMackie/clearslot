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
    logger = logging.getLogger("clearslot.events")
    # In production, structured logging (JSON) is preferred.
    if level.upper() == "ERROR":
        logger.error(f"EVENT: {event_name} DATA: {data}")
    elif level.upper() == "WARNING":
        logger.warning(f"EVENT: {event_name} DATA: {data}")
    else:
        logger.info(f"EVENT: {event_name} DATA: {data}")
