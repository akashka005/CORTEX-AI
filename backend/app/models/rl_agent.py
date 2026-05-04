import random
import json
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Q_TABLE_PATH = "models/q_table.json"
ACTIONS = ["motivate", "advice", "distract", "deep"]

class RLAgent:
    def __init__(self, path=Q_TABLE_PATH):
        self.path = path
        self.q_table = self._load_q_table()

    def _load_q_table(self):
        if os.path.exists(self.path):
            try:
                with open(self.path, "r") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading Q-table: {e}")
        return {}

    def save(self):
        try:
            with open(self.path, "w") as f:
                json.dump(self.q_table, f, indent=4)
        except Exception as e:
            logger.error(f"Error saving Q-table: {e}")

    def get_state(self, emotion, cluster):
        return f"{emotion}_{cluster}"

    def choose_action(self, state, epsilon=0.15):
        if random.random() < epsilon or state not in self.q_table:
            return random.choice(ACTIONS)
        
        state_actions = self.q_table[state]
        return max(state_actions, key=state_actions.get)

    def update(self, state, action, reward, alpha=0.1, gamma=0.9):
        if state not in self.q_table:
            self.q_table[state] = {a: 0.0 for a in ACTIONS}

        current_q = self.q_table[state][action]
        max_q = max(self.q_table[state].values())
        
        new_q = current_q + alpha * (reward + gamma * max_q - current_q)
        self.q_table[state][action] = new_q
        
        self.save()

agent = RLAgent()