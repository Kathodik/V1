import os
import base64
import logging
from dotenv import load_dotenv
from emergentintegrations.llm.openai.image_generation import OpenAIImageGeneration

load_dotenv()
logger = logging.getLogger(__name__)

api_key = os.environ.get("EMERGENT_LLM_KEY")

async def generate_concept_image(prompt: str) -> str:
    """Generate a photorealistic concept image from a text prompt. Returns base64 encoded image."""
    try:
        image_gen = OpenAIImageGeneration(api_key=api_key)
        images = await image_gen.generate_images(
            prompt=prompt,
            model="gpt-image-1",
            number_of_images=1
        )
        if images and len(images) > 0:
            image_base64 = base64.b64encode(images[0]).decode('utf-8')
            return image_base64
        else:
            raise Exception("No image was generated")
    except Exception as e:
        logger.error(f"Image generation failed: {e}")
        raise
