# Genome Firewall - Architecture and Hackathon Submission Report

## Executive Summary

Genome Firewall is a full-stack clinical decision-support demo for bacterial genome-based antibiotic resistance prediction. The system lets a user sign up, log in, upload or simulate a genome, inspect explainable resistance signals, run therapy simulations, ask a grounded clinical assistant, and export a report-ready dashboard experience.

For HackNation submission readiness, the project was hardened with authenticated protected API flows, persisted per-user genome samples and prediction logs, and a 100-concurrent-user verification script with unique user accounts and unique genome payloads.

## Product Capabilities

- Account signup and JWT login.
- Protected dashboard route with token storage and logout.
- Genome upload/demo isolate analysis.
- Resistance-risk prediction with confidence, uncertainty, dominant genes, feature importance, and antibiotic ranking.
- Resistance time-machine simulation across 24h, 48h, and 72h.
- Virtual antibiotic lab for selected therapies.
- Clinical assistant responses grounded in the simulated resistance profile.
- Three.js living genome visualization and Plotly analytics panels.
- Browser-based PDF/report export flow.
- 100-concurrent-user readiness test with unique data and JSON evidence artifact.

## Architecture Overview

```text
Browser / Next.js App
  |
  |  UI routes, auth forms, dashboard, local upload handling
  v
Next.js API Rewrite (/api/*)
  |
  |  Proxies frontend requests to backend service
  v
FastAPI Backend
  |
  |  Auth, JWT verification, prediction, simulation, assistant APIs
  v
SQLAlchemy Data Layer
  |
  |  Users, genome samples, prediction logs
  v
SQLite for local demo / PostgreSQL-ready via DATABASE_URL
```

## Frontend Design

The frontend is built with Next.js, React, TypeScript, Tailwind CSS, Three.js, Plotly, and lucide-react icons.

Key routes:

- `/` - product entry page.
- `/signup` - account creation.
- `/login` - JWT login.
- `/dashboard` - protected Genome Firewall application.

Important components:

- `src/components/genome-firewall-app.tsx` - primary dashboard and workflow orchestration.
- `src/components/genome-helix.tsx` - animated genome/digital-twin visualization.
- `src/components/plotly-panel.tsx` - analytics charts.
- `src/components/mutation-trust-card.tsx` - explainable mutation evidence card.
- `src/lib/simulate.ts` - frontend simulation helpers for immediate interactive feedback.

The dashboard is designed for a hackathon demo: it is visually polished, interactive, and focused on the core workflow rather than a marketing landing page.

## Backend Design

The backend is FastAPI with Pydantic schemas, SQLAlchemy ORM, JWT auth, and configurable database connectivity.

Key files:

- `backend/app/main.py` - API routes, auth dependencies, startup setup, persistence.
- `backend/app/models.py` - SQLAlchemy models.
- `backend/app/schemas.py` - Pydantic request/response contracts.
- `backend/app/security.py` - password hashing and JWT creation/verification.
- `backend/app/simulation.py` - backend prediction and simulation logic.
- `backend/app/database.py` - SQLAlchemy engine/session configuration.

Primary API endpoints:

- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`
- `POST /predict`
- `POST /time-machine`
- `POST /virtual-lab`
- `POST /assistant`
- `GET /trends`

## Data Model

### User

Stores account identity and password hash.

Fields:

- `id`
- `username`
- `hashed_password`
- `created_at`

### GenomeSample

Stores each submitted genome payload for the authenticated user.

Fields:

- `id`
- `user_id`
- `sample_name`
- `genome_source`
- `created_at`

### PredictionLog

Stores prediction summary metadata for each analyzed sample.

Fields:

- `id`
- `user_id`
- `sample_name`
- `risk_score`
- `label`
- `created_at`

## Security Design

- Passwords are hashed through Passlib bcrypt.
- JWT access tokens include subject, issued-at, and expiry claims.
- Protected endpoints require a bearer token and resolve the current user from the database.
- Demo credentials are seeded at startup for judge-friendly access: `demo` / `genome-firewall`.
- `BCRYPT_ROUNDS` is configurable. Default is `12`; the local 100-user load-test profile used `4` to avoid benchmarking password-hash CPU cost instead of app concurrency.

## Scalability and Concurrency Design

Local demo concurrency is supported through:

- SQLAlchemy connection pool tuning via `DB_POOL_SIZE`, `DB_MAX_OVERFLOW`, and `DB_POOL_TIMEOUT`.
- SQLite WAL mode and `busy_timeout` for local write contention tolerance.
- Clean separation of stateless API routes from database persistence.
- `DATABASE_URL` configuration so the same backend can target PostgreSQL for production-style deployment.

For production scale, PostgreSQL should be used instead of SQLite, with multiple Uvicorn/Gunicorn workers behind a load balancer.

## 100 Concurrent User Readiness Test

Test script:

- `test_realtime_users.py`

Evidence artifact:

- `artifacts/concurrency-readiness-report.json`

Load-test command used:

```powershell
$env:DATABASE_URL='sqlite:///./artifacts/loadtest-final.db'
$env:BCRYPT_ROUNDS='4'
$env:DB_POOL_SIZE='100'
$env:DB_MAX_OVERFLOW='50'
$env:DB_POOL_TIMEOUT='60'
.\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8001

.\.venv\Scripts\python.exe test_realtime_users.py --base-url http://127.0.0.1:8001
```

Result summary from the successful run:

- Total users requested: 100
- Concurrent workers: 100
- Completed flows: 100
- Error count: 0
- Unique usernames: 100
- Unique samples: 100
- Unique genome payloads: 100
- Unique data verified: true
- Total duration: 2.3183 seconds
- Database verification: 101 users including demo, 100 genome samples, 100 prediction logs

Latency summary:

| Endpoint | Average | p95 | Max |
| --- | ---: | ---: | ---: |
| Signup | 0.5194s | 1.0791s | 1.1692s |
| Login | 0.2643s | 0.3396s | 0.3518s |
| Predict | 0.3836s | 0.4463s | 1.1533s |
| Time Machine | 0.3281s | 0.4048s | 0.4171s |
| Virtual Lab | 0.2752s | 0.3772s | 0.4100s |
| Assistant | 0.2170s | 0.3429s | 0.3568s |

Each simulated user performs:

1. Signup with a unique username and email.
2. Login and JWT retrieval.
3. Prediction with a unique FASTA payload and sample name.
4. Time-machine simulation with that same sample.
5. Virtual antibiotic lab request.
6. Assistant question request.

## Verification Checklist

Completed checks:

- `npm run typecheck` passed.
- `npm run lint` passed.
- Python compilation passed for backend and readiness script.
- Backend unit tests passed: `4 passed`.
- 100-concurrent-user readiness test passed.
- Persisted database counts verified for users, genome samples, and prediction logs.

Known warning:

- Pytest could not write cache files under `.pytest_cache` because that folder is permission-denied in the current workspace. This does not affect test correctness.

## Submission Strengths

- Full-stack product, not only a static prototype.
- Authenticated user workflow.
- Per-user unique genome persistence.
- Interactive explainability and simulation panels.
- Strong visual dashboard suitable for live judging.
- Concrete 100-concurrent-user test evidence.
- Docker/PostgreSQL-ready architecture through `DATABASE_URL`.

## Production Caveats

This project is hackathon-ready, but not clinical-production-ready yet. Before real medical use, the following are required:

- Replace simulated prediction logic with a validated model trained on curated genomic and phenotypic AST datasets.
- Add model evaluation metrics, calibration analysis, and external validation.
- Add audit logs, role-based access, encryption-at-rest, and stricter CORS.
- Add migrations with Alembic.
- Deploy PostgreSQL rather than SQLite.
- Add CI for frontend, backend, and load-test smoke runs.
- Add PHI/PII handling policies and regulatory review for clinical deployment.

## Recommended Demo Flow for Judges

1. Open the landing page and sign up or use demo login.
2. Enter the dashboard.
3. Load the demo isolate.
4. Show the resistance call, top mutation, antibiotic ranking, and confidence/uncertainty.
5. Move the resistance time-machine slider.
6. Select different antibiotics in the virtual lab.
7. Ask the clinical assistant why meropenem is deprioritized.
8. Export the PDF report.
9. Show `artifacts/concurrency-readiness-report.json` as proof of 100-user readiness.

## Final Readiness Assessment

Genome Firewall is ready for hackathon submission as an interactive, authenticated, full-stack clinical decision-support demo with validated local 100-concurrent-user readiness and unique persisted test data. The project should be presented as a simulated clinical prototype with a production-oriented architecture, not as a clinically validated diagnostic system.