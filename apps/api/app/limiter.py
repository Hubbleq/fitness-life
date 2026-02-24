import os
from slowapi import Limiter
from slowapi.util import get_remote_address


def get_rate_limit(env_name: str, default: str) -> str:
    return os.getenv(env_name, default)


limiter = Limiter(key_func=get_remote_address)
