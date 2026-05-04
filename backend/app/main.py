from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from app.models.inference import predict, feedback
from app.utils.rate_limiter import limiter
from fastapi import HTTPException

import logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("mood-ai")

app = FastAPI(title="Mood AI Engine")

@app.on_event("startup")
async def startup_event():
    logger.info("Mood AI Engine starting up...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "version": "1.0.0"}

class ChatRequest(BaseModel):
    message: str
    model: str = "cortex-pro"


class FeedbackRequest(BaseModel):
    state: str
    action: str
    reward: int

@app.get("/")
def home():
    return {"message": "Mood AI Backend Running!"}


@app.post("/chat")
def chat(req: ChatRequest):
    allowed, remaining = limiter.check()
    force_local = (not allowed) or (req.model == "neural-lite")
    result = predict(req.message, force_local=force_local)
    result["remaining"] = remaining
    return result

@app.get("/usage")
def usage():
    return {"remaining": limiter.get_remaining(), "limit": limiter.limit}
@app.post("/feedback")
def give_feedback(req: FeedbackRequest):
    feedback(req.state, req.action, req.reward)
    return {"status": "updated"}