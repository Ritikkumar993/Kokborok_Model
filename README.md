# 🌐 Kokborok Language NLP Model

Advanced Part-of-Speech (POS) Tagging for the Kokborok language using a fine-tuned XLM-RoBERTa model.

## 📁 Project Structure

```
Kokborok_Model/
├── backend/                    # 🔧 Flask API (Deploy to Render)
│   ├── app.py                  # Flask server with model inference
│   ├── requirements.txt        # Python dependencies
│   ├── Procfile                # Render start command
│   ├── render.yaml             # Render blueprint config
│   └── .gitignore              # Backend-specific ignores
│
├── frontend/                   # 🎨 Static Website (Deploy to Vercel)
│   ├── index.html              # Home page with interactive demo
│   ├── history.html            # Kokborok language history
│   ├── importance.html         # Why this work matters
│   ├── technology.html         # Technology behind the model
│   ├── styles.css              # All styling
│   ├── script.js               # Frontend logic + API calls
│   └── vercel.json             # Vercel deployment config
│
├── .gitignore                  # Root-level ignores
└── README.md                   # This file
```

## 🚀 Deployment Guide

### Step 1: Deploy Backend on Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT --timeout 120`
   - **Environment**: Python 3
5. Deploy and note your URL (e.g., `https://kokborok-api.onrender.com`)

### Step 2: Update Frontend API URL

Open `frontend/script.js` and update line 4:

```javascript
const API_BASE_URL = 'https://YOUR-RENDER-APP-NAME.onrender.com';
```

Replace `YOUR-RENDER-APP-NAME` with your actual Render URL.

### Step 3: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Import Project**
2. Connect your GitHub repo
3. Set **Root Directory** to `frontend`
4. Framework Preset: **Other**
5. Deploy → Your site will be live!

## 🧪 Local Development

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Server runs at `http://localhost:5000`

### Frontend

Update `API_BASE_URL` in `script.js` to `http://localhost:5000`, then open `index.html` in your browser.

## 🤖 Model Details

| Property | Value |
|----------|-------|
| **Architecture** | XLM-RoBERTa (Token Classification) |
| **Parameters** | ~125 Million |
| **Hidden Size** | 768 dimensions |
| **Layers** | 12 transformer layers |
| **POS Tags** | 17 categories |
| **Model Hub** | [ritik3412/Kokborok_model](https://huggingface.co/ritik3412/Kokborok_model) |

## 🏷️ Supported POS Tags

ADJ, ADP, ADV, AUX, CCONJ, DET, INTJ, NOUN, NUM, PART, PRON, PROPN, PUNCT, SCONJ, UNK, VERB, X

## 📡 API Endpoints

### `POST /api/analyze`

```json
// Request
{ "text": "Ang nwng kwrwi sa." }

// Response
{ "tokens": [{ "text": "Ang", "tag": "PRON", "score": 95.2 }, ...] }
```

### `GET /api/model-info`

Returns model architecture details.

### `GET /`

Health check endpoint.

## 📜 About Kokborok

Kokborok (Tripuri) is a Tibeto-Burman language spoken by ~1 million people in Tripura, India. This project aims to preserve and advance the language through NLP technology.

## 📄 License

This project is for educational and research purposes.
