from __future__ import annotations

import argparse
import hashlib
import json
import statistics
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import requests

DEFAULT_BASE_URL = "http://localhost:8000"
TOTAL_USERS = 100
MAX_WORKERS = 100
REPORT_PATH = Path("artifacts/concurrency-readiness-report.json")

ANTIBIOTIC_SETS = [
    ["Meropenem", "Cefiderocol"],
    ["Amikacin", "Polymyxin B"],
    ["Cefiderocol", "Amikacin", "Piperacillin/Tazobactam"],
]

QUESTIONS = [
    "Why is carbapenem risk high for this isolate?",
    "Should polymyxin be treated as rescue only?",
    "How does fluoroquinolone target-site adaptation affect therapy?",
]


def deterministic_fasta(user_id: int, run_id: str) -> str:
    seed = hashlib.sha256(f"{run_id}:{user_id}:GenomeFirewall".encode("utf-8")).digest()
    alphabet = "ACGT"
    sequence = "".join(alphabet[byte % 4] for byte in seed * 16)[:256]
    return f">GF_SUBMISSION_USER_{user_id:03d}_{run_id}\n{sequence}"


def timed_post(session: requests.Session, url: str, **kwargs: Any) -> tuple[requests.Response, float]:
    started = time.perf_counter()
    response = session.post(url, timeout=60, **kwargs)
    return response, time.perf_counter() - started


def simulate_user(base_url: str, run_id: str, user_id: int) -> dict[str, Any]:
    username = f"hacknation_{run_id}_{user_id:03d}"
    password = f"GenomeFirewall-{run_id}-{user_id:03d}!"
    sample_name = f"submission-sample-{run_id}-{user_id:03d}"
    fasta = deterministic_fasta(user_id, run_id)
    genome_sha256 = hashlib.sha256(fasta.encode("utf-8")).hexdigest()

    metrics: dict[str, Any] = {
        "user_id": user_id,
        "username": username,
        "sample_name": sample_name,
        "genome_sha256": genome_sha256,
        "latency_seconds": {},
        "risk_score": None,
        "label": None,
        "errors": [],
    }

    try:
        with requests.Session() as session:
            signup_response, elapsed = timed_post(
                session,
                f"{base_url}/auth/signup",
                json={"username": username, "password": password, "email": f"{username}@demo.local"},
            )
            metrics["latency_seconds"]["signup"] = elapsed
            if signup_response.status_code != 200:
                metrics["errors"].append(f"signup:{signup_response.status_code}:{signup_response.text}")
                return metrics

            login_response, elapsed = timed_post(
                session,
                f"{base_url}/auth/login",
                json={"username": username, "password": password},
            )
            metrics["latency_seconds"]["login"] = elapsed
            if login_response.status_code != 200:
                metrics["errors"].append(f"login:{login_response.status_code}:{login_response.text}")
                return metrics

            token = login_response.json().get("access_token")
            if not token:
                metrics["errors"].append("login:missing_access_token")
                return metrics
            headers = {"Authorization": f"Bearer {token}"}

            predict_response, elapsed = timed_post(
                session,
                f"{base_url}/predict",
                json={"source": fasta, "sample_name": sample_name},
                headers=headers,
            )
            metrics["latency_seconds"]["predict"] = elapsed
            if predict_response.status_code != 200:
                metrics["errors"].append(f"predict:{predict_response.status_code}:{predict_response.text}")
                return metrics

            prediction = predict_response.json()
            risk_score = prediction.get("risk_score")
            metrics["risk_score"] = risk_score
            metrics["label"] = prediction.get("label")
            if not isinstance(risk_score, (int, float)):
                metrics["errors"].append("predict:missing_numeric_risk_score")
                return metrics

            time_machine_response, elapsed = timed_post(
                session,
                f"{base_url}/time-machine",
                json={"source": fasta, "sample_name": sample_name},
                headers=headers,
            )
            metrics["latency_seconds"]["time_machine"] = elapsed
            if time_machine_response.status_code != 200 or len(time_machine_response.json().get("items", [])) != 3:
                metrics["errors"].append(f"time-machine:{time_machine_response.status_code}:{time_machine_response.text}")

            lab_response, elapsed = timed_post(
                session,
                f"{base_url}/virtual-lab",
                json={"risk_score": risk_score, "selected_antibiotics": ANTIBIOTIC_SETS[user_id % len(ANTIBIOTIC_SETS)]},
                headers=headers,
            )
            metrics["latency_seconds"]["virtual_lab"] = elapsed
            if lab_response.status_code != 200 or not lab_response.json().get("items"):
                metrics["errors"].append(f"virtual-lab:{lab_response.status_code}:{lab_response.text}")

            assistant_response, elapsed = timed_post(
                session,
                f"{base_url}/assistant",
                json={"question": QUESTIONS[user_id % len(QUESTIONS)]},
                headers=headers,
            )
            metrics["latency_seconds"]["assistant"] = elapsed
            answer = assistant_response.json().get("answer", "") if assistant_response.status_code == 200 else ""
            if assistant_response.status_code != 200 or "Grounded answer" not in answer:
                metrics["errors"].append(f"assistant:{assistant_response.status_code}:{assistant_response.text}")
    except requests.RequestException as exc:
        metrics["errors"].append(f"request_exception:{exc}")
    except Exception as exc:
        metrics["errors"].append(f"exception:{exc}")

    return metrics


def summarize_latency(results: list[dict[str, Any]]) -> dict[str, dict[str, float]]:
    endpoints = sorted({endpoint for item in results for endpoint in item["latency_seconds"]})
    summary: dict[str, dict[str, float]] = {}
    for endpoint in endpoints:
        values = [item["latency_seconds"][endpoint] for item in results if endpoint in item["latency_seconds"]]
        if not values:
            continue
        sorted_values = sorted(values)
        p95_index = min(len(sorted_values) - 1, int((len(sorted_values) - 1) * 0.95))
        summary[endpoint] = {
            "avg": round(statistics.fmean(values), 4),
            "p95": round(sorted_values[p95_index], 4),
            "max": round(max(values), 4),
        }
    return summary


def run(base_url: str) -> dict[str, Any]:
    run_id = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    started_at = datetime.now(timezone.utc)
    started = time.perf_counter()
    results: list[dict[str, Any]] = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = [executor.submit(simulate_user, base_url, run_id, user_id) for user_id in range(TOTAL_USERS)]
        for future in as_completed(futures):
            results.append(future.result())

    elapsed = time.perf_counter() - started
    error_count = sum(len(item["errors"]) for item in results)
    unique_usernames = len({item["username"] for item in results})
    unique_samples = len({item["sample_name"] for item in results})
    unique_genomes = len({item["genome_sha256"] for item in results})
    completed_flows = sum(1 for item in results if not item["errors"])

    report = {
        "run_id": run_id,
        "base_url": base_url,
        "started_at_utc": started_at.isoformat(),
        "finished_at_utc": datetime.now(timezone.utc).isoformat(),
        "total_users_requested": TOTAL_USERS,
        "max_workers": MAX_WORKERS,
        "completed_flows": completed_flows,
        "error_count": error_count,
        "all_users_successful": completed_flows == TOTAL_USERS and error_count == 0,
        "unique_usernames": unique_usernames,
        "unique_samples": unique_samples,
        "unique_genomes": unique_genomes,
        "unique_data_verified": unique_usernames == TOTAL_USERS and unique_samples == TOTAL_USERS and unique_genomes == TOTAL_USERS,
        "total_duration_seconds": round(elapsed, 4),
        "latency_seconds": summarize_latency(results),
        "sample_failures": [item for item in results if item["errors"]][:5],
        "sample_successes": sorted([item for item in results if not item["errors"]], key=lambda item: item["user_id"])[:5],
    }

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Genome Firewall 100-user concurrent readiness test.")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL)
    args = parser.parse_args()

    result = run(args.base_url.rstrip("/"))
    print(json.dumps(result, indent=2))
    if not result["all_users_successful"] or not result["unique_data_verified"]:
        raise SystemExit(1)