# Agent-Based Modeling (ABM) Simulation Platform - Project Documentation

## Project Overview

This is a comprehensive web-based platform for creating, managing, and processing agent-based modeling simulations, specifically focused on biological and medical simulations (tumor growth, immune responses, drug delivery, etc.). The system implements a microservices architecture with real-time processing capabilities, user authentication, and advanced simulation management features.

## Architecture Overview

### System Architecture

The platform follows a **microservices architecture** with the following core components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │  Express.js API │    │ Background      │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│ Worker Service  │
│   Port: 5173    │    │   Port: 5000    │    │ (Simulation)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   MySQL 8.0     │              │
         │              │   Database      │              │
         │              │   Port: 3306    │              │
         │              └─────────────────┘              │
         │                                                │
         └──────────────► ┌─────────────────┐ ◄──────────┘
                         │   RabbitMQ      │
                         │ Message Queue   │
                         │ Port: 5672      │
                         └─────────────────┘
```

### Technology Stack

#### Backend Technologies

- **Node.js** with Express.js framework
- **MySQL 8.0** database with connection pooling
- **RabbitMQ** for asynchronous message processing
- **JWT** authentication with bcrypt password hashing
- **Zod** for data validation and schema management
- **Multer** for file upload handling
- **AMQP** for message queue communication

#### Frontend Technologies

- **React 18** with functional components and hooks
- **Vite** as build tool and development server
- **React Router DOM** for client-side routing
- **Chart.js** with react-chartjs-2 for data visualization
- **Socket.io-client** for real-time communication (optional)
- **React Icons** for consistent iconography
- **CSS3** with modern styling and responsive design

#### DevOps & Testing

- **Docker** containerization with multi-stage builds
- **Docker Compose** for orchestration
- **Vitest** for unit testing with coverage reports
- **Playwright** for end-to-end testing
- **ESLint** for code quality
- **Nginx** for production frontend serving

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  username varchar(45) NOT NULL,
  password varchar(255) NOT NULL,  -- bcrypt hashed
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
)
```

### Simulations Table

```sql
CREATE TABLE simulations (
  id int NOT NULL AUTO_INCREMENT,
  userId int NOT NULL,
  title varchar(255) NOT NULL DEFAULT 'Untitled',
  status enum('Submitted','Running','Done') NOT NULL DEFAULT 'Submitted',
  createdAt datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  mode enum('2D','3D') NOT NULL DEFAULT '2D',
  substrate varchar(255) NOT NULL DEFAULT 'Oxygen',
  duration int NOT NULL DEFAULT '5',
  decayRate float DEFAULT '0.1',
  divisionRate float DEFAULT '0.1',
  result json DEFAULT NULL,  -- Stores simulation results as JSON
  x int NOT NULL DEFAULT '1',
  y int NOT NULL DEFAULT '1',
  z int DEFAULT NULL,
  tumorCount int NOT NULL,
  tumorMovement enum('None','Random','Directed','Collective','Flow') DEFAULT NULL,
  immuneCount int NOT NULL DEFAULT '0',
  immuneMovement enum('None','Random','Directed','Collective','Flow') DEFAULT NULL,
  stemCount int NOT NULL DEFAULT '0',
  stemMovement enum('None','Random','Directed','Collective','Flow') DEFAULT NULL,
  fibroblastCount int NOT NULL DEFAULT '0',
  fibroblastMovement enum('None','Random','Directed','Collective','Flow') DEFAULT NULL,
  drugCarrierCount int NOT NULL DEFAULT '0',
  drugCarrierMovement enum('None','Random','Directed','Collective','Flow') DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (userId) REFERENCES users (id)
)
```

## API Endpoints

### Authentication Endpoints (`/api/auth/`)

- `POST /register` - Create new user account
- `POST /login` - Authenticate user and return JWT token
- `GET /verify` - Verify JWT token validity

### Simulation Management (`/api/simulations/`)

- `GET /` - Fetch all simulations for authenticated user
- `POST /` - Create single simulation
- `DELETE /:id` - Delete specific simulation
- `POST /batch` - Process multiple existing simulations
- `POST /create-batch` - Create and queue multiple simulations
- `GET /:id/results` - Fetch simulation results with visualization data

### Import Functionality (`/api/simulations/import`)

- `POST /import` - Validate and process JSON simulation files (supports batch creation)

## Key Features

### 1. User Authentication & Authorization

- **JWT-based authentication** with 24-hour token expiration
- **bcrypt password hashing** with salt rounds (10)
- **Protected routes** with middleware-based verification
- **Context-based state management** for global auth state
- **Automatic token validation** on app load

### 2. Simulation Creation & Management

- **Template-based simulation creation**:
  - Basic Template (2D, essential parameters)
  - Advanced Template (3D, full feature set)
  - Performance Template (optimized for benchmarking)
  - Custom Template (user-defined parameters)
- **Dynamic parameter validation** using Zod schemas
- **Batch simulation creation** (up to 100 simulations)
- **File import functionality** (JSON format with validation)
- **Real-time status tracking** (Submitted → Running → Done)

### 3. Live Dashboard Updates

- **Polling strategy** with configurable intervals (2s, 5s, 10s, 30s)
- **WebSocket support** for real-time push updates (optional)
- **Exponential backoff** on connection errors
- **Visual indicators** for live update status
- **Automatic pause/resume** on errors

### 4. Background Processing System

- **RabbitMQ message queue** for asynchronous simulation processing
- **Dedicated worker service** for simulation execution
- **Realistic result generation** with randomization factors
- **Progress tracking** with database status updates
- **Error handling** with automatic retry mechanisms
- **Graceful shutdown** with proper cleanup

### 5. Data Visualization & Results

- **Chart.js integration** for result visualization
- **Modal-based result display** with detailed metrics
- **JSON result storage** with flexible schema
- **Real-time result updates** via polling or WebSocket
- **Export capabilities** for simulation data

### 6. Advanced Import System

- **JSON file validation** with comprehensive error reporting
- **Movement type mapping** (user-friendly → database enum)
- **Batch processing** with individual error tracking
- **Schema-based validation** with default value assignment
- **File size limits** and security measures

## Development Workflow

### Development Commands

#### Backend Development

```bash
cd backend
npm run dev    # Start development server with nodemon
npm start      # Start production server
```

#### Frontend Development

```bash
cd frontend/thesis
npm run dev     # Start Vite development server (port 5173)
npm run build   # Build for production
npm run lint    # Run ESLint
npm run test    # Run unit tests with coverage
```

#### Docker Development

```bash
# Start all services
docker-compose up

# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Run tests
docker-compose -f docker-compose.test.yml up
```

### Port Configuration

- **Development**: Backend (5000), Frontend (5173), MySQL (3306), RabbitMQ (5672, 15672)
- **Docker**: Backend (5000), Frontend (3001), MySQL (3307), RabbitMQ (5672, 15672)

## Security Features

### Authentication Security

- **JWT tokens** with configurable expiration
- **bcrypt password hashing** with proper salt rounds
- **Authorization headers** for API requests
- **Token validation middleware** for protected routes

### Input Validation & Sanitization

- **Zod schema validation** for all user inputs
- **File upload restrictions** (JSON only, 1MB limit)
- **SQL injection prevention** via parameterized queries
- **XSS protection** through proper data handling

### Docker Security

- **Non-root user** execution in containers
- **Multi-stage builds** to minimize attack surface
- **Health checks** for service monitoring
- **Resource limits** to prevent abuse

## Performance Optimizations

### Frontend Performance

- **React.memo** and **useMemo** for component optimization
- **Lazy loading** for route-based code splitting
- **Efficient polling** with exponential backoff
- **CSS optimization** with minimal external dependencies
- **Build optimization** via Vite

### Backend Performance

- **MySQL connection pooling** (10 concurrent connections)
- **Efficient database queries** with proper indexing
- **Message queue processing** for non-blocking operations
- **Graceful error handling** without system crashes

### Infrastructure Performance

- **Docker multi-stage builds** for smaller images
- **Nginx serving** for production frontend
- **Health checks** for automatic recovery
- **Resource optimization** in container configurations

## Testing Strategy

### Unit Testing (Frontend)

- **Vitest** with jsdom environment
- **React Testing Library** for component testing
- **MSW (Mock Service Worker)** for API mocking
- **Coverage reports** with detailed metrics

### End-to-End Testing

- **Playwright** for browser automation
- **Multi-browser testing** support
- **Visual regression testing** capabilities
- **CI/CD integration** ready

### API Testing

- **Manual testing** with comprehensive endpoints
- **Error scenario coverage**
- **Authentication flow testing**
- **File upload validation testing**

## Deployment Architecture

### Docker Services

1. **MySQL Database** - Persistent data storage with initialization scripts
2. **RabbitMQ** - Message queue with management interface
3. **Backend API** - Express.js server with health checks
4. **Worker Service** - Background simulation processing
5. **Frontend** - Nginx-served React application

### Health Monitoring

- **Backend health endpoint** (`/health`)
- **Database connectivity checks**
- **RabbitMQ diagnostics**
- **Container health checks** with automatic restarts

### Data Persistence

- **MySQL data volume** for database persistence
- **RabbitMQ data volume** for queue persistence
- **Backup strategies** via volume mounting

This documentation provides a comprehensive overview of the ABM Simulation Platform, its architecture, features, and development practices. The system demonstrates modern web development patterns with microservices, real-time processing, and comprehensive user management capabilities.
