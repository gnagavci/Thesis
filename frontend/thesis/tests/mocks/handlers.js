import { http, HttpResponse } from "msw";

export const handlers = [
  // Auth endpoints
  http.post("/api/auth/login", async ({ request }) => {
    const { username, password } = await request.json();

    if (username === "testuser" && password === "testpass") {
      return HttpResponse.json({
        token: "mock-jwt-token-12345",
        user: {
          id: 1,
          username: "testuser",
          email: "test@example.com",
        },
      });
    }

    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),

  http.post("/api/auth/register", async ({ request }) => {
    const { username, email, password } = await request.json();

    return HttpResponse.json(
      {
        message: "User created successfully",
        user: {
          id: 2,
          username,
          email,
        },
      },
      { status: 201 }
    );
  }),

  http.get("/api/auth/verify", ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (authHeader === "Bearer mock-jwt-token-12345") {
      return HttpResponse.json({
        user: {
          id: 1,
          username: "testuser",
          email: "test@example.com",
        },
      });
    }

    return HttpResponse.json({ error: "Invalid token" }, { status: 401 });
  }),

  // Simulation endpoints
  http.get("/api/simulations", ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json([
      {
        id: 1,
        title: "Cancer Cell Growth",
        input1: 1.5,
        input2: 2.0,
        duration: 30,
        status: "Done",
        result: {
          finalPopulation: 1250,
          growthRate: 0.85,
          dataPoints: [
            { time: 0, population: 100 },
            { time: 10, population: 450 },
            { time: 20, population: 850 },
            { time: 30, population: 1250 },
          ],
        },
        created_at: "2024-01-15T10:00:00Z",
      },
      {
        id: 2,
        title: "Immune Response Model",
        input1: 2.5,
        input2: 1.8,
        duration: 45,
        status: "Running",
        result: null,
        created_at: "2024-01-15T11:00:00Z",
      },
      {
        id: 3,
        title: "Drug Efficacy Study",
        input1: 3.2,
        input2: 2.7,
        duration: 60,
        status: "Submitted",
        result: null,
        created_at: "2024-01-15T12:00:00Z",
      },
    ]);
  }),

  http.get("/api/simulations/:id", ({ params, request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (id === "1") {
      return HttpResponse.json({
        id: 1,
        title: "Cancer Cell Growth",
        input1: 1.5,
        input2: 2.0,
        duration: 30,
        status: "Done",
        result: {
          finalPopulation: 1250,
          growthRate: 0.85,
          dataPoints: [
            { time: 0, population: 100 },
            { time: 10, population: 450 },
            { time: 20, population: 850 },
            { time: 30, population: 1250 },
          ],
        },
      });
    }

    return HttpResponse.json(
      { error: "Simulation not found" },
      { status: 404 }
    );
  }),

  http.post("/api/simulations", async ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const simulationData = await request.json();

    return HttpResponse.json(
      {
        id: 4,
        ...simulationData,
        status: "Submitted",
        result: null,
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.delete("/api/simulations/:id", ({ params, request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({ message: "Simulation deleted successfully" });
  }),

  // Batch simulations endpoint
  http.post("/api/simulations/batch", async ({ request }) => {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.includes("mock-jwt-token")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { simulations } = await request.json();

    const createdSimulations = simulations.map((sim, index) => ({
      id: 100 + index,
      ...sim,
      status: "Submitted",
      result: null,
      created_at: new Date().toISOString(),
    }));

    return HttpResponse.json(
      {
        message: `${simulations.length} simulations queued successfully`,
        simulations: createdSimulations,
      },
      { status: 201 }
    );
  }),
];
