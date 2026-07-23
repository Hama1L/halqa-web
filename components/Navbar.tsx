"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/community", label: "Community" },
  { href: "/insights", label: "Insights" },
  { href: "/namaaz", label: "Namaaz Guide" },
  { href: "/prayer-times", label: "Namaaz Times" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <div className="sticky top-0 z-20 w-full flex justify-center" style={{ background: "#F7F2E7" }}>
      <div className="w-full max-w-md px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "'Amiri', serif", color: "#123832" }}
          >
            Halqa
          </h1>

          {!loading && (
            user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="text-xs font-medium"
                  style={{ color: "#123832" }}
                >
                  {user.displayName}
                </Link>
                <button
                  onClick={logout}
                  className="text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{ background: "#EDE7D8", color: "#4B4737" }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: "#123832", color: "#F7F2E7" }}
              >
                Log in
              </Link>
            )
          )}
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shrink-0"
                style={{
                  background: active ? "#123832" : "#EDE7D8",
                  color: active ? "#F7F2E7" : "#4B4737",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}