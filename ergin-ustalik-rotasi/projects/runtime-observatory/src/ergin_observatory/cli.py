"""CLI entrypoint for local runtime snapshot and optional cProfile report."""
from __future__ import annotations

import argparse
import asyncio
import cProfile
import io
import json
import pstats
from pathlib import Path
from typing import Any

from .collectors import collect_snapshot
from .workload import run_sample_workload


def build_report(with_profile: bool = False) -> dict[str, Any]:
    snapshot_before = collect_snapshot()
    profiler = cProfile.Profile()
    workload = (profiler.runcall(asyncio.run, run_sample_workload())
                if with_profile else asyncio.run(run_sample_workload()))
    report: dict[str, Any] = {
        "schema_version": "1.0",
        "project": "Ergin Calisma Zamani Gozlemevi",
        "runtime_snapshot": snapshot_before,
        "workload": workload,
        "profiling": None,
    }
    if with_profile:
        buffer = io.StringIO()
        pstats.Stats(profiler, stream=buffer).strip_dirs().sort_stats("cumulative").print_stats(25)
        report["profiling"] = {
            "tool": "cProfile",
            "sort": "cumulative",
            "top_25_functions": buffer.getvalue(),
            "note": "Profiling introduces overhead; compare separately from unprofiled runs.",
        }
    return report


def main() -> int:
    parser = argparse.ArgumentParser(description="Yerel Python çalışma zamanı raporu üretir.")
    parser.add_argument("--output", type=Path, default=Path("reports/runtime-report.json"))
    parser.add_argument("--profile", action="store_true", help="cProfile özeti rapora ekle")
    args = parser.parse_args()
    try:
        report = build_report(with_profile=args.profile)
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    except (OSError, ValueError, RuntimeError) as exc:
        parser.error(f"Rapor üretilemedi: {exc}")
    print(f"Rapor yazıldı: {args.output}")
    print(f"Tamamlanan iş: {report['workload']['completed_items']}")
    print(f"Simüle hata: {report['workload']['simulated_failures']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
