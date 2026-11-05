import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

// Restrict this public endpoint to the site's channel so it cannot proxy arbitrary queries.
const CHANNEL_ID = "UCuG7-r1F3b2RzGoRFIe0MnQ";
const CACHE_MS = 5 * 60 * 1000;
let cached: { data: Record<string, unknown>; expires: number } | null = null;
let pending: Promise<Record<string, unknown>> | null = null;

async function fetchStats(apiKey: string) {
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/channels");
  endpoint.searchParams.set("part", "statistics");
  endpoint.searchParams.set("id", CHANNEL_ID);
  endpoint.searchParams.set("key", apiKey);
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error(`YouTube returned ${response.status}`);
  const payload = await response.json();
  const statistics = payload.items?.[0]?.statistics;
  if (!statistics) throw new Error("Channel statistics not found");
  const count = (value: unknown) => {
    const parsed = Number(value);
    return value !== undefined && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  };
  const data = {
    subscriberCount: statistics.hiddenSubscriberCount ? null : count(statistics.subscriberCount),
    viewCount: count(statistics.viewCount),
    videoCount: count(statistics.videoCount),
    fetchedAt: new Date().toISOString(),
  };
  if (data.viewCount === null || data.videoCount === null) throw new Error("Incomplete statistics");
  cached = { data, expires: Date.now() + CACHE_MS };
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);
  let body;
  try { body = await req.json(); }
  catch { return json({ error: "Invalid request." }, 400); }
  if (body?.channelId !== CHANNEL_ID) return json({ error: "Channel not supported." }, 400);
  const apiKey = Deno.env.get("YOUTUBE_DATA_API_KEY");
  if (!apiKey) return json({ error: "YouTube statistics are not configured." }, 503);
  try {
    if (cached && cached.expires > Date.now()) return json(cached.data);
    if (!pending) pending = fetchStats(apiKey).finally(() => { pending = null; });
    return json(await pending);
  } catch {
    // Do not log the API key, upstream request URL, or response bodies.
    return json({ error: "YouTube statistics are temporarily unavailable." }, 502);
  }
});

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
