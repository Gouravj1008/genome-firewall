from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class GenomeSample(Base):
    __tablename__ = 'genome_samples'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sample_name: Mapped[str] = mapped_column(String(255), nullable=False)
    genome_source: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class PredictionLog(Base):
    __tablename__ = 'prediction_logs'

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sample_name: Mapped[str] = mapped_column(String(255), nullable=False)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    label: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
