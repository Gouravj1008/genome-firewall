from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone

import jwt
from passlib.context import CryptContext

SECRET_KEY = os.getenv('JWT_SECRET', 'genome-firewall-demo-secret')
ALGORITHM = 'HS256'

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=int(os.getenv("BCRYPT_ROUNDS", "12")))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: str) -> str:
    payload = {
        'sub': subject,
        'iat': datetime.now(timezone.utc),
        'exp': datetime.now(timezone.utc) + timedelta(hours=12),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
