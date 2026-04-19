import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 36,
          background:
            "radial-gradient(circle at 30% 30%, #4ade80 0%, #1f8f52 42%, #0a0a0a 100%)",
          color: "#f8fafc",
          fontSize: 96,
          fontWeight: 800,
          letterSpacing: -8,
        }}
      >
        S
      </div>
    ),
    size
  );
}