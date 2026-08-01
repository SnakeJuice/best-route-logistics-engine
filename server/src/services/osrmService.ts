const OSRM_BASE_URL = process.env.OSRM_URL || "http://127.0.0.1:5000";

export interface RouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface OsrmRouteResult {
  distanceMeters: number;
  durationSeconds: number;
  geometryPolyline: string;
}

/**
 * Obtiene la ruta optimizada, tiempo, distancia y geometría en formato Polyline
 * dada una lista ordenada de coordenadas [Origen, Parada 1, Parada 2, ...].
 */
export const calculateOsrmRoute = async (
  coordinates: RouteCoordinate[],
): Promise<OsrmRouteResult> => {
  if (coordinates.length < 2) {
    throw new Error(
      "Se requieren al menos 2 puntos (origen y destino) para calcular una ruta.",
    );
  }

  // OSRM espera las coordenadas en formato: longitude,latitude;longitude,latitude
  const formattedCoordinates = coordinates
    .map((coord) => `${coord.longitude},${coord.latitude}`)
    .join(";");

  const url = `${OSRM_BASE_URL}/route/v1/driving/${formattedCoordinates}?overview=full&geometries=polyline`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error consultando el motor OSRM: ${response.statusText}`);
  }

  const data = (await response.json()) as any;

  if (!data.routes || data.routes.length === 0) {
    throw new Error(
      "No se pudo calcular la ruta entre los puntos especificados.",
    );
  }

  const primaryRoute = data.routes[0];

  return {
    distanceMeters: primaryRoute.distance,
    durationSeconds: primaryRoute.duration,
    geometryPolyline: primaryRoute.geometry,
  };
};
