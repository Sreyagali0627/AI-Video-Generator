import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

# ---------------------------
# Test: Root Endpoint
# ---------------------------
def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert "ShortsMagic AI Backend" in response.json()["message"]


# ---------------------------
# Test: Export Video (Success)
# ---------------------------
def test_export_video_success():
    payload = {
        "title": "AI in Space Exploration",
        "scenes": [
            {
                "id": "scene1",
                "sceneNumber": 1,
                "narration": "AI is transforming space exploration.",
                "visualPrompt": "AI robots exploring Mars",
                "duration": 5.0
            },
            {
                "id": "scene2",
                "sceneNumber": 2,
                "narration": "Satellites powered by AI analyze data faster.",
                "visualPrompt": "AI-powered satellite in space",
                "duration": 6.0
            }
        ]
    }

    response = client.post("/export", json=payload)

    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "success"
    assert data["project_summary"]["scene_count"] == 2
    assert data["project_summary"]["total_duration"] == 11.0


# ---------------------------
# Test: Export Video (No Scenes)
# ---------------------------
def test_export_video_no_scenes():
    payload = {
        "title": "Empty Video",
        "scenes": []
    }

    response = client.post("/export", json=payload)

    assert response.status_code == 400
    assert response.json()["detail"] == "No scenes provided"


# ---------------------------
# Test: Invalid Payload
# ---------------------------
def test_export_video_invalid_payload():
    payload = {
        "title": "Invalid Payload"
        # scenes missing
    }

    response = client.post("/export", json=payload)

    assert response.status_code == 422  # Validation error
