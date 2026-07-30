"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CSSProperties } from "react";

type NavLink = {
  href: string;
  label: string;
  gif?: string;
  assetStyle?: CSSProperties;
};

const LINKS: NavLink[] = [
  { href: "/", label: "Home", gif: "/Cat_Home.gif" },
  { href: "/quran", label: "Qur'an", gif: "/turtlee.gif", assetStyle: { position: "absolute", top: -45, left: "50%", width: 60, zIndex: 10, transition: "opacity 0.2s ease" } },
  { href: "/community", label: "Community", gif: "/panda.gif", assetStyle: { position: "absolute", top: -24, left: "50%", width: 30, zIndex: 10, transition: "opacity 0.2s ease" } },
  { href: "/insights", label: "Insights", gif: "/snail.gif", assetStyle: { position: "absolute", top: -60, left: "60%", width: 60, zIndex: 10, transition: "opacity 0.2s ease" } },
  { href: "/namaaz", label: "Namaaz Guide", gif: "/white_fox.gif", assetStyle: { position: "absolute", top: -31, left: "50%", width: 40, zIndex: 10, transition: "opacity 0.2s ease" } },
  { href: "/prayer-times", label: "Namaaz Times", gif: "/red_fox.gif", assetStyle: { position: "absolute", top: -31, left: "50%", width: 40, zIndex: 10, transition: "opacity 0.2s ease" } },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();

  return (
    <div className="sticky top-0 z-20 w-full flex justify-center" style={{ background: "#F7F2E7", position: "relative", boxShadow: "0px 4px 2px rgba(0,0,0,0.06)" }}>
      <div className="w-full max-w-md px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          
          {/* --- WRAPPER ADDED HERE --- */}
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'Amiri', serif", color: "#123832", paddingRight: "5px" }} // Added slight padding
            >
              Halqa
            </h1>
            <img 
              src="/pixel_leaves.gif" 
              alt="Leaves" 
              className="pointer-events-none"
              style={{ 
                position: "absolute",
                top: -5,    
                right: -24,  // Pushed exactly right of the text
                width: 36,   
                zIndex: 10,
                filter: "drop-shadow(0px 4px 2px rgba(0,0,0,0.06))" 
              }} 
            />
            <img 
              src="/horse_black.gif" 
              alt="fox" 
              className="pointer-events-none"
              style={{ 
                position: "absolute",
                top: 10,    
                right: -20,  // Pushed just right of the leaves
                width: 20,   
                zIndex: 10,
                filter: "drop-shadow(0px 4px 2px rgba(0,0,0,0.06))" 
              }} 
            />
          </div>
          {/* --- WRAPPER ENDS HERE --- */}

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
                  className="text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
                  style={{ background: "#EDE7D8", color: "#4B4737" }}
                >
                  Log out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-medium px-3 py-1.5 rounded-full transition-opacity hover:opacity-90"
                style={{ background: "#123832", color: "#F7F2E7" }}
              >
                Log in
              </Link>
            )
          )}
        </div>

        <nav className="flex gap-2 overflow-x-auto pt-6 pb-2 -mx-1 px-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-transform hover:scale-[1.02]"
                style={{
                  background: active ? "#123832" : "#EDE7D8",
                  color: active ? "#F7F2E7" : "#4B4737",
                }}
              >
                {link.gif && (
                  <img
                    src={link.gif}
                    alt=""
                    className="pointer-events-none"
                    style={{
                      position: "absolute",
                      top: -24,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 40,
                      zIndex: 10,
                      transition: "opacity 0.2s ease",
                      ...link.assetStyle, 
                    }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}