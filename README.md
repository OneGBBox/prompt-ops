# prompt-ops
FastAPI + Angular app demonstrating tokens, context windows, JSON schema prompting, temperature, and few-shot techniques.

---

## Project Structure

```

prompting-lab/
├── backend/           -> Python FastAPI server
│   ├── main.py
│   └── requirements.txt
└── frontend/          -> Angular 17 app
    ├── src/app/
    │   ├── components/
    │   │   ├── tokens/          -> Concept 01: Tokens & Context Window
    │   │   ├── json-schema/     -> Concept 02: JSON Schema via System Prompt
    │   │   ├── temperature/     -> Concept 03: Temperature 0 vs 1
    │   │   └── few-shot/        -> Concept 04: Few-Shot Prompting
    │   ├── services/
    │   │   └── api.service.ts   -> HTTP service calls to FastAPI
    │   └── app.module.ts
    ├── package.json
    └── angular.json

```

---


### Prerequisites
- **Python 3.10+**
- **Node.js 18+** and npm
- **Claude API key**

---

### 1. Backend (FastAPI)

---

### 2. Frontend (Angular)


---

## The 4 Core Concepts

| # | Concept | What you learn |
|---|---------|----------------|
| 01 | **Tokens & Context Window** | Visualize how text becomes tokens; see context window usage |
| 02 | **JSON Schema via System Prompt** | Write a system prompt that reliably returns structured JSON |
| 03 | **Temperature: 0 vs 1** | Run the same prompt twice to see deterministic vs creative outputs |
| 04 | **Few-Shot Prompting** | Show 3 examples → model learns custom IT ticket format |

---

## API Endpoints


---

## Architecture
