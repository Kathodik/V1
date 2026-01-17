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
    
    async def send_message(self, session_id: str, message: str) -> str:
        """Send a message and get AI response"""
        try:
            # Get chat history from database
            history = await self.get_chat_history(session_id)
            
            # Initialize chat
            chat = LlmChat(
                api_key=self.api_key,
                session_id=session_id,
                system_message=SYSTEM_MESSAGE
            ).with_model("openai", "gpt-5.2")
            
            # Create user message
            user_message = UserMessage(text=message)
            
            # Send message and get response
            response = await chat.send_message(user_message)
            
            # Save to database
            await self.save_message(session_id, "user", message)
            await self.save_message(session_id, "assistant", response)
            
            return response
        except Exception as e:
            print(f"Error in chat service: {str(e)}")
            return f"Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Nachricht: {str(e)}"
    
    async def get_chat_history(self, session_id: str):
        """Get chat history from database"""
        messages = await db.chat_messages.find(
            {"session_id": session_id}
        ).sort("timestamp", 1).limit(50).to_list(50)
        return messages
    
    async def save_message(self, session_id: str, role: str, content: str):
        """Save message to database"""
        await db.chat_messages.insert_one({
            "session_id": session_id,
            "role": role,
            "content": content,
            "timestamp": datetime.utcnow()
        })
    
    async def clear_history(self, session_id: str):
        """Clear chat history for a session"""
        await db.chat_messages.delete_many({"session_id": session_id})

chat_service = ChatService()
