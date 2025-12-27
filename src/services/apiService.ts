import { getSupabaseClient } from "./supabaseClient";
import { logger } from "../utils/logger";
import type {
  Commission,
  Developer,
  Property,
  PropertyStatus,
  PropertyType,
  Receipt,
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
    if (ids.length === 0) return [];
    logger.info("[API][users] getByIds start", { count: ids.length });
    const { data, error } = await getSupabaseClient()
      .from("users")
      .select("*")
      .in("id", ids);
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
};

export const propertyService = {
  async getByIds(ids: string[]): Promise<Property[]> {
    if (ids.length === 0) return [];
    logger.info("[API][properties] getByIds start", { count: ids.length });
    const { data, error } = await getSupabaseClient()
      .from("properties")
      .select("*")
      .in("id", ids);
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
    developer?: string;
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
    if (filters?.developer) {
      query = query.eq("developer", filters.developer);
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
      developer?: string;
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
    if (filters?.developer) {
      query = query.eq("developer", filters.developer);
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
    const { data, error } = await getSupabaseClient()
      .from("properties")
      .insert(input)
      .select("*")
      .single();
    if (error) {
      logger.error("[API][properties] create failed", { ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][properties] create success", { id: data.id });
    return data as Property;
  },

  async update(id: string, updates: Partial<Omit<Property, "id" | "created_at">>): Promise<Property> {
    logger.info("[API][properties] update start", { id, keys: Object.keys(updates ?? {}) });
    const { data, error } = await getSupabaseClient()
      .from("properties")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();
    if (error) {
      logger.error("[API][properties] update failed", { id, ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][properties] update success", { id: data.id });
    return data as Property;
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

  async countByDeveloper(developer: string): Promise<number> {
    logger.info("[API][properties] countByDeveloper start", { developer });
    const { count, error } = await getSupabaseClient()
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("developer", developer);
    if (error) {
      logger.error("[API][properties] countByDeveloper failed", {
        developer,
        ...errorToLogPayload(error),
      });
      throw error;
    }
    return count ?? 0;
  },
};

function adaptDeveloperRow(row: Record<string, unknown>): Developer {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    status: (row.status === "Removed" ? "Removed" : "Active") as Developer["status"],
    dateAdded: typeof row.created_at === "string" ? row.created_at : new Date().toISOString(),
    totalProperties: 0,
  };
}

export const developerService = {
  async getAll(params?: { limit?: number; offset?: number }): Promise<Developer[]> {
    logger.info("[API][developers] getAll start", { params: params ?? null });
    let query = getSupabaseClient()
      .from("developers")
      .select("*")
      .order("created_at", { ascending: false });

    if (params?.limit) {
      query = query.limit(params.limit);
    }
    if (typeof params?.offset === "number") {
      const limit = params?.limit ?? 10;
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
    const { data, error } = await getSupabaseClient()
      .from("developers")
      .insert({
        name: input.name,
        email: input.email,
        phone: input.phone,
        status: "Active",
      })
      .select("*")
      .single();
    if (error) {
      logger.error("[API][developers] create failed", { ...errorToLogPayload(error) });
      throw error;
    }
    logger.info("[API][developers] create success", { id: data.id });
    return adaptDeveloperRow(data as Record<string, unknown>);
  },

  async update(
    id: string,
    updates: Partial<{ name: string; email: string; phone: string; status: Developer["status"] }>
  ): Promise<Developer> {
    logger.info("[API][developers] update start", { id, keys: Object.keys(updates ?? {}) });
    const { data, error } = await getSupabaseClient()
      .from("developers")
      .update(updates)
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
    const ownerFolder = opts?.folder ?? authData.user?.id ?? "admin";

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
        logger.error("[STORAGE][properties] upload failed", { path, ...errorToLogPayload(error) });
        throw error;
      }
      logger.info("[STORAGE][properties] upload success", { path: data.path });
      uploadedPaths.push(data.path);
    }

    return uploadedPaths;
  },
};

export const receiptService = {
  async countByStatus(status: Receipt["status"]): Promise<number> {
    const { count, error } = await getSupabaseClient()
      .from("receipts")
      .select("*", { count: "exact", head: true })
      .eq("status", status);
    if (error) throw error;
    return count ?? 0;
  },

  async sumAmountByStatus(status: Receipt["status"]): Promise<number> {
    const { data, error } = await getSupabaseClient()
      .from("receipts")
      .select("amount")
      .eq("status", status)
      .limit(5000);
    if (error) throw error;
    return ((data ?? []) as Array<{ amount: number }>).reduce(
      (acc, row) => acc + (Number.isFinite(row.amount) ? row.amount : 0),
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
      monthlyNewRealtors,
      topRealtors,
      recentReceipts,
      year,
    };
  },
};
