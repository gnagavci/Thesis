# ABM Simulation Platform - Demo Workflow

## Video Recording Checklist & Script

### Pre-Recording Setup (5 minutes)

1. **Environment Preparation**

   ```bash
   # Ensure clean state
   docker-compose down
   docker system prune -f

   # Start fresh
   docker-compose up -d

   # Wait for all services to be healthy (check with)
   docker-compose ps
   ```

2. **Browser Setup**

   - Open Chrome/Firefox in incognito mode
   - Navigate to http://localhost:3001
   - Open Developer Tools (F12) - optional for showing network requests
   - Prepare second tab for RabbitMQ management (http://localhost:15672)

3. **Terminal Setup**
   - Terminal 1: Main directory for Docker commands
   - Terminal 2: Frontend directory for testing
   - Terminal 3: Backend logs monitoring

## Demo Script (15-20 minutes)

### Part 1: Project Introduction (2 minutes)

**What to say:**
"Welcome! Today I'll demonstrate the ABM Simulation Platform - a microservices-based application for biological simulations. This system models tumor growth, immune responses, and drug delivery using agent-based modeling."

**What to show:**

1. **Architecture Overview**

   - Show docker-compose.yml in editor
   - Explain the 5 services: MySQL, RabbitMQ, Backend API, Worker Service, Frontend

   ```bash
   # Show running services
   docker-compose ps
   ```

2. **Technology Stack**
   - Backend: Node.js, Express, MySQL, RabbitMQ
   - Frontend: React, Vite, Chart.js
   - Show package.json files

### Part 2: Infrastructure Demo (3 minutes)

**What to show:**

1. **Database Inspection**

   ```bash
   # Show database structure
   docker exec -it abm-mysql mysql -u root -p
   # Password: rootpassword

   # In MySQL:
   USE abm;
   SHOW TABLES;
   SELECT id, title, status, tumorCount FROM simulations;
   SELECT username, createdAt FROM users;
   ```

2. **RabbitMQ Management**

   - Navigate to http://localhost:15672
   - Login: admin/admin
   - Show the `simulation_jobs` queue
   - Explain message queue purpose

3. **API Health Check**
   ```bash
   curl http://localhost:5000/health
   ```

### Part 3: Authentication & Security (2 minutes)

**What to show:**

1. **Login Process**

   - Navigate to http://localhost:3001
   - Show login form
   - Try wrong credentials first (show error handling)
   - Login successfully: `testuser` / `password123`

2. **Token-based Authentication**
   - Open browser dev tools → Application → Local Storage
   - Show JWT token storage
   - Explain protected routes

**What to say:**
"The application uses JWT authentication with bcrypt password hashing. All routes are protected, and tokens are automatically validated."

### Part 4: Core Functionality Demo (6 minutes)

#### A. Dashboard Overview (1 minute)

**What to show:**

- Navigation to simulation dashboard
- Explain the interface: Live updates toggle, interval selector, action buttons
- Show existing simulations with different statuses (Submitted, Running, Done)

**What to say:**
"The dashboard shows all simulations with real-time status updates. Notice the live updates feature with configurable polling intervals."

#### B. Creating Single Simulation (2 minutes)

**What to show:**

1. Click "Create Simulation" button
2. **Template Demonstration:**

   - Show "Basic Template" - explain 2D, simple parameters
   - Switch to "Advanced Template" - show 3D options, more cell types
   - Switch to "Performance Template" - show optimized settings
   - Finally select "Custom Template" - demonstrate dynamic form building

3. **Custom Simulation Creation:**

   ```
   Title: "Demo Tumor Growth Study"
   Mode: 3D
   Duration: 8 seconds
   Tumor Count: 800
   Immune Count: 400
   Substrate: Glucose
   Movement types: Random/Directed
   ```

4. Submit and show it appears in dashboard with "Submitted" status

**What to say:**
"The template system allows quick setup for different simulation types, while custom mode provides full flexibility."

#### C. Batch Operations (2 minutes)

**What to show:**

1. **Batch Creation:**

   - Use template to create 5 simulations at once
   - Show the batch creation dialog
   - Demonstrate title auto-numbering

2. **Batch Processing:**
   - Select multiple "Submitted" simulations
   - Click "Process Selected"
   - Show confirmation dialog

**What to say:**
"The platform supports batch operations for processing multiple simulations simultaneously, essential for research workflows."

#### D. Live Updates & Processing (1 minute)

**What to show:**

1. **Enable Live Updates:**

   - Toggle the live updates button
   - Set interval to 2 seconds
   - Watch simulations change from "Submitted" → "Running" → "Done"

2. **Real-time Monitoring:**
   - Show status changes happening automatically
   - Point out the visual indicators

**What to say:**
"Watch the real-time updates as simulations are processed by the background worker service."

### Part 5: Results Visualization (2 minutes)

**What to show:**

1. **View Results:**

   - Click "View Results" on a completed simulation
   - Show the detailed results modal with:
     - Simulation parameters
     - Generated metrics (tumor growth, immune efficiency, drug effectiveness)
     - Chart visualization

2. **Result Details:**
   - Explain the generated data points
   - Show how 3D simulations have different calculations
   - Close modal

**What to say:**
"Results include comprehensive metrics with visualizations. The system generates realistic biological simulation data including tumor growth rates, immune system efficiency, and drug effectiveness."

### Part 6: Advanced Features Demo (2 minutes)

#### A. Import Functionality (1 minute)

**What to show:**

1. Navigate to Import section
2. Show one of the test JSON files (`Test Files/basic2dsimulation.json`)
3. Upload and demonstrate validation
4. Show successful import with batch creation

**What to say:**
"The platform supports JSON file imports for batch simulation creation, with comprehensive validation and error reporting."

#### B. Error Handling (30 seconds)

**What to show:**

- Try to delete a running simulation (should show appropriate error)
- Demonstrate form validation errors
- Show network error handling

#### C. Backend Worker Monitoring (30 seconds)

**What to show:**

```bash
# Show worker logs
docker-compose logs -f worker
```

- Explain background processing
- Show message queue consumption

### Part 7: Testing Demo (3 minutes)

#### A. Unit Tests (2 minutes)

**What to show:**

```bash
cd frontend/thesis

# Run unit tests
npm run test:unit:run

# Show test coverage
npm run test:coverage
```

**Explain while running:**

- Component testing with React Testing Library
- API mocking with MSW
- Custom hooks testing
- Coverage metrics

#### B. Test Structure (1 minute)

**What to show:**

- Show test files in `tests/` directory
- Open a test file (e.g., `Login.test.jsx`)
- Explain testing approach:
  - Component rendering tests
  - User interaction tests
  - API integration tests

**What to say:**
"The application has comprehensive test coverage including unit tests for components, hooks, and API integrations."

### Part 8: DevOps & Architecture (2 minutes)

#### A. Docker Architecture (1 minute)

**What to show:**

```bash
# Show container status
docker-compose ps

# Show resource usage
docker stats --no-stream

# Show service dependencies
cat docker-compose.yml | grep -A 5 "depends_on"
```

#### B. Development Workflow (1 minute)

**What to show:**

```bash
# Show development mode
docker-compose -f docker-compose.dev.yml up -d

# Show hot reload capability
cd frontend/thesis
npm run dev
```

**What to say:**
"The application supports multiple deployment modes: production, development with hot reload, and testing environments."

### Part 9: Cleanup & Summary (1 minute)

**What to show:**

```bash
# Graceful shutdown
docker-compose down

# Optional: Show resource cleanup
docker system prune -f
```

**What to say:**
"This ABM Simulation Platform demonstrates modern microservices architecture with React frontend, Node.js backend, message queues, and comprehensive testing. It's production-ready with Docker containerization and real-time capabilities."

## Technical Points to Emphasize

### Architecture Highlights

- **Microservices**: Independent, scalable services
- **Message Queue**: Asynchronous processing with RabbitMQ
- **Real-time Updates**: Polling and WebSocket strategies
- **Database Design**: Flexible JSON storage for results
- **Containerization**: Full Docker orchestration

### Development Best Practices

- **Modern React**: Hooks, Context API, functional components
- **Security**: JWT authentication, input validation, bcrypt hashing
- **Testing**: Unit tests, E2E tests, mocking strategies
- **Code Quality**: ESLint, proper error handling
- **Documentation**: Comprehensive setup and API docs

### Performance Features

- **Connection Pooling**: Database optimization
- **Batch Processing**: Scalable simulation handling
- **Background Workers**: Non-blocking processing
- **Health Checks**: Service monitoring
- **Resource Management**: Proper cleanup and error recovery

## Recording Tips

### Technical Setup

- **Screen Resolution**: 1920x1080 minimum
- **Browser Zoom**: 100% or 125% for visibility
- **Font Size**: Increase terminal font size for readability
- **Window Management**: Use split screen for terminal + browser

### Presentation Tips

- **Pace**: Allow time for operations to complete
- **Commentary**: Explain what you're doing before doing it
- **Error Demonstration**: Show error handling capabilities
- **Visual Aids**: Point out important elements on screen
- **Code Explanation**: Briefly explain key code sections

### Time Management

- **Total Duration**: Aim for 15-20 minutes
- **Buffer Time**: Allow extra time for slower operations
- **Practice Run**: Do a full rehearsal first
- **Backup Plan**: Have fallback demonstrations ready

This workflow will showcase the platform's capabilities comprehensively while demonstrating professional development practices and modern architecture patterns.
