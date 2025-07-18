import express from "express";
import db from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

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

// Create a new simulation (placeholder for future implementation)
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

export default router;
