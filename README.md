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

## 🐳 Docker Deployment

To launch both backend and frontend using Docker Compose:

```bash
docker-compose up --build
```

---

## 👨‍💻 Project Author

**Rishabh Vyas**  
Bachelor of Technology — Computer Science & Engineering  
**Drs. Kiran & Pallavi Patel Global University**  
Class of 2026

---

## ⚖️ Scientific & Regulatory Notice

This application is an analytical decision-support and academic evaluation system. Predictions, calculated water quality indicators, and automated insights do not replace certified laboratory testing or official statutory regulatory monitoring by the Central Pollution Control Board (CPCB) or State Pollution Control Boards (SPCBs).
