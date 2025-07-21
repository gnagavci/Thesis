import express from "express";
import db from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";
import { publishToQueue } from "../config/rabbitmq.js";

const router = express.Router();

// Get all simulations for the authenticated user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [simulations] = await db.execute(
      `SELECT id, userId, title, status, createdAt, mode, substrate, 
              duration, decayRate, divisionRate, x, y, z, 
              tumorCount, tumorMovement, immuneCount, immuneMovement,
              stemCount, stemMovement, fibroblastCount, fibroblastMovement,
              drugCarrierCount, drugCarrierMovement
       FROM simulations 
       WHERE userId = ? 
       ORDER BY createdAt DESC`,
      [userId]
    );

    res.json({
      success: true,
      simulations: simulations,
    });
  } catch (error) {
    console.error("Error fetching simulations:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch simulations",
    });
  }
});

// Delete a simulation
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const simulationId = req.params.id;

    // First check if the simulation exists and belongs to the user
    const [existing] = await db.execute(
      "SELECT id FROM simulations WHERE id = ? AND userId = ?",
      [simulationId, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Simulation not found or access denied",
      });
    }

    // Delete the simulation
    await db.execute("DELETE FROM simulations WHERE id = ? AND userId = ?", [
      simulationId,
      userId,
    ]);

    res.json({
      success: true,
      message: "Simulation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting simulation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete simulation",
    });
  }
});

// Create a new simulation
router.post("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      mode,
      substrate,
      duration,
      decayRate,
      divisionRate,
      x,
      y,
      z,
      tumorCount,
      tumorMovement,
      immuneCount,
      immuneMovement,
      stemCount,
      stemMovement,
      fibroblastCount,
      fibroblastMovement,
      drugCarrierCount,
      drugCarrierMovement,
    } = req.body;

    // Validation
    if (!tumorCount || tumorCount < 1) {
      return res.status(400).json({
        success: false,
        error: "Tumor count is required and must be at least 1",
      });
    }

    const [result] = await db.execute(
      `INSERT INTO simulations (
        userId, title, mode, substrate, duration, decayRate, divisionRate,
        x, y, z, tumorCount, tumorMovement, immuneCount, immuneMovement,
        stemCount, stemMovement, fibroblastCount, fibroblastMovement,
        drugCarrierCount, drugCarrierMovement, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')`,
      [
        userId,
        title || "Untitled",
        mode || "2D",
        substrate || "Oxygen",
        duration || 5,
        decayRate || 0.1,
        divisionRate || 0.1,
        x || 1,
        y || 1,
        z || null,
        tumorCount,
        tumorMovement || null,
        immuneCount || 0,
        immuneMovement || null,
        stemCount || 0,
        stemMovement || null,
        fibroblastCount || 0,
        fibroblastMovement || null,
        drugCarrierCount || 0,
        drugCarrierMovement || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Simulation created successfully",
      simulationId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating simulation:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create simulation",
    });
  }
});

// Batch process simulations
router.post("/batch", authenticateToken, async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { simulationIds } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!Array.isArray(simulationIds) || simulationIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "simulationIds must be a non-empty array",
      });
    }

    await connection.beginTransaction();

    const processedSimulations = [];
    const errors = [];

    for (const simulationId of simulationIds) {
      try {
        // Verify simulation exists and belongs to user
        const [existing] = await connection.execute(
          "SELECT * FROM simulations WHERE id = ? AND userId = ?",
          [simulationId, userId]
        );

        if (existing.length === 0) {
          errors.push({
            id: simulationId,
            error: "Simulation not found or access denied",
          });
          continue;
        }

        const simulation = existing[0];

        // Only process simulations that haven't been processed yet
        if (simulation.status !== "Submitted") {
          errors.push({
            id: simulationId,
            error: `Cannot process simulation with status: ${simulation.status}`,
          });
          continue;
        }

        // Prepare message for queue
        const message = {
          simulationId: simulation.id,
          userId: simulation.userId,
          title: simulation.title,
          mode: simulation.mode,
          substrate: simulation.substrate,
          duration: simulation.duration,
          decayRate: simulation.decayRate,
          divisionRate: simulation.divisionRate,
          x: simulation.x,
          y: simulation.y,
          z: simulation.z,
          tumorCount: simulation.tumorCount,
          tumorMovement: simulation.tumorMovement,
          immuneCount: simulation.immuneCount,
          immuneMovement: simulation.immuneMovement,
          stemCount: simulation.stemCount,
          stemMovement: simulation.stemMovement,
          fibroblastCount: simulation.fibroblastCount,
          fibroblastMovement: simulation.fibroblastMovement,
          drugCarrierCount: simulation.drugCarrierCount,
          drugCarrierMovement: simulation.drugCarrierMovement,
        };

        // Publish to queue
        await publishToQueue("simulation_jobs", message);

        processedSimulations.push({
          id: simulationId,
          status: "Queued for processing",
        });
      } catch (error) {
        console.error(`Error processing simulation ${simulationId}:`, error);
        errors.push({
          id: simulationId,
          error: error.message,
        });
      }
    }

    await connection.commit();

    res.json({
      success: true,
      processed: processedSimulations,
      errors: errors,
      summary: {
        total: simulationIds.length,
        processed: processedSimulations.length,
        failed: errors.length,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error("Batch processing error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to process batch simulations",
    });
  } finally {
    connection.release();
  }
});

router.post("/create-batch", authenticateToken, async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { simulationData, count } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!simulationData || !count || count < 1 || count > 100) {
      return res.status(400).json({
        success: false,
        error: "Invalid request. Count must be between 1 and 100.",
      });
    }

    await connection.beginTransaction();

    const createdSimulations = [];
    const simulationIds = [];

    // Create multiple simulations
    for (let i = 0; i < count; i++) {
      const title = simulationData.title
        ? `${simulationData.title} ${count > 1 ? `#${i + 1}` : ""}`
        : `Untitled Simulation ${count > 1 ? `#${i + 1}` : ""}`;

      const [result] = await connection.execute(
        `INSERT INTO simulations (
          userId, title, mode, substrate, duration, decayRate, divisionRate,
          x, y, z, tumorCount, tumorMovement, immuneCount, immuneMovement,
          stemCount, stemMovement, fibroblastCount, fibroblastMovement,
          drugCarrierCount, drugCarrierMovement, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')`,
        [
          userId,
          title,
          simulationData.mode || "2D",
          simulationData.substrate || "Oxygen",
          simulationData.duration || 5,
          simulationData.decayRate || 0.1,
          simulationData.divisionRate || 0.1,
          simulationData.x || 1,
          simulationData.y || 1,
          simulationData.z || null,
          simulationData.tumorCount,
          simulationData.tumorMovement || null,
          simulationData.immuneCount || 0,
          simulationData.immuneMovement || null,
          simulationData.stemCount || 0,
          simulationData.stemMovement || null,
          simulationData.fibroblastCount || 0,
          simulationData.fibroblastMovement || null,
          simulationData.drugCarrierCount || 0,
          simulationData.drugCarrierMovement || null,
        ]
      );

      const simulationId = result.insertId;
      simulationIds.push(simulationId);

      // Prepare message for queue
      const message = {
        simulationId,
        userId,
        title,
        mode: simulationData.mode || "2D",
        substrate: simulationData.substrate || "Oxygen",
        duration: simulationData.duration || 5,
        decayRate: simulationData.decayRate || 0.1,
        divisionRate: simulationData.divisionRate || 0.1,
        x: simulationData.x || 1,
        y: simulationData.y || 1,
        z: simulationData.z || null,
        tumorCount: simulationData.tumorCount,
        tumorMovement: simulationData.tumorMovement || null,
        immuneCount: simulationData.immuneCount || 0,
        immuneMovement: simulationData.immuneMovement || null,
        stemCount: simulationData.stemCount || 0,
        stemMovement: simulationData.stemMovement || null,
        fibroblastCount: simulationData.fibroblastCount || 0,
        fibroblastMovement: simulationData.fibroblastMovement || null,
        drugCarrierCount: simulationData.drugCarrierCount || 0,
        drugCarrierMovement: simulationData.drugCarrierMovement || null,
      };

      // Publish to queue
      await publishToQueue("simulation_jobs", message);

      createdSimulations.push({
        id: simulationId,
        title: title,
      });
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Successfully created and queued ${count} simulation(s)`,
      created: count,
      simulations: createdSimulations,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Batch creation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create simulations",
    });
  } finally {
    connection.release();
  }
});

router.get("/:id/results", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const simulationId = req.params.id;

    // Fetch simulation with results
    const [simulations] = await db.execute(
      `SELECT id, userId, title, status, result, mode, substrate, duration,
              tumorCount, immuneCount, stemCount, fibroblastCount, drugCarrierCount
       FROM simulations 
       WHERE id = ? AND userId = ?`,
      [simulationId, userId]
    );

    if (simulations.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Simulation not found or access denied",
      });
    }

    const simulation = simulations[0];

    if (simulation.status !== "Done") {
      return res.status(400).json({
        success: false,
        error: "Results not available - simulation not complete",
      });
    }

    res.json({
      success: true,
      id: simulation.id,
      title: simulation.title,
      status: simulation.status,
      result: simulation.result,
      parameters: {
        mode: simulation.mode,
        substrate: simulation.substrate,
        duration: simulation.duration,
        tumorCount: simulation.tumorCount,
        immuneCount: simulation.immuneCount,
        stemCount: simulation.stemCount,
        fibroblastCount: simulation.fibroblastCount,
        drugCarrierCount: simulation.drugCarrierCount,
      },
    });
  } catch (error) {
    console.error("Error fetching simulation results:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch simulation results",
    });
  }
});

export default router;
