import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 30% 30%, #4ade80 0%, #1f8f52 42%, #0a0a0a 100%)",
          color: "#f8fafc",
          fontSize: 260,
          fontWeight: 800,
          letterSpacing: -16,
        }}
      >
        S
      </div>
    ),
    size
  );
}