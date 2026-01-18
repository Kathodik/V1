from emergentintegrations.llm.chat import LlmChat, UserMessage
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

SYSTEM_MESSAGE = """Du bist ein Experte für Galvanotechnik und arbeitest für Kathodik, einen professionellen Lohngalvanisierer.

Deine Aufgaben:
1. Beantworte Fachfragen zur Galvanisierung (Chrom, Cobalt, Nickel, Kupfer, Zink, Ruthenium, Rhodium, Palladium, Silber, Zinn, Platin, Gold)
2. Erkläre verschiedene Bearbeitungen (z.B. Gelbchromatiert, Blauchromatiert, Schwarzchrom, Schwarzrhodium, Glanzpalladium)
3. Berate zu Anwendungsfällen und geeigneten Metallen
4. Helfe bei der Auswahl der richtigen Beschichtung
5. Beantworte Fragen zu Prozessen, Eigenschaften und Anwendungen
6. Bei Bedarf helfe dem Kunden, sein gewünschtes 3D-Modell zu beschreiben

Verfügbare Metalle (12) und ihre Haupteigenschaften:
- Chrom (Cr): Härte, Glanz, Korrosionsschutz - auch als Schwarzchrom
- Cobalt (Co): Verschleißschutz, Magnetismus, Hochtemperaturbeständigkeit
- Nickel (Ni): Verschleißschutz - auch in Schwarz und Seidenmatt
- Kupfer (Cu): Elektrische Leitfähigkeit - verschiedene Färbungen (Rot, Antik)
- Zink (Zn): Korrosionsschutz - Gelbchromatiert, Blauchromatiert
- Ruthenium (Ru): Härte, Verschleißschutz, edle Optik
- Rhodium (Rh): Extrem hart und reflektierend - auch in Schwarz
- Palladium (Pd): Korrosionsbeständig, hypoallergen - auch hochglänzend
- Silber (Ag): Beste elektrische Leitfähigkeit, antibakteriell
- Zinn (Sn): Lötbarkeit, lebensmittelecht
- Platin (Pt): Extrem beständig, hochwertig, Edelmetall
- Gold (Au): Korrosionsbeständig, edle Optik, Leitfähigkeit

Maximale Teilegröße: 40 x 60 x 160 cm
Versand: Porto wird von Kathodik bezahlt

Sei professionell, präzise und hilfsbereit. Antworte auf Deutsch."""

class ChatService:
    def __init__(self):
        self.api_key = EMERGENT_LLM_KEY
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment variables")
    
    async def send_message(self, session_id: str, message: str) -> str:
        """Send a message and get AI response"""
        try:
            print(f"[ChatService] Processing message for session {session_id}")
            print(f"[ChatService] Message: {message[:100]}...")
            
            # Create a new chat instance - session_id might need to be positional
            # Try different initialization patterns
            try:
                # Pattern 1: session_id as keyword argument
                chat = LlmChat(
                    api_key=self.api_key,
                    session_id=session_id,
                    system_message=SYSTEM_MESSAGE
                )
            except TypeError:
                # Pattern 2: Try without session_id
                chat = LlmChat(
                    api_key=self.api_key,
                    system_message=SYSTEM_MESSAGE
                )
            
            # Configure to use OpenAI gpt-4o
            chat = chat.with_model("openai", "gpt-4o")
            
            # Create user message
            user_message = UserMessage(text=message)
            
            print(f"[ChatService] Sending message to LLM...")
            
            # Send message
            response = await chat.send_message(user_message)
            
            print(f"[ChatService] Received response: {response[:100] if response else 'None'}...")
            
            # Save to database
            await self.save_message(session_id, "user", message)
            await self.save_message(session_id, "assistant", response)
            
            return response
            
        except Exception as e:
            error_msg = str(e)
            print(f"[ChatService] Error: {error_msg}")
            import traceback
            traceback.print_exc()
            
            # Return a user-friendly error message
            return "Entschuldigung, ich hatte ein technisches Problem. Bitte versuchen Sie es erneut."
    
    async def get_chat_history(self, session_id: str):
        """Get chat history from database"""
        try:
            messages = await db.chat_messages.find(
                {"session_id": session_id}
            ).sort("timestamp", 1).limit(50).to_list(50)
            return messages
        except Exception as e:
            print(f"[ChatService] Error getting history: {str(e)}")
            return []
    
    async def save_message(self, session_id: str, role: str, content: str):
        """Save message to database"""
        try:
            await db.chat_messages.insert_one({
                "session_id": session_id,
                "role": role,
                "content": content,
                "timestamp": datetime.utcnow()
            })
        except Exception as e:
            print(f"[ChatService] Error saving message: {str(e)}")
    
    async def clear_history(self, session_id: str):
        """Clear chat history for a session"""
        try:
            await db.chat_messages.delete_many({"session_id": session_id})
        except Exception as e:
            print(f"[ChatService] Error clearing history: {str(e)}")

# Initialize the service
chat_service = ChatService()
