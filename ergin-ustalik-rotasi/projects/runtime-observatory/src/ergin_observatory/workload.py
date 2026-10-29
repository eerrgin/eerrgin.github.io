"""A bounded asynchronous workload for exercising the reporting pipeline."""
from __future__ import annotations

import asyncio
import time
from typing import Any


async def run_sample_workload(items: int = 24, concurrency: int = 4) -> dict[str, Any]:
    if items < 1:
        raise ValueError("items must be >= 1")
    if concurrency < 1:
        raise ValueError("concurrency must be >= 1")

    semaphore = asyncio.Semaphore(concurrency)
    active = max_active = failures = completed = 0
    started = time.perf_counter()

    async def unit(index: int) -> None:
        nonlocal active, max_active, failures, completed
        async with semaphore:
            active += 1
            max_active = max(max_active, active)
            try:
                await asyncio.sleep(0)
                if index % 11 == 0:
                    failures += 1
                else:
                    completed += 1
            finally:
                active -= 1

    await asyncio.gather(*(unit(i) for i in range(items)))
    return {
        "requested_items": items,
        "completed_items": completed,
        "simulated_failures": failures,
        "max_concurrency_observed": max_active,
        "concurrency_limit": concurrency,
        "elapsed_wall_seconds": time.perf_counter() - started,
    }
