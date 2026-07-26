import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import "./globals.css";

const svgIcon = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='12' fill='%231A1A1A'/><rect y='30' width='100' height='15' fill='%23D9C98A'/><rect x='20' y='45' width='15' height='55' fill='%23D9C98A'/></svg>`;
export const metadata: Metadata = {
  title: "Halqa — a circle for reflection",
  description: "Find solace in Quranic wisdom and community reflections.",
  icons: {
    icon: [
      {
        url: svgIcon,
        type: "image/svg+xml",
      },
    ],
    // Optional: Keep apple-touch-icon as PNG if you have one, as iOS Home Screen bookmarks prefer physical PNG files
    apple: "/apple-touch-icon.png", 
  },
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