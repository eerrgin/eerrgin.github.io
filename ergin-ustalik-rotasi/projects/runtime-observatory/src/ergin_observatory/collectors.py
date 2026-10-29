"""Low-overhead, local-only runtime snapshot collectors."""
from __future__ import annotations

import asyncio
import platform
import threading
import time
import tracemalloc
from datetime import datetime, timezone
from typing import Any


def collect_snapshot() -> dict[str, Any]:
    """Return a scoped snapshot; traced memory is not full process RSS."""
    tracing_was_active = tracemalloc.is_tracing()
    if not tracing_was_active:
        tracemalloc.start()
    try:
        current_bytes, peak_bytes = tracemalloc.get_traced_memory()
    finally:
        if not tracing_was_active:
            tracemalloc.stop()

    try:
        task_count = len(asyncio.all_tasks())
    except RuntimeError:
        task_count = 0

    return {
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "python_version": platform.python_version(),
        "implementation": platform.python_implementation(),
        "platform": platform.platform(),
        "process_cpu_seconds": time.process_time(),
        "traced_python_memory_current_bytes": current_bytes,
        "traced_python_memory_peak_bytes": peak_bytes,
        "thread_count": threading.active_count(),
        "asyncio_task_count": task_count,
        "memory_measurement_note": "tracemalloc allocations only; not process RSS",
        "cpu_measurement_note": "absolute process CPU time; not system CPU percentage",
    }
