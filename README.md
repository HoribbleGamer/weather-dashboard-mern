# Real-Time Weather Dashboard 🌤️

A full-stack real-time weather dashboard built with **React** (Vite), **Node.js/Express**, and **MongoDB**.

---

## 📁 Project Structure

```
weather-dashboard/
├── client/                   # React frontend (Vite)
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                   # Node.js/Express backend
│   ├── routes/               # (coming soon)
│   ├── models/               # (coming soon)
│   ├── controllers/          # (coming soon)
│   ├── middleware/           # (coming soon)
│   ├── .env                  # ⚠️ Not committed to git
│   ├── server.js             # Entry point
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account (or local MongoDB instance)
- OpenWeatherMap API key — [Get one free](https://openweathermap.org/api)

---

### 1. Backend Setup

```bash
cd server
npm install
```

Edit `server/.env` and fill in your credentials:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/weather-dashboard
OPENWEATHER_API_KEY=your_api_key_here
PORT=5000
NODE_ENV=development
```

Start the dev server (with auto-reload via nodemon):

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

The React app will be available at `http://localhost:5173`.

---

## 🛠️ Tech Stack

| Layer     | Technology                            |
|-----------|---------------------------------------|
| Frontend  | React 18, Vite, CSS                   |
| Backend   | Node.js, Express 5                    |
| Database  | MongoDB + Mongoose                    |
| Weather   | OpenWeatherMap API (via Axios)        |
| Dev Tools | nodemon, dotenv, cors                 |

---

## 📡 API Endpoints

| Method | Endpoint               | Description                     |
|--------|------------------------|---------------------------------|
| GET    | `/`                    | Health check                    |
| GET    | `/api/weather/:city`   | *(coming soon)* Current weather |
| GET    | `/api/weather/forecast`| *(coming soon)* 5-day forecast  |

---

## 🔐 Environment Variables

| Variable              | Description                        |
|-----------------------|------------------------------------|
| `MONGO_URI`           | MongoDB connection string          |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key             |
| `PORT`                | Express server port (default 5000) |
| `NODE_ENV`            | `development` / `production`       |

---