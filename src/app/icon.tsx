import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
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
          background: "#8B6914",
          borderRadius: 32,
          fontSize: 96,
          color: "#FAF6F0",
          fontFamily: "serif",
        }}
      >
        G
      </div>
    ),
    { ...size }
  );
}
