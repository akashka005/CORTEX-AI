import random
from collections import deque
import logging

logger = logging.getLogger(__name__)

class ResponseMemory:
    def __init__(self, size=5):
        self.memory = deque(maxlen=size)

    def is_repeating(self, resp):
        return resp in self.memory

    def remember(self, resp):
        self.memory.append(resp)

memory = ResponseMemory()

RESPONSES = {
    "happy": {
        "motivate": [
            "Love that energy—keep it going!",
            "You're doing something right, keep building on it.",
            "That's fantastic! How can you use this momentum?",
            "High spirits lead to high achievements. Keep at it!"
        ],
        "advice": [
            "Maybe use this momentum to tackle something you've been putting off.",
            "Channel this positivity into something meaningful today.",
            "When you're happy, you're more creative. What's a new idea you have?",
            "Share this joy with someone—it usually doubles it."
        ],
        "distract": [
            "Celebrate a little—watch something fun or go out.",
            "Maybe treat yourself a bit, you deserve it.",
            "How about a quick game or a hobby you love?",
            "Take a moment to just soak in this good feeling."
        ],
        "deep": [
            "What’s been going so well for you lately?",
            "What’s contributing to this good feeling?",
            "Do you think this happiness comes from within or from your surroundings?",
            "What's one thing you're most grateful for right now?"
        ]
    },
    "sad": {
        "motivate": [
            "You’ve handled tough moments before. You can do this.",
            "It might not feel like it now, but you're stronger than this.",
            "Small steps still move you forward. Just focus on the next one.",
            "You're allowed to have bad days. Tomorrow is a fresh start."
        ],
        "advice": [
            "Try writing down what’s bothering you—it sometimes helps.",
            "Talking it out or journaling might ease the weight a bit.",
            "Focus on things you can control right now, however small.",
            "Be kind to yourself today. What's one gentle thing you can do?"
        ],
        "distract": [
            "Maybe take a break with music or a short walk.",
            "A small reset—like stepping outside—might help a bit.",
            "Watch a comfort movie or listen to a soothing podcast.",
            "Try a simple task like organizing a small space—it can be grounding."
        ],
        "deep": [
            "Do you want to talk about what’s making you feel this way?",
            "I’m here to listen—what’s been weighing on you?",
            "If this sadness had a shape or color, what would it be?",
            "When did you first start feeling this shift?"
        ]
    },
    "angry": {
        "motivate": [
            "Take a breath. You’re still in control.",
            "You’ve got the power to handle this without letting it take over.",
            "Anger is energy—how can we use it constructively?",
            "You're bigger than this frustration."
        ],
        "advice": [
            "Step away for a bit before reacting.",
            "Give yourself a moment before responding—it can help.",
            "Try 'box breathing': inhale 4s, hold 4s, exhale 4s, hold 4s.",
            "Think about the outcome you want—will reacting now help get it?"
        ],
        "distract": [
            "Try doing something physical—walk, stretch, reset.",
            "Burn that energy off—movement helps more than you think.",
            "Listen to some intense music or do a quick workout.",
            "Try a mentally engaging puzzle to shift your focus."
        ],
        "deep": [
            "What exactly triggered this feeling?",
            "What’s been building up to make you feel like this?",
            "Is there a boundary that was crossed?",
            "What would 'fixing' this situation look like for you?"
        ]
    },
    "anxious": {
        "motivate": [
            "You’re stronger than your worries.",
            "You’ve gotten through moments like this before.",
            "This feeling is temporary, even if it feels heavy right now.",
            "One breath at a time. You're doing okay."
        ],
        "advice": [
            "Focus on one small step instead of everything at once.",
            "Break it down—what’s one thing you can control right now?",
            "Try the 5-4-3-2-1 grounding technique.",
            "Label the feeling as 'anxiety'—giving it a name can reduce its power."
        ],
        "distract": [
            "Try grounding yourself—look around and name 5 things you see.",
            "Take a slow breath—just focus on right now.",
            "Drink some cold water or hold an ice cube—it resets the senses.",
            "Listen to some calming ambient sounds or white noise."
        ],
        "deep": [
            "What’s been on your mind lately?",
            "What exactly is making you feel this way?",
            "If you could fast-forward 24 hours, what would you want to see?",
            "What's the 'story' your anxiety is telling you right now?"
        ]
    },
    "neutral": {
        "motivate": ["I'm here for you.", "Keep going, you're doing fine."],
        "advice": ["Maybe take a moment to check in with yourself.", "How's your day been so far?"],
        "distract": ["Want to talk about something else?", "Any interesting news today?"],
        "deep": ["How are you really feeling?", "What's on your mind?"]
    }
}

def detect_intent(text):
    text = text.lower()
    if any(w in text for w in ["hi", "hello", "hey", "greetings"]):
        return "greeting"
    if any(w in text for w in ["scared", "afraid", "panic", "terrified", "worried"]):
        return "fear"
    if any(w in text for w in ["sad", "lost", "empty", "depressed"]):
        return "sadness"
    if any(w in text for w in ["angry", "mad", "frustrated", "hate"]):
        return "anger"
    if any(w in text for w in ["why", "how", "what should", "help"]):
        return "question"
    if len(text.split()) <= 2:
        return "short"
    return "normal"

class ResponseGenerator:
    def __init__(self):
        self.short_pool = [
            "Hmm… tell me a bit more.",
            "I'm listening—what’s going on?",
            "Take your time—what’s been bothering you?",
            "You can say it however you want—I'm here.",
            "Even a small hint helps—what's on your mind?"
        ]
        self.escalations = [
            "We don’t need to solve everything right now. What feels slightly off?",
            "Even if you're unsure—what's the closest word to what you're feeling?",
            "Is it more like stress, confusion, or something else?",
            "You don’t have to figure it out alone—talk to me."
        ]

    def is_stuck(self, context):
        if not context: return False
        context = context.lower()
        triggers = ["i dont know", "idk", "not sure", "i'm not sure"]
        count = sum(context.count(t) for t in triggers)
        return count >= 2

    def blend_context(self, base, context):
        if not context or random.random() < 0.4:
            return base
        
        ctx_clean = context.strip()[-60:]
        variations = [
            f"{base} You mentioned '{ctx_clean}'—how does that tie in?",
            f"{base} Thinking about what you said earlier: '{ctx_clean}'...",
            f"{base} It feels related to when you said '{ctx_clean}'.",
            f"{base} That makes sense, especially since you noted '{ctx_clean}'."
        ]
        return random.choice(variations)

    def generate(self, emotion, action, text="", context=""):
        intent = detect_intent(text)

        if self.is_stuck(context):
            return random.choice(self.escalations)

        if intent == "greeting":
            return random.choice(["Hey :) what's on your mind?", "Hi—how are you feeling today?"])
        
        if intent == "short":
            resp = random.choice(self.short_pool)
            return resp if not memory.is_repeating(resp) else random.choice(self.escalations)

        emotion_data = RESPONSES.get(emotion, RESPONSES["neutral"])
        action_data = emotion_data.get(action, emotion_data["motivate"])
        
        base = random.choice(action_data)
        
        if memory.is_repeating(base):
            base = random.choice(self.escalations)
            
        final = self.blend_context(base, context)
        memory.remember(final)
        return final

generator = ResponseGenerator()

def generate_response(emotion, action, text=None, context=None):
    return generator.generate(emotion, action, text or "", context or "")