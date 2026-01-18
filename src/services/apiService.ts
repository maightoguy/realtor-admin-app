import { getSupabaseClient } from "./supabaseClient";
import { API_BASE_URL, API_KEY } from "./app_url";
import { logger } from "../utils/logger";
import type {
  Commission,
  Developer,
  Payout,
  Property,
  PropertyStatus,
  PropertyType,
  Receipt,
  Referral,
  User,
} from "./types";

function errorToLogPayload(err: unknown) {
  if (!err || typeof err !== "object") return { message: String(err) };
  const anyErr = err as Record<string, unknown>;
  return {
    message: typeof anyErr.message === "string" ? anyErr.message : String(err),
    code: typeof anyErr.code === "string" ? anyErr.code : undefined,
    details: typeof anyErr.details === "string" ? anyErr.details : undefined,
    hint: typeof anyErr.hint === "string" ? anyErr.hint : undefined,
    name: typeof anyErr.name === "string" ? anyErr.name : undefined,
  };
}

function formatApiError(err: unknown): string {
  const payload = errorToLogPayload(err);
  const parts = [payload.message, payload.code, payload.details, payload.hint].filter(
    (v): v is string => typeof v === "string" && v.trim().length > 0
  );
  return parts.join(" | ");
}

function isMissingDeveloperColumn(err: unknown): boolean {
  const payload = errorToLogPayload(err);
  const message = `${String(payload.message ?? "")} ${String(payload.details ?? "")}`.toLowerCase();
  const mentionsDeveloper =
    message.includes("developer_id") || message.includes("developer");
  if (payload.code === "42703" && mentionsDeveloper) return true;
  if (payload.code === "PGRST204" && mentionsDeveloper) return true;
  if (message.includes("schema cache") && mentionsDeveloper) return true;
  return mentionsDeveloper && message.includes("does not exist");
}

export const userService = {
  async getById(id: string): Promise<User | null> {
    logger.info("[API][users] getById start", { id });
    const { data, error } = await getSupabaseClient()
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      logger.error("[API][users] getById failed", { id, ...errorToLogPayload(error) });
      throw error;
    }

    logger.info("[API][users] getById success", { id });
    return data as User;
  },

  async getByIds(ids: string[]): Promise<User[]> {
    const validIds = ids.filter(id => id && id !== 'null' && id.trim().length > 0);
    if (validIds.length === 0) return [];
    logger.info("[API][users] getByIds start", { count: validIds.length, ids: validIds });
    const { data, error } = await getSupabaseClient()
      .from("users")
      .select("*")
      .in("id", validIds);
    if (error) {
      logger.error("[API][users] getByIds failed", { ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][users] getByIds success", { count: (data ?? []).length });
    return (data ?? []) as User[];
  },

  async countByRole(role: User["role"]): Promise<number> {
    logger.info("[API][users] countByRole start", { role });
    const { count, error } = await getSupabaseClient()
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", role);
    if (error) {
      logger.error("[API][users] countByRole failed", { role, ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][users] countByRole success", { role, count: count ?? 0 });
    return count ?? 0;
  },

  async getAll(filters?: {
    role?: User["role"];
    kycStatus?: User["kyc_status"];
    referredBy?: string;
    searchText?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    const q = filters?.searchText?.trim() ?? "";
    logger.info("[API][users] getAll start", { hasQuery: Boolean(q), filters: filters ?? null });

    let query = getSupabaseClient()
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.role) {
      query = query.eq("role", filters.role);
    }
    if (filters?.kycStatus) {
      query = query.eq("kyc_status", filters.kycStatus);
    }
    if (filters?.referredBy) {
      query = query.eq("referred_by", filters.referredBy);
    }
    if (q) {
      query = query.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,phone_number.ilike.%${q}%`
      );
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (typeof filters?.offset === "number") {
      const limit = filters.limit ?? 10;
      query = query.range(filters.offset, filters.offset + limit - 1);
    }

    const { data, error } = await query;
    if (error) {
      logger.error("[API][users] getAll failed", { filters: filters ?? null, ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][users] getAll success", { count: (data ?? []).length });
    return (data ?? []) as User[];
  },

  async update(id: string, updates: Partial<Omit<User, "id" | "created_at">>): Promise<User> {
    logger.info("[API][users] update start", { id, keys: Object.keys(updates ?? {}) });
    const { data: sessionData } = await getSupabaseClient().auth.getSession();
    const sessionUserId = sessionData.session?.user?.id ?? null;
    logger.info("[API][users] update auth", { id, sessionUserId });
    if (!sessionUserId) {
      throw new Error("Not authenticated. Please log in again.");
    }

    const { data, error } = await getSupabaseClient()
      .from("users")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      logger.error("[API][users] update failed", { id, ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][users] update success", { id });
    return data as User;
  },

  async delete(id: string): Promise<void> {
    logger.info("[API][users] delete start", { id });
    const { error } = await getSupabaseClient().from("users").delete().eq("id", id);
    if (error) {
      logger.error("[API][users] delete failed", { id, ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][users] delete success", { id });
  },

  async removeAsAdmin(id: string): Promise<void> {
    logger.info("[API][admin][users] remove start", { id });
    try {
      const supabase = getSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("No active session found. Please log in again.");
      }

      const invokeResult = await supabase.functions.invoke("admin-remove-user", {
        body: { userId: id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (invokeResult.error) {
        const maybeStatus = (invokeResult.error as { context?: { status?: number } | null })
          ?.context?.status;
        const looksUnauthorized = maybeStatus === 401;

        if (!looksUnauthorized) {
          throw invokeResult.error;
        }

        if (!API_BASE_URL || !API_KEY) {
          throw invokeResult.error;
        }

        const url = `${API_BASE_URL.replace(/\/+$/, "")}/functions/v1/admin-remove-user`;
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: API_KEY,
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ userId: id }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(
            `admin-remove-user failed: ${res.status} ${res.statusText}${text ? ` | ${text}` : ""}`
          );
        }

        const data = await res.json().catch(() => null);
        if (!data || typeof data !== "object") {
          throw new Error("Unexpected response from admin-remove-user.");
        }
      } else if (!invokeResult.data || typeof invokeResult.data !== "object") {
        throw new Error("Unexpected response from admin-remove-user.");
      }
      logger.info("[API][admin][users] remove success", { id });
    } catch (err) {
      const primaryMessage = formatApiError(err);
      logger.error("[API][admin][users] remove failed", {
        id,
        ...errorToLogPayload(err),
      });

      const supabase = getSupabaseClient();
      try {
        logger.warn("[API][admin][users] remove fallback: delete public.users", { id });
        const { error: deleteError } = await supabase.from("users").delete().eq("id", id);
        if (!deleteError) {
          logger.info("[API][admin][users] remove fallback delete success", { id });
          return;
        }

        logger.warn("[API][admin][users] remove fallback: scrub public.users", {
          id,
          ...errorToLogPayload(deleteError),
        });
        const placeholderEmail = `deleted+${id}@deleted.local`;
        const placeholderPhone = `del-${id}`.slice(0, 20);
        const { error: scrubError } = await supabase
          .from("users")
          .update({
            first_name: "Deleted",
            last_name: "User",
            email: placeholderEmail,
            phone_number: placeholderPhone,
            gender: null,
            avatar_url: null,
            bank_details: null,
            id_document_url: null,
            kyc_status: "rejected",
            referred_by: null,
          })
          .eq("id", id);
        if (scrubError) throw scrubError;

        logger.info("[API][admin][users] remove fallback scrub success", { id });
        return;
      } catch (fallbackErr) {
        logger.error("[API][admin][users] remove fallback failed", {
          id,
          ...errorToLogPayload(fallbackErr),
        });
        const fallbackMessage = formatApiError(fallbackErr);
        throw new Error(
          [primaryMessage, fallbackMessage].filter(Boolean).join(" | ") ||
            "Failed to remove user."
        );
      }
    }
  },
};

export const propertyService = {
  async getByIds(ids: string[]): Promise<Property[]> {
    const validIds = ids.filter(id => id && id !== 'null' && id.trim().length > 0);
    if (validIds.length === 0) return [];
    logger.info("[API][properties] getByIds start", { count: validIds.length, ids: validIds });
    const { data, error } = await getSupabaseClient()
      .from("properties")
      .select("*")
      .in("id", validIds);
    if (error) {
      logger.error("[API][properties] getByIds failed", { ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][properties] getByIds success", { count: (data ?? []).length });
    return (data ?? []) as Property[];
  },

  async getAll(filters?: {
    type?: PropertyType;
    status?: PropertyStatus;
    developerId?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    offset?: number;
  }): Promise<Property[]> {
    logger.info("[API][properties] getAll start", { filters: filters ?? null });
    let query = getSupabaseClient()
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.developerId) {
      query = query.eq("developer_id", filters.developerId);
    }
    if (filters?.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }
    if (typeof filters?.minPrice === "number") {
      query = query.gte("price", filters.minPrice);
    }
    if (typeof filters?.maxPrice === "number") {
      query = query.lte("price", filters.maxPrice);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (typeof filters?.offset === "number") {
      const limit = filters?.limit ?? 10;
      query = query.range(filters.offset, filters.offset + limit - 1);
    }

    const { data, error } = await query;
    if (error) {
      logger.error("[API][properties] getAll failed", { filters: filters ?? null, ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][properties] getAll success", { count: (data ?? []).length });
    return (data ?? []) as Property[];
  },

  async search(
    searchText: string,
    filters?: {
      type?: PropertyType;
      status?: PropertyStatus;
      developerId?: string;
      location?: string;
      minPrice?: number;
      maxPrice?: number;
      limit?: number;
    }
  ): Promise<Property[]> {
    const q = searchText.trim();
    logger.info("[API][properties] search start", { q, filters: filters ?? null });
    let query = getSupabaseClient()
      .from("properties")
      .select("*")
      .or(`title.ilike.%${q}%,location.ilike.%${q}%,description.ilike.%${q}%`)
      .order("created_at", { ascending: false });

    if (filters?.type) {
      query = query.eq("type", filters.type);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.developerId) {
      query = query.eq("developer_id", filters.developerId);
    }
    if (filters?.location) {
      query = query.ilike("location", `%${filters.location}%`);
    }
    if (typeof filters?.minPrice === "number") {
      query = query.gte("price", filters.minPrice);
    }
    if (typeof filters?.maxPrice === "number") {
      query = query.lte("price", filters.maxPrice);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) {
      logger.error("[API][properties] search failed", { q, filters: filters ?? null, ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][properties] search success", { count: (data ?? []).length });
    return (data ?? []) as Property[];
  },

  async create(input: Omit<Property, "id" | "created_at">): Promise<Property> {
    logger.info("[API][properties] create start", {
      title: input.title,
      hasImages: Array.isArray(input.images) && input.images.length > 0,
    });
    const { data: sessionData } = await getSupabaseClient().auth.getSession();
    const sessionUserId = sessionData.session?.user?.id ?? null;
    logger.info("[API][properties] create auth", { sessionUserId });
    if (!sessionUserId) {
      throw new Error("Not authenticated. Please log in again.");
    }
    const { data, error } = await getSupabaseClient()
      .from("properties")
      .insert(input)
      .select("*")
      .single();
    if (error) {
      if (
        Object.prototype.hasOwnProperty.call(input, "developer_id") &&
        isMissingDeveloperColumn(error)
      ) {
        const { developer_id: _developerId, ...withoutDeveloper } = input as Omit<
          Property,
          "id" | "created_at"
        > & { developer_id?: unknown };
        logger.warn("[API][properties] create retry without developer column", {
          ...errorToLogPayload(error),
        });
        const retry = await getSupabaseClient()
          .from("properties")
          .insert(withoutDeveloper)
          .select("*")
          .single();
        if (retry.error) {
          logger.error("[API][properties] create failed", {
            ...errorToLogPayload(retry.error),
          });
          throw retry.error;
        }
        logger.info("[API][properties] create success", { id: retry.data.id });
        return retry.data as Property;
      }
      logger.error("[API][properties] create failed", { ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][properties] create success", { id: data.id });
    return data as Property;
  },

  async update(id: string, updates: Partial<Omit<Property, "id" | "created_at">>): Promise<Property> {
    logger.info("[API][properties] update start", { id, keys: Object.keys(updates ?? {}) });
    const { data: sessionData } = await getSupabaseClient().auth.getSession();
    const sessionUserId = sessionData.session?.user?.id ?? null;
    logger.info("[API][properties] update auth", { id, sessionUserId });
    if (!sessionUserId) {
      throw new Error("Not authenticated. Please log in again.");
    }
    const { data, error } = await getSupabaseClient()
      .from("properties")
      .update(updates)
      .eq("id", id)
      .select("*");
    if (error) {
      if (
        Object.prototype.hasOwnProperty.call(updates, "developer_id") &&
        isMissingDeveloperColumn(error)
      ) {
        const { developer_id: _developerId, ...withoutDeveloper } = updates as Partial<
          Omit<Property, "id" | "created_at">
        > & { developer_id?: unknown };
        logger.warn("[API][properties] update retry without developer column", {
          id,
          ...errorToLogPayload(error),
        });
        const retry = await getSupabaseClient()
          .from("properties")
          .update(withoutDeveloper)
          .eq("id", id)
          .select("*");
        if (retry.error) {
          logger.error("[API][properties] update failed", {
            id,
            ...errorToLogPayload(retry.error),
          });
          throw retry.error;
        }
        const rows = (retry.data ?? []) as unknown[];
        if (rows.length !== 1) {
          logger.error("[API][properties] update unexpected row count", {
            id,
            rowCount: rows.length,
          });
          if (rows.length === 0) {
            throw new Error(
              "Update did not return a row. This usually means the update matched 0 rows or was blocked by Row Level Security."
            );
          }
          throw new Error(
            "Update returned multiple rows. Ensure the 'id' filter targets a single property."
          );
        }
        const row = rows[0] as Property;
        logger.info("[API][properties] update success", { id: row.id });
        return row;
      }
      logger.error("[API][properties] update failed", { id, ...errorToLogPayload(error) });
      throw error;
    }
    const rows = (data ?? []) as unknown[];
    if (rows.length !== 1) {
      logger.error("[API][properties] update unexpected row count", {
        id,
        rowCount: rows.length,
        keys: Object.keys(updates ?? {}),
      });
      if (rows.length === 0) {
        throw new Error(
          "Update did not return a row. This usually means the update matched 0 rows or was blocked by Row Level Security."
        );
      }
      throw new Error(
        "Update returned multiple rows. Ensure the 'id' filter targets a single property."
      );
    }
    const row = rows[0] as Property;
    logger.info("[API][properties] update success", { id: row.id });
    return row;
  },

  async delete(id: string): Promise<void> {
    logger.info("[API][properties] delete start", { id });
    const { error } = await getSupabaseClient()
      .from("properties")
      .delete()
      .eq("id", id);
    if (error) {
      logger.error("[API][properties] delete failed", { id, ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][properties] delete success", { id });
  },

  async countAll(): Promise<number> {
    logger.info("[API][properties] countAll start");
    const { count, error } = await getSupabaseClient()
      .from("properties")
      .select("*", { count: "exact", head: true });
    if (error) {
      logger.error("[API][properties] countAll failed", { ...errorToLogPayload(error) });
      throw error;
    }
    return count ?? 0;
  },

  async countByStatus(status: PropertyStatus): Promise<number> {
    logger.info("[API][properties] countByStatus start", { status });
    const { count, error } = await getSupabaseClient()
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", status);
    if (error) {
      logger.error("[API][properties] countByStatus failed", { status, ...errorToLogPayload(error) });
      throw error;
    }
    return count ?? 0;
  },

  async countByDeveloperId(developerId: string): Promise<number> {
    logger.info("[API][properties] countByDeveloperId start", { developerId });
    const { count, error } = await getSupabaseClient()
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("developer_id", developerId);
    if (error) {
      const payload = errorToLogPayload(error);
      const message = String(payload.message ?? "");
      if (
        payload.code === "42703" ||
        payload.code === "PGRST204" ||
        message.toLowerCase().includes("schema cache") && message.toLowerCase().includes("developer") ||
        message.toLowerCase().includes("properties.developer_id") ||
        message.toLowerCase().includes("column") && message.toLowerCase().includes("does not exist")
      ) {
        logger.warn("[API][properties] countByDeveloperId missing column, returning 0", {
          developerId,
          ...payload,
        });
        return 0;
      }
      logger.error("[API][properties] countByDeveloperId failed", {
        developerId,
        ...payload,
      });
      throw error;
    }
    return count ?? 0;
  },
};

function adaptDeveloperRow(row: Record<string, unknown>): Developer {
  const rawStatus = typeof row.status === "string" ? row.status : "";
  const statusNormalized = rawStatus.trim().toLowerCase();
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    status: (statusNormalized === "inactive" ? "Removed" : "Active") as Developer["status"],
    dateAdded: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
    totalProperties: 0,
  };
}

function toDbDeveloperStatus(status: Developer["status"]): "active" | "inactive" {
  if (typeof status === "string") {
    const normalized = status.toLowerCase();
    if (normalized === "inactive" || normalized === "removed") return "inactive";
  }
  return "active";
}

export const developerService = {
  async getByIds(ids: string[]): Promise<Developer[]> {
    if (ids.length === 0) return [];
    logger.info("[API][developers] getByIds start", { count: ids.length });
    const { data, error } = await getSupabaseClient()
      .from("developers")
      .select("*")
      .in("id", ids);
    if (error) {
      logger.error("[API][developers] getByIds failed", { ...errorToLogPayload(error) });
      throw error;
    }
    const rows = (data ?? []) as Array<Record<string, unknown>>;
    logger.info("[API][developers] getByIds success", { count: rows.length });
    return rows.map(adaptDeveloperRow);
  },

  async getAll(params?: {
    limit?: number;
    offset?: number;
  }): Promise<Developer[]> {
    logger.info("[API][developers] getAll start", { params: params ?? null });
    let query = getSupabaseClient()
      .from("developers")
      .select("*")
      .order("created_at", { ascending: false });

    if (params?.limit) {
      query = query.limit(params.limit);
    }
    if (typeof params?.offset === "number") {
      const limit = params.limit ?? 10;
      query = query.range(params.offset, params.offset + limit - 1);
    }

    const { data, error } = await query;
    if (error) {
      logger.error("[API][developers] getAll failed", { ...errorToLogPayload(error) });
      throw error;
    }

    const rows = (data ?? []) as Array<Record<string, unknown>>;
    logger.info("[API][developers] getAll success", { count: rows.length });
    return rows.map(adaptDeveloperRow);
  },

  async create(input: { name: string; email: string; phone: string }): Promise<Developer> {
    logger.info("[API][developers] create start", { name: input.name });
    const baseInsert = {
      name: input.name,
      email: input.email,
      phone: input.phone,
    } as const;

    const supabase = getSupabaseClient();
    const first = await supabase
      .from("developers")
      .insert({ ...baseInsert, status: "active" })
      .select("*")
      .single();

    if (!first.error) {
      logger.info("[API][developers] create success", { id: first.data.id });
      return adaptDeveloperRow(first.data as Record<string, unknown>);
    }

    if (first.error.code === "23514") {
      const second = await supabase.from("developers").insert(baseInsert).select("*").single();
      if (second.error) {
        logger.error("[API][developers] create failed", { ...errorToLogPayload(second.error) });
        throw second.error;
      }
      logger.info("[API][developers] create success", { id: second.data.id });
      return adaptDeveloperRow(second.data as Record<string, unknown>);
    }

    logger.error("[API][developers] create failed", { ...errorToLogPayload(first.error) });
    throw first.error;
  },

  async update(
    id: string,
    updates: Partial<{ name: string; email: string; phone: string; status: Developer["status"] }>
  ): Promise<Developer> {
    logger.info("[API][developers] update start", { id, keys: Object.keys(updates ?? {}) });
    const payload = { ...updates } as Record<string, unknown>;
    if (typeof updates?.status === "string") {
      payload.status = toDbDeveloperStatus(updates.status as Developer["status"]);
    }
    const { data, error } = await getSupabaseClient()
      .from("developers")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      logger.error("[API][developers] update failed", { id, ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][developers] update success", { id: data.id });
    return adaptDeveloperRow(data as Record<string, unknown>);
  },

  async delete(id: string): Promise<void> {
    logger.info("[API][developers] delete start", { id });
    const { error } = await getSupabaseClient().from("developers").delete().eq("id", id);
    if (error) {
      logger.error("[API][developers] delete failed", { id, ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][developers] delete success", { id });
  },
};

export const propertyMediaService = {
  bucket: "properties",

  getPublicUrl(pathOrUrl: string): string {
    if (!pathOrUrl) return "";
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const { data } = getSupabaseClient()
      .storage.from(this.bucket)
      .getPublicUrl(pathOrUrl);
    return data.publicUrl;
  },

  async uploadMany(files: File[], opts?: { folder?: string; upsert?: boolean }): Promise<string[]> {
    if (files.length === 0) return [];

    const supabase = getSupabaseClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user?.id) {
      throw new Error("Not authenticated. Please log in again.");
    }
    const ownerFolder = opts?.folder ?? authData.user.id;

    const uploadedPaths: string[] = [];
    for (const file of files) {
      const ext = file.name.split(".").pop() || "bin";
      const path = `${ownerFolder}/property-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;

      logger.info("[STORAGE][properties] upload start", {
        path,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });
      const { data, error } = await supabase.storage.from(this.bucket).upload(path, file, {
        contentType: file.type,
        upsert: opts?.upsert ?? false,
      });
      if (error) {
        const payload = errorToLogPayload(error);
        const msg = String(payload.message ?? "");
        logger.error("[STORAGE][properties] upload failed", { path, ...payload });
        if (msg.toLowerCase().includes("row-level security")) {
          throw new Error(
            "Permission denied uploading property media: your Storage RLS policy blocks inserts into `storage.objects` for the `properties` bucket."
          );
        }
        throw new Error(msg || "Failed to upload property media");
      }
      logger.info("[STORAGE][properties] upload success", { path: data.path });
      uploadedPaths.push(data.path);
    }

    return uploadedPaths;
  },
};

export const profileAvatarService = {
  bucket: "profile-avatars",

  getPublicUrl(pathOrUrl: string): string {
    if (!pathOrUrl) return "";
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const { data } = getSupabaseClient()
      .storage.from(this.bucket)
      .getPublicUrl(pathOrUrl);
    return data.publicUrl;
  },

  async uploadForUser(userId: string, file: File): Promise<string> {
    const supabase = getSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUserId = sessionData.session?.user?.id ?? null;
    if (!sessionUserId) {
      throw new Error("Not authenticated. Please log in again.");
    }
    if (sessionUserId !== userId) {
      throw new Error("User ID mismatch. Cannot upload avatar.");
    }

    const ext = file.name.split(".").pop() || "bin";
    const path = `${userId}/avatar-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(this.bucket).upload(path, file, {
      contentType: file.type,
      upsert: true,
    });
    if (error) {
      const payload = errorToLogPayload(error);
      const msg = String(payload.message ?? "");
      if (msg.toLowerCase().includes("row-level security")) {
        throw new Error(
          "Permission denied uploading avatar: your Storage RLS policy blocks inserts into `storage.objects` for the `profile-avatars` bucket."
        );
      }
      throw new Error(msg || "Failed to upload avatar");
    }

    return this.getPublicUrl(path);
  },
};

export const receiptService = {
  async getByIds(ids: string[]): Promise<Receipt[]> {
    const validIds = ids.filter(id => id && id !== 'null' && id.trim().length > 0);
    if (validIds.length === 0) return [];
    
    const { data, error } = await getSupabaseClient()
      .from("receipts")
      .select("*")
      .in("id", validIds);
      
    if (error) throw error;
    return (data ?? []) as Receipt[];
  },

  async countByStatus(status: Receipt["status"]): Promise<number> {
    const { count, error } = await getSupabaseClient()
      .from("receipts")
      .select("*", { count: "exact", head: true })
      .eq("status", status);
    if (error) throw error;
    return count ?? 0;
  },

  async listForPeriod(params: {
    startIso: string;
    endIsoExclusive: string;
    status?: Receipt["status"];
    limit?: number;
  }): Promise<Pick<Receipt, "amount_paid" | "created_at">[]> {
    let query = getSupabaseClient()
      .from("receipts")
      .select("amount_paid, created_at")
      .gte("created_at", params.startIso)
      .lt("created_at", params.endIsoExclusive)
      .order("created_at", { ascending: false });

    if (params.status) {
      query = query.eq("status", params.status);
    }
    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Array<Pick<Receipt, "amount_paid" | "created_at">>;
  },

  async sumAmountByStatus(status: Receipt["status"]): Promise<number> {
    const { data, error } = await getSupabaseClient()
      .from("receipts")
      .select("amount_paid")
      .eq("status", status)
      .limit(5000);
    if (error) throw error;
    return ((data ?? []) as Array<{ amount_paid: number }>).reduce(
      (acc, row) =>
        acc + (Number.isFinite(row.amount_paid) ? row.amount_paid : 0),
      0
    );
  },

  async getRecent(limit: number): Promise<Receipt[]> {
    const { data, error } = await getSupabaseClient()
      .from("receipts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Receipt[];
  },

  async getAll(params?: {
    limit?: number;
    offset?: number;
    status?: Receipt["status"] | Array<Receipt["status"]>;
    realtorId?: string;
    propertyId?: string;
  }): Promise<Receipt[]> {
    let query = getSupabaseClient()
      .from("receipts")
      .select("*")
      .order("created_at", { ascending: false });

    if (params?.status) {
      if (Array.isArray(params.status)) {
        query = query.in("status", params.status);
      } else {
        query = query.eq("status", params.status);
      }
    }
    if (params?.realtorId) {
      query = query.eq("realtor_id", params.realtorId);
    }
    if (params?.propertyId) {
      query = query.eq("property_id", params.propertyId);
    }

    if (params?.limit) {
      query = query.limit(params.limit);
    }

    if (typeof params?.offset === "number") {
      const limit = params.limit ?? 10;
      query = query.range(params.offset, params.offset + limit - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Receipt[];
  },

  async updateStatus(params: {
    id: string;
    status: Receipt["status"];
    rejectionReason?: string | null;
  }): Promise<Receipt> {
    const { data: sessionData } = await getSupabaseClient().auth.getSession();
    const sessionUserId = sessionData.session?.user?.id ?? null;
    if (!sessionUserId) {
      throw new Error("Not authenticated. Please log in again.");
    }

    const { data, error } = await getSupabaseClient()
      .from("receipts")
      .update({
        status: params.status,
        rejection_reason: params.rejectionReason ?? null,
      })
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) throw error;
    return data as Receipt;
  },
};

export const commissionService = {
  async sumAmountByStatus(status: Commission["status"]): Promise<number> {
    const { data, error } = await getSupabaseClient()
      .from("commissions")
      .select("amount")
      .eq("status", status)
      .limit(5000);
    if (error) throw error;
    return ((data ?? []) as Array<{ amount: number }>).reduce(
      (acc, row) => acc + (Number.isFinite(row.amount) ? row.amount : 0),
      0
    );
  },

  async listForPeriod(params: {
    startIso: string;
    endIsoExclusive: string;
    statuses?: Commission["status"][];
    limit?: number;
  }): Promise<Pick<Commission, "realtor_id" | "amount" | "created_at">[]> {
    let query = getSupabaseClient()
      .from("commissions")
      .select("realtor_id, amount, created_at")
      .gte("created_at", params.startIso)
      .lt("created_at", params.endIsoExclusive)
      .order("created_at", { ascending: false });

    if (params.statuses && params.statuses.length > 0) {
      query = query.in("status", params.statuses);
    }
    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Array<Pick<Commission, "realtor_id" | "amount" | "created_at">>;
  },

  async getAll(params?: {
    realtorId?: string;
    statuses?: Commission["status"] | Array<Commission["status"]>;
    limit?: number;
    offset?: number;
  }): Promise<Commission[]> {
    let query = getSupabaseClient()
      .from("commissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (params?.realtorId) {
      query = query.eq("realtor_id", params.realtorId);
    }
    if (params?.statuses) {
      if (Array.isArray(params.statuses)) {
        query = query.in("status", params.statuses);
      } else {
        query = query.eq("status", params.statuses);
      }
    }
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    if (typeof params?.offset === "number") {
      const limit = params.limit ?? 10;
      query = query.range(params.offset, params.offset + limit - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Commission[];
  },

  async updateStatus(params: {
    id: string;
    status: Commission["status"];
  }): Promise<Commission> {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error("No active session found. Please log in again.");
      }

      const { data, error } = await supabase.functions.invoke("admin-update-commission-status", {
        body: { id: params.id, status: params.status },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      if (error) throw error;
      if (!data || typeof data !== "object" || !("data" in data)) {
        throw new Error("Unexpected response from admin-update-commission-status.");
      }
      return (data as { data: Commission }).data;
    } catch (err) {
      throw new Error(formatApiError(err) || "Update failed. Permission denied.");
    }
  },
};

export const payoutService = {
  async getAll(params?: {
    realtorId?: string;
    statuses?: Payout["status"] | Array<Payout["status"]>;
    limit?: number;
    offset?: number;
  }): Promise<Payout[]> {
    let query = getSupabaseClient()
      .from("payouts")
      .select("*")
      .order("created_at", { ascending: false });

    if (params?.realtorId) {
      query = query.eq("realtor_id", params.realtorId);
    }
    if (params?.statuses) {
      if (Array.isArray(params.statuses)) {
        query = query.in("status", params.statuses);
      } else {
        query = query.eq("status", params.statuses);
      }
    }
    if (params?.limit) {
      query = query.limit(params.limit);
    }
    if (typeof params?.offset === "number") {
      const limit = params.limit ?? 10;
      query = query.range(params.offset, params.offset + limit - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Payout[];
  },

  async updateStatus(params: {
    id: string;
    status: Payout["status"];
  }): Promise<Payout> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.functions.invoke("admin-update-payout-status", {
        body: { id: params.id, status: params.status },
      });
      if (error) throw error;
      if (!data || typeof data !== "object" || !("data" in data)) {
        throw new Error("Unexpected response from admin-update-payout-status.");
      }
      return (data as { data: Payout }).data;
    } catch (err) {
      throw new Error(formatApiError(err) || "Update failed. Permission denied.");
    }
  },
};

export const transactionService = {
  async requestPayout(params: {
    realtorId?: string;
    amount: number;
    bankDetails?: Record<string, unknown> | null;
  }): Promise<Payout> {
    const supabase = getSupabaseClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUserId = sessionData.session?.user?.id ?? null;
    if (!sessionUserId) {
      throw new Error("Not authenticated. Please log in again.");
    }

    const realtorId = params.realtorId ?? sessionUserId;
    if (realtorId !== sessionUserId) {
      throw new Error("Permission denied.");
    }

    const amount = Number(params.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid amount.");
    }

    const insertRow = {
      amount,
      realtor_id: realtorId,
      bank_details: params.bankDetails ?? null,
    };

    const { data, error } = await supabase
      .from("payouts")
      .insert(insertRow)
      .select("*")
      .single();
    if (error) throw error;
    return data as Payout;
  },
};

export const notificationService = {
  async create(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const supabase = getSupabaseClient();
    const { error: rpcError } = await supabase.rpc("create_notification", {
      p_user_id: params.userId,
      p_type: params.type,
      p_title: params.title ?? null,
      p_message: params.message ?? null,
      p_seen: false,
      p_metadata: params.metadata ?? {},
    });

    if (!rpcError) return;

    const { error: insertError } = await supabase.from("notifications").insert({
      user_id: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      seen: false,
      metadata: params.metadata ?? {},
    });
    if (insertError) throw insertError;
  },

  async getAdminActionNotifications(params: {
    userId: string;
    limit?: number;
  }): Promise<
    Array<{
      id: string;
      user_id: string;
      type: string;
      message: string;
      seen: boolean | null;
      created_at: string | null;
      title: string | null;
      metadata: Record<string, unknown> | null;
    }>
  > {
    const supabase = getSupabaseClient();
    const limit = params.limit ?? 50;

    const selectColumnsBase = "id,user_id,type,message,seen,created_at,title,metadata";
    const selectColumnsWithTargetRole = `${selectColumnsBase},target_role`;

    const baseQuery = (selectColumns: string) =>
      supabase
        .from("notifications")
        .select(selectColumns)
        .eq("user_id", params.userId)
        .order("created_at", { ascending: false })
        .limit(limit);

    try {
      const { data, error } = await baseQuery(selectColumnsWithTargetRole).eq(
        "target_role",
        "admin"
      );
      if (error) throw error;
      return (data ?? []) as unknown as Array<{
        id: string;
        user_id: string;
        type: string;
        message: string;
        seen: boolean | null;
        created_at: string | null;
        title: string | null;
        metadata: Record<string, unknown> | null;
      }>;
    } catch {
      const { data, error } = await baseQuery(selectColumnsBase).contains("metadata", {
        target_role: "admin",
      });
      if (error) throw error;
      return (data ?? []) as unknown as Array<{
        id: string;
        user_id: string;
        type: string;
        message: string;
        seen: boolean | null;
        created_at: string | null;
        title: string | null;
        metadata: Record<string, unknown> | null;
      }>;
    }
  },

  async markAllAdminActionAsSeen(params: { userId: string }): Promise<void> {
    const supabase = getSupabaseClient();

    const baseUpdate = () =>
      supabase
        .from("notifications")
        .update({ seen: true })
        .eq("user_id", params.userId)
        .eq("seen", false);

    try {
      const { error } = await baseUpdate().eq("target_role", "admin");
      if (error) throw error;
    } catch {
      const { error } = await baseUpdate().contains("metadata", {
        target_role: "admin",
      });
      if (error) throw error;
    }
  },

  async getAdminActionUnreadCount(params: { userId: string }): Promise<number> {
    const supabase = getSupabaseClient();

    const baseCount = () =>
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", params.userId)
        .eq("seen", false);

    try {
      const { count, error } = await baseCount().eq("target_role", "admin");
      if (error) throw error;
      return count ?? 0;
    } catch {
      const { count, error } = await baseCount().contains("metadata", {
        target_role: "admin",
      });
      if (error) throw error;
      return count ?? 0;
    }
  },

  async sendBroadcast(params: {
    title: string;
    message: string;
    type?: string;
    target:
      | { kind: "all" }
      | { kind: "role"; role: string }
      | { kind: "userIds"; userIds: string[] };
    metadata?: Record<string, unknown>;
  }): Promise<{ broadcastId: string; recipientCount: number }> {
    const supabase = getSupabaseClient();
    const broadcastId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const resolveRecipients = async (): Promise<string[]> => {
      if (params.target.kind === "userIds") return params.target.userIds;

      let query = supabase.from("users").select("id").limit(5000);
      if (params.target.kind === "role") {
        query = query.eq("role", params.target.role);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? [])
        .map((r) => (r as { id?: string }).id)
        .filter((id): id is string => Boolean(id));
    };

    const userIds = await resolveRecipients();
    if (userIds.length === 0) {
      return { broadcastId, recipientCount: 0 };
    }

    const baseMetadata = {
      ...(params.metadata ?? {}),
      source: "admin",
      broadcast_id: broadcastId,
      broadcast_target: {
        kind: params.target.kind,
        role: params.target.kind === "role" ? params.target.role : undefined,
        recipient_count: userIds.length,
      },
    };

    const rows = userIds.map((userId) => ({
      user_id: userId,
      type: params.type ?? "broadcast",
      title: params.title,
      message: params.message,
      seen: false,
      metadata: baseMetadata,
    }));

    const insertInChunks = async () => {
      const chunkSize = 500;
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const { error } = await supabase.from("notifications").insert(chunk);
        if (error) throw error;
      }
    };

    const insertViaRpcLoop = async () => {
      const concurrency = 10;
      const ids = [...userIds];
      const workers = Array.from({ length: concurrency }, async () => {
        while (ids.length > 0) {
          const id = ids.shift();
          if (!id) return;
          await this.create({
            userId: id,
            type: params.type ?? "broadcast",
            title: params.title,
            message: params.message,
            metadata: baseMetadata,
          });
        }
      });
      await Promise.all(workers);
    };

    try {
      await insertInChunks();
    } catch (err) {
      const payload = errorToLogPayload(err);
      const msg = `${String(payload.message ?? "")} ${String(payload.details ?? "")}`.toLowerCase();
      const looksLikeRls =
        payload.code === "42501" ||
        payload.code === "PGRST301" ||
        msg.includes("row-level security") ||
        msg.includes("rls");
      if (!looksLikeRls) throw err;
      await insertViaRpcLoop();
    }

    return { broadcastId, recipientCount: userIds.length };
  },

  async getAdminLogs(params?: {
    limit?: number;
  }): Promise<
    Array<{
      id: string;
      title: string;
      message: string;
      created_at: string;
      status: "Sent";
      userType?: string;
      selectedUsers?: string[];
    }>
  > {
    const supabase = getSupabaseClient();
    const limit = params?.limit ?? 200;

    const queryBase = supabase
      .from("notifications")
      .select("id,user_id,type,message,seen,created_at,title,metadata")
      .order("created_at", { ascending: false })
      .limit(limit * 10);

    const tryAdminOnly = async () => {
      const { data, error } = await queryBase.contains("metadata", {
        source: "admin",
      });
      if (error) throw error;
      return (data ?? []) as Array<{
        id: string;
        user_id: string;
        type: string;
        message: string;
        seen: boolean | null;
        created_at: string | null;
        title: string | null;
        metadata: Record<string, unknown> | null;
      }>;
    };

    const rows = await (async () => {
      try {
        return await tryAdminOnly();
      } catch {
        const { data, error } = await queryBase;
        if (error) throw error;
        return (data ?? []) as Array<{
          id: string;
          user_id: string;
          type: string;
          message: string;
          seen: boolean | null;
          created_at: string | null;
          title: string | null;
          metadata: Record<string, unknown> | null;
        }>;
      }
    })();

    const grouped = new Map<
      string,
      {
        id: string;
        title: string;
        message: string;
        created_at: string;
        status: "Sent";
        userType?: string;
        selectedUsers?: string[];
      }
    >();

    for (const r of rows) {
      const metadata = (r.metadata ?? {}) as Record<string, unknown>;
      const broadcastId =
        typeof metadata.broadcast_id === "string" ? metadata.broadcast_id : r.id;
      const createdAt = r.created_at ?? new Date().toISOString();

      if (!grouped.has(broadcastId)) {
        const broadcastTarget = (metadata.broadcast_target ??
          {}) as Record<string, unknown>;
        const kind =
          typeof broadcastTarget.kind === "string"
            ? broadcastTarget.kind
            : undefined;
        const role =
          typeof broadcastTarget.role === "string"
            ? broadcastTarget.role
            : undefined;

        let userType: string | undefined;
        if (kind === "all") userType = "All Users";
        else if (kind === "role" && role)
          userType =
            role === "realtor"
              ? "Realtors"
              : role === "admin"
              ? "Admins"
              : role;
        else if (kind === "userIds") userType = "Selected users";

        grouped.set(broadcastId, {
          id: broadcastId,
          title: r.title ?? "-",
          message: r.message ?? "-",
          created_at: createdAt,
          status: "Sent",
          userType,
          selectedUsers: kind === "userIds" ? [] : undefined,
        });
      }

      const entry = grouped.get(broadcastId);
      if (!entry) continue;

      if (entry.userType === "Selected users") {
        entry.selectedUsers = entry.selectedUsers ?? [];
        if (entry.selectedUsers.length < 20) entry.selectedUsers.push(r.user_id);
      }
    }

    return [...grouped.values()]
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, limit);
  },
};

export const referralService = {
  async getReferralStats(params?: {
    limit?: number;
    commissionStatuses?: Commission["status"][];
  }): Promise<
    Array<{
      realtor: User;
      recruitsCount: number;
      recruitsCommissionTotal: number;
    }>
  > {
    const supabase = getSupabaseClient();
    const limit = params?.limit ?? 5000;
    const commissionStatuses = params?.commissionStatuses ?? ["approved", "paid", "pending"];

    const realtors = await userService.getAll({ role: "realtor", limit });
    const realtorIds = realtors.map((r) => r.id);
    if (realtorIds.length === 0) return [];

    const { data: recruitRows, error: recruitErr } = await supabase
      .from("users")
      .select("id,referred_by")
      .in("referred_by", realtorIds)
      .limit(10000);
    if (recruitErr) throw recruitErr;

    const recruitToUpline = new Map<string, string>();
    const recruitsByUpline = new Map<string, string[]>();
    for (const row of (recruitRows ?? []) as Array<{
      id: string;
      referred_by: string | null;
    }>) {
      if (!row.referred_by) continue;
      recruitToUpline.set(row.id, row.referred_by);
      const list = recruitsByUpline.get(row.referred_by) ?? [];
      list.push(row.id);
      recruitsByUpline.set(row.referred_by, list);
    }

    const commissionsByUpline = new Map<string, number>();

    if (realtorIds.length > 0) {
      const { data: commissionRows, error: commissionErr } = await supabase
        .from("commissions")
        .select("realtor_id,amount,status,commission_type")
        .in("realtor_id", realtorIds)
        .eq("commission_type", "referral")
        .in("status", commissionStatuses)
        .limit(50000);
      if (commissionErr) throw commissionErr;

      for (const row of (commissionRows ?? []) as Array<{
        realtor_id: string | null;
        amount: number | string;
      }>) {
        const uplineId = row.realtor_id;
        if (!uplineId) continue;
        
        const amount = Number(row.amount);
        const safeAmount = Number.isFinite(amount) ? amount : 0;
        commissionsByUpline.set(
          uplineId,
          (commissionsByUpline.get(uplineId) ?? 0) + safeAmount
        );
      }
    }

    return realtors.map((realtor) => ({
      realtor,
      recruitsCount: (recruitsByUpline.get(realtor.id) ?? []).length,
      recruitsCommissionTotal: commissionsByUpline.get(realtor.id) ?? 0,
    }));
  },

  async getAll(filters?: {
    upline_id?: string;
    downline_id?: string;
    level?: number;
    limit?: number;
  }): Promise<Referral[]> {
    let query = getSupabaseClient()
      .from("referrals")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters?.upline_id) {
      query = query.eq("upline_id", filters.upline_id);
    }
    if (filters?.downline_id) {
      query = query.eq("downline_id", filters.downline_id);
    }
    if (typeof filters?.level === "number") {
      query = query.eq("level", filters.level);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as Referral[];
  },
};

function startOfMonthUtc(year: number, monthIndex0: number) {
  return new Date(Date.UTC(year, monthIndex0, 1, 0, 0, 0, 0));
}

export const overviewService = {
  async getMonthlyCommissionTotals(params: {
    year: number;
    statuses?: Commission["status"][];
  }): Promise<number[]> {
    const start = startOfMonthUtc(params.year, 0);
    const endExclusive = startOfMonthUtc(params.year + 1, 0);
    const rows = await commissionService.listForPeriod({
      startIso: start.toISOString(),
      endIsoExclusive: endExclusive.toISOString(),
      statuses: params.statuses,
      limit: 5000,
    });

    const totals = Array.from({ length: 12 }, () => 0);
    for (const row of rows) {
      const d = new Date(row.created_at);
      if (Number.isNaN(d.getTime())) continue;
      const month = d.getUTCMonth();
      totals[month] += Number.isFinite(row.amount) ? row.amount : 0;
    }
    return totals;
  },

  async getMonthlySalesTotals(params: {
    year: number;
    status?: Receipt["status"];
  }): Promise<number[]> {
    const start = startOfMonthUtc(params.year, 0);
    const endExclusive = startOfMonthUtc(params.year + 1, 0);
    const rows = await receiptService.listForPeriod({
      startIso: start.toISOString(),
      endIsoExclusive: endExclusive.toISOString(),
      status: params.status,
      limit: 5000,
    });

    const totals = Array.from({ length: 12 }, () => 0);
    for (const row of rows) {
      const d = new Date(row.created_at);
      if (Number.isNaN(d.getTime())) continue;
      const month = d.getUTCMonth();
      totals[month] += Number.isFinite(row.amount_paid) ? row.amount_paid : 0;
    }
    return totals;
  },

  async getMonthlyNewRealtors(params: { year: number }): Promise<number[]> {
    const start = startOfMonthUtc(params.year, 0);
    const endExclusive = startOfMonthUtc(params.year + 1, 0);
    const { data, error } = await getSupabaseClient()
      .from("users")
      .select("created_at")
      .eq("role", "realtor")
      .gte("created_at", start.toISOString())
      .lt("created_at", endExclusive.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) throw error;

    const totals = Array.from({ length: 12 }, () => 0);
    for (const row of (data ?? []) as Array<{ created_at: string }>) {
      const d = new Date(row.created_at);
      if (Number.isNaN(d.getTime())) continue;
      totals[d.getUTCMonth()] += 1;
    }
    return totals;
  },

  async getTopRealtorsByCommission(params: {
    year: number;
    statuses?: Commission["status"][];
    limit: number;
  }): Promise<Array<{ user: User; total: number }>> {
    const start = startOfMonthUtc(params.year, 0);
    const endExclusive = startOfMonthUtc(params.year + 1, 0);
    const rows = await commissionService.listForPeriod({
      startIso: start.toISOString(),
      endIsoExclusive: endExclusive.toISOString(),
      statuses: params.statuses,
      limit: 5000,
    });

    const totalsByRealtor = new Map<string, number>();
    for (const row of rows) {
      const current = totalsByRealtor.get(row.realtor_id) ?? 0;
      totalsByRealtor.set(
        row.realtor_id,
        current + (Number.isFinite(row.amount) ? row.amount : 0)
      );
    }

    const top = [...totalsByRealtor.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, params.limit);

    const users = await userService.getByIds(top.map(([id]) => id));
    const userMap = new Map(users.map((u) => [u.id, u]));

    return top
      .map(([id, total]) => {
        const user = userMap.get(id);
        if (!user) return null;
        return { user, total };
      })
      .filter(Boolean) as Array<{ user: User; total: number }>;
  },

  async getRecentReceiptsEnriched(params: {
    limit: number;
  }): Promise<
    Array<{
      receipt: Receipt;
      realtor: User | null;
      property: Property | null;
    }>
  > {
    const receipts = await receiptService.getRecent(params.limit);
    const realtorIds = Array.from(
      new Set(
        receipts
          .map((r) => r.realtor_id)
          .filter((id): id is string => Boolean(id))
      )
    );
    const propertyIds = Array.from(
      new Set(
        receipts
          .map((r) => r.property_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    const [realtors, properties] = await Promise.all([
      userService.getByIds(realtorIds),
      propertyService.getByIds(propertyIds),
    ]);

    const realtorMap = new Map(realtors.map((u) => [u.id, u]));
    const propertyMap = new Map(properties.map((p) => [p.id, p]));

    return receipts.map((receipt) => ({
      receipt,
      realtor: receipt.realtor_id ? realtorMap.get(receipt.realtor_id) ?? null : null,
      property: receipt.property_id ? propertyMap.get(receipt.property_id) ?? null : null,
    }));
  },

  async getOverviewSnapshot() {
    const year = new Date().getUTCFullYear();

    const [
      totalRealtors,
      totalProperties,
      pendingReceipts,
      commissionPaid,
      totalSale,
      monthlyCommission,
      monthlySales,
      monthlyNewRealtors,
      topRealtors,
      recentReceipts,
    ] = await Promise.all([
      userService.countByRole("realtor"),
      propertyService.countAll(),
      receiptService.countByStatus("pending"),
      commissionService.sumAmountByStatus("paid"),
      receiptService.sumAmountByStatus("approved"),
      this.getMonthlyCommissionTotals({ year, statuses: ["approved", "paid"] }),
      this.getMonthlySalesTotals({ year, status: "approved" }),
      this.getMonthlyNewRealtors({ year }),
      this.getTopRealtorsByCommission({ year, statuses: ["approved", "paid"], limit: 5 }),
      this.getRecentReceiptsEnriched({ limit: 10 }),
    ]);

    return {
      totalRealtors,
      totalProperties,
      pendingReceipts,
      commissionPaid,
      totalSale,
      monthlyCommission,
      monthlySales,
      monthlyNewRealtors,
      topRealtors,
      recentReceipts,
      year,
    };
  },
};
