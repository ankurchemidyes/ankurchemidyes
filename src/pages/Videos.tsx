import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, Eye, Plus, Users, Youtube } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

import { YOUTUBE_CHANNEL_ID, FEATURED_VIDEO } from "@/lib/youtube";
import { YouTubeSubscribe } from "@/components/videos/YouTubeSubscribe";
import { AddVideoForm } from "@/components/videos/AddVideoForm";
import { useVideoAdmin } from "@/hooks/use-video-admin";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
const CHANNEL_NAME = "Abhiyukth Vlogs";

type Video = {
  id: string;
  youtube_video_id: string;
  title: string;
  description: string | null;
};

type ChannelStats = {
  subscriberCount: number | null;
  fetchedAt: string;
  viewCount: number;
  videoCount: number;
};

export default function Videos() {
  const prefersReducedMotion = useReducedMotion();
  const [videos, setVideos] = useState<Video[]>([FEATURED_VIDEO]);
  const [stats, setStats] = useState<ChannelStats | null>(null);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const { userId, isAdmin, checking } = useVideoAdmin();
  const [addOpen, setAddOpen] = useState(false);
  const [galleryVersion, setGalleryVersion] = useState(0);
  const [videosError, setVideosError] = useState(false);

  useEffect(() => { if (!isAdmin) setAddOpen(false); }, [isAdmin]);

  useEffect(() => {
    let active = true;

    const loadVideos = async () => {
      try {
        const { data, error } = await supabase
          .from("videos")
          .select("id, youtube_video_id, title, description")
          .eq("published", true)
          .order("created_at", { ascending: false });

        if (active) {
          setVideosError(!!error);
          if (!error && data) setVideos([FEATURED_VIDEO, ...data.filter(video => video.youtube_video_id !== FEATURED_VIDEO.youtube_video_id)]);
        }
      } catch { if (active) setVideosError(true); }
      finally { if (active) setLoadingVideos(false); }
    };

    void loadVideos();
    return () => {
      active = false;
    };
  }, [galleryVersion]);

  useEffect(() => {
    let active = true;
    setLoadingStats(true);

    let inFlight = false;
    const loadStats = async () => {
      if (inFlight || document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        const { data, error } = await supabase.functions.invoke("youtube-stats", { body: { channelId: YOUTUBE_CHANNEL_ID } });
        if (!active) return;
        if (error || !data || data.error) throw new Error("Statistics unavailable");
        setStats(data as ChannelStats);
        setStatsError(null);
      } catch {
        if (active) setStatsError("Live statistics are temporarily unavailable. Any displayed counts are from the last update.");
      } finally {
        inFlight = false;
        if (active) setLoadingStats(false);
      }
    };
    void loadStats();
    const interval = window.setInterval(() => void loadStats(), 300000);
    return () => { active = false; window.clearInterval(interval); };
  }, []);

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <Navbar />
      <main className="video-page relative isolate overflow-hidden pt-28 pb-20">
        <div className="video-light video-light-one" aria-hidden="true" />
        <div className="video-light video-light-two" aria-hidden="true" />
        <div className="container relative z-10">
          <motion.section
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-5xl text-center"
            aria-labelledby="videos-title"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">Abhiyukth Vlogs</p>
            <h1 id="videos-title" className="font-display text-4xl font-bold tracking-tight md:text-6xl">
              Stories in motion.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
              Watch the latest videos, follow the journey, and stay connected with the channel.
            </p>
          </motion.section>

          <section className="mx-auto mt-12 max-w-5xl" aria-labelledby="channel-stats-title">
            <div className="sr-only" id="channel-stats-title">Channel statistics and subscription</div>
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="video-stats-panel glass-strong rounded-3xl p-6 shadow-deep md:p-8">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-primary">Live channel pulse</p>
                    <h2 className="mt-1 font-display text-2xl font-semibold">{CHANNEL_NAME}</h2>
                  </div>
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                    <BarChart3 className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FlipMetric
                    icon={<Users className="h-4 w-4" aria-hidden="true" />}
                    label="Subscribers"
                    value={stats?.subscriberCount ?? null}
                    loading={loadingStats}
                  />
                  <FlipMetric
                    icon={<Eye className="h-4 w-4" aria-hidden="true" />}
                    label="Total views"
                    value={stats?.viewCount ?? null}
                    loading={loadingStats}
                  />
                </div>
                <p className="mt-5 text-sm text-muted-foreground" role={statsError ? "status" : undefined}>
                  {statsError ?? (stats ? `${stats.videoCount.toLocaleString()} videos · Updated ${new Date(stats.fetchedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.` : "Updating live channel data…")}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">Refreshes every 5 minutes. Subscriber counts are rounded by YouTube; hidden counts display —.</p>
              </div>

              <div className="video-subscribe-panel glass rounded-3xl p-6 shadow-floating md:p-8">
                <div className="flex h-full flex-col justify-between gap-8">
                  <div>
                    <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-destructive text-destructive-foreground shadow-elevated">
                      <Youtube className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h2 className="font-display text-2xl font-semibold">Join the channel</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">Use the official YouTube button below. YouTube may open a sign-in or confirmation window.</p>
                  </div>
                  <YouTubeSubscribe />
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto mt-20 max-w-6xl" aria-labelledby="gallery-title">
            <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Video gallery</p>
                <h2 id="gallery-title" className="mt-2 font-display text-3xl font-semibold md:text-4xl">Watch the latest</h2>
              </div>
              <p className="max-w-md text-sm text-muted-foreground sm:text-right">Watch with the official YouTube player. YouTube validates and counts eligible views.</p>
            </div>

            {!checking && isAdmin && userId && (
              <div className="mb-6">
                <Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" aria-hidden="true" />Add Video</Button>
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Add a video</DialogTitle><DialogDescription>Paste a YouTube link to publish it in the gallery.</DialogDescription></DialogHeader>
                    <AddVideoForm userId={userId} onAdded={() => { setAddOpen(false); setGalleryVersion(version => version + 1); }} />
                  </DialogContent>
                </Dialog>
              </div>
            )}
            {loadingVideos && <p role="status" className="mb-4 text-sm text-muted-foreground">Loading more videos…</p>}
            {videosError && <div role="status" className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">More videos could not be loaded.<Button variant="outline" onClick={() => setGalleryVersion(version => version + 1)}>Try again</Button></div>}
              <div className="grid gap-6 md:grid-cols-2">
                {videos.map((video, index) => (
                  <motion.article
                    key={video.id}
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.55, delay: index * 0.06 }}
                    className="video-card glass-strong overflow-hidden rounded-3xl shadow-floating"
                  >
                    <div className="video-embed-wrap">
                      <iframe
                        src={`https://www.youtube.com/embed/${video.youtube_video_id}`}
                        title={video.title}
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-xl font-semibold">{video.title}</h3>
                      {video.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{video.description}</p>}
                    </div>
                  </motion.article>
                ))}
              </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function FlipMetric({ icon, label, value, loading }: { icon: React.ReactNode; label: string; value: number | null; loading: boolean }) {
  const reducedMotion = useReducedMotion();
  const formatted = value === null ? "—" : value.toLocaleString();
  return (
    <div className="video-metric rounded-2xl border border-border/60 bg-background/40 p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div>
      <motion.div
        key={formatted}
        initial={reducedMotion ? false : { rotateX: -90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 origin-bottom font-display text-[clamp(1.5rem,3vw,2.75rem)] font-bold tabular-nums text-gradient break-words"
        aria-live="polite"
      >
        {loading ? "…" : formatted}
      </motion.div>
    </div>
  );
}