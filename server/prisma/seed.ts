import { OrderStatus } from "@prisma/client";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Starting database seed...");

  // 1. Limpiar datos existentes
  await prisma.stop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.order.deleteMany();
  await prisma.vehicle.deleteMany();

  // 2. Crear Vehículos
  const vehicle1 = await prisma.vehicle.create({
    data: {
      name: "Van Express #1",
      licensePlate: "AA-123-BB",
      capacityKg: 1000,
      driverName: "Juan Pérez",
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      name: "Camión Ligero #2",
      licensePlate: "CC-456-DD",
      capacityKg: 2500,
      driverName: "María González",
    },
  });

  console.log(`✅ Vehicles created: ${vehicle1.name}, ${vehicle2.name}`);

  // 3. Crear Órdenes de Entrega (Puntos de entrega en Santiago)
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

  console.log(`✅ ${ordersData.length} pending orders created.`);
  console.log("🌾 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
