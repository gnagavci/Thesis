// backend/routes/import.js - FINAL FIXED VERSION
import express from "express";
import multer from "multer";
import { body, validationResult } from "express-validator";
import { z } from "zod";
import jwt from "jsonwebtoken";

const router = express.Router();

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024, // 1MB limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/json" ||
      file.originalname.endsWith(".json")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only JSON files are allowed"), false);
    }
  },
});

// Movement value mapper - convert JSON values to database enum values
const mapMovementValue = (value) => {
  const mapping = {
    static: "None",
    random: "Random",
    directed: "Directed",
    collective: "Collective",
    flow: "Flow",
  };
  return mapping[value.toLowerCase()] || "Random"; // Default to 'Random' if unknown
};

// Basic simulation schema for validation (accepts user-friendly values)
const SimulationSchema = z
  .object({
    title: z.string().min(1).max(255),
    mode: z.enum(["2D", "3D"]),
    substrate: z.string().min(1).max(100),
    duration: z.number().positive().max(1000),
    tumorCount: z.number().int().min(1).max(10000),
    // Make other fields optional with defaults
    decayRate: z.number().min(0).max(1).optional().default(0.1),
    divisionRate: z.number().min(0).max(10).optional().default(0.05),
    x: z.number().int().min(0).max(1000).optional().default(100),
    y: z.number().int().min(0).max(1000).optional().default(100),
    z: z.number().int().min(0).max(1000).optional(),
    immuneCount: z.number().int().min(0).max(10000).optional().default(50),
    stemCount: z.number().int().min(0).max(10000).optional().default(25),
    fibroblastCount: z.number().int().min(0).max(10000).optional().default(75),
    drugCarrierCount: z.number().int().min(0).max(10000).optional().default(30),
    // Accept user-friendly movement values
    tumorMovement: z
      .enum(["static", "random", "directed", "collective", "flow", "none"])
      .optional()
      .default("random"),
    immuneMovement: z
      .enum(["static", "random", "directed", "collective", "flow", "none"])
      .optional()
      .default("directed"),
    stemMovement: z
      .enum(["static", "random", "directed", "collective", "flow", "none"])
      .optional()
      .default("static"),
    fibroblastMovement: z
      .enum(["static", "random", "directed", "collective", "flow", "none"])
      .optional()
      .default("random"),
    drugCarrierMovement: z
      .enum(["static", "random", "directed", "collective", "flow", "none"])
      .optional()
      .default("directed"),
  })
  .refine(
    (data) => {
      // 2D mode shouldn't have z coordinate or should be 0
      if (data.mode === "2D" && data.z && data.z !== 0) return false;
      // 3D mode should have z coordinate
      if (data.mode === "3D" && (data.z === undefined || data.z === null))
        return false;
      return true;
    },
    {
      message:
        "Z coordinate is required for 3D mode and should be 0 or omitted for 2D mode",
    }
  );

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Import simulations endpoint - VALIDATION ONLY
router.post(
  "/import",
  authenticateToken,
  upload.single("file"),
  body("count")
    .isInt({ min: 1, max: 1000 })
    .withMessage("Count must be between 1 and 1000"),
  async (req, res) => {
    try {
      console.log("=== Import request received ===");

      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ errors: [{ msg: "No file uploaded" }] });
      }

      // Parse JSON content
      let simulationSpec;
      try {
        const fileContent = req.file.buffer.toString("utf8");
        simulationSpec = JSON.parse(fileContent);
        console.log("Parsed JSON keys:", Object.keys(simulationSpec));
      } catch (error) {
        console.log("JSON Parse Error:", error.message);
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid JSON format" }] });
      }

      // Validate against schema and apply defaults
      try {
        simulationSpec = SimulationSchema.parse(simulationSpec);
        console.log("Validation passed, original data:", simulationSpec);

        // Convert movement values to database enum values
        simulationSpec.tumorMovement = mapMovementValue(
          simulationSpec.tumorMovement
        );
        simulationSpec.immuneMovement = mapMovementValue(
          simulationSpec.immuneMovement
        );
        simulationSpec.stemMovement = mapMovementValue(
          simulationSpec.stemMovement
        );
        simulationSpec.fibroblastMovement = mapMovementValue(
          simulationSpec.fibroblastMovement
        );
        simulationSpec.drugCarrierMovement = mapMovementValue(
          simulationSpec.drugCarrierMovement
        );

        console.log("Processed data with DB enum values:", simulationSpec);
      } catch (error) {
        console.log("Schema validation error:", error.errors);
        const validationErrors = error.errors.map((err) => ({
          msg: `${err.path.join(".")}: ${err.message}`,
          param: err.path.join("."),
        }));
        return res.status(400).json({ errors: validationErrors });
      }

      const count = parseInt(req.body.count);

      // Just return the validated data - let the frontend handle simulation creation
      console.log(`=== Validation successful for ${count} simulations ===`);

      res.json({
        success: true,
        imported: count,
        simulationData: simulationSpec,
        message: `Successfully validated simulation data for ${count} simulation${
          count > 1 ? "s" : ""
        }`,
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({
        errors: [{ msg: "Internal server error: " + error.message }],
      });
    }
  }
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res
        .status(400)
        .json({ errors: [{ msg: "File size too large (max 1MB)" }] });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res
        .status(400)
        .json({ errors: [{ msg: "Too many files uploaded" }] });
    }
  }

  if (error.message === "Only JSON files are allowed") {
    return res
      .status(400)
      .json({ errors: [{ msg: "Only JSON files are allowed" }] });
  }

  next(error);
});

export default router;
