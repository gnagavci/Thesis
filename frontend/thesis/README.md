# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

Testing
This project includes comprehensive automated testing with unit/component tests using Vitest + React Testing Library, and end-to-end tests using Playwright.
Test Structure
frontend/thesis/
├── tests/ # Unit/Component tests
│ ├── setupTests.js # Test environment setup
│ ├── mocks/ # MSW mock handlers
│ │ ├── handlers.js # API endpoint mocks
│ │ └── server.js # MSW server setup
│ ├── Login.test.jsx
│ ├── CreateSimulation.test.jsx
│ └── SimulationDashboard.test.jsx
├── e2e/ # End-to-end tests
│ ├── playwright.config.js # Playwright configuration
│ └── login.spec.js # E2E test specs
└── vitest.config.js # Vitest configuration
Running Tests
Prerequisites
Install dependencies:
bashcd frontend/thesis
npm install
Unit/Component Tests
Run unit tests with Vitest:
bash# Run tests in watch mode
npm run test:unit

# Run tests once

npm run test:unit:run

# Run with coverage

npm run test:coverage
End-to-End Tests
Run E2E tests with Playwright:
bash# Run E2E tests
npm run test:e2e

# Run E2E tests with UI

npm run test:e2e:ui
All Tests
Run complete test suite:
bashnpm run test
Docker Testing
Unit Tests in Docker
Run unit tests in isolated Docker environment:
bash# From project root
docker compose -f docker-compose.yml -f docker-compose.test.yml up --build tests
E2E Tests in Docker
Run E2E tests against containerized frontend:
bash# Start frontend service first
docker compose up -d frontend

# Run E2E tests

docker compose -f docker-compose.yml -f docker-compose.test.yml run --rm playwright
Full Test Suite in Docker
bash# Run both unit and E2E tests
docker compose -f docker-compose.yml -f docker-compose.test.yml up --build
Test Coverage
The test suite covers:
Unit/Component Tests

✅ Login Component: Form validation, successful/failed login flows, loading states
✅ CreateSimulation Component: Form submission, field validation, template selection
✅ SimulationDashboard Component: Data fetching, polling, result modals, Chart.js integration

E2E Tests

✅ Login Flow: Complete authentication flow with API mocking
✅ Dashboard Navigation: Post-login navigation and simulation list display
✅ Error Handling: Invalid credentials and error states

Mock Service Worker (MSW)
All API endpoints are mocked:

POST /api/auth/login - Authentication
GET /api/simulations - Simulation list
GET /api/simulations/:id - Individual simulation
POST /api/simulations - Create simulation
DELETE /api/simulations/:id - Delete simulation

Test Data
Tests use realistic mock data:

Simulations with different statuses (Submitted, Running, Done)
Chart data for visualization testing
JWT token handling
Error scenarios

Debugging Tests
Vitest Debug
bash# Run specific test file
npx vitest tests/Login.test.jsx

# Run with debugger

npx vitest --inspect-brk tests/Login.test.jsx
Playwright Debug
bash# Run with headed browser
npx playwright test --headed

# Run with debug mode

npx playwright test --debug

# Generate trace

npx playwright test --trace on
CI/CD Integration
Tests are designed to run in CI environments:

Deterministic and fast (< 5s total for unit tests)
No external dependencies (all APIs mocked)
Proper cleanup between tests
Coverage reporting

Troubleshooting
Common Issues

Port conflicts: Ensure ports 3000 and 80 are available
MSW handlers: Check that API endpoints match your actual backend routes
Chart.js mocking: Verify chart components render with mocked Chart.js
Docker permissions: Ensure Docker has access to frontend directory

Debug Commands
bash# Check if MSW is intercepting requests
DEBUG=msw npm run test:unit

# Verbose Playwright output

npx playwright test --reporter=line

# Check Docker test setup

docker compose -f docker-compose.test.yml config
