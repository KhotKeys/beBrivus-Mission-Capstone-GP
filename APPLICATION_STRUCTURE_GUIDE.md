# beBrivus Application Structure Guide

## Project Overview

beBrivus is a comprehensive AI-powered career development platform with Django REST API backend and React TypeScript frontend.

## 🏗️ Architecture Principles

### 1. **Modular Architecture**

- **Backend**: Django apps for each domain (accounts, opportunities, mentors, applications, etc.)
- **Frontend**: Feature-based structure with shared components and utilities

### 2. **Separation of Concerns**

- **API Layer**: Clean REST APIs with proper serialization
- **Business Logic**: Centralized in Django models and services
- **UI Components**: Reusable, composable React components
- **State Management**: Context for auth, React Query for server state

### 3. **Type Safety**

- Full TypeScript integration
- API response types matching Django serializers
- Proper error handling and validation

## 📁 Directory Structure

```
beBrivus/
├── backend/                          # Django REST API
│   ├── core/                        # Main Django settings
│   │   ├── settings.py              # Environment-based configuration
│   │   ├── urls.py                  # Root URL configuration
│   │   └── wsgi.py                  # WSGI configuration
│   ├── accounts/                    # User management
│   │   ├── models.py               # Custom User model
│   │   ├── serializers.py          # API serializers
│   │   ├── views.py                # API views
│   │   └── urls.py                 # Auth endpoints
│   ├── opportunities/               # Job opportunities
│   ├── mentors/                     # Mentor system
│   ├── applications/                # Application tracking
│   ├── forum/                       # Community features
│   ├── tracker/                     # Progress tracking
│   ├── resources/                   # Learning resources
│   ├── ai_services/                 # AI integrations
│   ├── analytics/                   # Data analytics
│   └── gamification/                # Achievement system
│
├── frontend/                        # React TypeScript
│   ├── src/
│   │   ├── api/                     # API client and services
│   │   │   ├── client.ts           # Axios instance with interceptors
│   │   │   ├── auth.ts             # Authentication API
│   │   │   ├── opportunities.ts    # Opportunities API
│   │   │   └── mentors.ts          # Mentors API
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                 # Base UI components
│   │   │   │   ├── Button.tsx      # Button component
│   │   │   │   ├── Input.tsx       # Input component
│   │   │   │   ├── Card.tsx        # Card component
│   │   │   │   └── Badge.tsx       # Badge component
│   │   │   └── layout/             # Layout components
│   │   │       ├── Layout.tsx      # Main layout wrapper
│   │   │       └── Header.tsx      # Navigation header
│   │   ├── features/                # Feature-specific components
│   │   │   ├── auth/               # Authentication components
│   │   │   │   ├── LoginForm.tsx   # Login form
│   │   │   │   └── RegisterForm.tsx# Registration form
│   │   │   ├── opportunities/      # Opportunity components
│   │   │   ├── mentors/            # Mentor components
│   │   │   └── applications/       # Application components
│   │   ├── pages/                   # Page components
│   │   │   ├── HomePage.tsx        # Landing page
│   │   │   ├── DashboardPage.tsx   # User dashboard
│   │   │   ├── OpportunitiesPage.tsx # Job search
│   │   │   ├── MentorsPage.tsx     # Mentor discovery
│   │   │   └── TrackerPage.tsx     # Application tracking
│   │   ├── contexts/                # React contexts
│   │   │   └── AuthContext.tsx     # Authentication state
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── utils/                   # Utility functions
│   │   ├── types/                   # TypeScript definitions
│   │   └── index.css               # Tailwind CSS with custom theme
│   └── package.json                 # Dependencies and scripts
```

## 🎯 Component Design Principles

### 1. **UI Components (components/ui/)**

- **Single Responsibility**: Each component has one clear purpose
- **Composition over Inheritance**: Use composition patterns
- **Prop Interface**: Well-defined TypeScript interfaces
- **Styling**: Tailwind classes with variant support
- **Accessibility**: ARIA attributes and keyboard navigation

### 2. **Feature Components (features/)**

- **Domain-Specific**: Components tied to business logic
- **API Integration**: Use React Query for data fetching
- **Form Handling**: React Hook Form with Yup validation
- **Error Boundaries**: Proper error handling

### 3. **Page Components (pages/)**

- **Layout Integration**: Use consistent layout wrapper
- **SEO Friendly**: Proper meta tags and titles
- **Loading States**: Handle loading and error states
- **Route Protection**: Implement authentication guards

## 🔌 API Integration Strategy

### 1. **API Client (api/client.ts)**

```typescript
- Axios instance with base configuration
- Request/response interceptors
- Token management (JWT with refresh)
- Error handling and retry logic
- Request/response transformation
```

### 2. **Service Layer (api/\*.ts)**

```typescript
- Domain-specific API services
- TypeScript interfaces for requests/responses
- Consistent error handling
- Caching strategies with React Query
```

### 3. **State Management**

```typescript
- Auth state: React Context
- Server state: React Query (TanStack Query)
- Form state: React Hook Form
- Local state: useState/useReducer
```

## 🎨 Styling Guidelines

### 1. **Tailwind CSS Configuration**

- Custom color palette with semantic naming
- Consistent spacing and typography scale
- Component-specific utility classes
- Responsive design patterns

### 2. **Theme Structure**

```css
- Primary: Emerald green (brand color)
- Secondary: Indigo/Teal (accent color)
- Success: Emerald green (positive actions)
- Warning: Gold (caution/alerts)
- Error: Red (negative actions/errors)
- Neutral: Slate gray (text/backgrounds)
```

### 3. **Component Styling**

- Base styles in index.css
- Component-specific styles via Tailwind classes
- Consistent spacing and typography
- Dark mode preparation

## 🛡️ Security Considerations

### 1. **Authentication & Authorization**

- JWT tokens with refresh mechanism
- Secure token storage
- Route-level protection
- API endpoint security

### 2. **Data Validation**

- Frontend: Yup schema validation
- Backend: Django serializers validation
- Sanitization of user inputs
- XSS and CSRF protection

### 3. **API Security**

- CORS configuration
- Rate limiting
- Request validation
- Error message sanitization

## 🚀 Development Workflow

### 1. **Backend Development**

```bash
1. Create Django app for new feature
2. Define models with proper relationships
3. Create serializers for API responses
4. Implement views with proper permissions
5. Add URL routing
6. Write tests for critical paths
```

### 2. **Frontend Development**

```bash
1. Define TypeScript interfaces
2. Create API service functions
3. Build UI components (bottom-up)
4. Implement page components
5. Add routing and navigation
6. Test user interactions
```

### 3. **Integration Process**

```bash
1. Backend API endpoints ready
2. Frontend API service implementation
3. Component integration with real data
4. Error handling implementation
5. Loading states and UX polish
6. End-to-end testing
```

## 📋 Code Quality Standards

### 1. **TypeScript**

- Strict type checking enabled
- No implicit any types
- Proper interface definitions
- Generic type usage where appropriate

### 2. **React Best Practices**

- Functional components with hooks
- Proper dependency arrays
- Memoization for performance
- Error boundaries for stability

### 3. **Django Best Practices**

- Model-first approach
- Proper serializer usage
- Permission-based access control
- Consistent API response formats

## 🧪 Testing Strategy

### 1. **Backend Testing**

- Unit tests for models and utilities
- API endpoint integration tests
- Authentication flow testing
- Database transaction testing

### 2. **Frontend Testing**

- Component unit tests
- Hook testing
- Integration tests for user flows
- E2E testing for critical paths

## 📦 Deployment Architecture

### 1. **Backend Deployment**

- Docker containerization
- PostgreSQL database
- Redis for caching/sessions
- Nginx for static files
- Gunicorn for WSGI

### 2. **Frontend Deployment**

- Static build generation
- CDN for asset delivery
- Environment-based configuration
- Progressive Web App features

## 🔄 Data Flow Patterns

### 1. **Authentication Flow**

```
User Input → Form Validation → API Request → JWT Storage → User State Update → Route Redirect
```

### 2. **Data Fetching Flow**

```
Component Mount → React Query → API Request → Response Caching → UI Update → Error Handling
```

### 3. **Form Submission Flow**

```
User Input → Client Validation → API Request → Success/Error Handling → UI Feedback → State Update
```

This guide ensures consistent, maintainable, and scalable code across the entire beBrivus platform.
