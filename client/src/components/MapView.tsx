import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Order, RouteData } from "../services/api";
import { decodePolyline } from "../utils/polyline";

interface MapViewProps {
  orders: Order[];
  routes: RouteData[];
  onMapClick: (lat: number, lng: number) => void;
}

// Event listener para clics en el mapa
const MapClickListener: React.FC<{
  onMapClick: (lat: number, lng: number) => void;
}> = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Paleta de colores para diferenciar rutas distintas en el mapa
const ROUTE_COLORS = ["#2563eb", "#16a34a", "#9333ea", "#ea580c", "#0891b2"];

// Icono Numerado dinámico según el color de su ruta
const createStopIcon = (sequence: number, color: string) =>
  L.divIcon({
    className: `custom-stop-icon-${sequence}`,
    html: `
      <div style="
        background-color: ${color};
        color: white;
        border: 2px solid #ffffff;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 3px 6px rgba(0,0,0,0.35);
      ">${sequence}</div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const SANTIAGO_CENTER: [number, number] = [-33.4442, -70.6528];

const depotIcon = L.divIcon({
  className: "custom-depot-icon",
  html: `<div style="background-color:#0f172a;color:white;border:2px solid #fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 4px 8px rgba(0,0,0,0.4);">🏢</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const pendingIcon = L.divIcon({
  className: "custom-pending-icon",
  html: `<div style="background-color:#f59e0b;color:white;border:2px solid #fff;border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 5px rgba(0,0,0,0.3);">📦</div>`,
  iconSize: [15, 15],
  iconAnchor: [15, 15],
});

export const MapView: React.FC<MapViewProps> = ({
  orders,
  routes,
  onMapClick,
}) => {
  return (
    <div
      style={{
        height: "580px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #cbd5e1",
        cursor: "pointer",
      }}
    >
      <MapContainer
        center={SANTIAGO_CENTER}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickListener onMapClick={onMapClick} />

        {/* 🏢 Depósito Central */}
        <Marker position={SANTIAGO_CENTER} icon={depotIcon}>
          <Popup>
            <strong>🏢 Depósito Central</strong>
            <br />
            Origen de despacho
          </Popup>
        </Marker>

        {/* 📦 Órdenes Pendientes */}
        {orders
          .filter((order) => order.status === "PENDING")
          .map((order) => (
            <Marker
              key={order.id}
              position={[order.latitude, order.longitude]}
              icon={pendingIcon}
            >
              <Popup>
                <strong>📦 {order.customerName}</strong>
                <br />
                {order.address}
                <br />
                Peso: {order.weightKg} kg
              </Popup>
            </Marker>
          ))}

        {/* 🛣️ Rutas Optimizadas con Colores Distintos */}
        {routes.map((route, routeIndex) => {
          if (!route.polyline) return null;
          const positions = decodePolyline(route.polyline);

          // Asignar color dinámico según el índice de la ruta
          const routeColor = ROUTE_COLORS[routeIndex % ROUTE_COLORS.length];

          return (
            <React.Fragment key={route.id}>
              {/* Trazado con color único */}
              <Polyline
                positions={positions}
                color={routeColor}
                weight={5}
                opacity={0.85}
              />

              {/* Paradas con el mismo color del trazado */}
              {route.stops.map((stop) => (
                <Marker
                  key={stop.id}
                  position={[stop.order.latitude, stop.order.longitude]}
                  icon={createStopIcon(stop.sequence, routeColor)}
                >
                  <Popup>
                    <strong>🛑 Parada #{stop.sequence}</strong>
                    <br />
                    Cliente: {stop.order.customerName}
                    <br />
                    Vehículo: {route.vehicle.name}
                  </Popup>
                </Marker>
              ))}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
