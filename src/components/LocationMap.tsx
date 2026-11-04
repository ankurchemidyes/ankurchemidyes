import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, ExternalLink, Copy, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

interface BusinessStatus {
  isOpen: boolean;
  label: string;
}

const DEFAULT_LOCATION = "Ankur Chemidyes, Nallalam, Kozhikode";
const DEFAULT_COORDINATES = "11.2185° N, 75.8034° E";
const RAW_COORDS = "11.2185,75.8034";
const ADDRESS_LINE = "Modern, Kolathara Rd, near Krishi Bhavan, Nallalam, Kozhikode, Kerala 673655";

/**
 * Calculates current business status according to Indian Standard Time (IST, UTC+5:30)
 * Mon-Sat, 9:00 AM – 6:00 PM IST
 */
function getISTBusinessStatus(): BusinessStatus {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });

    const parts = formatter.formatToParts(new Date());
    const weekday = parts.find((p) => p.type === "weekday")?.value;
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);

    const isSunday = weekday === "Sun";
    const currentMinutes = hour * 60 + minute;
    const openMinutes = 9 * 60; // 9:00 AM (540 min)
    const closeMinutes = 18 * 60; // 6:00 PM (1080 min)

    const isOpen = !isSunday && currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    return {
      isOpen,
      label: isOpen ? "Open • Closes at 6:00 PM" : "Closed",
    };
  } catch {
    // Fallback if Intl.DateTimeFormat with timeZone is unsupported
    return {
      isOpen: false,
      label: "Closed",
    };
  }
}

export const LocationMap = () => {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<BusinessStatus>(() => getISTBusinessStatus());

  useEffect(() => {
    // Update status on mount and refresh every minute
    const update = () => setStatus(getISTBusinessStatus());
    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyCoordinates = async () => {
    try {
      await navigator.clipboard.writeText(DEFAULT_COORDINATES);
      setCopied(true);
      toast.success("Coordinates copied to clipboard", {
        description: DEFAULT_COORDINATES,
      });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Failed to copy coordinates");
    }
  };

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(RAW_COORDS)}`;
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RAW_COORDS)}`;
  const embedMapUrl = `https://www.google.com/maps?q=${encodeURIComponent(RAW_COORDS)}&hl=en&z=15&output=embed`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="glass-strong rounded-3xl p-6 sm:p-8 shadow-deep relative overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute -top-24 -left-24 h-56 w-56 rounded-full bg-gradient-primary opacity-10 blur-3xl pointer-events-none"
      />

      {/* Header: Company Logo, Name, Location & Dynamic IST Business Hours Badge */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <img
            src={logo}
            alt="Ankur Chemidyes logo"
            width={44}
            height={44}
            className="h-11 w-11 rounded-xl shadow-elevated shrink-0 border border-border/50"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-bold tracking-tight">Ankur Chemidyes</h3>
              <span className="hidden sm:inline-block rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                Headquarters
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{DEFAULT_LOCATION}</span>
            </p>
          </div>
        </div>

        {/* Dynamic IST Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              status.isOpen
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "bg-muted/80 text-muted-foreground border border-border/80"
            }`}
          >
            <span className="relative flex h-2 w-2">
              {status.isOpen && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  status.isOpen ? "bg-emerald-500" : "bg-muted-foreground/60"
                }`}
              />
            </span>
            <span className="tracking-wide font-medium">{status.label}</span>
          </div>
        </div>
      </div>

      {/* Meta Bar: Coordinates & Navigation Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-4 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyCoordinates}
            title="Click to copy coordinates"
            className="group inline-flex items-center gap-2 rounded-xl border border-border/70 bg-surface-1/60 px-3 py-1.5 font-mono text-xs text-foreground transition-all hover:border-primary/50 hover:bg-surface-2"
          >
            <span className="text-muted-foreground group-hover:text-primary transition-colors">Coord:</span>
            <span className="font-semibold">{DEFAULT_COORDINATES}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:scale-110" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-glow"
          >
            <Navigation className="h-3.5 w-3.5" />
            Get Directions
          </a>
          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open location in Google Maps"
            title="Open in Google Maps"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface-1/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:text-foreground hover:bg-surface-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Maps
          </a>
        </div>
      </div>

      {/* Interactive Google Maps Embed */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-border/70 bg-surface-2 shadow-inner">
        <iframe
          title="Ankur Chemidyes Location Map"
          src={embedMapUrl}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[300px] sm:h-[380px] md:h-[420px] w-full border-0"
        />
      </div>

      {/* Bottom Information Footer */}
      <div className="mt-4 flex flex-col gap-2 pt-3 border-t border-border/50 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="truncate">{ADDRESS_LINE}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
          <span>Hours: Mon–Sat 9:00 AM – 6:00 PM IST</span>
        </div>
      </div>
    </motion.div>
  );
};
