import { getSupabaseClient } from "./supabaseClient";
import type { Commission, Property, Receipt, User } from "./types";

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

  async getByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    const { data, error } = await getSupabaseClient()
      .from("users")
      .select("*")
      .in("id", ids);
    if (error) throw error;
    return (data ?? []) as User[];
  },

  async countByRole(role: User["role"]): Promise<number> {
    const { count, error } = await getSupabaseClient()
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", role);
    if (error) throw error;
    return count ?? 0;
  },
};

export const propertyService = {
  async getByIds(ids: string[]): Promise<Property[]> {
    if (ids.length === 0) return [];
    const { data, error } = await getSupabaseClient()
      .from("properties")
      .select("*")
      .in("id", ids);
    if (error) throw error;
    return (data ?? []) as Property[];
  },

  async countAll(): Promise<number> {
    const { count, error } = await getSupabaseClient()
      .from("properties")
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
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
