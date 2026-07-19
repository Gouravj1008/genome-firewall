from __future__ import annotations

import os

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./genomefirewall.db')

connect_args = {"check_same_thread": False, "timeout": 30} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_size=int(os.getenv('DB_POOL_SIZE', '100')),
    max_overflow=int(os.getenv('DB_MAX_OVERFLOW', '50')),
    pool_timeout=int(os.getenv('DB_POOL_TIMEOUT', '60')),
    future=True,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


@event.listens_for(Engine, "connect")
def configure_sqlite_connection(dbapi_connection, connection_record) -> None:
    if not DATABASE_URL.startswith("sqlite"):
        return

    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA busy_timeout=30000")
    cursor.close()