# ABM Simulation Platform - Setup Guide

## Prerequisites

### Required Software
1. **Docker & Docker Compose**
   - Download Docker Desktop: https://www.docker.com/products/docker-desktop/
   - Ensure Docker Compose is included (comes with Docker Desktop)
   - Verify installation: `docker --version && docker-compose --version`

2. **Node.js (v18 or higher)**
   - Download: https://nodejs.org/
   - Verify installation: `node --version && npm --version`

3. **Git**
   - Download: https://git-scm.com/
   - Verify installation: `git --version`

### Optional (for development)
- **Visual Studio Code**: https://code.visualstudio.com/
- **MySQL Workbench**: https://www.mysql.com/products/workbench/ (for database inspection)
- **Postman**: https://www.postman.com/ (for API testing)

## Project Setup

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Thesis
```

### Step 2: Environment Configuration
1. **Backend Environment**:
   ```bash
   cd backend
   cp .env.example .env
   ```
   
   Edit `.env` with your preferred values:
   ```env
   DB_HOST=mysql
   DB_USER=root
   DB_PASSWORD=rootpassword
   DB_NAME=abm
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   PORT=5000
   RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672
   ```

2. **Root Environment** (for Docker Compose):
   ```bash
   cd ..
   cp .env.example .env
   ```
   
   Configure Docker environment variables:
   ```env
   MYSQL_ROOT_PASSWORD=rootpassword
   DB_NAME=abm
   DB_USER=root
   DB_PASSWORD=rootpassword
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   RABBITMQ_USER=admin
   RABBITMQ_PASS=admin
   NODE_ENV=production
   ```

### Step 3: Install Dependencies

**Backend:**
```bash
cd backend
npm install
cd ..
```

**Frontend:**
```bash
cd frontend/thesis
npm install
cd ../..
```

## Running the Application

### Option 1: Docker Compose (Recommended)
This starts all services with a single command:

```bash
# Start all services (MySQL, RabbitMQ, Backend, Worker, Frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Access Points:**
- **Web Application**: http://localhost:3001
- **Backend API**: http://localhost:5000
- **RabbitMQ Management**: http://localhost:15672 (admin/admin)
- **MySQL Database**: localhost:3307

### Option 2: Development Mode
For development with hot reload:

```bash
# Start infrastructure services only
docker-compose up -d mysql rabbitmq

# Start backend development server
cd backend
npm run dev

# In another terminal, start frontend development server
cd frontend/thesis
npm run dev
```

**Access Points:**
- **Web Application**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Option 3: Manual Setup (Development)
If you prefer running without Docker:

1. **Install and start MySQL 8.0**
   - Create database `abm`
   - Run the initialization script: `backend/database/init2.sql`

2. **Install and start RabbitMQ**
   - Enable management plugin
   - Create user: admin/admin

3. **Start services**:
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend (new terminal)
   cd frontend/thesis
   npm run dev
   
   # Worker (new terminal)
   cd backend
   node workers/simulationWorker.js
   ```

## Verification Steps

### 1. Check Service Health
```bash
# Check all containers are running
docker-compose ps

# Test backend health
curl http://localhost:5000/health

# Check RabbitMQ management interface
open http://localhost:15672
```

### 2. Database Verification
```bash
# Connect to MySQL container
docker exec -it abm-mysql mysql -u root -p

# Check database and tables
USE abm;
SHOW TABLES;
SELECT * FROM users;
```

### 3. Application Test
1. Open http://localhost:3001 (or http://localhost:5173 for dev)
2. Login with test credentials:
   - Username: `testuser`
   - Password: `password123`
3. Verify you can access the dashboard

## Test Users

The database is pre-populated with test users:
- **Username**: `testuser` | **Password**: `password123`
- **Username**: `admin123` | **Password**: `admin123`

## Running Tests

### Frontend Unit Tests
```bash
cd frontend/thesis

# Run tests once
npm run test:unit:run

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:unit

# Run tests with UI
npm run test:ui
```

### End-to-End Tests
```bash
cd frontend/thesis

# Run Playwright tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

## Common Issues & Solutions

### Issue: Port Already in Use
```bash
# Check what's using the port
lsof -i :3001  # or :5000, :3307, etc.

# Kill the process
kill -9 <PID>
```

### Issue: Docker Permission Denied
```bash
# Add user to docker group (Linux/Mac)
sudo usermod -aG docker $USER
newgrp docker
```

### Issue: Database Connection Failed
1. Ensure MySQL container is running: `docker-compose ps`
2. Check MySQL logs: `docker-compose logs mysql`
3. Verify environment variables in `.env`

### Issue: RabbitMQ Connection Failed
1. Check RabbitMQ container: `docker-compose logs rabbitmq`
2. Verify RabbitMQ is accessible: http://localhost:15672
3. Check RABBITMQ_URL in environment variables

### Issue: Frontend Build Errors
```bash
# Clean install
cd frontend/thesis
rm -rf node_modules package-lock.json
npm install
```

## Development Commands

### Backend
```bash
cd backend
npm run dev      # Start with nodemon (hot reload)
npm start        # Start production server
```

### Frontend
```bash
cd frontend/thesis
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

### Docker
```bash
# Development mode with hot reload
docker-compose -f docker-compose.dev.yml up

# Testing environment
docker-compose -f docker-compose.test.yml up

# View specific service logs
docker-compose logs -f backend

# Rebuild containers
docker-compose up --build
```

## Monitoring & Debugging

### Service Status
```bash
# Check all services
docker-compose ps

# View resource usage
docker stats

# Check specific container logs
docker logs abm-backend -f
```

### Database Inspection
```bash
# Access MySQL CLI
docker exec -it abm-mysql mysql -u root -p

# Common queries
USE abm;
SELECT * FROM simulations ORDER BY createdAt DESC LIMIT 10;
SELECT COUNT(*) FROM simulations WHERE status = 'Running';
```

### RabbitMQ Monitoring
- Management UI: http://localhost:15672
- Check queue status and message counts
- Monitor connections and channels

## Production Deployment Notes

### Security Checklist
- [ ] Change default passwords
- [ ] Use strong JWT secrets
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### Performance Optimization
- [ ] Configure database connection pooling
- [ ] Set up Redis for caching
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Monitor resource usage

### Backup Strategy
- [ ] Regular database backups
- [ ] Version control for configurations
- [ ] Container registry for images
- [ ] Documentation updates

This setup guide should get you up and running with the ABM Simulation Platform. For additional help, check the logs and ensure all prerequisites are properly installed.