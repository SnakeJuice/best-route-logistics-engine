import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// GET /api/orders - Obtener todas las órdenes
export const getOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// POST /api/orders - Crear una nueva orden
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { customerName, address, latitude, longitude, weightKg } = req.body;

    if (
      !customerName ||
      !address ||
      latitude === undefined ||
      longitude === undefined ||
      !weightKg
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newOrder = await prisma.order.create({
      data: {
        customerName,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        weightKg: parseFloat(weightKg),
      },
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
};
