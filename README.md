# beBrivus

An AI-powered opportunity discovery and mentorship platform connecting students with career growth experiences.

**[Design](https://www.figma.com/design/CNoGWFBj59n4JHGY4oVd0X/beBrivus-Capstone-Figma-Design)** | **[Backend API Docs](./backend/BOOKING_API.md)** | **[Profile Guide](./PROFILE_PAGE.md)**

## ✨ Features

- **Smart Opportunity Discovery** – Filter and save opportunities matched to your interests and skills
- **Mentorship Matching** – Connect with mentors for guidance and career coaching
- **AI-Powered Coaching** – Get personalized advice through Gemini AI integration
- **Application Tracking** – Manage applications with status updates and interview scheduling
- **Community Forum** – Engage with peers, ask questions, and share experiences
- **Gamification** – Earn badges and points for completing milestones
- **User Dashboard** – Role-based views for students, mentors, and admins

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, TanStack Query |
| Backend | Django 4.2, Django REST Framework, PostgreSQL/SQLite |
| AI Services | Google Gemini API |
| Storage | Media files (profiles, documents) |
| Authentication | JWT, Email-based registration |

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Git

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend runs on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

### Environment Variables

Create `.env` file in `backend/`:
```
SECRET_KEY=your-django-secret
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
GEMINI_API_KEY=your-gemini-api-key
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:5173
```

## 📁 Project Structure

```
beBrivus-Mission-Capstone/
├── backend/
│   ├── apps/
│   │   ├── accounts/        # User authentication & management
│   │   ├── opportunities/   # Job/opportunity listings
│   │   ├── applications/    # Application tracking
│   │   ├── mentors/        # Mentorship features
│   │   ├── ai_services/    # Gemini AI integration
│   │   ├── forum/          # Community discussions
│   │   ├── gamification/   # Badges & points system
│   │   ├── resources/      # Learning materials
│   │   ├── messaging/      # Direct messaging
│   │   ├── tracker/        # Activity tracking
│   │   └── video/          # Video sessions
│   ├── core/               # Django configuration
│   ├── templates/          # Email templates
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── api/           # API client
│   │   ├── contexts/      # React contexts
│   │   ├── features/      # Feature modules
│   │   └── utils/         # Utility functions
│   └── vite.config.ts
└── README.md
```

## 🔄 App Flow

1. **Unauthenticated Users** → Sign up or login
2. **Students** → Browse opportunities → Apply → Track applications → Get AI coaching
3. **Mentors** → Create mentorship sessions → View mentees → Send feedback
4. **Admins** → Manage users → Create opportunities → Monitor platform analytics

## 📚 API Endpoints

| Feature | Endpoint | Method |
|---------|----------|--------|
| Authentication | `/api/auth/` | POST |
| Opportunities | `/api/opportunities/` | GET, POST |
| Applications | `/api/applications/` | GET, POST, PATCH |
| Mentors | `/api/mentors/` | GET, POST |
| AI Chat | `/api/ai/sessions/` | POST, GET |
| Forum | `/api/forum/` | GET, POST |
| Gamification | `/api/gamification/` | GET |
| Resources | `/api/resources/` | GET, POST |

For detailed endpoints, see [backend/BOOKING_API.md](./backend/BOOKING_API.md)

## 🏗️ Development Workflow

1. **Design First** – Start with Figma mockups, translate to Tailwind CSS
2. **Backend First** – Implement models, serializers, and endpoints
3. **Frontend Integration** – Build React components and connect to APIs
4. **Testing** – Run unit tests, validate against design specs
5. **Review** – Code review and QA before merge

## 🔐 Authentication & Authorization

- Custom User model with email-based authentication
- JWT tokens for API access
- Role-based access control (admin, mentor, institution, student)
- Protected routes enforce role permissions

## 📤 Email System

- Gmail SMTP integration for user invitations
- Premium HTML email templates with branding
- Bulk user invitation support
- Personalized credentials and welcome messages

## 🧪 Testing

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm run test
```

## 🎬 Deployment

### Local Development
```bash
cd backend && python manage.py runserver
cd frontend && npm run dev
```

### Production
1. Build frontend: `npm run build` → outputs to `frontend/dist`
2. Set `DEBUG=False` in backend settings
3. Configure `ALLOWED_HOSTS` and database credentials
4. Use Gunicorn/WSGI server for Django
5. Serve static files via Nginx or CDN
6. Run migrations: `python manage.py migrate`

## 📝 License

MIT License – See LICENSE file for details

## 👥 Team

Built for the beBrivus Capstone Project

---

**Got questions?** Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture details or [PROFILE_PAGE.md](./PROFILE_PAGE.md) for user profile features.
