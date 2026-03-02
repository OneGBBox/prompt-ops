import os
import re
import json
import anthropic
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

# Load environment variables from .env file (if exists)
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Prompt Ops API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
# ─────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────


class TokenRequest(BaseModel):
    text: str


class JsonSchemaRequest(BaseModel):
    user_prompt: str


class TemperatureRequest(BaseModel):
    prompt: str


class FewShotRequest(BaseModel):
    user_input: str

# ─────────────────────────────────────────────
# 1. Tokens & Context Window
# ─────────────────────────────────────────────


@app.post("/api/tokens/analyze")
def analyze_tokens(req: TokenRequest):
    """
    Estimate token count for text and visualize context window usage.
    Uses a simple word-based approximation (1 token ≈ 0.75 words).
    """
    text = req.text
    words = text.split()
    chars = len(text)

    # Rough approximation: ~4 chars per token (industry standard heuristic)
    estimated_tokens = max(1, round(chars / 4))

    # Color-annotated word groups (every ~4 chars = 1 token visual)
    token_chunks = []
    word_buffer = ""
    chunk_index = 0
    for word in words:
        word_buffer += word + " "
        if len(word_buffer) >= 4:
            token_chunks.append(
                {"text": word_buffer.strip(), "index": chunk_index})
            word_buffer = ""
            chunk_index += 1
    if word_buffer:
        token_chunks.append(
            {"text": word_buffer.strip(), "index": chunk_index})

    context_window = 200000  # Claude's context window
    percent_used = round((estimated_tokens / context_window) * 100, 6)

    return {
        "original_text": text,
        "character_count": chars,
        "word_count": len(words),
        "estimated_tokens": estimated_tokens,
        "context_window_size": context_window,
        "tokens_remaining": context_window - estimated_tokens,
        "percent_used": percent_used,
        "chunks": [c["text"] for c in token_chunks[:80]],
        "explanation": (
            f"Your text uses about {estimated_tokens} tokens — "
            f"like filling {percent_used:.4f}% of a {context_window:,}-seat stadium."
        ),
    }


# ─────────────────────────────────────────────
# 2. JSON Schema System Prompt
# ─────────────────────────────────────────────

PRODUCT_SCHEMA = {
    "type": "object",
    "properties": {
        "name":        {"type": "string", "description": "Product name"},
        "price":       {"type": "number", "description": "Price in USD"},
        "category":    {"type": "string", "enum": ["electronics", "clothing", "food", "other"]},
        "in_stock":    {"type": "boolean"},
        "tags":        {"type": "array", "items": {"type": "string"}},
        "rating":      {"type": "number", "minimum": 0, "maximum": 5},
    },
    "required": ["name", "price", "category", "in_stock", "tags", "rating"],
}

JSON_SYSTEM_PROMPT = """You are a product data extraction assistant.
Your ONLY job is to return valid JSON — no prose, no markdown, no code fences.

Always return a JSON object matching this exact schema:
{
  "name":     string   (product name),
  "price":    number   (USD, e.g. 29.99),
  "category": string   (one of: "electronics", "clothing", "food", "other"),
  "in_stock": boolean,
  "tags":     string[] (2-5 descriptive tags),
  "rating":   number   (0.0 - 5.0)
}

Rules:
- Output ONLY the JSON object. Nothing before or after it.
- If information is missing, make a reasonable inference.
- Never add extra fields.
- Never explain your answer."""


@app.post("/api/json-schema/generate")
def generate_json(req: JsonSchemaRequest):
    """Call Claude with a strict JSON system prompt and return structured output."""
    try:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=512,
            system=JSON_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": req.user_prompt}],
        )
        raw = response.content[0].text.strip()

        # Clean any accidental markdown fences
        clean = re.sub(r"^```(?:json)?|```$", "", raw,
                       flags=re.MULTILINE).strip()
        parsed = json.loads(clean)

        return {
            "system_prompt_used": JSON_SYSTEM_PROMPT,
            "user_prompt": req.user_prompt,
            "raw_response": raw,
            "parsed_json": parsed,
            "schema": PRODUCT_SCHEMA,
            "valid_json": True,
        }
    except json.JSONDecodeError as e:
        return {
            "system_prompt_used": JSON_SYSTEM_PROMPT,
            "user_prompt": req.user_prompt,
            "raw_response": raw if "raw" in locals() else "",
            "parsed_json": None,
            "schema": PRODUCT_SCHEMA,
            "valid_json": False,
            "error": str(e),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────
# 3. Temperature Comparison
# ─────────────────────────────────────────────

@app.post("/api/temperature/compare")
def compare_temperature(req: TemperatureRequest):
    """Run the same prompt at temperature 0 and temperature 1, return both."""
    results = {}
    for temp in [0.0, 1.0]:
        try:
            response = client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=300,
                temperature=temp,
                messages=[{"role": "user", "content": req.prompt}],
            )
            results[f"temp_{int(temp)}"] = response.content[0].text.strip()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return {
        "prompt": req.prompt,
        "temp_0": results["temp_0"],
        "temp_1": results["temp_1"],
        "explanation": {
            "temp_0": "Deterministic — always picks the most probable next token. Best for facts, code, structured data.",
            "temp_1": "Creative — samples from the probability distribution. Best for brainstorming, writing, ideation.",
        },
    }


# ─────────────────────────────────────────────
# 4. Few-Shot Prompting
# ─────────────────────────────────────────────

FEW_SHOT_EXAMPLES = [
    {
        "user": "My laptop won't turn on",
        "assistant": " ISSUE: Device power failure\n CATEGORY: Hardware\n URGENCY: High\n NEXT STEP: Check power cable, then battery\n TICKET: #HW-001",
    },
    {
        "user": "I forgot my password",
        "assistant": " ISSUE: Authentication failure\n CATEGORY: Account Access\n URGENCY: Medium\n NEXT STEP: Use password reset link in login page\n TICKET: #AC-002",
    },
    {
        "user": "The app is running slowly",
        "assistant": " ISSUE: Performance degradation\n CATEGORY: Software\n URGENCY: Low\n NEXT STEP: Clear cache, restart application\n TICKET: #SW-003",
    },
]


@app.post("/api/few-shot/generate")
def few_shot_generate(req: FewShotRequest):
    """Demonstrate few-shot prompting with a custom IT ticket format."""
    # Build few-shot message history
    messages = []
    for ex in FEW_SHOT_EXAMPLES:
        messages.append({"role": "user", "content": ex["user"]})
        messages.append({"role": "assistant", "content": ex["assistant"]})
    messages.append({"role": "user", "content": req.user_input})

    try:
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=300,
            system="You are an IT helpdesk triage assistant. Follow the exact format shown in the conversation history.",
            messages=messages,
        )
        output = response.content[0].text.strip()

        return {
            "user_input": req.user_input,
            "output": output,
            "examples_used": FEW_SHOT_EXAMPLES,
            "messages_sent": messages,
            "explanation": (
                "By showing 3 input→output examples before the real request, "
                "the model learns the exact emoji-tagged ticket format without any explicit instructions about format."
            ),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "Prompting Lab API is running"}
