import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Order, RouteData } from "../services/api";
import { decodePolyline } from "../utils/polyline";

interface MapViewProps {
  orders: Order[];
  routes: RouteData[];
}

// Coordenadas del Depósito Central (Santiago Centro)
const SANTIAGO_CENTER: [number, number] = [-33.4442, -70.6528];

// 🏢 Icono del Depósito Central
const depotIcon = L.divIcon({
  className: "custom-depot-icon",
  html: `
    <div style="
      background-color: #0f172a;
      color: white;
      border: 2px solid #ffffff;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
    ">🏢</div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

// 📦 Icono para Órdenes Pendientes
const pendingIcon = L.divIcon({
  className: "custom-pending-icon",
  html: `
    <div style="
      background-color: #f59e0b;
      color: white;
      border: 2px solid #ffffff;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    ">📦</div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// 🔢 Icono Numerado para Paradas Secuenciales (1, 2, 3...)
const createStopIcon = (sequence: number) =>
  L.divIcon({
    className: `custom-stop-icon-${sequence}`,
    html: `
      <div style="
        background-color: #2563eb;
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

export const MapView: React.FC<MapViewProps> = ({ orders, routes }) => {
  return (
    <div
      style={{
        height: "580px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #cbd5e1",
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

        {/* 🏢 Marcador del Depósito Central */}
        <Marker position={SANTIAGO_CENTER} icon={depotIcon}>
          <Popup>
            <strong>🏢 Depósito Central</strong>
            <br />
            Punto de origen y despacho de flotas
          </Popup>
        </Marker>

        {/* 📦 Marcadores para Órdenes Pendientes */}
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

        {/* 🛣️ Trazados y Paradas Numeradas */}
        {routes.map((route) => {
          if (!route.polyline) return null;
          const positions = decodePolyline(route.polyline);

          return (
            <React.Fragment key={route.id}>
              <Polyline
                positions={positions}
                color="#2563eb"
                weight={5}
                opacity={0.85}
              />

              {route.stops.map((stop) => (
                <Marker
                  key={stop.id}
                  position={[stop.order.latitude, stop.order.longitude]}
                  icon={createStopIcon(stop.sequence)}
                >
                  <Popup>
                    <strong>🛑 Parada #{stop.sequence}</strong>
                    <br />
                    Cliente: {stop.order.customerName}
                    <br />
                    Vehículo: {route.vehicle.name} ({route.vehicle.licensePlate}
                    )
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
