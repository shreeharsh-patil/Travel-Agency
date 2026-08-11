# ✈️ Horizon Travels

A premium, high-fidelity luxury travel agency web application built with **React** and **Vite**. **Horizon Travels** provides a stunning interactive experience for discerning travelers to explore exclusive stays, private aviation, and curated global experiences.

---

## 🚀 Experience the Extraordinary

*   🌍 **Exclusive Stays**: From Overwater Sanctuaries to Royal Estates.
*   🧳 **Curated Experiences**: Unique, behind-the-scenes global adventures.
*   ✈️ **Private Aviation**: Seamless, on-demand private jet travel.
*   🎥 **Immersive Hero**: High-performance canvas-based scroll animations.
*   ⚡ **Ultra Performance**: Built with Vite and optimized for speed.
*   🎨 **Premium Aesthetic**: Modern, dark-mode design with 8K luxury assets.

---

## 🛠️ Tech Stack

*   **Frontend**: React 18+ (Vite)
*   **Animations**: GSAP (ScrollTrigger), Framer Motion, Lenis (Smooth Scroll)
*   **Styling**: Modern CSS / Tailwind CSS v4
*   **Database**: MongoDB Atlas (serverless API routes)
*   **Imagery**: Custom-generated 8K luxury assets

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/shreeharsh-patil/Travel-Agency.git
cd Travel-Agency
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

---

## 🗄️ MongoDB Atlas Database

Reservations, contact messages, user accounts, and the gallery are stored in **MongoDB Atlas** through serverless API routes (`/api/*`).

### 1. Create a free cluster

1. Sign up at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free **M0** cluster.
2. Create a **database user** and add your IP (or `0.0.0.0/0` for local dev) to the **Network Access** allow list.
3. Click **Connect → Drivers**, copy the connection string, and replace `<db_user>` / `<db_password>`.

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `MONGODB_URI`, then set a `JWT_SECRET` (generate one with `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).

### 3. Run locally

```bash
npm run dev      # starts Vite (web) + the Express API on :3001
npm run seed     # seeds the gallery collection from the bundled images
```

Without a `MONGODB_URI`, the API automatically falls back to a local JSON database in `.data/` so the site keeps working offline.

### 4. Deploy

*   **Vercel**: add `MONGODB_URI` and `JWT_SECRET` in *Project → Settings → Environment Variables*. The `api/` folder deploys as serverless functions automatically.
*   **Netlify**: add the same variables in *Site configuration → Environment variables*. The `netlify/functions/api.js` catch-all serves `/api/*`.
*   **GitHub Pages**: serves the static site only — API calls gracefully fall back to the bundled data / demo mode.

### API endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| POST | `/api/reservations` | Save a booking |
| POST | `/api/contact` | Save a contact message |
| GET / POST | `/api/images` | List / add gallery images |
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Sign in (returns a JWT) |
| GET | `/api/auth/me` | Validate a stored session |

---

## ▶️ Usage

Open your browser and navigate to:

```
http://localhost:5173
```

---

## 📁 Project Structure

```
Travel-Agency/
├── public/
│   ├── images/          # 8K High-fidelity generated assets
│   ├── videos/          # Premium background videos
│   └── frames/          # Hero animation frames
├── src/
│   ├── components/      # Luxury UI components (Header, Bento, etc.)
│   ├── data/            # Destination and blog datasets
│   ├── hooks/           # Custom React hooks (useCanvasVideo)
│   ├── App.jsx          # Route management
│   └── main.jsx
├── api/                 # Serverless functions (Vercel / Netlify / Express)
├── lib/                 # Shared DB + auth helpers
├── netlify/functions/   # Netlify catch-all API function
├── package.json
├── vite.config.js
└── .gitignore
```

---

## 🌟 Premium Features

*   🏙️ **Bento Grid Architecture**: A modern layout for showcasing destinations.
*   💎 **Liquid Glass UI**: Stunning glassmorphism and backdrop blur effects.
*   🌊 **Smooth Interaction**: Integrated Lenis for a cinematic scrolling experience.
*   📱 **Responsive Excellence**: Pixel-perfect layout across all devices.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed by *Shreeharsh Patil*
