import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, LogIn, ShieldCheck, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVideoAdmin } from "@/hooks/use-video-admin";
import { AddVideoForm } from "@/components/videos/AddVideoForm";
import { supabase } from "@/integrations/supabase/client";

type AdminVideo = { id: string; youtube_video_id: string; title: string; description: string | null };

export default function VideosAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { userId, isAdmin, checking } = useVideoAdmin();
  const [videos, setVideos] = useState<AdminVideo[]>([]);

  useEffect(() => {
    let active = true;
    setVideos([]);
    if (isAdmin && !checking) {
      void supabase.from("videos").select("id, youtube_video_id, title, description").order("created_at", { ascending: false }).then(({ data, error }) => {
        if (!active) return;
        if (error) toast.error("Could not load your videos.");
        else setVideos(data ?? []);
      });
    }
    return () => { active = false; };
  }, [isAdmin, checking, userId]);

  const loadVideos = async () => {
    const { data } = await supabase.from("videos").select("id, youtube_video_id, title, description").order("created_at", { ascending: false });
    setVideos(data ?? []);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) toast.error(error.message);
    else toast.success("Signed in. Checking admin access…");
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin || checking || !userId) return;
    const { error } = await supabase.from("videos").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Video removed.");
      await loadVideos();
    }
  };

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <main className="video-admin-page relative isolate min-h-[calc(100dvh-108px)] overflow-hidden py-28">
        <div className="container relative z-10 max-w-3xl">
          <Link to="/videos" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Videos
          </Link>
          <div className="mt-8 glass-strong rounded-3xl p-6 shadow-deep md:p-9">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
                <ShieldCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Private channel tools</p>
                <h1 className="mt-2 font-display text-3xl font-bold">Video administration</h1>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">This page is not linked publicly. Only accounts with the server-approved admin role can manage the gallery.</p>
              </div>
            </div>

            {checking ? (
              <p className="mt-8 text-sm text-muted-foreground">Checking your access…</p>
            ) : !userId ? (
              <form onSubmit={handleLogin} className="mt-8 space-y-5">
                <div className="space-y-2"><Label htmlFor="admin-email">Email</Label><Input id="admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="admin-password">Password</Label><Input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
                <Button type="submit" className="w-full"><LogIn className="h-4 w-4" aria-hidden="true" /> Sign in</Button>
              </form>
            ) : !isAdmin ? (
              <div className="mt-8 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-sm text-muted-foreground">This account is signed in, but it has not been approved for video administration.<Button type="button" variant="outline" className="mt-4 block" onClick={() => void supabase.auth.signOut()}>Sign out</Button></div>
            ) : (
              <>
                <div className="mt-8"><AddVideoForm userId={userId} onAdded={() => void loadVideos()} /></div>
                <div className="mt-10 border-t border-border/60 pt-6">
                  <h2 className="font-display text-xl font-semibold">Published videos</h2>
                  <div className="mt-4 space-y-3">
                    {videos.length === 0 ? <p className="text-sm text-muted-foreground">No videos have been added yet.</p> : videos.map((video) => (
                      <div key={video.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background/40 p-4">
                        <div className="min-w-0"><p className="truncate text-sm font-medium">{video.title}</p><p className="mt-1 text-xs text-muted-foreground">{video.youtube_video_id}</p></div>
                        <Button type="button" variant="ghost" size="icon" aria-label={`Delete ${video.title}`} onClick={() => void handleDelete(video.id)}><Trash2 className="h-4 w-4" aria-hidden="true" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="button" variant="outline" className="mt-6" onClick={() => void supabase.auth.signOut()}>Sign out</Button>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
