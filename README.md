# 🌤️ Full-Stack Weather Dashboard

**Live Application:** https://weather-dashboard-mern-cyan.vercel.app | **API Backend:** https://weather-dashboard-mern-5exc.onrender.com

## 📋 Overview
A full-stack web application built with the MERN stack (MongoDB, Express, React, Node.js) that provides real-time weather tracking and forecasting. Users can search for global weather data and permanently save their favorite locations to a cloud database. 

This project demonstrates strong architectural principles, RESTful API design, and secure handling of third-party integrations.

## 🔒 Security & Architecture Highlights
* **Credential Hygiene:** Implemented strict environment variable (`.env`) protocols and `.gitignore` configurations across both client and server environments to prevent API key and database credential leakage.
* **Network Communication:** Configured Cross-Origin Resource Sharing (CORS) to safely route RESTful API traffic between the decoupled Vite/React frontend and the Node.js backend.
* **Data Persistence:** Utilized MongoDB Atlas for secure, cloud-based storage of user-specific data arrays.
* **Performance Optimization:** Built with React hooks (`useEffect`, `useState`) and optimized CSS rendering paths to minimize main-thread blocking and ensure smooth cross-browser performance (Edge, Firefox, Chrome).

## 💻 Tech Stack
* **Frontend:** React, Vite, CSS3 (Hardware-accelerated animations)
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose
* **External APIs:** OpenWeatherMap API
* **Deployment:** Vercel (Frontend), Render (Backend)

## 🚀 Core Features
* **Live Weather Engine:** Fetches and processes real-time meteorological data asynchronously.
* **Dynamic UI:** Interface adapts fluidly based on incoming data states without requiring full-page reloads.
* **Persistent Favorites:** Integrates full CRUD operations to store and retrieve favorited cities from the cloud database.

## 🛠️ Local Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/weather-dashboard-mern.git
   cd weather-dashboard-mern
   ```

2. **Set up environment variables:**
   * Create a `.env` file in the `/server` directory:
     ```
     PORT=5000
     MONGO_URI=your_mongodb_connection_string
     OPENWEATHER_API_KEY=your_openweather_api_key
     ```
   * Create a `.env` file in the `/client` directory:
     ```
     VITE_API_URL=http://localhost:5000
     ```

3. **Install dependencies and run:**
   ```bash
   npm install
   npm run dev
   ```
   *(Ensure you have the `concurrently` package configured in the root directory to launch both client and server simultaneously).*