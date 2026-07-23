"use client";
import { useState, useCallback, useEffect, useRef } from "react";

import {
  MapPin, Navigation, Sunrise, Sun, CloudSun, Sunset, Moon,
  Compass, RefreshCw, AlertCircle,
} from "lucide-react";

// Each obligatory prayer, the Aladhan API key it maps to, an accent color
// (reusing the same palette as the rest of Halqa), an icon, and a short
// reflection on what makes that prayer meaningful.
const PRAYERS = [
  {
    key: "Fajr",
    label: "Fajr",
    icon: Sunrise,
    color: "#3D5A73",
    tint: "#EAEFF3",
    reflection: "The stillness before dawn — a reminder to begin the day anchored in Allah before anything else can claim your attention.",
  },
  {
    key: "Dhuhr",
    label: "Dhuhr",
    icon: Sun,
    color: "#B8933D",
    tint: "#FBF3E1",
    reflection: "A pause at the peak of the day's business, when the sun is highest and the world is loudest — a chance to return, even for a few minutes.",
  },
  {
    key: "Asr",
    label: "Asr",
    icon: CloudSun,
    color: "#5F7A63",
    tint: "#EEF3EE",
    reflection: "As the afternoon light begins to soften, a moment to check in on the day's choices while there's still time left to realign.",
  },
  {
    key: "Maghrib",
    label: "Maghrib",
    icon: Sunset,
    color: "#A8615A",
    tint: "#F7EBE9",
    reflection: "As the sun sets and the sky changes color right in front of you, a natural moment of gratitude for the day that has passed, however it went.",
  },
  {
    key: "Isha",
    label: "Isha",
    icon: Moon,
    color: "#6B5670",
    tint: "#F0EBF1",
    reflection: "The night's closing of accounts — proof to yourself that even after a long day, you made time to end it turned toward Allah before rest.",
  },
];

const CALC_METHOD = 1; // University of Islamic Sciences, Karachi — a common default for South Asia

function todayForAladhan() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

async function fetchQibla(lat : any , lon : any) {
  const res = await fetch(`https://api.aladhan.com/v1/qibla/${lat}/${lon}`);
  if (!res.ok) throw new Error("qibla fetch failed");
  const json = await res.json();
  return json.data.direction; // degrees from North, clockwise
}

async function fetchTimings(lat : any, lon : any) {
  const date = todayForAladhan();
  const res = await fetch(
    `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lon}&method=${CALC_METHOD}`
  );
  if (!res.ok) throw new Error("timings fetch failed");
  const json = await res.json();
  return json.data.timings;
}

function LatticeDivider() {
  return (
    <svg viewBox="0 0 200 8" className="w-full h-2 opacity-40" preserveAspectRatio="none">
      <defs>
        <pattern id="lattice2" width="16" height="8" patternUnits="userSpaceOnUse">
          <path d="M0 4 L4 0 L8 4 L4 8 Z" fill="none" stroke="#B8933D" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="200" height="8" fill="url(#lattice2)" />
    </svg>
  );
}

function LocationPrompt({
  onUseGeolocation,
  onUseManual,
  locating,
  error,
}: {
  onUseGeolocation: () => void;
  onUseManual: (lat: number, lon: number) => void;
  locating: boolean;
  error: string | null;
}) {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [showManual, setShowManual] = useState(false);

  return (
    <div className="rounded-xl p-5" style={{ background: "#FFFCF5", border: "1px solid #EAE3D3" }}>
      <div className="flex items-center gap-2 mb-2">
        <MapPin size={18} color="#123832" />
        <span className="text-sm font-semibold" style={{ color: "#1E2521" }}>Where are you?</span>
      </div>
      <p className="text-xs mb-4" style={{ color: "#9C9483" }}>
        Needed to calculate today's prayer times and the Qibla direction for your location.
      </p>

      {error && (
        <div className="flex items-start gap-2 mb-3 text-xs rounded-lg p-2.5" style={{ background: "#F7EBE9", color: "#A8615A" }}>
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={onUseGeolocation}
        disabled={locating}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium px-4 py-2.5 rounded-full mb-2"
        style={{ background: "#123832", color: "#F7F2E7", opacity: locating ? 0.7 : 1 }}
      >
        <Navigation size={15} />
        {locating ? "Locating…" : "Use my current location"}
      </button>

      <button
        onClick={() => setShowManual((s) => !s)}
        className="w-full text-xs font-medium py-2"
        style={{ color: "#123832" }}
      >
        {showManual ? "Hide manual entry" : "Enter coordinates manually instead"}
      </button>

      {showManual && (
        <div className="flex flex-col gap-2 mt-2">
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude (e.g. 24.8607)"
            inputMode="decimal"
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ background: "#F7F2E7", border: "1px solid #DCD3BC", color: "#1E2521" }}
          />
          <input
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="Longitude (e.g. 67.0011)"
            inputMode="decimal"
            className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none"
            style={{ background: "#F7F2E7", border: "1px solid #DCD3BC", color: "#1E2521" }}
          />
          <button
            onClick={() => {
              const la = parseFloat(lat);
              const lo = parseFloat(lon);
              if (!isNaN(la) && !isNaN(lo)) onUseManual(la, lo);
            }}
            disabled={!lat || !lon}
            className="w-full text-sm font-medium px-4 py-2.5 rounded-full"
            style={{ background: "#EDE7D8", color: "#4B4737" }}
          >
            Use these coordinates
          </button>
        </div>
      )}
    </div>
  );
}

// A small stylized Kaaba icon built purely from CSS shapes — no external image,
// so no licensing concerns and it stays crisp at any size.
function KaabaIcon({ size = 16 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background: "#1A1A1A",
        borderRadius: 2,
        position: "relative",
        boxShadow: "0 1px 3px rgba(0,0,0,0.5)",
        border: "1px solid #000",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: size * 0.32,
          height: Math.max(1.5, size * 0.14),
          background: "linear-gradient(90deg, #D9C98A, #B8933D, #D9C98A)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: size * 0.15,
          top: size * 0.32,
          width: Math.max(1, size * 0.08),
          height: size * 0.6,
          background: "#D9C98A",
          opacity: 0.7,
        }}
      />
    </div>
  );
}

function useDeviceHeading() {
  const [heading, setHeading] = useState<number | null>(null);
  const [status, setStatus] = useState("off"); // off | requesting | on | denied | unsupported
  const listenerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let h;
    const compassHeading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
    if (typeof compassHeading === "number") {
      h = compassHeading; // iOS: already a true compass heading
    } else if (typeof e.alpha === "number") {
      h = 360 - e.alpha; // Android absolute orientation, approximated
    }
    if (typeof h === "number" && !isNaN(h)) setHeading(h);
  }, []);

  const enable = useCallback(async () => {
    if (typeof DeviceOrientationEvent === "undefined") {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");

    // iOS 13+ requires an explicit user-gesture permission request
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      try {
        const result = await (DeviceOrientationEvent as any).requestPermission();
        if (result !== "granted") {
          setStatus("denied");
          return;
        }
      } catch {
        setStatus("denied");
        return;
      }
    }

    const eventName = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    listenerRef.current = handleOrientation;
    window.addEventListener(eventName, handleOrientation, true);
    setStatus("on");
  }, [handleOrientation]);

  const disable = useCallback(() => {
    const eventName = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    if (listenerRef.current) window.removeEventListener(eventName, listenerRef.current, true);
    listenerRef.current = null;
    setHeading(null);
    setStatus("off");
  }, []);

  useEffect(() => () => disable(), [disable]);

  return { heading, status, enable, disable };
}

function QiblaCompass({ degrees }: { degrees: number }) {
  const { heading, status, enable, disable } = useDeviceHeading();
  const isLive = status === "on" && heading != null;
  // The ring (labels + ticks) rotates opposite to heading so "up" always shows
  // the direction the phone currently faces. The needle sits inside that ring
  // and only needs a constant `degrees` rotation — the ring's own rotation
  // combines with it automatically, so together they always point at the
  // true Qibla bearing regardless of which way the phone is turned.
  const ringRotation = isLive ? -heading : 0;

  const cardinals = [
    { label: "N", angle: 0, bold: true },
    { label: "E", angle: 90 },
    { label: "S", angle: 180 },
    { label: "W", angle: 270 },
  ];

  return (
    <div className="rounded-xl p-5 mb-4" style={{ background: "#123832" }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <Compass size={14} color="#D9C98A" />
          <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#D9C98A" }}>Qibla direction</span>
        </div>
        {isLive && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "#1B4A40", color: "#8FD9BE" }}>
            ● live · facing {Math.round(heading)}°
          </span>
        )}
      </div>

      <div className="flex items-center gap-5">
        <div className="relative shrink-0" style={{ width: 108, height: 108 }}>
          {/* Dial face (does not rotate — only its contents do) */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 35% 30%, #1B4A40, #0D2B25 75%)",
              border: "1.5px solid #3A5C53",
              boxShadow: "inset 0 0 12px rgba(0,0,0,0.35)",
            }}
          />

          {/* Fixed marker showing where the top of the phone points */}
          <div
            className="absolute left-1/2"
            style={{ top: -3, width: 0, height: 0, transform: "translateX(-50%)", borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderBottom: "5px solid #D9C98A" }}
          />

          {/* Rotating ring: tick marks + N/E/S/W labels + needle, all together */}
          <div
            className="absolute inset-0"
            style={{ transform: `rotate(${ringRotation}deg)`, transition: "transform 0.15s linear" }}
          >
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <div
                key={deg}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: 1.5,
                  height: deg % 90 === 0 ? 8 : 5,
                  background: "#3A5C53",
                  transformOrigin: "50% 0",
                  transform: `translate(-50%, 0) rotate(${deg}deg)`,
                  marginTop: -52,
                }}
              />
            ))}

            {cardinals.map(({ label, angle, bold }) => (
              <span
                key={label}
                className="absolute left-1/2 top-1/2 text-[10px]"
                style={{
                  fontWeight: bold ? 600 : 400,
                  color: bold ? "#D9C98A" : "#9FB3AC",
                  // rotate to the label's position, push it out from center,
                  // then rotate back so the letter itself stays upright
                  transform: `rotate(${angle}deg) translateY(-44px) rotate(${-angle}deg) translate(-50%, -50%)`,
                }}
              >
                {label}
              </span>
            ))}

            {/* Needle: constant qibla rotation, combines with the ring's own rotation above */}
            <div
              className="absolute inset-0"
              style={{ transform: `rotate(${degrees}deg)` }}
            >
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  width: 2,
                  height: 46,
                  background: "linear-gradient(to top, #D9C98A00, #D9C98A)",
                  transform: "translate(-50%, -100%)",
                }}
              />
              {/* Positioned by fixed pixel distance from center so it clears the
                  54px dial radius and sits fully outside the ring, not inside it */}
              <div
                className="absolute left-1/2 top-1/2"
                style={{ transform: "translate(-50%, -50%) translateY(-62px)" }}
              >
                <KaabaIcon size={12} />
              </div>
            </div>
          </div>

          {/* Center pivot dot, drawn last so it sits above the needle base */}
          <div
            className="absolute rounded-full"
            style={{
              width: 7, height: 7, background: "#D9C98A",
              left: "50%", top: "50%", transform: "translate(-50%, -50%)",
              boxShadow: "0 0 4px rgba(217,201,138,0.8)",
            }}
          />
        </div>

        <div>
          <p className="text-2xl font-bold mb-1" style={{ color: "#F7F2E7" }}>{degrees.toFixed(1)}°</p>
          <p className="text-xs mb-2" style={{ color: "#9FB3AC" }}>from true North, clockwise</p>

          {status === "off" && (
            <button
              onClick={enable}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={{ background: "#D9C98A", color: "#123832" }}
            >
              Enable live compass
            </button>
          )}
          {status === "requesting" && <p className="text-[11px]" style={{ color: "#9FB3AC" }}>Requesting permission…</p>}
          {status === "on" && (
            <button
              onClick={disable}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={{ background: "#22493F", color: "#8FD9BE" }}
            >
              Turn off live compass
            </button>
          )}
          {status === "denied" && (
            <p className="text-[11px]" style={{ color: "#E0A9A2" }}>Motion permission denied — the needle will stay in flat/North-up mode.</p>
          )}
          {status === "unsupported" && (
            <p className="text-[11px]" style={{ color: "#9FB3AC" }}>Your device/browser doesn't expose a compass sensor — flat/North-up mode only.</p>
          )}
          {!isLive && status !== "denied" && status !== "unsupported" && status !== "requesting" && (
            <p className="text-[11px] mt-2" style={{ color: "#7C9089" }}>
              Right now this assumes your phone is flat with North at the top of the screen.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type PrayerCardProps = {
  prayer: {
    icon: typeof Sunrise;
    color: string;
    label: string;
    reflection: string;
  };
  time: string;
};

function PrayerCard({ prayer, time }: PrayerCardProps) {
  const Icon = prayer.icon;
  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{ background: "#FFFCF5", border: `1px solid ${prayer.color}33`, borderLeft: `3px solid ${prayer.color}` }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={16} color={prayer.color} />
          <span className="text-sm font-semibold" style={{ color: "#1E2521" }}>{prayer.label}</span>
        </div>
        <span className="text-sm font-bold" style={{ color: prayer.color }}>{time}</span>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "#7A7364" }}>{prayer.reflection}</p>
    </div>
  );
}

export default function PrayerTimes() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [qibla, setQibla] = useState(null);
  const [timings, setTimings] = useState(null);
  const [dataError, setDataError] = useState("");
  const [loadingData, setLoadingData] = useState(false);

  const loadData = useCallback(async (lat :any, lon : any) => {
    setLoadingData(true);
    setDataError("");
    try {
      const [q, t] = await Promise.all([fetchQibla(lat, lon), fetchTimings(lat, lon)]);
      setQibla(q);
      setTimings(t);
    } catch {
      setDataError("Couldn't reach the prayer times service. Check your connection and try again.");
    } finally {
      setLoadingData(false);
    }
  }, []);

  const useGeolocation = () => {
    setLocError("");
    if (!navigator.geolocation) {
      setLocError("Geolocation isn't available in this browser — try entering coordinates manually.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        loadData(latitude, longitude);
      },
      (err) => {
        setLocating(false);
        setLocError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied — enter coordinates manually instead."
            : "Couldn't get your location — enter coordinates manually instead."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const useManual = (lat : number, lon : number) => {
    setLocError("");
    setCoords({ lat, lon });
    loadData(lat, lon);
  };

  const refresh = () => coords && loadData(coords.lat, coords.lon);

  return (
    <div className="min-h-screen w-full flex justify-center" style={{ background: "#F7F2E7" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      <div className="w-full max-w-md" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="sticky top-0 z-10 px-4 pt-5 pb-3" style={{ background: "#F7F2E7" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold" style={{ fontFamily: "'Amiri', serif", color: "#123832" }}>Namaaz Times</h1>
              <span className="text-xs mt-1" style={{ color: "#9C9483" }}>& Qibla</span>
            </div>
            
          </div>
          <div className="mt-3"><LatticeDivider /></div>
        </div>

        <div className="px-4 pb-10">
          {!coords && (
            <LocationPrompt
              onUseGeolocation={useGeolocation}
              onUseManual={useManual}
              locating={locating}
              error={locError}
            />
          )}

          {coords && loadingData && (
            <>
              <div className="rounded-xl p-5 mb-4 animate-pulse" style={{ background: "#EFE9DB", height: 150 }} />
              <div className="rounded-xl p-5 animate-pulse" style={{ background: "#EFE9DB", height: 300 }} />
            </>
          )}

          {coords && !loadingData && dataError && (
            <div className="rounded-xl p-5" style={{ background: "#F7EBE9" }}>
              <div className="flex items-start gap-2 text-sm mb-3" style={{ color: "#A8615A" }}>
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{dataError}</span>
              </div>
              <button
                onClick={refresh}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: "#123832", color: "#F7F2E7" }}
              >
                <RefreshCw size={12} /> Try again
              </button>
            </div>
          )}

          {coords && !loadingData && !dataError && qibla != null && timings && (
            <>
              <QiblaCompass degrees={qibla} />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: "#9C9483" }}>
                  Today's prayers
                </span>
                <button onClick={refresh} className="flex items-center gap-1 text-[11px]" style={{ color: "#123832" }}>
                  <RefreshCw size={11} /> Refresh
                </button>
              </div>
              {PRAYERS.map((p) => (
                <PrayerCard key={p.key} prayer={p} time={timings[p.key]} />
              ))}
              <p className="text-[11px] text-center mt-2" style={{ color: "#9C9483" }}>
                Calculation method: University of Islamic Sciences, Karachi
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}