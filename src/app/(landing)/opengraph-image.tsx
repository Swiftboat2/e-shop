import { ImageResponse } from "next/og";
import { DESCRIPCION_PLATAFORMA, NOMBRE_PLATAFORMA } from "@/features/landing/marca";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${NOMBRE_PLATAFORMA} — catálogos online con pedidos por WhatsApp`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #064e3b 0%, #0f766e 100%)",
          color: "white",
        }}
      >
        <div style={{ fontSize: 84, fontWeight: 800 }}>{NOMBRE_PLATAFORMA}</div>
        <div style={{ fontSize: 36, marginTop: 24, maxWidth: 900, lineHeight: 1.35, opacity: 0.92 }}>
          {DESCRIPCION_PLATAFORMA}
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 28,
            background: "rgba(255,255,255,0.15)",
            padding: "12px 28px",
            borderRadius: 999,
            alignSelf: "flex-start",
          }}
        >
          Sin comisiones por venta
        </div>
      </div>
    ),
    size,
  );
}
