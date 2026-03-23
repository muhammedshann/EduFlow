<div align="center">
  <br />
  <h1>🎓 EduFlow</h1>
  <p><strong>The All-in-One Educational Ecosystem for Maximum Productivity</strong></p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
    <img src="https://img.shields.io/badge/Razorpay-020425?style=for-the-badge&logo=razorpay&logoColor=3395FF" alt="Razorpay" />
  </p>
</div>

---

**EduFlow** is a modern, centralized educational ecosystem designed to elevate the student experience. By integrating productivity tools, AI-powered learning, and real-time collaboration, EduFlow eliminates the need to jump between multiple fragmented applications.

## ✨ Key Features

* **🎙️ Smart Transcriptions:** Convert lecture audio into organized study notes using **OpenAI Whisper**.
* **🤖 AI Study Assistant:** Context-aware chatbot powered by **Google Gemini** for research and summarization.
* **💬 Real-Time Collaboration:** Persistent group chats for peer learning via **WebSockets (Django Channels)**.
* **⏳ Focus Suite:** Integrated **Pomodoro timers** and a **Habit Tracker** to monitor long-term growth.
* **💳 Digital Wallet:** Seamless credit system integrated with **Razorpay** for managing premium AI features.
* **📄 PDF Engine:** Export AI-generated summaries and study notes directly to high-quality PDF documents.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js (Vite), Redux Toolkit, Tailwind CSS, Framer Motion, Lucide Icons |
| **Backend** | Python, Django, Django REST Framework (DRF) |
| **Real-time** | Django Channels (WebSockets), Redis, Daphne |
| **Database** | PostgreSQL |
| **Task Queue** | Celery, Redis |
| **AI Services** | Google Gemini (Generative AI), OpenAI Whisper |

---

## 🚀 Installation & Setup

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Redis Server** (Running locally or via Docker)
- **PostgreSQL** Database

### 2. Backend Setup
```bash
# Navigate to backend and setup environment
cd Backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations and start server
python manage.py migrate
python manage.py runserver