import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YOUTUBE_CHANNEL_ID } from "@/lib/youtube";

type GoogleWindow = Window & { gapi?: { ytsubscribe?: { go: (container: HTMLElement) => void } } };

export function YouTubeSubscribe() {
  const container = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    setUnavailable(false);
    const widget = document.createElement("div");
    widget.className = "g-ytsubscribe";
    widget.dataset.channelid = YOUTUBE_CHANNEL_ID;
    widget.dataset.layout = "full";
    widget.dataset.count = "default";
    widget.dataset.theme = resolvedTheme === "dark" ? "dark" : "default";
    root.replaceChildren(widget);
    const render = () => (window as GoogleWindow).gapi?.ytsubscribe?.go(root);
    const fail = () => setUnavailable(true);
    let script = document.querySelector<HTMLScriptElement>('script[src="https://apis.google.com/js/platform.js"]');
    const isNew = !script;
    if (!script) {
      script = document.createElement("script");
      script.src = "https://apis.google.com/js/platform.js";
      script.async = true;
      script.id = "youtube-platform-script";
    }
    script.addEventListener("load", render);
    script.addEventListener("error", fail);
    if (isNew) document.head.appendChild(script);
    else render();
    const timeout = window.setTimeout(() => {
      if (!root.querySelector("iframe")) setUnavailable(true);
    }, 10000);
    return () => {
      window.clearTimeout(timeout);
      script.removeEventListener("load", render);
      script.removeEventListener("error", fail);
      root.replaceChildren();
    };
  }, [resolvedTheme]);
  return <div>
    <div ref={container} className="min-h-12" aria-label="Subscribe to Abhiyukth Vlogs" />
    {unavailable && <p role="status" className="mt-3 text-xs text-muted-foreground">The YouTube widget could not load. You can subscribe using the link below.</p>}
    <Button asChild variant="outline" className="mt-4 w-full">
      <a href={`https://www.youtube.com/channel/${YOUTUBE_CHANNEL_ID}?sub_confirmation=1`} target="_blank" rel="noopener noreferrer">
        Subscribe on YouTube <ExternalLink className="h-4 w-4" aria-hidden="true" />
      </a>
    </Button>
  </div>;
}
