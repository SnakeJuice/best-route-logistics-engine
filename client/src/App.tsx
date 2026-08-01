import { useEffect, useState } from "react";
import {
  getOrders,
  getVehicles,
  getRoutes,
  optimizeRoute,
  resetDatabase,
  createOrder,
  Order,
  Vehicle,
  RouteData,
} from "./services/api";
import { MapView } from "./components/MapView";
import { Sidebar } from "./components/Sidebar";
import { OrderModal } from "./components/OrderModal";

export function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [optimizing, setOptimizing] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);

  // Estado del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersData, vehiclesData, routesData] = await Promise.all([
        getOrders(),
        getVehicles(),
        getRoutes(),
      ]);
      setOrders(ordersData);
      setVehicles(vehiclesData);
      setRoutes(routesData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    setIsModalOpen(true);
  };

  const handleCreateOrder = async (orderData: {
    customerName: string;
    address: string;
    latitude: number;
    longitude: number;
    weightKg: number;
  }) => {
    await createOrder(orderData);
    await fetchData();
  };

  const handleOptimize = async () => {
    const pendingOrders = orders.filter((o) => o.status === "PENDING");

    if (pendingOrders.length === 0) {
      alert("No hay órdenes pendientes para optimizar.");
      return;
    }

    if (vehicles.length === 0) {
      alert("No hay vehículos disponibles.");
      return;
    }

    try {
      setOptimizing(true);
      const selectedVehicleId = vehicles[0].id;
      const selectedOrderIds = pendingOrders.slice(0, 3).map((o) => o.id);

      await optimizeRoute(selectedVehicleId, selectedOrderIds);
      await fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error || "Error optimizando la ruta");
    } finally {
      setOptimizing(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      await resetDatabase();
      await fetchData();
    } catch (error) {
      alert("Error al reiniciar la base de datos");
    } finally {
      setResetting(false);
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "sans-serif",
        }}
      >
        <h2>🚚 Cargando Torre de Control de Logística...</h2>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1300px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
        color: "#0f172a",
      }}
    >
      <header
        style={{
          marginBottom: "20px",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: "12px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "24px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          🚚 Best Route Logistics Engine
        </h1>
        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
          Torre de control para optimización de flotas y ruteo en tiempo real
          con OSRM (Haz clic en el mapa para agregar una orden)
        </p>
      </header>

      <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        <Sidebar
          orders={orders}
          vehicles={vehicles}
          routes={routes}
          onOptimize={handleOptimize}
          onReset={handleReset}
          onOpenOrderModal={() => {
            setSelectedCoords(null);
            setIsModalOpen(true);
          }}
          optimizing={optimizing}
          resetting={resetting}
        />

        <main style={{ flex: 1 }}>
          <MapView
            orders={orders}
            routes={routes}
            onMapClick={handleMapClick}
          />
        </main>
      </div>

      <OrderModal
        isOpen={isModalOpen}
        initialCoords={selectedCoords}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
}

export default App;
