import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Halqa — a circle for reflection",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: "#F7F2E7", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <AuthProvider>
          <Navbar />
          <main className="w-full flex justify-center">
            <div className="w-full max-w-md px-4 pb-10">{children}</div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}