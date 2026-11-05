import { FormEvent, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { extractVideoId } from "@/lib/youtube";

export function AddVideoForm({ userId, onAdded }: { userId: string; onAdded: () => void }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const id = extractVideoId(url);
    if (!id) { toast.error("Enter a valid YouTube video link."); return; }
    setSaving(true);
    try {
      // RLS also checks the current authenticated user's admin role on every write.
      const { error } = await supabase.from("videos").insert({ youtube_video_id: id, title: title.trim() || "Abhiyukth Vlogs video", description: description.trim() || null, created_by: userId });
      if (error) {
        toast.error(error.code === "23505" ? "This video is already in the gallery." : "Could not add the video. Check your admin access and try again.");
        return;
      }
      setUrl(""); setTitle(""); setDescription("");
      toast.success("Video added to the gallery.");
      onAdded();
    } catch { toast.error("Could not connect. Please try again."); }
    finally { setSaving(false); }
  };
  return <form onSubmit={submit} className="space-y-5">
    <div className="space-y-2"><Label htmlFor="video-url">YouTube video URL</Label><Input id="video-url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" required /></div>
    <div className="space-y-2"><Label htmlFor="video-title">Title</Label><Input id="video-title" maxLength={200} value={title} onChange={e => setTitle(e.target.value)} placeholder="Video title" /></div>
    <div className="space-y-2"><Label htmlFor="video-description">Description</Label><Textarea id="video-description" maxLength={2000} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" /></div>
    <Button type="submit" disabled={saving}><Plus className="h-4 w-4" aria-hidden="true" />{saving ? "Adding…" : "Add video"}</Button>
  </form>;
}
