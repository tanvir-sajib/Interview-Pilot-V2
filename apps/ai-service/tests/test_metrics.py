import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from metrics import compute_delivery_metrics

def test_compute_delivery_metrics():
    # Provide a deterministic transcript (content does not affect placeholder results)
    metrics = compute_delivery_metrics("any transcript text")
    expected = {
        "speech_duration": "not reliably computable yet",
        "speaking_rate": "not reliably computable yet",
        "pause_duration": "not reliably computable yet",
        "long_pause_detection": "not reliably computable yet",
        "filler_frequency": "not reliably computable yet",
        "speech_consistency": "not reliably computable yet",
    }
    assert metrics == expected
