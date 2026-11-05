export const YOUTUBE_CHANNEL_ID = "UCuG7-r1F3b2RzGoRFIe0MnQ";
export const FEATURED_VIDEO = {
  id: "featured-gxpAlDUWIOQ",
  youtube_video_id: "gxpAlDUWIOQ",
  title: "Abhiyukth Vlogs — Featured video",
  description: null,
};

export function extractVideoId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (!["https:", "http:"].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.slice(1).match(/^[A-Za-z0-9_-]{11}$/)?.[0] ?? null;
    if (host !== "youtube.com" && host !== "m.youtube.com") return null;
    const candidate = url.pathname === "/watch" ? url.searchParams.get("v") : url.pathname.match(/^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{11})\/?$/)?.[1];
    return candidate?.match(/^[A-Za-z0-9_-]{11}$/)?.[0] ?? null;
  } catch {
    return null;
  }
}
