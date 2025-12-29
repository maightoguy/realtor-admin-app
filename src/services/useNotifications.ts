import { useEffect, useState } from "react";
import { getSupabaseClient } from "./supabaseClient";

export type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  message: string;
  seen: boolean | null;
  created_at: string | null;
  title: string | null;
  metadata: Record<string, unknown> | null;
};

export function useNotifications(params?: {
  userId?: string;
  enabled?: boolean;
}) {
  const enabled = params?.enabled ?? true;
  const userId = params?.userId ?? null;
  const [inserts, setInserts] = useState<NotificationRow[]>([]);

  useEffect(() => {
    if (!enabled) return;
    const supabase = getSupabaseClient();

    const channel = supabase
      .channel(`notifications:${userId ?? "all"}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: userId ? `user_id=eq.${userId}` : undefined,
        },
        (payload) => {
          const row = payload.new as NotificationRow;
          setInserts((prev) => [row, ...prev].slice(0, 200));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, userId]);

  return { inserts };
}

