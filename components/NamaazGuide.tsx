"use client";
import { ArrowLeft } from "lucide-react";

export default function NamaazGuide() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          background: "#123832",
          flexShrink: 0,
        }}
      >
       
      </div>

      <iframe
        src="/namaaz-guide.html"
        title="The Heart of Namaaz — A Guide to Khushū"
        style={{ flex: 1, width: "100%", border: "none" }}
      />
    </div>
  );
}