# 💧 AquaSense — River Water Quality Analysis & Forecasting Platform

A full-fledged, production-grade environmental intelligence platform that combines **Central Pollution Control Board (CPCB) Regulatory Standards** with a **300-Estimator Random Forest Classifier** to provide real-time, explainable water quality assessment, multi-year river trend tracking, and surveillance telemetry integration.

---

## 🌟 Key Highlights

- **Hybrid Predictive Engine**: Evaluates deterministic statutory CPCB criteria (Classes A–E) alongside a 12-feature Random Forest machine learning ensemble.
- **Explainable AI**: Gini-impurity feature importance ranking, transparent model agreement analysis, and automated contextual insights.
- **Genuine Historical Registry**: Searchable, filterable, and exportable database of **1,868 authentic CPCB river monitoring observations** spanning 2013–2023 across Godavari, Narmada, Sabarmati, Yamuna, Krishna, and Mahanadi river basins.
- **Verified Evaluation Metrics**:
  - **Training Accuracy:** 100.0%
  - **Stratified Test Accuracy:** 98.57%
  - **5-Fold Cross Validation:** 85.31%
  - **Ensemble Architecture:** 300 Decision Trees (max depth 15, standard scaled)
- **Monitoring Station Network**: 315 registered CPCB surveillance nodes with geospatial GPS mapping for Gujarat and peninsular river basins.
- **Modern Responsive SaaS Design**: Deep oceanic aesthetic with dark/light themes, custom SVG circular confidence gauges, interactive parameter sliders with real-time range badges, and Recharts analytics.

---

## 🏗 System Architecture

```text
river-water-quality-platform/
├── backend/
│   ├── main.py                  # FastAPI server with lifespan singleton management
│   ├── model.pkl                # Trained 300-tree Random Forest classifier
│   ├── scaler.pkl               # Trained 12-feature StandardScaler
│   ├── water_quality.xlsx       # 1,868-record CPCB historical river surveillance dataset
│   ├── requirements.txt         # Python dependencies
│   ├── schemas/
│   │   ├── prediction.py        # Pydantic v2 validation models for prediction
│   │   └── dataset.py           # Schemas for records, KPIs, and station cards
│   ├── services/
│   │   ├── predictor.py         # CPCB rule engine, feature engineering & inference
│   │   └── data_service.py      # Data loading, KPI aggregation, distributions & station index
│   ├── routers/
│   │   ├── predict.py           # POST /api/predict & GET /api/feature-importance
│   │   ├── dataset.py           # GET /api/dataset, filters, and CSV streaming export
│   │   ├── analytics.py         # Summary statistics, class breakdown, distributions, correlation
│   │   ├── stations.py          # GET /api/stations and /api/stations/map
│   │   └── forecast.py          # GET /api/forecast (2013-2023 trends & IoT architecture)
│   └── tests/
│       └── test_predictor.py    # Pytest unit tests for CPCB rules and inference
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components (Gauges, Sliders, Charts, Cards)
│   │   ├── pages/               # 10 dedicated pages
│   │   ├── services/api.ts      # Type-safe Fetch API client
│   │   ├── types/index.ts       # Centralized TypeScript definitions
│   │   ├── App.tsx              # Shell layout with desktop sidebar & mobile drawer
│   │   ├── index.css            # Tailwind base, utilities & glassmorphism
│   │   └── main.tsx             # Application bootstrap
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docker-compose.yml           # Full-stack container orchestration
├── .env.example
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (tested on Python 3.14)
- **Node.js 18+** & **npm 9+**

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend unit tests
python -m pytest tests/ -v

# Start FastAPI server (runs on http://localhost:8000)
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### 2. Frontend Setup (React + Vite)

```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser to view the application.

---

## 🧪 Production Build

```bash
cd frontend
npm run build
```
Compiled production artifacts will be generated in `frontend/dist/`.

---

## ☁️ Deployment Guide (GitHub, Render & Vercel)

### 1. Push to GitHub

Initialize and push to your GitHub repository:

```bash
# Add your GitHub remote URL (replace YOUR_USERNAME/YOUR_REPO with your details)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push to main branch
git push -u origin main
```

---

### 2. Deploy Backend to Render (Free Web Service)

AquaSense includes a pre-configured [render.yaml](file:///render.yaml):

1. Log into [Render](https://render.com).
2. Click **New +** → **Blueprint** (or **Web Service**).
3. Connect your GitHub repository.
4. If using Blueprint: Render will automatically detect `render.yaml` and configure everything.
5. If creating a manual **Web Service**:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**: `PYTHON_VERSION` = `3.11.9`
6. Click **Create Web Service**.
7. Once deployed, copy your live backend URL (e.g. `https://aquasense-backend.onrender.com`).

---

### 3. Deploy Frontend to Vercel

AquaSense includes pre-configured [vercel.json](file:///vercel.json) files:

1. Log into [Vercel](https://vercel.com).
2. Click **Add New…** → **Project**.
3. Import your GitHub repository.
4. In the **Configure Project** screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `frontend` *(or leave as root, root `vercel.json` will route automatically)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://aquasense-backend.onrender.com` *(your live Render backend URL from Step 2)*
6. Click **Deploy**.

Your live frontend will now communicate seamlessly with your Render-hosted ML API!

---

## ⚖️ Scientific & Regulatory Notice

This application is an analytical decision-support and academic evaluation system. Predictions, calculated water quality indicators, and automated insights do not replace certified laboratory testing or official statutory regulatory monitoring by the Central Pollution Control Board (CPCB) or State Pollution Control Boards (SPCBs).

