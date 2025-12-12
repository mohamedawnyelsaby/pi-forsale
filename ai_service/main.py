from fastapi import FastAPI, File, UploadFile, HTTPException, Header
from pydantic import BaseModel
import uvicorn
import os

app = FastAPI(title="Logy AI Service")

class AnalyzeRequest(BaseModel):
    description: str | None = None
    images: list[str] | None = None

@app.post("/analyze")
async def analyze(req: AnalyzeRequest, x_api_key: str = Header(None)):
    if x_api_key != os.getenv("AI_SERVICE_KEY"):
        raise HTTPException(status_code=401, detail="Invalid key")
    # TODO: call real AI model (OpenAI/other). For now mock
    return {
        "title": "iPhone 15 Pro (Titanium)",
        "description": "جهاز آيفون 15 برو مستعمل...",
        "price": 105000,
        "category": "electronics",
        "specs": {"storage":"256GB","color":"Titanium"}
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)
