[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/k6kO_4Go)

# Triple Guu — Social Anti‑Fake News (SE331 Term Project I)

A community‑driven web app where users can post news claims, vote **Fake/Non‑fake**, and discuss with comments. Built with **Vue 3 + Vite + TypeScript + Pinia + Vue Router + Tailwind CSS**.

> This README is tailored to the SE331 Term Project I brief (“The Social Anti‑Fake News System”). It includes deployment, mock‑data, and submission notes from the assignment PDF.

---

## 👥 Group Name- Triple Guu

| Student ID | Name | Role |
|---|---|---|
| 662115503| Hnin Ei Shwe Yee | 
| 662115505| Ju Zuu Hlaing| 
| 662115511 | Nang Shu Shan Na|


---

## 🔗 Project Links (fill these before submitting)

- **Live site (Vercel):**   https://project-01-the-anti-fake-news-syste-mu.vercel.app/
- **Demo video (2–3 min):** https://drive.google.com/file/d/1zjWq6eqYJoH1kZlhBQrCG6CLzdDRMkcE/view?usp=drive_link  
- **Repository:** https://github.com/chartchai-class/project-01-the-anti-fake-news-system-triple-guu.git
- **API link**              https://news-api-production-3197.up.railway.app   
- **API github link**       https://github.com/Juzuu24/news-api.git         
---

## ✨ Features (mapped to the brief)

- **Home / News List**
  - Shows news with **topic**, **short summary**, **status** (fake / non‑fake), **reporter**, and **reported date/time**.
  - **Filter** by *All*, *Fake*, *Non‑fake*.
  - **Per‑page selector** and **pagination**.

- **Details Page**
  - Full details: topic, body, status, reporter, datetime, and **image via URL**.
  - **Vote** 👍/👎 and view **comments**.
  - **Comments pagination**.

- **Create Post**
  - Add a new news item (topic, short, detail, links, image URL).

- **Storage Behavior (assignment‑compliant mode)**
  - Voting and user comments are stored in **localStorage** and shown immediately.
  - As a simple SPA, comments may be cleared on reload.

- **Mock Data & Deployment**
  - Sufficient **mock data** to exercise pagination.
  - Deployed to **Vercel**.

---

## 🛠️ Tech Stack

- **Vue 3** (Composition API) + **Vite**
- **TypeScript**, **Pinia** (state), **Vue Router**
- **Tailwind CSS** (responsive UI)
- Optional local API for development: **json‑server**

---

## 🗂️ Project Structure (excerpt)

```
src/
  components/      # Pagination, FilterBar, NewsCard, etc.
  views/           # Home, Details, Comments, Post (Create)
  stores/          # Pinia stores (newsStore, uiStore)
  router/          # Routes
public/
  db.json          # Mock data (fallback mode)
```

---

## 🚀 Getting Started

### 1) Prerequisites
- Node.js ≥ 18

### 2) Install
```bash
npm install
```

### 3) Run Dev
```bash
npm run dev
```

### 4) Build
```bash
npm run build
npm run preview
```

---

## 🧪 Data & Mocking (two modes)

### A) Assignment‑compliant **Storage/Mock** mode (no POST server)
- Ensure **no** `VITE_API_BASE` is set in `.env`.
- Provide `public/db.json` with enough items to test pagination:
  ```json
  {
    "news": [
      {
        "id": 1,
        "topic": "City pilots car‑free Sunday",
        "short": "Trial closes 4 km of streets to traffic.",
        "detail": "Longer text…",
        "image": "https://example.com/image.jpg",
        "reporter": "Admin",
        "reportedAt": "2025-08-01T09:00:00.000Z"
      }
    ],
    "comments": [
      { "id": 101, "newsId": 1, "text": "Seed comment", "createdAt": "2025-08-01T10:00:00.000Z", "author": "Staff" }
    ],
    "votes": []
  }
  ```
- The app will load seed data from `/public/db.json`, and keep **userVotes** and **userComments** in `localStorage`.

### B) Optional **API mode** (for local persistence during development)
If you want server‑side writes while developing:

1. Run a local API:
   ```bash
   npx json-server -p 5175 -w db.json
   ```
2. Create `.env`:
   ```
   VITE_API_BASE=http://localhost:5175
   ```
3. Restart the dev server.

> The assignment itself only requires mock data + local storage; API mode is optional.

---

## 🧭 How to Use / Test

1. **Home** → Verify list shows topic/short/status/reporter/date. Choose per‑page size and paginate.
2. **Filter** by *All*, *Fake*, *Non‑fake*.
3. **Details** → See full details + image.
4. **Vote** 👍/👎 → Status updates from votes.
5. **Comments** → Paginated; add a comment or a link/URL image.
6. **Create Post** → Fill topic/short/detail/image/link and submit; new item appears on Home.

---

## 📦 Environment Variables

- **(Optional)** `VITE_API_BASE` — REST endpoint (e.g., `http://localhost:5175`) to enable API mode. Omit to use assignment‑compliant mock/storage mode.

---

## ✅ Submission & Grading Notes (from the brief)

- Provide **mock data**, deploy to **Vercel**, and include a **2–3 min demo video**.
- Submit a **GitHub repository** with a **README** listing your **group members**, **video URL**, and **deployed site URL**.
- **Deadline:** 26th Aug, 11:59 pm.
- Grading includes: mock data sufficiency (enough for pagination), distinct responsive layout (not the lab Event app), list + per‑page + pagination, filter Fake/Non‑fake, details page, sub‑routing for comments, votes/comments display, and use of Pinia for shared state; plus deployment readiness.

---

## 🧹 Scripts

```bash
# dev
npm run dev

# type-check (if configured)
npm run typecheck

# build & preview
npm run build
npm run preview
```

---

## 📝 License

MIT (or your chosen license).

---

### Acknowledgment

This project is developed for **SE331 — Component‑Based Software Development, Term Project I**.