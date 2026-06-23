import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://pnijzmqygibhwbcnkklm.supabase.co")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
OLLAMA_ENDPOINT = os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "tiny")
LLM_MODEL = os.getenv("LLM_MODEL", "llama3.2")
VISION_MODEL = os.getenv("VISION_MODEL", "llama3.2-vision")
DELAY_CAMPANHA_MIN = int(os.getenv("DELAY_CAMPANHA_MIN", "45"))
DELAY_CAMPANHA_MAX = int(os.getenv("DELAY_CAMPANHA_MAX", "75"))
QUEUE_MAX_SIZE = int(os.getenv("QUEUE_MAX_SIZE", "50"))
