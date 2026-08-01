import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { calculateOsrmRoute } from "../services/osrmService";

// POST /api/routes/optimize - Generar una ruta optimizada para un vehículo
export const createOptimizedRoute = async (req: Request, res: Response) => {
  try {
    const { vehicleId, orderIds, startLocation } = req.body;

    if (
      !vehicleId ||
      !orderIds ||
      !Array.isArray(orderIds) ||
      orderIds.length === 0
    ) {
      return res.status(400).json({
        error: "vehicleId and a non-empty list of orderIds are required",
      });
    }

    // 1. Buscar únicamente órdenes que existan y estén en estado PENDING
    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
        status: "PENDING",
      },
    });

    if (orders.length === 0) {
      return res.status(400).json({
        error:
          "No pending orders found. Selected orders might already be assigned to a route or do not exist.",
      });
    }

    if (orders.length !== orderIds.length) {
      return res.status(400).json({
        error: "Some selected orders are already assigned to another route.",
      });
    }

    // Coordenada base de salida por defecto (Depósito Central en Santiago Centro)
    const depot = startLocation || { latitude: -33.4442, longitude: -70.6528 };

    // 2. Mapear coordenadas: Depósito -> Órdenes
    const points = [
      depot,
      ...orders.map((o) => ({ latitude: o.latitude, longitude: o.longitude })),
    ];

    // 3. Consultar a OSRM para calcular trazado y métricas por calle
    const routeData = await calculateOsrmRoute(points);

    // 4. Registrar la nueva ruta y sus paradas en la base de datos dentro de una transacción
    const newRoute = await prisma.$transaction(async (tx) => {
      const route = await tx.route.create({
        data: {
          vehicleId,
          totalDistanceM: routeData.distanceMeters,
          totalDurationS: routeData.durationSeconds,
          polyline: routeData.geometryPolyline,
          status: "OPTIMIZED",
        },
      });

      // Crear registros de paradas secuenciales
      const stopsData = orders.map((order, index) => ({
        routeId: route.id,
        orderId: order.id,
        sequence: index + 1,
      }));

      await tx.stop.createMany({ data: stopsData });

      // Actualizar estado de las órdenes a ASSIGNED
      await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: "ASSIGNED" },
      });

      return tx.route.findUnique({
        where: { id: route.id },
        include: { stops: true, vehicle: true },
      });
    });

    res.status(201).json(newRoute);
  } catch (error: any) {
    console.error("Error generating optimized route:", error);
    res
      .status(500)
      .json({ error: error.message || "Failed to generate route" });
  }
};
