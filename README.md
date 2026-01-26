# 🎓 EduFlow: The All-in-One Platform

**EduFlow** is a centralized educational ecosystem designed to streamline the student experience. Instead of jumping between multiple apps, students can manage their productivity, learning, and communication within a single, high-performance platform.

---

## 🚀 Key Features

* **🎙️ Smart Transcriptions:** Convert lectures and audio into organized study notes automatically.
* **🤖 AI Study Assistant:** Built-in AI chatbot to help with research, summarization, and concept clarity.
* **💬 Group Collaboration:** Real-time group chat for projects and peer-to-peer learning.
* **⏳ Focus & Productivity:** * **Habit Tracker:** Build and monitor long-term study habits.
    * **Timer Techniques:** Integrated Pomodoro and focus timers to maximize deep work.
* **🔔 Notification Center:** Admin-led system for broadcast announcements or personalized alerts (e.g., credit purchases, payment failures).

---

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS, Redux Toolkit, Lucide Icons.
- **Backend:** Python, Django REST Framework (DRF).
- **Communication:** WebSockets (Django Channels) for real-time chat.
- **AI Integration:** OpenAI Whisper / Gemini.

---

## 📦 Installation & Setup

### 1. Prerequisites
- Python 3.10+
- Node.js & npm

### 2. Backend Installation
```bash
# Clone the repository
git clone [https://github.com/muhammedshann/eduflow.git](https://github.com/muhammedshann/eduflow.git)
cd eduflow/backend

# Set up virtual environment
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Migrations
python manage.py migrate

# Start Server
python manage.py runserver
