# 🔍 TruthLens – AI-Powered Fact Checker

> Combat misinformation instantly. Upload suspicious text or images and get a real-time AI verdict backed by live web sources.

---

## ✨ Features

| Feature | Details |
|---|---|
| 📝 Text Verification | Paste any claim, headline, or WhatsApp forward |
| 🖼️ Image / Screenshot | Drag & drop images — Gemini reads & understands context |
| 🤖 AI Verdict | REAL · FAKE · MISLEADING · UNVERIFIED |
| 📊 Confidence Score | 0–100% confidence meter per verdict |
| 🔎 Real-time Search | Tavily scours fact-check sites (Snopes, Reuters, AP, etc.) |
| 🔗 Source Links | Clickable evidence articles from the web |
| 📈 Trending Feed | MongoDB-backed history of recent checks |
| 🗂️ History Page | Filter & review all past verifications |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite · react-dropzone · react-router-dom · react-hot-toast
- **Backend**: Node.js · Express.js · Multer
- **Database**: MongoDB Atlas (Mongoose)
- **AI**: Google Gemini 2.0 Flash (`@google/generative-ai`)
- **Search**: Tavily Search API (real-time web search)

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone <your-repo-url>
cd truth-lens-iic-hackathon

# Install server deps
cd server && npm install && cd ..

# Install client deps
cd client && npm install && cd ..
```

### 2. Configure environment variables

```bash
cd server
cp .env.example .env
# Fill in your keys (see below)
```

**`server/.env`**

```env
PORT=5000
CLIENT_URL=http://localhost:5173

# MongoDB Atlas connection string
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/truthlens?retryWrites=true&w=majority

# Google Gemini API key → https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Tavily Search API key → https://tavily.com
TAVILY_API_KEY=your_tavily_api_key_here
```

### 3. Run

Open **two terminals**:

```bash
# Terminal 1 – Backend
cd server
npm run dev

# Terminal 2 – Frontend
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔄 How It Works

```
User Input (Text / Image)
        ↓
Express /api/verify  (Multer handles image)
        ↓
Gemini 2.0 Flash extracts the core claim
        ↓
Tavily API searches the web in real time
        ↓
Gemini compares claim vs evidence → JSON verdict
        ↓
MongoDB stores result
        ↓
React displays verdict + confidence + sources
```

---

## 📁 Project Structure

```
truth-lens-iic-hackathon/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── UploadZone.jsx
│       │   ├── ResultCard.jsx
│       │   ├── VerdictBadge.jsx
│       │   ├── ConfidenceMeter.jsx
│       │   ├── SourcesList.jsx
│       │   └── TrendingFeed.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── History.jsx
│       │   └── Detail.jsx
│       └── services/
│           └── api.js
└── server/                  # Express backend
    ├── config/db.js
    ├── models/FactCheck.js
    ├── middleware/upload.js
    ├── routes/
    │   ├── verify.js
    │   └── history.js
    ├── services/factCheckService.js
    └── index.js
```

---

## 🔑 API Keys Setup

| Key | Where to get |
|---|---|
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) – free tier available |
| `TAVILY_API_KEY` | [tavily.com](https://tavily.com) – free tier: 1,000 searches/month |
| `MONGO_URI` | [MongoDB Atlas](https://cloud.mongodb.com) – free M0 cluster |

---

## 📝 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/verify` | Verify text (`body.text`) or image (`multipart image`) |
| `GET` | `/api/history` | Get last 20 fact-checks |
| `GET` | `/api/history/:id` | Get full detail of one record |
| `DELETE` | `/api/history/:id` | Delete a record |
| `GET` | `/api/health` | Server health check |

---

## 🏆 Built for IIC Hackathon

TruthLens demonstrates full-stack AI integration using the MERN stack to combat the real-world problem of misinformation.
