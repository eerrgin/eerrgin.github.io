import asyncio
import json
import unittest

from ergin_observatory.collectors import collect_snapshot
from ergin_observatory.cli import build_report
from ergin_observatory.workload import run_sample_workload


class CollectorTests(unittest.TestCase):
    def test_snapshot_declares_measurement_limits(self):
        result = collect_snapshot()
        self.assertIn("captured_at", result)
        self.assertIn("traced_python_memory_current_bytes", result)
        self.assertIn("not process RSS", result["memory_measurement_note"])
        self.assertGreaterEqual(result["thread_count"], 1)

    def test_workload_respects_concurrency_and_counts_failures(self):
        result = asyncio.run(run_sample_workload(items=24, concurrency=3))
        self.assertLessEqual(result["max_concurrency_observed"], 3)
        self.assertEqual(result["completed_items"] + result["simulated_failures"], 24)

    def test_invalid_workload_parameters_fail_clearly(self):
        with self.assertRaises(ValueError):
            asyncio.run(run_sample_workload(items=0))

    def test_report_is_json_serializable(self):
        report = build_report(with_profile=True)
        encoded = json.dumps(report)
        self.assertIn('"schema_version": "1.0"', encoded)
        self.assertIsNotNone(report["profiling"])
        self.assertGreater(report["workload"]["requested_items"], 0)


if __name__ == "__main__":
    unittest.main()
