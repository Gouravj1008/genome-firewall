from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=3)
    password: str = Field(min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal['bearer'] = 'bearer'


class AnalysisRequest(BaseModel):
    source: str


class QuestionRequest(BaseModel):
    question: str


class LabRequest(BaseModel):
    risk_score: float = Field(ge=0, le=1)
    selected_antibiotics: list[str] = Field(default_factory=list)


class PredictResponse(BaseModel):
    label: str
    risk_score: float
    confidence: float
    uncertainty: float
    dominant_genes: list[dict]
    feature_importance: list[dict]
    selected_antibiotics: list[dict]


class SimulationResponse(BaseModel):
    items: list[dict]


class AssistantResponse(BaseModel):
    answer: str
