import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { OrderStatus } from "@prisma/client";

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

// POST /api/admin/reset - Resetear la base de datos a su estado inicial
export const resetDatabase = async (_req: Request, res: Response) => {
  try {
    await prisma.stop.deleteMany();
    await prisma.route.deleteMany();
    await prisma.order.deleteMany();
    await prisma.vehicle.deleteMany();

    await prisma.vehicle.createMany({
      data: [
        {
          name: "Van Express #1",
          licensePlate: "AA-123-BB",
          capacityKg: 1000,
          driverName: "Juan Pérez",
        },
        {
          name: "Camión Ligero #2",
          licensePlate: "CC-456-DD",
          capacityKg: 2500,
          driverName: "María González",
        },
      ],
    });

    const ordersData = [
      {
        customerName: "Cliente Centro",
        address: "Av. Libertador Bernardo O'Higgins 1000",
        latitude: -33.4442,
        longitude: -70.6528,
        weightKg: 150,
      },
      {
        customerName: "Cliente Providencia",
        address: "Av. Providencia 1200",
        latitude: -33.4267,
        longitude: -70.6171,
        weightKg: 80,
      },
      {
        customerName: "Cliente Las Condes",
        address: "Av. Apoquindo 4000",
        latitude: -33.4111,
        longitude: -70.575,
        weightKg: 200,
      },
      {
        customerName: "Cliente Ñuñoa",
        address: "Av. Irarrázaval 2500",
        latitude: -33.454,
        longitude: -70.603,
        weightKg: 120,
      },
      {
        customerName: "Cliente Santiago Sur",
        address: "Gran Avenida 5000",
        latitude: -33.5011,
        longitude: -70.655,
        weightKg: 300,
      },
    ];

    for (const order of ordersData) {
      await prisma.order.create({
        data: {
          ...order,
          status: OrderStatus.PENDING,
        },
      });
    }

    res.status(200).json({ message: "Database reset successfully" });
  } catch (error) {
    console.error("Error resetting database:", error);
    res.status(500).json({ error: "Failed to reset database" });
  }
};
