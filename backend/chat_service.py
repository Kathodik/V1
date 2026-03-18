from emergentintegrations.llm.chat import LlmChat, UserMessage
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

mongo_client = AsyncIOMotorClient(MONGO_URL)
db = mongo_client[DB_NAME]

SYSTEM_MESSAGE = """Du bist ein Experte fuer Galvanotechnik und arbeitest fuer Kathodik, einen professionellen Lohngalvanisierer.

Deine Aufgaben:
1. Beantworte Fachfragen zur Galvanisierung (Chrom, Cobalt, Nickel, Kupfer, Zink, Ruthenium, Rhodium, Palladium, Silber, Zinn, Platin, Gold)
2. Erklaere verschiedene Bearbeitungen (z.B. Gelbchromatiert, Blauchromatiert, Schwarzchrom, Schwarzrhodium, Glanzpalladium)
3. Berate zu Anwendungsfaellen und geeigneten Metallen
4. Helfe bei der Auswahl der richtigen Beschichtung
5. Beantworte Fragen zu Prozessen, Eigenschaften und Anwendungen
6. Bei Bedarf helfe dem Kunden, sein gewuenschtes 3D-Modell zu beschreiben

Verfuegbare Metalle (12) und ihre Haupteigenschaften:
- Chrom (Cr): Haerte, Glanz, Korrosionsschutz - auch als Schwarzchrom
- Cobalt (Co): Verschleissschutz, Magnetismus, Hochtemperaturbestaendigkeit
- Nickel (Ni): Verschleissschutz - auch in Schwarz und Seidenmatt
- Kupfer (Cu): Elektrische Leitfaehigkeit - verschiedene Faerbungen (Rot, Antik)
- Zink (Zn): Korrosionsschutz - Gelbchromatiert, Blauchromatiert
- Ruthenium (Ru): Haerte, Verschleissschutz, edle Optik
- Rhodium (Rh): Extrem hart und reflektierend - auch in Schwarz
- Palladium (Pd): Korrosionsbestaendig, hypoallergen - auch hochglaenzend
- Silber (Ag): Beste elektrische Leitfaehigkeit, antibakteriell
- Zinn (Sn): Loetbarkeit, lebensmittelecht
- Platin (Pt): Extrem bestaendig, hochwertig, Edelmetall
- Gold (Au): Korrosionsbestaendig, edle Optik, Leitfaehigkeit

Maximale Teilegroesse: 40 x 60 x 160 cm
Versand: Porto wird von Kathodik bezahlt

Sei professionell, praezise und hilfsbereit. Antworte auf Deutsch."""


class ChatService:
    def __init__(self):
        if not EMERGENT_LLM_KEY:
            logger.error("EMERGENT_LLM_KEY not set in environment")
        logger.info("ChatService initialized with emergentintegrations")

    def _create_chat(self, session_id: str) -> LlmChat:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message=SYSTEM_MESSAGE
        )
        chat.with_model("openai", "gpt-4o")
        return chat

    async def send_message(self, session_id: str, message: str, image_data: str = None) -> str:
        try:
            logger.info(f"Processing message for session {session_id}: {message[:80]}...")

            chat = self._create_chat(session_id)

            # Load history from DB into chat context
            history = await self._get_db_history(session_id)
            for msg in history[-10:]:
                if msg["role"] == "user":
                    chat.messages.append({"role": "user", "content": msg["content"]})
                elif msg["role"] == "assistant":
                    chat.messages.append({"role": "assistant", "content": msg["content"]})

            # Build user message with optional image
            if image_data:
                user_message = UserMessage(text=message, image_url=image_data)
                logger.info("Sending message with image data")
            else:
                user_message = UserMessage(text=message)

            response = await chat.send_message(user_message)

            logger.info(f"Got response: {str(response)[:80]}...")

            # Save both messages to DB
            await self._save_message(session_id, "user", message)
            await self._save_message(session_id, "assistant", str(response))

            return str(response)

        except Exception as e:
            logger.error(f"Chat error: {e}", exc_info=True)
            error_str = str(e)
            if "budget" in error_str.lower() or "exceeded" in error_str.lower():
                return "Entschuldigung, der KI-Dienst ist voruebergehend nicht verfuegbar. Bitte kontaktieren Sie uns direkt unter Service@Kathodik.com oder 01626431168."
            raise

    async def _get_db_history(self, session_id: str):
        try:
            messages = await db.chat_messages.find(
                {"session_id": session_id}, {"_id": 0}
            ).sort("timestamp", 1).limit(50).to_list(50)
            return messages
        except Exception as e:
            logger.error(f"Error getting history: {e}")
            return []

    async def _save_message(self, session_id: str, role: str, content: str):
        try:
            await db.chat_messages.insert_one({
                "session_id": session_id,
                "role": role,
                "content": content,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
        except Exception as e:
            logger.error(f"Error saving message: {e}")

    async def get_chat_history(self, session_id: str):
        return await self._get_db_history(session_id)

    async def clear_history(self, session_id: str):
        try:
            await db.chat_messages.delete_many({"session_id": session_id})
        except Exception as e:
            logger.error(f"Error clearing history: {e}")


chat_service = ChatService()
