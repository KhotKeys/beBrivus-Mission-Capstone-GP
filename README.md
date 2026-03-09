# beBrivus — African Student Opportunity Platform

## 📌 Overview

**beBrivus** is a comprehensive digital platform designed to bridge the gap between African students and global educational and professional opportunities. Built as a mission-driven capstone project, beBrivus addresses the critical challenge faced by students across Africa: discovering, tracking, and successfully applying for scholarships, internships, grants, and mentorship programs.

The platform serves as a one-stop ecosystem where students can explore curated opportunities, connect with mentors, engage in community discussions, track their application progress, and receive AI-powered guidance throughout their journey. Institutions and organizations can manage their opportunities, review applications, and connect directly with qualified candidates.

With support for 10 African languages and offline-first architecture, beBrivus ensures accessibility across diverse communities and varying internet connectivity conditions, making opportunity discovery truly inclusive.

---

## ✨ Features

### 🎓 For Students

- **Opportunity Discovery** — Browse scholarships, internships, grants, and exchange programs filtered by category, deadline, location, and eligibility
- **Smart Search & Filters** — Advanced filtering by opportunity type, field of study, country, funding type, and deadline
- **Application Tracking System** — Comprehensive dashboard to track application status, deadlines, and progress across multiple opportunities
- **AI-Powered Coach** — Get personalized guidance, application tips, essay feedback, and deadline reminders using Google Gemini AI
- **Mentorship Matching** — Connect with verified mentors across various fields for career guidance and application support
- **Video Consultation** — Real-time video calls with mentors for personalized guidance sessions
- **Community Forum** — Participate in discussions, ask questions, share experiences, and get support from peers
- **Resource Library** — Access curated guides, templates, sample essays, and educational materials
- **Gamification System** — Earn points, badges, and achievements for platform engagement and milestone completion
- **Profile Management** — Maintain a comprehensive profile with academic credentials, achievements, and application history
- **Multilingual Interface** — Use the platform in 10 languages including English, French, Swahili, Amharic, Hausa, Yoruba, Zulu, Arabic, Portuguese, and Dinka
- **Offline Access** — Browse cached opportunities and resources even without internet connection
- **Real-time Notifications** — Receive email alerts for application status updates, new opportunities, and mentor responses
- **Personalized Dashboard** — View recommended opportunities, upcoming deadlines, and activity summaries

### 🏛️ For Institutions

- **Opportunity Management** — Create, edit, and manage scholarship and internship postings
- **Application Review System** — Access applicant profiles, review submissions, and manage application workflows
- **Direct Messaging** — Communicate with applicants and schedule interviews
- **Analytics Dashboard** — Track application metrics, view applicant demographics, and monitor opportunity performance
- **Institution Profile** — Showcase organizational mission, previous programs, and contact information
- **Bulk Actions** — Efficiently manage multiple applications with status updates and batch communications

### 🛡️ For Admins

- **User Management** — Create, edit, deactivate user accounts, and manage role assignments (student/institution/admin)
- **Content Moderation** — Monitor and moderate forum discussions with AI-assisted flagging for inappropriate content
- **Opportunity Oversight** — Review, approve, edit, or remove opportunity postings
- **Resource Management** — Upload, categorize, and manage educational resources and templates
- **Analytics & Reporting** — Access comprehensive platform analytics, user engagement metrics, and weekly automated reports
- **Moderation Dashboard** — Review flagged forum posts and user-reported content with detailed violation tracking
- **Activity Logs** — Monitor platform activity, user behavior, and system events
- **Email Notification Control** — Manage automated email triggers for various platform events

---

## 🛠 Tech Stack

### Frontend

- **React 19.1.1** — Modern UI library with latest concurrent features
- **TypeScript 5.8.3** — Type-safe development with enhanced developer experience
- **Vite 7.1.2** — Lightning-fast build tool and development server
- **TanStack Query 5.87.4** — Powerful data synchronization and caching
- **React Router 7.8.2** — Client-side routing with protected routes
- **i18next 25.8.13** — Internationalization with 10 language support
- **Tailwind CSS 4.1.12** — Utility-first CSS framework for responsive design
- **Axios 1.11.0** — HTTP client for API communication
- **React Hook Form 7.62.0** — Performant form management with validation
- **Recharts 3.2.0** — Composable charting library for analytics visualization
- **Lucide React 0.543.0** — Modern icon library
- **Cesium 1.137.0** — 3D globe visualization for geographic exploration
- **JWT Decode 4.0.0** — Token-based authentication
- **React Markdown 10.1.0** — Markdown rendering for content display

### Backend

- **Django 4.2.16** — High-level Python web framework
- **Django REST Framework 3.15.1** — Toolkit for building Web APIs
- **Django Channels 4.3.2** — WebSocket support for real-time features
- **Daphne 4.2.1** — ASGI server for Django Channels
- **Django Simple JWT 5.5.0** — JSON Web Token authentication
- **Celery 5.6.2** — Distributed task queue for background jobs
- **Redis 7.2.0** — In-memory data store for caching and message brokering
- **SQLite** — Lightweight SQL database (production-ready for PostgreSQL migration)
- **Google Generative AI 0.8.6** — Gemini AI integration for intelligent features
- **Django CORS Headers 4.5.0** — Cross-origin resource sharing support
- **Django Taggit 6.1.0** — Simple tagging for opportunities and resources
- **Django Filters 23.5** — Dynamic querystring filtering
- **Pillow 10.4.0** — Image processing for profile pictures and uploads
- **Gunicorn 21.2.0** — Production WSGI HTTP server
- **WhiteNoise 6.9.0** — Static file serving
- **Python Decouple 3.8** — Environment variable management

---

## 🌍 Multilingual Support

beBrivus is fully localized in **10 languages** to serve diverse African communities:

| Language | Code | Region |
|----------|------|--------|
| 🇬🇧 English | `en` | International |
| 🇫🇷 French | `fr` | West/Central Africa |
| 🇰🇪 Swahili | `sw` | East Africa |
| 🇪🇹 Amharic | `am` | Ethiopia |
| 🇳🇬 Hausa | `ha` | West Africa |
| 🇳🇬 Yoruba | `yo` | Nigeria |
| 🇿🇦 Zulu | `zu` | South Africa |
| 🇸🇦 Arabic | `ar` | North Africa (with RTL support) |
| 🇦🇴 Portuguese | `pt` | Portuguese-speaking Africa |
| 🇸🇸 Dinka | `dinka` | South Sudan |

**Features:**
- Automatic language detection based on browser settings
- Persistent language preference saved to localStorage
- Right-to-left (RTL) layout support for Arabic
- All UI elements, notifications, and email templates fully translated

---

## 📱 PWA & Offline Support

beBrivus is a **Progressive Web App** with advanced offline capabilities:

### Service Worker Features
- **Offline-First Architecture** — Cache-first strategy for static assets
- **Network-First API Caching** — Opportunities, mentors, and resources cached when online
- **Background Sync** — Queue application submissions and forum posts when offline
- **Smart Cache Management** — Automatic cache versioning and cleanup
- **Install Prompt** — Add to home screen on mobile devices for native-like experience

### Cached Content
- Opportunity listings
- Mentor profiles
- Forum discussions
- Educational resources
- User profile data

Even without internet, users can browse previously loaded content, draft applications, and compose forum posts that sync when connectivity is restored.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** 18.x or higher
- **Python** 3.10 or higher
- **pip** (Python package manager)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/beBrivus-Mission-Capstone.git
cd beBrivus-Mission-Capstone
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see Environment Variables section)
# Configure your environment variables

# Run migrations
python manage.py migrate

# Create superuser (admin account)
python manage.py createsuperuser

# Start Redis (required for Celery and Channels)
# On Windows with WSL or Docker:
redis-server

# Start Celery worker (in a separate terminal)
celery -A core worker --loglevel=info

# Start Django development server
python manage.py runserver 0.0.0.0:8001
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev
```

#### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8001/api/
- **Django Admin**: http://localhost:8001/admin/

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=*

# Database (SQLite by default, optional PostgreSQL)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# Email Configuration (for notifications)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@bebrivus.com

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Redis (for Celery and Channels)
REDIS_URL=redis://localhost:6379/0

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# JWT Settings (optional, defaults provided)
JWT_ACCESS_TOKEN_LIFETIME=60
JWT_REFRESH_TOKEN_LIFETIME=1440
```

**Frontend Environment (optional):**

Create `.env` in `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8001/api
```

---

## 📂 Project Structure

```
beBrivus-Mission-Capstone/
├── backend/
│   ├── apps/
│   │   ├── accounts/          # User authentication & profiles
│   │   ├── ai_services/       # Gemini AI integration
│   │   ├── analytics/         # Platform analytics & reporting
│   │   ├── applications/      # Application management
│   │   ├── forum/             # Community discussions
│   │   ├── gamification/      # Badges, points, leaderboard
│   │   ├── mentors/           # Mentor profiles & matching
│   │   ├── messaging/         # Real-time chat system
│   │   ├── notifications/     # Email & push notifications
│   │   ├── opportunities/     # Opportunity listings
│   │   ├── resources/         # Educational resource library
│   │   ├── tracker/           # Application tracking
│   │   └── video/             # Video consultation
│   ├── core/
│   │   ├── settings.py        # Django configuration
│   │   ├── urls.py            # API routing
│   │   ├── asgi.py            # ASGI configuration
│   │   └── wsgi.py            # WSGI configuration
│   ├── media/                 # User uploads
│   ├── static/                # Static files
│   ├── templates/             # Email templates
│   ├── manage.py              # Django management script
│   └── requirements.txt       # Python dependencies
│
├── frontend/
│   ├── public/
│   │   ├── service-worker.js  # PWA service worker
│   │   ├── manifest.json      # PWA manifest
│   │   └── offline.html       # Offline fallback
│   ├── src/
│   │   ├── api/               # API client configuration
│   │   ├── assets/            # Images, videos, fonts
│   │   ├── components/        # Reusable UI components
│   │   │   ├── admin/         # Admin-specific components
│   │   │   ├── layout/        # Header, Footer, Navbar
│   │   │   ├── mentors/       # Mentor components
│   │   │   ├── messaging/     # Chat components
│   │   │   ├── ui/            # Generic UI components
│   │   │   └── video/         # Video call components
│   │   ├── contexts/          # React contexts (Auth, Theme)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/
│   │   │   ├── admin/         # Admin dashboard pages
│   │   │   ├── institution/   # Institution pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── OpportunitiesPage.tsx
│   │   │   ├── MentorshipPage.tsx
│   │   │   ├── ForumPage.tsx
│   │   │   ├── TrackerPage.tsx
│   │   │   ├── AICoachPage.tsx
│   │   │   ├── GamificationPage.tsx
│   │   │   └── ...
│   │   ├── translations/      # i18n language files
│   │   ├── utils/             # Helper functions
│   │   ├── App.tsx            # Root component
│   │   ├── i18n.ts            # i18next configuration
│   │   └── main.tsx           # Entry point
│   ├── package.json           # Node dependencies
│   └── vite.config.ts         # Vite configuration
│
├── README.md
└── setup.bat                  # Windows setup script
```

---

## 🔌 API Overview

### Authentication Endpoints
- `POST /api/auth/register/` — User registration
- `POST /api/auth/login/` — User login (returns JWT tokens)
- `POST /api/auth/refresh/` — Refresh access token
- `GET /api/auth/profile/` — Get current user profile
- `PUT /api/auth/profile/` — Update user profile
- `POST /api/auth/password/reset/` — Password reset request
- `POST /api/auth/password/reset/confirm/` — Confirm password reset

### Opportunities
- `GET /api/opportunities/` — List all opportunities (with filters)
- `POST /api/opportunities/` — Create new opportunity (institutions/admins)
- `GET /api/opportunities/{id}/` — Get opportunity details
- `PUT /api/opportunities/{id}/` — Update opportunity
- `DELETE /api/opportunities/{id}/` — Delete opportunity

### Applications
- `GET /api/applications/` — List user's applications
- `POST /api/applications/` — Submit new application
- `GET /api/applications/{id}/` — Get application details
- `PUT /api/applications/{id}/` — Update application status
- `DELETE /api/applications/{id}/` — Withdraw application

### Forum
- `GET /api/forum/discussions/` — List discussions
- `POST /api/forum/discussions/` — Create new discussion
- `GET /api/forum/discussions/{slug}/` — Get discussion details
- `POST /api/forum/discussions/{slug}/like/` — Like/unlike discussion
- `POST /api/forum/discussions/{slug}/reply/` — Add reply
- `POST /api/forum/replies/{id}/flag/` — Flag inappropriate content
- `GET /api/forum/categories/` — List forum categories

### Mentors
- `GET /api/mentors/` — List available mentors (with filters)
- `GET /api/mentors/{id}/` — Get mentor profile
- `POST /api/mentors/{id}/book/` — Book mentorship session
- `GET /api/mentors/bookings/` — List user's bookings

### Resources
- `GET /api/resources/` — List educational resources
- `GET /api/resources/{id}/` — Download resource
- `POST /api/resources/` — Upload resource (admins)

### AI Services
- `POST /api/ai/chat/` — Chat with AI Coach
- `POST /api/ai/analyze-essay/` — Get essay feedback
- `GET /api/ai/suggestions/` — Get personalized opportunity suggestions

### Analytics
- `GET /api/analytics/dashboard/` — Platform-wide analytics (admins)
- `GET /api/analytics/user-stats/` — User engagement statistics
- `GET /api/analytics/weekly-report/` — Automated weekly report

### Admin
- `GET /api/admin/users/` — List all users
- `POST /api/admin/users/{id}/deactivate/` — Deactivate user
- `GET /api/admin/moderation/flagged-posts/` — Get flagged forum posts
- `POST /api/admin/moderation/{id}/resolve/` — Resolve flagged content

---

## 🤖 AI Features

### Google Gemini Integration

beBrivus leverages **Google Gemini AI** to provide intelligent, context-aware assistance:

#### AI Coach Capabilities
- **Personalized Guidance** — Get tailored advice based on academic background, interests, and goals
- **Essay Review** — Submit application essays for grammar, structure, and content feedback
- **Opportunity Matching** — Receive AI-recommended opportunities based on profile and preferences
- **Interview Preparation** — Practice common interview questions with AI-generated responses
- **Deadline Reminders** — Intelligent notifications about upcoming deadlines

#### Forum Moderation
- **Automatic Content Flagging** — AI scans forum posts for inappropriate content, hate speech, and spam
- **Severity Assessment** — Categorizes violations by severity for moderator prioritization
- **Context Understanding** — Analyzes context to reduce false positives

#### Analytics Insights
- **Trend Detection** — Identifies popular opportunity types and emerging student interests
- **Performance Predictions** — Suggests optimization strategies for application success rates
- **Weekly Summaries** — Generates automated analytical reports with actionable insights

**Privacy Note:** All AI interactions are processed securely, and no personal data is stored by third-party AI services.

---

## 🔐 Authentication & Roles

### Authentication System

beBrivus uses **JWT (JSON Web Token)** authentication for secure, stateless sessions:

- **Access Tokens** — Short-lived tokens (60 minutes) for API requests
- **Refresh Tokens** — Long-lived tokens (24 hours) for obtaining new access tokens
- **Token Storage** — Tokens stored in localStorage with automatic refresh
- **Protected Routes** — Role-based route guards prevent unauthorized access

### User Roles

#### 1. **Student** (Default)
- Browse and apply for opportunities
- Access mentorship and forum
- Track applications
- Use AI Coach
- View resources

#### 2. **Institution**
- Create and manage opportunities
- Review applications
- Communicate with applicants
- View application analytics

#### 3. **Admin**
- Full platform access
- User management
- Content moderation
- Analytics dashboard
- Resource management
- System configuration

### Role Assignment
- Students self-register
- Institutions request account via "Partner With Us" form (admin approval)
- Admins created via Django admin or command line

---

## 📧 Email Notifications

beBrivus sends automated email notifications for critical events:

### For Students
- ✉️ **Welcome Email** — Upon successful registration
- ✉️ **Application Confirmation** — When application is submitted
- ✉️ **Status Updates** — When application status changes (under review, accepted, rejected)
- ✉️ **Deadline Reminders** — 7 days, 3 days, and 1 day before opportunity deadlines
- ✉️ **Mentor Booking Confirmation** — When mentorship session is booked
- ✉️ **Forum Reply Notifications** — When someone replies to your discussion
- ✉️ **Achievement Unlocked** — When new badge or milestone is earned

### For Institutions
- ✉️ **New Application Alert** — When student applies to opportunity
- ✉️ **Opportunity Expiry Warning** — 5 days before opportunity deadline
- ✉️ **Weekly Application Summary** — Every Monday with application statistics

### For Admins
- ✉️ **Flagged Content Alert** — When forum post is flagged by users or AI
- ✉️ **New Institution Request** — When institution registers for account
- ✉️ **Weekly Analytics Report** — Comprehensive platform performance summary
- ✉️ **Critical System Alerts** — For errors or unusual activity

**Email Templates:** All emails are professionally designed, responsive, and available in all 10 supported languages.

---

## 🧪 Testing

### Backend Tests

Run Django unit tests:

```bash
cd backend

# Run all tests
python manage.py test

# Run tests for specific app
python manage.py test apps.opportunities

# Run with coverage
pytest --cov=apps --cov-report=html

# Run specific test file
python manage.py test apps.forum.tests.test_moderation
```

### Frontend Tests

```bash
cd frontend

# Run unit tests (if configured)
npm run test

# Run linting
npm run lint
```

### Manual Testing Scripts

The backend includes utility scripts for testing features:

```bash
# Test opportunity creation
python backend/test_opportunities_api.py

# Test AI moderation
python backend/demo_moderation_system.py

# Test booking system
python backend/test_booking.py

# Test Gemini API
python backend/test_gemini_key.py
```

---

## 📸 Screenshots

> **Note:** Add screenshots here to showcase the platform

### Student Experience
- **Homepage** — Hero section with opportunity highlights
- **Opportunities Page** — Filtered listing with search and categories
- **Application Tracker** — Dashboard showing application progress
- **Mentor Profiles** — Browse and book mentorship sessions
- **AI Coach** — Interactive chat interface
- **Forum** — Community discussions with categories

### Institution Dashboard
- **Opportunity Management** — Create and edit postings
- **Application Review** — Applicant profiles and documents
- **Analytics** — Application metrics and demographics

### Admin Panel
- **User Management** — User list with role management
- **Forum Moderation** — Flagged posts with AI severity scores
- **Analytics Dashboard** — Platform-wide engagement metrics
- **Weekly Reports** — Automated performance summaries

---

## 🤝 Contributing

We welcome contributions from the community! To contribute:

### 1. Fork the Repository

```bash
git clone https://github.com/yourusername/beBrivus-Mission-Capstone.git
cd beBrivus-Mission-Capstone
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

### 3. Submit a Pull Request

- Push your branch to GitHub
- Open a Pull Request with a detailed description
- Reference any related issues
- Await review from maintainers

### Code Standards

- **Backend:** Follow PEP 8 Python style guide
- **Frontend:** Use TypeScript strict mode, ESLint rules
- **Commits:** Use conventional commit messages (feat:, fix:, docs:, etc.)

### Reporting Issues

Found a bug or have a feature request? Open an issue:

1. Use a clear, descriptive title
2. Provide steps to reproduce (for bugs)
3. Include screenshots if applicable
4. Specify your environment (OS, browser, versions)

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 beBrivus Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Authors & Acknowledgments

### Development Team
- **[Your Name]** — Full Stack Developer & Project Lead
- **[Team Member 2]** — Backend Developer
- **[Team Member 3]** — Frontend Developer
- **[Team Member 4]** — UI/UX Designer

### Special Thanks
- **Google Gemini AI** — For intelligent features and content moderation
- **African Students Worldwide** — For inspiration and user feedback
- **Open Source Community** — For the incredible tools and libraries that made this possible

---

## 📞 Contact & Support

- **Website:** [https://bebrivus.com](https://bebrivus.com) *(coming soon)*
- **Email:** support@bebrivus.com
- **GitHub Issues:** [Report a Bug](https://github.com/yourusername/beBrivus-Mission-Capstone/issues)
- **Twitter:** [@beBrivus](https://twitter.com/bebrivus)

---

## 🌟 Star This Project

If you find beBrivus helpful, please consider giving it a ⭐ on GitHub. It helps others discover the project!

---

<div align="center">

**Built with ❤️ for African students, by African innovator**

*Empowering the next generation of African leaders through accessible opportunities*

</div>
