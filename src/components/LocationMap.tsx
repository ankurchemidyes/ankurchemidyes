import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Clock,
  X,
  Sparkles,
} from "lucide-react";
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
    return {
      isOpen: false,
      label: "Closed",
    };
  }
}

export const LocationMap = () => {
  const [copied, setCopied] = useState(false);
  const [popupOpen, setPopupOpen] = useState(true);
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
          <button
            type="button"
            onClick={() => setPopupOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border/70 bg-surface-1/60 px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:border-primary/50 hover:bg-surface-2"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>{popupOpen ? "Hide Popup" : "Show Pin Popup"}</span>
          </button>
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

      {/* Interactive Map Container with Custom Branded Marker & Prominent Popup */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-border/70 bg-surface-2 shadow-inner">
        {/* Google Maps Base Iframe */}
        <iframe
          title="Ankur Chemidyes Location Map"
          src={embedMapUrl}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[360px] sm:h-[440px] md:h-[480px] w-full border-0"
        />

        {/* Custom Branded Map Marker & Popup Overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative flex flex-col items-center">
            {/* Prominent Marker Popup */}
            <AnimatePresence>
              {popupOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.94 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="pointer-events-auto absolute bottom-full mb-3.5 w-[285px] sm:w-[325px] rounded-2xl glass-strong p-4 shadow-xl border border-border/80 bg-background/95 backdrop-blur-md"
                >
                  {/* Close button */}
                  <button
                    type="button"
                    onClick={() => setPopupOpen(false)}
                    aria-label="Dismiss marker popup"
                    className="absolute top-3 right-3 grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>

                  {/* Header inside popup: Logo + Name */}
                  <div className="flex items-center gap-3 pr-5">
                    <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-primary p-0.5 shadow-glow">
                      <img
                        src={logo}
                        alt="Ankur Chemidyes Logo"
                        className="h-full w-full rounded-[10px] object-cover bg-white"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-display text-sm font-bold tracking-tight text-foreground truncate">
                          Ankur Chemidyes
                        </h4>
                        <Sparkles className="h-3 w-3 text-primary shrink-0" />
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        Premier Footwear Raw Materials
                      </p>
                    </div>
                  </div>

                  {/* Address & Status Pill */}
                  <div className="mt-3 space-y-1.5 border-t border-border/50 pt-2.5 text-[11px]">
                    <div className="flex items-start gap-1.5 text-muted-foreground leading-snug">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{ADDRESS_LINE}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          status.isOpen
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                            : "bg-muted text-muted-foreground border border-border/70"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            status.isOpen ? "bg-emerald-500" : "bg-muted-foreground/60"
                          }`}
                        />
                        {status.label}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {DEFAULT_COORDINATES}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action in Popup */}
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-primary py-2 text-xs font-semibold text-primary-foreground shadow-soft transition-all hover:shadow-glow"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Get Directions
                    </a>
                    <a
                      href={mapsSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 rounded-xl border border-border/80 bg-surface-1 py-2 px-3 text-xs font-medium text-foreground hover:bg-surface-2 transition-colors"
                      title="Open full Google Maps"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {/* Popup Arrow Tail */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 border-r border-b border-border/80 bg-background/95" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Custom Branded Map Marker Pin */}
            <button
              type="button"
              onClick={() => setPopupOpen((v) => !v)}
              title="Click to toggle Ankur Chemidyes details"
              aria-label="Ankur Chemidyes location pin"
              className="pointer-events-auto group relative flex flex-col items-center focus:outline-none"
            >
              {/* Radar pulse wave */}
              <span className="absolute -inset-2.5 rounded-full bg-primary/25 animate-ping pointer-events-none" />

              {/* Pin Shell */}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-primary p-0.5 shadow-glow transition-transform duration-300 group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-1 overflow-hidden p-0.5">
                  <img
                    src={logo}
                    alt="Ankur Chemidyes logo marker"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
              </div>

              {/* Pin Beak / Pointer Tail */}
              <div className="relative z-10 -mt-1 h-0 w-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-primary" />

              {/* Ground Shadow Ring */}
              <div className="mt-0.5 h-1.5 w-4 rounded-full bg-black/40 blur-[1px]" />
            </button>
          </div>
        </div>
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
