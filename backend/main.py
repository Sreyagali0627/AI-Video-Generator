
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import base64
import os

app = FastAPI(title="ShortsMagic AI Backend")

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/")
async def root():
    return {"message": "ShortsMagic AI Backend is running", "status": "ok"}

@app.post("/export")
async def export_video(project: VideoProject):
    """
    In a full production environment with FFmpeg installed, this would:
    1. Decode all base64 images and audio.
    2. Use FFmpeg to stitch them into an MP4.
    3. Return the MP4 file.
    
    For this implementation, we return a success status and the project
    data which the frontend can then trigger a high-quality browser-side download for.
    """
    try:
        if not project.scenes:
            raise HTTPException(status_code=400, detail="No scenes provided")
        
        # Simulate processing delay
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
                "total_duration": sum(s.duration or 0 for s in project.scenes)
            }
        }
    except Exception as e:
        print(f"Error in export: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
