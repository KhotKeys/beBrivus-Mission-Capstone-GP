# beBrivus Frontend

Modern React TypeScript frontend for the beBrivus mentorship and opportunity platform.

## Technology Stack

- **React 18** - UI library with hooks and modern patterns
- **TypeScript** - Type-safe JavaScript with enhanced IDE support
- **Vite** - Next-generation frontend build tool with HMR
- **React Router** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API communication
- **WebSocket** - Real-time messaging and notifications
- **React Query** - Server state management and caching

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── admin/       # Admin dashboard components
│   ├── institution/ # Institution portal components
│   ├── messaging/   # Real-time messaging components
│   └── ui/          # Base UI components (buttons, cards, etc.)
├── pages/           # Route-level page components
│   ├── admin/       # Admin management pages
│   ├── institution/ # Institution dashboard pages
│   └── student/     # Student portal pages
├── services/        # API service layer
├── store/           # State management
├── types/           # TypeScript type definitions
├── utils/           # Helper functions and utilities
└── App.tsx          # Root application component
```

## Key Features

### Multi-Role Dashboards
- **Student Portal** - Browse opportunities, apply, track progress
- **Institution Dashboard** - Post opportunities, manage applications
- **Admin Panel** - User management, moderation, analytics

### Real-Time Communication
- WebSocket-based messaging system
- Video call integration for mentor sessions
- Live notifications and updates

### AI-Powered Moderation
- Automated content moderation for posts and opportunities
- Flagging system with admin review workflow

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Optimized for all screen sizes
- Accessible components following WCAG guidelines

## Development Setup

### Prerequisites
```bash
# Install pnpm (recommended) or npm
npm install -g pnpm
```

### Installation
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`

### Environment Configuration
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000/ws
```

## Available Scripts

```bash
# Development server with hot reload
pnpm dev

# Type checking
pnpm tsc

# Linting
pnpm lint

# Production build
pnpm build

# Preview production build
pnpm preview
```

## Build Configuration

### Vite Setup
- **Fast Refresh** - Instant module replacement during development
- **Code Splitting** - Automatic route-based code splitting
- **Tree Shaking** - Dead code elimination for smaller bundles
- **Asset Optimization** - Image and font optimization

### TypeScript Configuration
- Strict type checking enabled
- Path aliases configured for clean imports
- Type definitions for all dependencies

### ESLint Configuration
Production-ready linting with:
- React hooks rules
- TypeScript type-aware linting
- Import sorting and organization
- Accessibility checks

## API Integration

The frontend communicates with the Django REST backend:

```typescript
// Example API call
import api from '@/services/api';

const opportunities = await api.get('/opportunities/');
```

All API endpoints are proxied through Vite during development to avoid CORS issues.

## Deployment

### Production Build
```bash
pnpm build
```

Generates optimized static files in the `dist/` directory.

### Docker Deployment
```bash
docker build -t bebrivus-frontend .
docker run -p 80:80 bebrivus-frontend
```

### Environment Variables
Configure production API endpoints:
```env
VITE_API_URL=https://api.bebrivus.com/api
VITE_WS_URL=wss://api.bebrivus.com/ws
```

## Testing

```bash
# Run unit tests (when configured)
pnpm test

# Run E2E tests (when configured)
pnpm test:e2e
```

## Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript types for all components and functions
3. Write meaningful commit messages
4. Ensure all linting passes before committing

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

## Performance Optimization

- Route-based code splitting
- Lazy loading for images and components
- React.memo for expensive components
- Debounced search and form inputs
- Service worker for offline capability (optional)

## License

Part of the beBrivus mentorship platform project.
