from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="ShortsMagic AI Backend")

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Data Models
# ---------------------------
class Scene(BaseModel):
    id: str
    sceneNumber: int
    narration: str
    visualPrompt: str
    imageUrl: Optional[str] = None
    audioData: Optional[str] = None
    duration: Optional[float] = None


class VideoProject(BaseModel):
    title: str
    scenes: List[Scene]


# ---------------------------
# Routes
# ---------------------------
@app.get("/")
async def root():
    return {
        "message": "ShortsMagic AI Backend is running",
        "status": "ok"
    }


@app.post("/export")
async def export_video(project: VideoProject):
    """
    In a production environment with FFmpeg installed, this would:
    1. Decode base64 images and audio
    2. Stitch scenes into a video
    3. Return the generated MP4

    For now, this endpoint validates input and simulates processing.
    """
    try:
        # ❌ Validation check
        if not project.scenes:
            raise HTTPException(
                status_code=400,
                detail="No scenes provided"
            )

        # ⏳ Simulate processing delay
        import time
        time.sleep(1)

        print(f"Export request received for project: {project.title}")

        return {
            "status": "success",
            "message": f"Project '{project.title}' processed. Video assembly initiated.",
            "download_url": "#",
            "project_summary": {
                "title": project.title,
                "scene_count": len(project.scenes),
                "total_duration": sum(scene.duration or 0 for scene in project.scenes)
            }
        }

    # ✅ IMPORTANT FIX
    except HTTPException as http_exc:
        # Re-raise HTTP exceptions so FastAPI returns correct status codes
        raise http_exc

    except Exception as e:
        print(f"Unexpected error in export: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


# ---------------------------
# App Runner
# ---------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="info"
    )
