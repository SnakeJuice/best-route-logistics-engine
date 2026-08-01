import React, { useState, useEffect } from "react";

interface OrderModalProps {
  isOpen: boolean;
  initialCoords: { lat: number; lng: number } | null;
  onClose: () => void;
  onSubmit: (data: {
    customerName: string;
    address: string;
    latitude: number;
    longitude: number;
    weightKg: number;
  }) => Promise<void>;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  initialCoords,
  onClose,
  onSubmit,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [weightKg, setWeightKg] = useState("100");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialCoords) {
      setLatitude(initialCoords.lat.toFixed(6));
      setLongitude(initialCoords.lng.toFixed(6));
    } else {
      setLatitude("-33.4372");
      setLongitude("-70.6506");
    }
  }, [initialCoords]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !address || !latitude || !longitude || !weightKg) {
      alert("Por favor completa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        customerName,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        weightKg: parseFloat(weightKg),
      });
      // Reset form
      setCustomerName("");
      setAddress("");
      onClose();
    } catch (error) {
      alert("Error creando la orden");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px" }}>
            📦 Crear Nueva Orden de Entrega
          </h3>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "none",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <div>
            <label style={labelStyle}>Nombre del Cliente:</label>
            <input
              type="text"
              placeholder="Ej: Cliente La Florida"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Dirección:</label>
            <input
              type="text"
              placeholder="Ej: Av. Vicuña Mackenna 7000"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
            }}
          >
            <div>
              <label style={labelStyle}>Latitud:</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>Longitud:</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Peso del Paquete (kg):</label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "12px",
            }}
          >
            <button type="button" onClick={onClose} style={cancelButtonStyle}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={submitButtonStyle}>
              {loading ? "Guardando..." : "➕ Guardar Orden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(15, 23, 42, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "24px",
  width: "100%",
  maxWidth: "440px",
  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "12px",
  fontWeight: "bold",
  color: "#475569",
  marginBottom: "4px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  fontSize: "14px",
  boxSizing: "border-box",
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  backgroundColor: "#f1f5f9",
  cursor: "pointer",
};

const submitButtonStyle: React.CSSProperties = {
  padding: "8px 16px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#16a34a",
  color: "#ffffff",
  fontWeight: "bold",
  cursor: "pointer",
};
