import axios from "axios";

const API_BASE_URL = "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  capacityKg: number;
  driverName?: string;
}

export interface Order {
  id: string;
  customerName: string;
  address: string;
  latitude: number;
  longitude: number;
  weightKg: number;
  status: "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "FAILED";
}

export interface Stop {
  id: string;
  sequence: number;
  order: Order;
}

export interface RouteData {
  id: string;
  vehicleId: string;
  status: string;
  totalDistanceM: number;
  totalDurationS: number;
  polyline: string;
  vehicle: Vehicle;
  stops: Stop[];
}

export const getVehicles = () =>
  api.get<Vehicle[]>("/vehicles").then((res) => res.data);
export const getOrders = () =>
  api.get<Order[]>("/orders").then((res) => res.data);
export const getRoutes = () =>
  api.get<RouteData[]>("/routes").then((res) => res.data);
export const optimizeRoute = (vehicleId: string, orderIds: string[]) =>
  api
    .post<RouteData>("/routes/optimize", { vehicleId, orderIds })
    .then((res) => res.data);
export const resetDatabase = () =>
  api.post("/admin/reset").then((res) => res.data);
