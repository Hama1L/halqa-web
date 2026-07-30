"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { CSSProperties } from "react";

type NavLink = {
  href: string;
  label: string;
  gif?: string;
  assetStyle?: CSSProperties; // <-- This is the magic line that fixes the error!
};
// 1. Add your GIF paths here. 
// You can leave it completely empty (or remove the property) if a button shouldn't have one.
const LINKS : NavLink[] = [
  { href: "/", label: "Home", gif: "/Cat_Home.gif" },
  { href: "/quran", label: "Qur'an", gif: "/turtlee.gif",assetStyle : { position : "absolute" , top : -45 , left : "50%" , width : 60 , zIndex: 10 , transition : "opacity 0.2s ease" } },
  { href: "/community", label: "Community", gif: "/panda.gif",assetStyle : { position : "absolute" , top : -24 , left : "50%" , width : 30 , zIndex: 10 , transition : "opacity 0.2s ease" } },
  { href: "/insights", label: "Insights", gif: "/snail.gif" , assetStyle : { position : "absolute" , top : -60 , left : "60%" , width : 60 , zIndex: 10 , transition : "opacity 0.2s ease" } },
  { href: "/namaaz", label: "Namaaz Guide", gif: "/white_fox.gif", assetStyle : { position : "absolute" , top : -31 , left : "50%" , width : 40 , zIndex: 10 , transition : "opacity 0.2s ease" } },
  { href: "/prayer-times", label: "Namaaz Times" ,gif: "/red_fox.gif" ,assetStyle : { position : "absolute" , top : -31 , left : "50%" , width : 40 , zIndex: 10 , transition : "opacity 0.2s ease" } }, // No GIF here as an example
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
          <img 
        src="/pixel_leaves.gif" 
        alt="Leaves" 
        className="pointer-events-none"
        style={{ 
          position: "relative",
          top: -5,    // Adjust to perch it perfectly on the header
          left: -76,  // Placed just to the left of the "Ask something" button
          width: 36,   // Adjust based on your GIF's actual size
          zIndex: 10,
          filter: "drop-shadow(0px 4px 2px rgba(0,0,0,0.06))" // Optional cozy shadow
        }} 
      />
      <img 
        src="/horse_black.gif" 
        alt="fox" 
        className="pointer-events-none"
        style={{ 
          position: "relative",
          top: 1,    // Adjust to perch it perfectly on the header
          left: -180,  // Placed just to the left of the "Ask something" button
          width: 20,   // Adjust based on your GIF's actual size
          zIndex: 10,
          filter: "drop-shadow(0px 4px 2px rgba(0,0,0,0.06))" // Optional cozy shadow
        }} 
      />

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

        {/* 2. Added pt-6 (padding-top) so the perched GIFs don't clip outside the scroll container */}
        <nav className="flex gap-2 overflow-x-auto pt-6 pb-2 -mx-1 px-1">
          {LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                // Added relative so the absolute GIF anchors to the pill
                className="relative text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition-transform hover:scale-[1.02]"
                style={{
                  background: active ? "#123832" : "#EDE7D8",
                  color: active ? "#F7F2E7" : "#4B4737",
                }}
              >
                {/* 3. Render the GIF if it exists for this link */}
                {link.gif && (
                  <img
                    src={link.gif}
                    alt=""
                    className="pointer-events-none"
                    style={{
                      position: "absolute",
                      top: -24, // Pushes it right above the pill
                      left: "50%",
                      transform: "translateX(-50%)", // Perfectly centers it regardless of word length
                      width: 40, // Keep it small so the navbar doesn't feel cluttered
                      zIndex: 10,
                      // Optional: If you only want the GIF to show on the ACTIVE tab, uncomment the line below:
                      // opacity: active ? 1 : 0, 
                      transition: "opacity 0.2s ease",
                      ...link.assetStyle, // Allow for custom styles per link if needed
                      
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