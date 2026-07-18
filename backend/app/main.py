from __future__ import annotations

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.exc import OperationalError

from .database import engine
from .models import Base
from .schemas import AnalysisRequest, AssistantResponse, LabRequest, LoginRequest, PredictResponse, SimulationResponse, TokenResponse
from .security import create_access_token, verify_access_token
from .simulation import answer_question, simulate_analysis, simulate_antibiotic_lab, simulate_time_machine

app = FastAPI(
    title='Genome Firewall AI API',
    version='1.0.0',
    description='FastAPI backend for bacterial genome resistance prediction, simulation, and clinical assistant flows.'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

bearer_scheme = HTTPBearer(auto_error=False)


@app.on_event('startup')
def startup_event() -> None:
    try:
        Base.metadata.create_all(bind=engine)
    except OperationalError:
        # The demo remains usable without a live PostgreSQL instance.
        pass


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/auth/login', response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    if payload.username.strip() != 'demo' or payload.password.strip() != 'genome-firewall':
        raise HTTPException(status_code=401, detail='Invalid demo credentials')
    return TokenResponse(access_token=create_access_token(payload.username))


@app.post('/predict', response_model=PredictResponse)
def predict(payload: AnalysisRequest, credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> PredictResponse:
    if credentials is not None:
        try:
            verify_access_token(credentials.credentials)
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(status_code=401, detail='Invalid token') from exc

    result = simulate_analysis(payload.source)
    return PredictResponse(**result)


@app.post('/time-machine', response_model=SimulationResponse)
def time_machine(payload: AnalysisRequest) -> SimulationResponse:
    analysis = simulate_analysis(payload.source)
    return SimulationResponse(items=simulate_time_machine(analysis['risk_score']))


@app.post('/virtual-lab', response_model=SimulationResponse)
def virtual_lab(payload: LabRequest) -> SimulationResponse:
    return SimulationResponse(items=simulate_antibiotic_lab(payload.risk_score, payload.selected_antibiotics))


@app.post('/assistant', response_model=AssistantResponse)
def assistant(payload: dict[str, str]) -> AssistantResponse:
    question = payload.get('question', '').strip()
    if not question:
        raise HTTPException(status_code=400, detail='question is required')
    return AssistantResponse(answer=answer_question(question))


@app.get('/trends')
def trends() -> dict[str, list[dict[str, object]]]:
    return {
        'items': [
            {'label': 'ICU', 'resistance_rate': 18, 'isolates': 52},
            {'label': 'Surgery', 'resistance_rate': 13, 'isolates': 36},
            {'label': 'Transplant', 'resistance_rate': 22, 'isolates': 27},
            {'label': 'Emergency', 'resistance_rate': 15, 'isolates': 44},
            {'label': 'Oncology', 'resistance_rate': 26, 'isolates': 31},
        ]
    }
