// frontend/thesis/src/schemas/simulationSchema.js - UPDATED FOR YOUR DATABASE
import { z } from "zod";

const SimulationSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255, "Title too long"),
    mode: z.enum(["2D", "3D"], {
      errorMap: () => ({ message: "Mode must be '2D' or '3D'" }),
    }),
    substrate: z
      .string()
      .min(1, "Substrate is required")
      .max(255, "Substrate name too long"),
    duration: z
      .number()
      .positive("Duration must be positive")
      .max(1000, "Duration too large"),
    decayRate: z
      .number()
      .min(0, "Decay rate cannot be negative")
      .max(1, "Decay rate cannot exceed 1")
      .optional()
      .default(0.1),
    divisionRate: z
      .number()
      .min(0, "Division rate cannot be negative")
      .max(10, "Division rate too large")
      .optional()
      .default(0.1),

    // Coordinates
    x: z
      .number()
      .int("X coordinate must be integer")
      .min(0, "X coordinate cannot be negative")
      .max(1000)
      .optional()
      .default(1),
    y: z
      .number()
      .int("Y coordinate must be integer")
      .min(0, "Y coordinate cannot be negative")
      .max(1000)
      .optional()
      .default(1),
    z: z
      .number()
      .int("Z coordinate must be integer")
      .min(0, "Z coordinate cannot be negative")
      .max(1000)
      .optional(),

    // Cell counts
    tumorCount: z
      .number()
      .int("Tumor count must be integer")
      .min(1, "Tumor count must be at least 1")
      .max(10000),
    immuneCount: z
      .number()
      .int("Immune count must be integer")
      .min(0, "Immune count cannot be negative")
      .max(10000)
      .optional()
      .default(0),
    stemCount: z
      .number()
      .int("Stem count must be integer")
      .min(0, "Stem count cannot be negative")
      .max(10000)
      .optional()
      .default(0),
    fibroblastCount: z
      .number()
      .int("Fibroblast count must be integer")
      .min(0, "Fibroblast count cannot be negative")
      .max(10000)
      .optional()
      .default(0),
    drugCarrierCount: z
      .number()
      .int("Drug carrier count must be integer")
      .min(0, "Drug carrier count cannot be negative")
      .max(10000)
      .optional()
      .default(0),

    // Movement enums - accept user-friendly values, will be converted to DB values
    tumorMovement: z
      .enum(["static", "random", "directed", "collective", "flow", "none"], {
        errorMap: () => ({
          message:
            "Tumor movement must be 'static', 'random', 'directed', 'collective', 'flow', or 'none'",
        }),
      })
      .optional()
      .default("random"),
    immuneMovement: z
      .enum(["static", "random", "directed", "collective", "flow", "none"], {
        errorMap: () => ({
          message:
            "Immune movement must be 'static', 'random', 'directed', 'collective', 'flow', or 'none'",
        }),
      })
      .optional()
      .default("directed"),
    stemMovement: z
      .enum(["static", "random", "directed", "collective", "flow", "none"], {
        errorMap: () => ({
          message:
            "Stem movement must be 'static', 'random', 'directed', 'collective', 'flow', or 'none'",
        }),
      })
      .optional()
      .default("static"),
    fibroblastMovement: z
      .enum(["static", "random", "directed", "collective", "flow", "none"], {
        errorMap: () => ({
          message:
            "Fibroblast movement must be 'static', 'random', 'directed', 'collective', 'flow', or 'none'",
        }),
      })
      .optional()
      .default("random"),
    drugCarrierMovement: z
      .enum(["static", "random", "directed", "collective", "flow", "none"], {
        errorMap: () => ({
          message:
            "Drug carrier movement must be 'static', 'random', 'directed', 'collective', 'flow', or 'none'",
        }),
      })
      .optional()
      .default("directed"),
  })
  .refine(
    (data) => {
      // If mode is 2D, z coordinate should not be provided or should be 0
      if (data.mode === "2D" && data.z && data.z !== 0) {
        return false;
      }
      // If mode is 3D, z coordinate is required
      if (data.mode === "3D" && (data.z === undefined || data.z === null)) {
        return false;
      }
      return true;
    },
    {
      message:
        "Z coordinate is required for 3D mode and should be 0 or omitted for 2D mode",
      path: ["z"],
    }
  );

export default SimulationSchema;
