import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/vehicles - Obtener todos los vehículos
export const getVehicles = async (_req: Request, res: Response) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ error: "Failed to fetch vehicles" });
  }
};
