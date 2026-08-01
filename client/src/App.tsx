import { useEffect, useState } from "react";
import {
  getOrders,
  getVehicles,
  getRoutes,
  optimizeRoute,
  Order,
  Vehicle,
  RouteData,
} from "./services/api";
import { MapView } from "./components/MapView";

export function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [optimizing, setOptimizing] = useState<boolean>(false);

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

  if (loading) {
    return (
      <div style={{ padding: "20px" }}>
        Cargando datos del motor de logística...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "sans-serif",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>🚚 Logistics Engine</h1>
          <p style={{ margin: "5px 0 0 0", color: "#666" }}>
            Optimización de Rutas en Tiempo Real con OSRM
          </p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={optimizing}
          style={{
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: optimizing ? "not-allowed" : "pointer",
            opacity: optimizing ? 0.7 : 1,
          }}
        >
          {optimizing
            ? "Calculando con OSRM..."
            : "⚡ Optimizar Siguiente Ruta"}
        </button>
      </header>

      <MapView orders={orders} routes={routes} />
    </div>
  );
}

export default App;
