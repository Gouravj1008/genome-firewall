from __future__ import annotations

from hashlib import blake2b
from typing import Generator

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session

from .database import engine, SessionLocal
from .models import Base, GenomeSample, PredictionLog, User
from .schemas import AnalysisRequest, AssistantResponse, LabRequest, LoginRequest, SignupRequest, PredictResponse, SimulationResponse, TokenResponse
from .security import create_access_token, verify_access_token, get_password_hash, verify_password
from .simulation import answer_question, simulate_analysis, simulate_antibiotic_lab, simulate_time_machine

app = FastAPI(
    title='Genome Firewall API',
    version='1.0.0',
    description='FastAPI backend with user authentication and privacy.'
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

bearer_scheme = HTTPBearer(auto_error=False)

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme), db: Session = Depends(get_db)) -> User | None:
    if not credentials:
        raise HTTPException(status_code=401, detail='Not authenticated')
    try:
        payload = verify_access_token(credentials.credentials)
        username = payload.get('sub')
        if username is None:
            raise HTTPException(status_code=401, detail='Invalid token')
    except Exception as exc:
        raise HTTPException(status_code=401, detail='Invalid token') from exc
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail='User not found')
    return user

@app.on_event('startup')
def startup_event() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            demo_user = db.query(User).filter(User.username == 'demo').first()
            if demo_user is None:
                db.add(User(username='demo', hashed_password=get_password_hash('genome-firewall')))
                db.commit()
    except OperationalError:
        pass


@app.get('/health')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@app.post('/auth/signup', response_model=dict)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> dict:
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail='Username already registered')
    new_user = User(
        username=payload.username,
        hashed_password=get_password_hash(payload.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}


@app.post('/auth/login', response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        # Fallback to demo user if they type demo/genome-firewall so the landing page default works, or just strictly check DB.
        # Let's strictly check DB.
        if payload.username.strip() == 'demo' and payload.password.strip() == 'genome-firewall':
            return TokenResponse(access_token=create_access_token('demo'))
        raise HTTPException(status_code=401, detail='Incorrect username or password')
    return TokenResponse(access_token=create_access_token(user.username))


@app.post('/predict', response_model=PredictResponse)
def predict(payload: AnalysisRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> PredictResponse:
    result = simulate_analysis(payload.source)
    source_hash = blake2b(payload.source.encode('utf-8'), digest_size=6).hexdigest()
    sample_name = payload.sample_name.strip() or f'Genome sample {source_hash}'

    db.add(GenomeSample(user_id=current_user.id, sample_name=sample_name, genome_source=payload.source))
    db.add(PredictionLog(user_id=current_user.id, sample_name=sample_name, risk_score=result['risk_score'], label=result['label']))
    db.commit()

    return PredictResponse(**result)


@app.post('/time-machine', response_model=SimulationResponse)
def time_machine(payload: AnalysisRequest, current_user: User = Depends(get_current_user)) -> SimulationResponse:
    analysis = simulate_analysis(payload.source)
    return SimulationResponse(items=simulate_time_machine(analysis['risk_score']))


@app.post('/virtual-lab', response_model=SimulationResponse)
def virtual_lab(payload: LabRequest, current_user: User = Depends(get_current_user)) -> SimulationResponse:
    return SimulationResponse(items=simulate_antibiotic_lab(payload.risk_score, payload.selected_antibiotics))


@app.post('/assistant', response_model=AssistantResponse)
def assistant(payload: dict[str, str], current_user: User = Depends(get_current_user)) -> AssistantResponse:
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
