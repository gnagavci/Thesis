import amqp from "amqplib";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "abm",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Simulation result generator
function generateSimulationResults(params) {
  const {
    tumorCount,
    immuneCount,
    stemCount,
    fibroblastCount,
    drugCarrierCount,
    decayRate,
    divisionRate,
    duration,
    mode,
  } = params;

  // Add randomness factor (±10%)
  const randomFactor = () => 0.9 + Math.random() * 0.2;

  // Calculate tumor growth/decay
  const growthFactor = divisionRate - decayRate;
  const timeSteps = duration * 10; // Simulate in 0.1 time units

  let currentTumorCount = tumorCount;
  let killedByImmune = 0;
  let drugEffectiveness = 0;

  // Simulate tumor growth with immune system interaction
  for (let i = 0; i < timeSteps; i++) {
    // Tumor growth
    currentTumorCount *= (1 + growthFactor / timeSteps) * randomFactor();

    // Immune system effect
    if (immuneCount > 0) {
      const immuneEffect = (immuneCount / 1000) * 0.01 * randomFactor();
      const killed = Math.floor(currentTumorCount * immuneEffect);
      killedByImmune += killed;
      currentTumorCount -= killed;
    }

    // Drug carrier effect
    if (drugCarrierCount > 0) {
      const drugEffect = (drugCarrierCount / 100) * 0.005 * randomFactor();
      currentTumorCount *= 1 - drugEffect;
      drugEffectiveness += drugEffect;
    }
  }

  // Calculate final metrics
  const finalTumorCount = Math.max(0, Math.floor(currentTumorCount));
  const survivalRate = Math.max(
    0,
    Math.min(1, 1 - finalTumorCount / (tumorCount * 10))
  );
  const immuneEfficiency =
    immuneCount > 0 ? killedByImmune / (tumorCount + killedByImmune) : 0;

  // Add some 3D-specific calculations
  const volumeFactor = mode === "3D" ? 1.5 : 1.0;

  return {
    initialTumorCount: tumorCount,
    finalTumorCount: Math.floor(finalTumorCount * volumeFactor),
    tumorGrowthRate: ((finalTumorCount - tumorCount) / tumorCount) * 100,
    immuneCellsDeployed: immuneCount,
    tumorCellsKilledByImmune: Math.floor(killedByImmune),
    immuneEfficiency: (immuneEfficiency * 100).toFixed(2),
    stemCellsActivated: Math.floor(stemCount * 0.3 * randomFactor()),
    fibroblastActivity:
      fibroblastCount > 0 ? (Math.random() * 50 + 25).toFixed(2) : 0,
    drugCarriersUsed: drugCarrierCount,
    drugEffectiveness: ((drugEffectiveness * 100) / timeSteps).toFixed(2),
    survivalRate: (survivalRate * 100).toFixed(2),
    simulationDuration: duration,
    mode: mode,
    substrate: params.substrate,
    timestamp: new Date().toISOString(),
  };
}

// Main worker function
async function startWorker() {
  try {
    // Connect to RabbitMQ
    const rabbitmqUrl =
      process.env.RABBITMQ_URL || "amqp://admin:admin@localhost:5672";
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    const queue = "simulation_jobs";
    await channel.assertQueue(queue, { durable: true });

    // Only process one message at a time
    channel.prefetch(1);

    console.log("🚀 Simulation worker started");
    console.log(`⏳ Waiting for messages in ${queue} queue...`);

    channel.consume(queue, async (msg) => {
      if (!msg) return;

      const startTime = Date.now();
      let simulation = null;

      try {
        // Parse message
        simulation = JSON.parse(msg.content.toString());
        console.log(
          `\n📥 Received simulation job: ${simulation.simulationId} - "${simulation.title}"`
        );

        // Update status to Running
        await pool.execute(
          "UPDATE simulations SET status = ? WHERE id = ? AND status = ?",
          ["Running", simulation.simulationId, "Submitted"]
        );
        console.log(
          `🏃 Simulation ${simulation.simulationId} status updated to Running`
        );

        // Simulate processing time (convert duration from minutes to milliseconds)
        const processingTime = simulation.duration * 1000; // 1 second per minute of simulation
        console.log(`⏱️  Processing for ${simulation.duration} seconds...`);

        await new Promise((resolve) => setTimeout(resolve, processingTime));

        // Generate results
        const results = generateSimulationResults(simulation);
        console.log(`✅ Simulation ${simulation.simulationId} completed`);

        // Update database with results
        await pool.execute(
          "UPDATE simulations SET status = ?, result = ? WHERE id = ?",
          ["Done", JSON.stringify(results), simulation.simulationId]
        );

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(
          `💾 Results saved for simulation ${simulation.simulationId} (Total time: ${totalTime}s)`
        );

        // Acknowledge message
        channel.ack(msg);
      } catch (error) {
        console.error("❌ Error processing simulation:", error);

        // Update status back to Submitted on error
        if (simulation && simulation.simulationId) {
          try {
            await pool.execute(
              "UPDATE simulations SET status = ? WHERE id = ?",
              ["Submitted", simulation.simulationId]
            );
          } catch (dbError) {
            console.error("Failed to reset simulation status:", dbError);
          }
        }

        // Reject message and requeue
        channel.nack(msg, false, true);
      }
    });

    // Handle shutdown gracefully
    process.on("SIGINT", async () => {
      console.log("\n🛑 Shutting down worker...");
      await channel.close();
      await connection.close();
      await pool.end();
      process.exit(0);
    });
  } catch (error) {
    console.error("Failed to start worker:", error);
    process.exit(1);
  }
}

// Start the worker
startWorker();
