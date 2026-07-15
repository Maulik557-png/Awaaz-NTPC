# Awaaz-NTPC

**Acoustic machinery health monitoring for thermal power plants**

Awaaz is a mobile-first web application that helps plant technicians detect early equipment faults by analysing machine sound. Record audio from a smartphone, run it through a CNN classifier, and get actionable maintenance recommendations — a cost-effective preliminary diagnosis layer for motors, pumps, valves, turbines, and heat exchangers.

---

## Problem

Thermal power plants run large fleets of heavy equipment. Different parts degrade over time and can lead to outages. Experienced operators can often hear when something is wrong — Awaaz aims to scale that intuition with a software system that:

1. Captures equipment sound in the field
2. Converts it to a mel spectrogram
3. Classifies the fault with a trained CNN
4. Surfaces remedies, alerts, and daily reports for the maintenance team

---

## Features

| Area                   | What you get                                                |
| ---------------------- | ----------------------------------------------------------- |
| **Auth**               | Sign up / login with employee profile (token-based)         |
| **Equipment**          | Register and manage plant assets (no mock data)             |
| **Recording**          | Capture audio on-device, set duration, upload for analysis  |
| **ML analysis**        | Mel spectrogram + CNN fault codes `0–4` with remedies       |
| **Dashboard**          | Live stats, equipment status, recent activity               |
| **Alerts**             | Auto-created on abnormal predictions; acknowledge / resolve |
| **Reports**            | Daily analysis reports with findings & recommendations      |
| **Settings / Profile** | Account management and logout                               |

### Fault classes

| Code | Label                | Suggested action                   |
| ---- | -------------------- | ---------------------------------- |
| 0    | Normal               | Continue routine monitoring        |
| 1    | Fan misalignment     | Check fan alignment                |
| 2    | Gearbox issue        | Inspect gearbox oil                |
| 3    | Pump valve issue     | Check pump valves                  |
| 4    | Slider / valve fault | Inspect slider / valve maintenance |

---

## Architecture

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│  React + Vite frontend  │  REST   │  Django REST API (:8000)     │
│  (mobile-first UI)      │ ──────► │  Auth · Equipment · Alerts   │
│  localhost:8080         │  Token  │  Recordings · ML upload      │
└─────────────────────────┘         └──────────────┬───────────────┘
                                                   │
                                    ┌──────────────▼───────────────┐
                                    │  MySQL (awaaz_ntpc)          │
                                    │  + local media (audio/PNG)   │
                                    │  + saved_models/cnn_model.h5 │
                                    └──────────────────────────────┘
```

**Analysis pipeline**

```
Microphone (WebM)
    → Upload to /api/upload/
    → Convert to WAV (ffmpeg / pydub)
    → Mel spectrogram (librosa)
    → CNN prediction (TensorFlow)
    → Save recording + update equipment status
    → Create alert if fault ≠ Normal
```

---

## Tech stack

### Frontend

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- React Query · React Router · Sonner

### Backend

- Django 4.x + Django REST Framework
- Token authentication
- PyMySQL · python-dotenv · django-cors-headers

### ML / audio

- TensorFlow / Keras (`cnn_model.h5`)
- librosa · matplotlib · Pillow · pydub
- **ffmpeg** required on the host for WebM → WAV

### Database

- Local **MySQL 8**

---

## Project structure

```
Awaaz-NTPC/
├── backend/
│   ├── awaaz_app/          # Models, API views, ML utils
│   ├── Working-py-script/  # Django settings & URLs
│   ├── saved_models/       # cnn_model.h5
│   ├── media/              # Uploaded audio & spectrograms
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/          # Dashboard, Record, Equipment, …
│   │   ├── components/
│   │   ├── contexts/       # Auth
│   │   └── lib/api.ts      # REST client
│   ├── package.json
│   └── .env                # VITE_BACKEND_URL
└── PRESENTATION.md
```

---

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+ (3.12 tested)
- **MySQL 8** running locally
- **ffmpeg** on `PATH` (needed for WebM conversion)

---

## Quick start

### 1. Clone

```bash
git clone https://github.com/Maulik557-png/Awaaz-NTPC.git
cd Awaaz-NTPC
```

### 2. MySQL database

```sql
CREATE DATABASE awaaz_ntpc CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Backend

```bash
cd backend
copy .env.example .env          # Windows
# cp .env.example .env          # macOS / Linux
```

Edit `.env` and set at least:

```env
MYSQL_PASSWORD=your_mysql_password
```

Then:

```bash
py -3 -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS / Linux:
# source .venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

API health check: [http://127.0.0.1:8000/api/](http://127.0.0.1:8000/api/)

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

App: [http://localhost:8080](http://localhost:8080)

`frontend/.env`:

```env
VITE_BACKEND_URL=http://127.0.0.1:8000
```

---

## Demo flow

1. **Sign up** with email, password, full name, and employee ID
2. **Add equipment** (Equipment → Add)
3. **Record** audio for that asset
4. Tap **Save & Analyze** — wait for spectrogram + CNN (first run may take ~1 minute while the model loads)
5. Review the **on-screen result**, then open the daily **report** or **alerts** if a fault was detected
6. Check the **dashboard** for updated counts and recent activity

---

## API overview

Base URL: `http://127.0.0.1:8000/api/`

Authenticated routes expect:

```http
Authorization: Token <your-token>
```

| Method                     | Endpoint           | Description                                      |
| -------------------------- | ------------------ | ------------------------------------------------ |
| `POST`                     | `/auth/register/`  | Create account + profile                         |
| `POST`                     | `/auth/login/`     | Login → token                                    |
| `POST`                     | `/auth/logout/`    | Invalidate token                                 |
| `GET` / `PATCH`            | `/auth/me/`        | Read / update profile                            |
| `GET` / `POST`             | `/equipment/`      | List / create equipment                          |
| `GET` / `PATCH` / `DELETE` | `/equipment/<id>/` | Equipment detail                                 |
| `GET`                      | `/recordings/`     | List recordings (`?date=YYYY-MM-DD`, `?limit=N`) |
| `POST`                     | `/upload/`         | Multipart: `audio`, `equipment_id`, `duration`   |
| `GET`                      | `/alerts/`         | List alerts (`?status=`, `?severity=`)           |
| `PATCH`                    | `/alerts/<id>/`    | Update status (`acknowledged` / `resolved`)      |

---

## Environment variables

### Backend (`backend/.env`)

| Variable               | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| `SECRET_KEY`           | Django secret                             |
| `DEBUG`                | `True` / `False`                          |
| `ALLOWED_HOSTS`        | Comma-separated hosts                     |
| `MYSQL_*`              | Database name, user, password, host, port |
| `CORS_ALLOWED_ORIGINS` | Frontend origins allowed by CORS          |

### Frontend (`frontend/.env`)

| Variable           | Purpose                             |
| ------------------ | ----------------------------------- |
| `VITE_BACKEND_URL` | Django base URL (no trailing slash) |

---

## Screens (product areas)

- **Login / Sign up** — NTPC-branded auth
- **Dashboard** — recordings, alerts, analysed-today, quick actions
- **Equipment** — CRUD-style list with filters by category / status / plant
- **Record** — mic capture → analyse → inline result card
- **Reports** — daily groupings of analysed recordings
- **Alerts** — severity tabs + acknowledge / resolve
- **Settings / Profile** — account & logout

---

## Roadmap / ideas

- Offline recording queue for poor plant network coverage
- Stronger model training on site-specific industrial datasets
- Push notifications for critical alerts
- PDF export for daily reports
- Native Android / iOS wrappers (same API)
- Multi-plant org / role-based access (admin, supervisor, technician)

---

## Contributing

This began as a hackathon prototype and is being refurbished into a working end-to-end system. PRs that improve ML accuracy, field UX, or deployment docs are welcome.

1. Fork & branch
2. Keep changes focused
3. Test auth → equipment → record → analyse → dashboard/alerts locally
4. Open a pull request

---

## License

Specify your preferred license here (e.g. MIT). Until then, all rights reserved by the authors.

---

## Acknowledgements

- Inspired by the NTPC problem statement on acoustic anomaly detection for heavy machinery
- Built with Django, React, TensorFlow, and librosa

---
