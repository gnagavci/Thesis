# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Node.js/Express API)
- `cd backend && npm run dev` - Start backend development server with nodemon
- `cd backend && npm start` - Start backend production server
- Backend runs on port 5000 in development, 4000 in Docker

### Frontend (React + Vite)
- `cd frontend/thesis && npm run dev` - Start frontend development server
- `cd frontend/thesis && npm run build` - Build for production
- `cd frontend/thesis && npm run lint` - Run ESLint
- Frontend runs on port 5173 in development, 3000 in Docker

### Docker Environment
- `docker-compose up` - Start all services (MySQL, RabbitMQ, backend, frontend, worker)
- `docker-compose down` - Stop all services
- Services: MySQL (3306), RabbitMQ (5672, 15672), backend (4000), frontend (3000)

## Architecture Overview

### Microservices Structure
- **Backend**: Express.js API with JWT authentication, MySQL database, RabbitMQ integration
- **Frontend**: React application with Vite, Context-based state management
- **Worker**: Background processing service (currently placeholder)
- **Database**: MySQL 8 with connection pooling
- **Message Queue**: RabbitMQ for inter-service communication

### Authentication System
- JWT-based authentication with 24-hour token expiration
- bcrypt password hashing with salt rounds (10)
- AuthContext manages global authentication state
- Protected routes use middleware-based verification
- Tokens stored in localStorage on frontend

### API Structure
- Base URL: `/api/auth/` for authentication endpoints
- Frontend proxy: `/api/*` routes to `localhost:5000` in development
- Authentication endpoints: register, login, verify
- JWT middleware protects routes in `middleware/auth.js`

### Database Configuration
- MySQL connection pool in `config/database.js`
- Environment variables: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- Note: Docker uses database name `abs`, .env may reference `abm`

### Key Files and Patterns
- **Backend Entry**: `server.js` (main), `index.js` (alternative on port 8800)
- **Frontend Entry**: `main.jsx` renders App component
- **Auth Context**: `contexts/AuthContext.jsx` for global auth state
- **API Utils**: `utils/api.js` for frontend API communication
- **ES6 Modules**: Both backend and frontend use `"type": "module"`

### Environment Configuration
- Backend uses `.env` file for database and JWT configuration
- Vite proxy configuration handles API routing in development
- Docker services have specific environment variables in docker-compose.yml

## Development Notes

### Port Configuration
- Development: Backend (5000), Frontend (5173), MySQL (3306), RabbitMQ (5672, 15672)
- Docker: Backend (4000), Frontend (3000), MySQL (3306), RabbitMQ (5672, 15672)

### Database Inconsistency
Watch for database name differences between Docker (`abs`) and .env configuration (`abm` if present).

### Worker Service
The worker directory exists but is currently empty - likely intended for background task processing with RabbitMQ.