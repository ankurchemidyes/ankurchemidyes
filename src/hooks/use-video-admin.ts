import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useVideoAdmin() {
  const [access, setAccess] = useState({ userId: null as string | null, isAdmin: false, checking: true });

  useEffect(() => {
    let active = true;
    let revision = 0;
    const check = async (userId: string | null) => {
      const current = ++revision;
      setAccess({ userId, isAdmin: false, checking: !!userId });
      if (!userId) return;
      try {
        const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
        if (active && current === revision) setAccess({ userId, isAdmin: !error && data?.role === "admin", checking: false });
      } catch {
        if (active && current === revision) setAccess({ userId, isAdmin: false, checking: false });
      }
    };
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer Supabase queries until its auth callback has released its lock.
      ++revision;
      setAccess({ userId: session?.user.id ?? null, isAdmin: false, checking: !!session });
      queueMicrotask(() => { if (active) void check(session?.user.id ?? null); });
    });
    const initialRevision = revision;
    void supabase.auth.getUser().then(({ data }) => {
      if (active && revision === initialRevision) void check(data.user?.id ?? null);
    }).catch(() => {
      if (active && revision === initialRevision) void check(null);
    });
    return () => { active = false; ++revision; listener.subscription.unsubscribe(); };
  }, []);

  return access;
}
