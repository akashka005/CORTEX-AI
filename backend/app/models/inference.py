import joblib
import logging
import os
from typing import Dict, Any
from dotenv import load_dotenv
from google import genai

from app.data_pipeline.preprocess import clean_text
from app.models.rl_agent import agent
from app.models.memory import add_to_memory, get_memory

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-flash-latest"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    sl_model = joblib.load("models/sl_model.pkl")
    vectorizer = joblib.load("models/vectorizer.pkl")
    kmeans = joblib.load("models/kmeans.pkl")
    cluster_vectorizer = joblib.load("models/cluster_vectorizer.pkl")
except Exception as e:
    logger.error(f"Failed to load models: {e}")
    sl_model = vectorizer = kmeans = cluster_vectorizer = None

def fallback_response(user_input: str, session_id: str = "default") -> Dict[str, Any]:
    return {
        "input": user_input,
        "emotion": "neutral",
        "cluster": 0,
        "action": "support",
        "response": "I'm here with you. Want to tell me more?",
        "state": "neutral_0",
        "session_id": session_id,
        "analysis": {
            "confidence": 0.0,
            "pipeline": "fallback"
        }
    }

def predict(user_input: str, session_id: str = "default", force_local: bool = False) -> Dict[str, Any]:
    if not user_input or len(user_input.strip()) < 2:
        return fallback_response(user_input, session_id)

    try:
        text = clean_text(user_input)
        if not text:
            return fallback_response(user_input, session_id)
        
        add_to_memory(session_id, "user", user_input)

        emotion = "neutral"
        engine_used = "Neural Lite"
        
        if not force_local:
            try:
                emotion_prompt = f"Analyze the emotion of this text: '{user_input}'. Categorize it into EXACTLY ONE of these: happy, sad, angry, anxious, neutral. Return only the word."
                response_em = client.models.generate_content(model=MODEL_NAME, contents=emotion_prompt)
                emotion = response_em.text.strip().lower()
                if emotion not in ["happy", "sad", "angry", "anxious", "neutral"]:
                    emotion = "neutral"
                engine_used = f"Cortex Pro ({MODEL_NAME})"
            except Exception as e:
                if "RESOURCE_EXHAUSTED" in str(e):
                    logger.warning("Gemini Quota Exceeded (Emotion Detection). Using Local Model.")
                    engine_used = "Neural Lite (Quota Full)"
                else:
                    logger.error(f"Gemini Emotion Detection Error: {e}")
                    engine_used = "Neural Lite (Error Fallback)"
        else:
            engine_used = "Neural Lite (Manual/Limit)"

        if "Neural Lite" in engine_used:
            if sl_model and vectorizer:
                vec = vectorizer.transform([text])
                emotion = sl_model.predict(vec)[0]
                if engine_used == "Local Model":
                    engine_used = "Local Model (Fallback)"
        cluster = 0
        if kmeans and cluster_vectorizer:
            c_vec = cluster_vectorizer.transform([text])
            cluster = int(kmeans.predict(c_vec)[0])

        state = agent.get_state(emotion, cluster)
        action = agent.choose_action(state)

        history = get_memory(session_id)
        user_msgs = [m["text"] for m in history if m["role"] == "user"]
        context = user_msgs[-2] if len(user_msgs) >= 2 else ""
        
        response = None
        if not force_local:
            try:
                response_prompt = f"""
                User says: '{user_input}'
                Context: '{context}'
                Detected Emotion: {emotion}
                Required AI Strategy: {action}
                
                Generate a short, empathetic, and human-like response following the '{action}' strategy.
                If the strategy is 'deep', listen and ask a follow-up.
                If it is 'advice', give a small helpful tip.
                If it is 'distract', mention something positive or a small reset.
                If it is 'support', be validating and warm.
                """
                response_gen = client.models.generate_content(model=MODEL_NAME, contents=response_prompt)
                response = response_gen.text.strip()
            except Exception as e:
                if "RESOURCE_EXHAUSTED" in str(e):
                    logger.warning("Gemini Quota Exceeded (Response Generation). Using Local Generator.")
                else:
                    logger.error(f"Gemini Response Generation Error: {e}")
        
        if not response:
            from app.models.response_generator import generate_response
            response = generate_response(emotion=emotion, action=action, text=user_input, context=context)
        
        add_to_memory(session_id, "ai", response)

        return {
            "input": user_input,
            "emotion": emotion,
            "cluster": cluster,
            "action": action,
            "response": response,
            "state": state,
            "session_id": session_id,
            "analysis": {
                "detected_emotion": emotion,
                "user_intent": "normal",
                "cluster_group": cluster,
                "strategy": action,
                "engine": engine_used,
                "quota_hit": "Quota Full" in engine_used or "Limit" in engine_used
            }
        }

    except Exception as e:
        logger.error(f"Prediction Error: {e}", exc_info=True)
        return fallback_response(user_input, session_id)

def feedback(state: str, action: str, reward: int):
    try:
        if state and action:
            agent.update(state, action, reward)
    except Exception as e:
        logger.error(f"Feedback Error: {e}")