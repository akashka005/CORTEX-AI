from collections import defaultdict, deque
MEMORY = defaultdict(lambda: deque(maxlen=10))


def add_to_memory(session_id, role, text):
    MEMORY[session_id].append({
        "role": role,
        "text": text
    })

def get_memory(session_id):
    return list(MEMORY[session_id])