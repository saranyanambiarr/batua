# what this file does -

# redis interaction
# token revocation
# logout handling

# this file wont have fastapi imports or request/response objects

import redis
# pip install redis
from app.core.config import settings

redis_client = redis.from_url(settings.REDIS_URL) # connects to the instance using a connection string (e.g., redis://localhost:6379/0)

def blacklist_token(token:str, exp_seconds:int):
    redis_client.setex(token, exp_seconds, "blacklisted") # set with expiration cmd; stores the token and automatically deletes it after exp_seconds; perfect for JWTs bcoz once a token naturally expires, no longer need to track it in the blacklist.

def is_token_blacklisted(token:str) -> bool:
    return redis_client.exists(token) == 1 # to check if key is present

# storing raw jwts in redis can consume unnecessary memory and technically exposes the token signature. hash the token using sha265 before using it as the redis key