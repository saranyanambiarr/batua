import logging
import logging.handlers
import json
import os
import traceback
from datetime import datetime, timezone
from pathlib import Path

SERVICE_NAME = "budget_service"
LOG_LEVEL    = os.getenv("LOG_LEVEL", "INFO").upper()
LOG_DIR      = Path("/app/logs")
LOG_FILE     = LOG_DIR / "budget_service.log"


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts":      datetime.now(timezone.utc).isoformat(),
            "service": SERVICE_NAME,
            "level":   record.levelname,
            "logger":  record.name,
            "msg":     record.getMessage(),
        }
        for key, val in record.__dict__.items():
            if key not in (
                "msg", "args", "levelname", "levelno", "pathname", "filename",
                "module", "exc_info", "exc_text", "stack_info", "lineno",
                "funcName", "created", "msecs", "relativeCreated", "thread",
                "threadName", "processName", "process", "name", "message",
            ):
                payload[key] = val
        if record.exc_info:
            payload["exc"] = traceback.format_exception(*record.exc_info)
        return json.dumps(payload, default=str)


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger
    logger.setLevel(LOG_LEVEL)
    fmt = JsonFormatter()
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(fmt)
    logger.addHandler(stream_handler)
    try:
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        file_handler = logging.handlers.RotatingFileHandler(
            LOG_FILE, maxBytes=5 * 1024 * 1024, backupCount=3, encoding="utf-8"
        )
        file_handler.setFormatter(fmt)
        logger.addHandler(file_handler)
    except OSError:
        pass
    logger.propagate = False
    return logger
