import { getSupabaseClient } from "./supabaseClient";
import type { User } from "./types";

export const userService = {
  async getById(id: string): Promise<User | null> {
    const { data, error } = await getSupabaseClient()
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }

    return data as User;
  },
};

