import React from "react";
import { Order, RouteData, Vehicle } from "../services/api";

interface SidebarProps {
  orders: Order[];
  vehicles: Vehicle[];
  routes: RouteData[];
  onOptimize: () => void;
  onReset: () => void;
  onOpenOrderModal: () => void;
  optimizing: boolean;
  resetting: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  orders,
  vehicles,
  routes,
  onOptimize,
  onReset,
  onOpenOrderModal,
  optimizing,
  resetting,
}) => {
  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const totalDistanceKm = (
    routes.reduce((acc, r) => acc + r.totalDistanceM, 0) / 1000
  ).toFixed(1);
  const totalDurationMin = Math.round(
    routes.reduce((acc, r) => acc + r.totalDurationS, 0) / 60,
  );

  return (
    <aside
      style={{
        width: "360px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}
      >
        <div style={kpiCardStyle}>
          <span style={kpiLabelStyle}>Órdenes Pendientes</span>
          <span style={kpiValueStyle}>{pendingOrders.length}</span>
        </div>
        <div style={kpiCardStyle}>
          <span style={kpiLabelStyle}>Rutas Activas</span>
          <span style={kpiValueStyle}>{routes.length}</span>
        </div>
        <div style={kpiCardStyle}>
          <span style={kpiLabelStyle}>Distancia Total</span>
          <span style={kpiValueStyle}>{totalDistanceKm} km</span>
        </div>
        <div style={kpiCardStyle}>
          <span style={kpiLabelStyle}>Tiempo Estimado</span>
          <span style={kpiValueStyle}>{totalDurationMin} min</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <button
          onClick={onOptimize}
          disabled={optimizing || pendingOrders.length === 0}
          style={{
            ...primaryButtonStyle,
            opacity: optimizing || pendingOrders.length === 0 ? 0.6 : 1,
          }}
        >
          {optimizing
            ? "⚡ Calculando con OSRM..."
            : "⚡ Optimizar Siguiente Ruta"}
        </button>

        <button onClick={onOpenOrderModal} style={createButtonStyle}>
          ➕ Crear Nueva Orden
        </button>

        <button
          onClick={onReset}
          disabled={resetting}
          style={secondaryButtonStyle}
        >
          {resetting ? "🔄 Reiniciando..." : "🔄 Resetear Datos de Prueba"}
        </button>
      </div>

      <div style={sectionContainerStyle}>
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
          📍 Rutas Generadas
        </h3>
        {routes.length === 0 ? (
          <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
            Presiona "Optimizar" para asignar órdenes a un vehículo.
          </p>
        ) : (
          routes.map((route) => (
            <div key={route.id} style={routeCardStyle}>
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "4px",
                }}
              >
                🚛 {route.vehicle.name} ({route.vehicle.licensePlate})
              </div>
              <div
                style={{ fontSize: "12px", color: "#555", marginBottom: "8px" }}
              >
                Chófer: {route.vehicle.driverName || "N/A"} |{" "}
                {(route.totalDistanceM / 1000).toFixed(1)} km |{" "}
                {Math.round(route.totalDurationS / 60)} min
              </div>

              <div style={{ borderTop: "1px solid #eee", paddingTop: "8px" }}>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "bold",
                    color: "#444",
                  }}
                >
                  PARADAS:
                </span>
                <ol
                  style={{
                    margin: "4px 0 0 0",
                    paddingLeft: "18px",
                    fontSize: "12px",
                  }}
                >
                  {route.stops.map((stop) => (
                    <li key={stop.id} style={{ marginBottom: "2px" }}>
                      <strong>{stop.order.customerName}</strong> -{" "}
                      {stop.order.weightKg} kg
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

const kpiCardStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "12px",
  display: "flex",
  flexDirection: "column",
};

const kpiLabelStyle: React.CSSProperties = {
  fontSize: "11px",
  color: "#64748b",
  fontWeight: "bold",
  textTransform: "uppercase",
};

const kpiValueStyle: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#0f172a",
  marginTop: "4px",
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: "#2563eb",
  color: "#ffffff",
  border: "none",
  padding: "12px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: "bold",
  cursor: "pointer",
};

const createButtonStyle: React.CSSProperties = {
  backgroundColor: "#16a34a",
  color: "#ffffff",
  border: "none",
  padding: "10px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "bold",
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: "#f1f5f9",
  color: "#334155",
  border: "1px solid #cbd5e1",
  padding: "10px",
  borderRadius: "8px",
  fontSize: "13px",
  fontWeight: "bold",
  cursor: "pointer",
};

const sectionContainerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "14px",
  flex: 1,
  overflowY: "auto",
  maxHeight: "320px",
};

const routeCardStyle: React.CSSProperties = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  padding: "10px",
  marginBottom: "10px",
};
