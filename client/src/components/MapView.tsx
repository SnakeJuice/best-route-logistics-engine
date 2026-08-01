import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Order, RouteData } from "../services/api";
import { decodePolyline } from "../utils/polyline";

// Corregir íconos de Leaflet en Vite
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });
}

interface MapViewProps {
  orders: Order[];
  routes: RouteData[];
}

const SANTIAGO_CENTER: [number, number] = [-33.4442, -70.6528];

export const MapView: React.FC<MapViewProps> = ({ orders, routes }) => {
  return (
    <div
      style={{
        height: "550px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #ccc",
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

        {/* 1. Marcadores para Órdenes Pendientes */}
        {orders
          .filter((order) => order.status === "PENDING")
          .map((order) => (
            <Marker key={order.id} position={[order.latitude, order.longitude]}>
              <Popup>
                <strong>📦 {order.customerName}</strong>
                <br />
                {order.address}
                <br />
                Peso: {order.weightKg} kg
              </Popup>
            </Marker>
          ))}

        {/* 2. Trazado de Rutas Optimizadas */}
        {routes.map((route) => {
          if (!route.polyline) return null;
          const positions = decodePolyline(route.polyline);

          return (
            <React.Fragment key={route.id}>
              <Polyline
                positions={positions}
                color="#2563eb"
                weight={5}
                opacity={0.8}
              />

              {route.stops.map((stop) => (
                <Marker
                  key={stop.id}
                  position={[stop.order.latitude, stop.order.longitude]}
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
