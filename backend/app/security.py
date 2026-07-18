from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

import jwt

SECRET_KEY = os.getenv('JWT_SECRET', 'genome-firewall-demo-secret')
ALGORITHM = 'HS256'


def create_access_token(subject: str) -> str:
    payload = {
        'sub': subject,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
