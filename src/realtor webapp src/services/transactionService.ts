import { getSupabaseClient } from "./supabaseClient";
import { logger } from "../utils/logger";
import type { User } from "./types";
import { notificationService } from "./apiService";

export type CommissionStatus = "pending" | "approved" | "paid";
export type PayoutStatus = "pending" | "approved" | "paid" | "rejected";

export type TransactionDirection = "credit" | "debit";

export interface CommissionRow {
  id: string;
  amount: number;
  status: CommissionStatus;
  realtor_id: string;
  created_at: string;
}

export interface PayoutRow {
  id: string;
  amount: number;
  status: PayoutStatus;
  realtor_id: string;
  created_at: string;
  bank_details?: Record<string, unknown> | null;
}

export interface UnifiedTransaction {
  id: string;
  amount: number;
  status: CommissionStatus | PayoutStatus;
  realtor_id: string;
  created_at: string;
  type: TransactionDirection;
}

export interface TransactionMetrics {
  totalEarnings: number;
  totalWithdrawals: number;
  currentBalance: number;
  totalPending: number;
}

function sumAmounts(rows: Array<{ amount: number }>): number {
  return rows.reduce((acc, row) => acc + (Number.isFinite(row.amount) ? row.amount : 0), 0);
}

export const transactionService = {
  async getTransactions(userId: string): Promise<UnifiedTransaction[]> {
    const supabase = getSupabaseClient();

    const [commissionsResult, payoutsResult] = await Promise.all([
      supabase
        .from("commissions")
        .select("id, amount, status, realtor_id, created_at")
        .eq("realtor_id", userId),
      supabase
        .from("payouts")
        .select("id, amount, status, realtor_id, created_at")
        .eq("realtor_id", userId),
    ]);

    if (commissionsResult.error) {
      logger.error("❌ [TRANSACTIONS] Failed to fetch commissions:", commissionsResult.error);
      throw commissionsResult.error;
    }

    if (payoutsResult.error) {
      logger.error("❌ [TRANSACTIONS] Failed to fetch payouts:", payoutsResult.error);
      throw payoutsResult.error;
    }

    const commissions = (commissionsResult.data || []) as CommissionRow[];
    const payouts = (payoutsResult.data || []) as PayoutRow[];

    const merged: UnifiedTransaction[] = [
      ...commissions.map((row) => ({
        id: row.id,
        amount: row.amount,
        status: row.status,
        realtor_id: row.realtor_id,
        created_at: row.created_at,
        type: "credit" as const,
      })),
      ...payouts.map((row) => ({
        id: row.id,
        amount: row.amount,
        status: row.status,
        realtor_id: row.realtor_id,
        created_at: row.created_at,
        type: "debit" as const,
      })),
    ];

    merged.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return merged;
  },

  async getMetrics(userId: string): Promise<TransactionMetrics> {
    const supabase = getSupabaseClient();

    const [earningsResult, withdrawalsResult, pendingCommissions, pendingPayouts] = await Promise.all([
      supabase
        .from("commissions")
        .select("amount")
        .eq("realtor_id", userId)
        .in("status", ["approved", "paid"]),
      supabase
        .from("payouts")
        .select("amount")
        .eq("realtor_id", userId)
        .eq("status", "paid"),
      supabase
        .from("commissions")
        .select("amount")
        .eq("realtor_id", userId)
        .eq("status", "pending"),
      supabase
        .from("payouts")
        .select("amount")
        .eq("realtor_id", userId)
        .eq("status", "pending"),
    ]);

    if (earningsResult.error) throw earningsResult.error;
    if (withdrawalsResult.error) throw withdrawalsResult.error;
    if (pendingCommissions.error) throw pendingCommissions.error;
    if (pendingPayouts.error) throw pendingPayouts.error;

    const totalEarnings = sumAmounts((earningsResult.data || []) as Array<{ amount: number }>);
    const totalWithdrawals = sumAmounts(
      (withdrawalsResult.data || []) as Array<{ amount: number }>
    );
    const pendingPayoutsAmount = sumAmounts((pendingPayouts.data || []) as Array<{ amount: number }>);
    const totalPending = 
      sumAmounts((pendingCommissions.data || []) as Array<{ amount: number }>) +
      pendingPayoutsAmount;

    return {
      totalEarnings,
      totalWithdrawals,
      currentBalance: totalEarnings - totalWithdrawals - pendingPayoutsAmount,
      totalPending,
    };
  },

  async requestPayout(params: { realtorId: string; amount: number; bankDetails?: Record<string, unknown> | null }): Promise<PayoutRow> {
    const supabase = getSupabaseClient();
    let bankDetails = params.bankDetails;

    if (!bankDetails) {
      const { data: userRow, error: userError } = await supabase
        .from("users")
        .select("bank_details")
        .eq("id", params.realtorId)
        .single();

      if (userError) {
        logger.error("❌ [TRANSACTIONS] Failed to fetch user bank_details:", userError);
        throw userError;
      }
      bankDetails = (userRow as Pick<User, "bank_details"> | null)?.bank_details
        ? JSON.parse(JSON.stringify((userRow as Pick<User, "bank_details"> | null)?.bank_details))
        : null;
    }

    const metrics = await transactionService.getMetrics(params.realtorId);

    if (params.amount > metrics.currentBalance) {
      const error = new Error("Withdrawal amount exceeds your current balance.");
      error.name = "InsufficientBalanceError";
      throw error;
    }

    const { data: payout, error: payoutError } = await supabase
      .from("payouts")
      .insert({
        realtor_id: params.realtorId,
        amount: params.amount,
        status: "pending",
        bank_details: bankDetails,
      })
      .select("id, amount, status, realtor_id, created_at, bank_details")
      .single();

    if (payoutError) {
      logger.error("❌ [TRANSACTIONS] Failed to create payout request:", payoutError);
      throw payoutError;
    }

    try {
        await notificationService.create({
            user_id: params.realtorId,
            type: 'info',
            title: 'Withdrawal Requested',
            message: `Withdrawal request for ₦${params.amount.toLocaleString()} has been submitted.`,
            seen: false,
            metadata: {
                payout_id: (payout as PayoutRow).id,
                amount: params.amount
            }
        });
        logger.info('🔔 [TRANSACTIONS] Withdrawal notification created');
    } catch (notifyError) {
        logger.warn('⚠️ [TRANSACTIONS] Failed to create notification:', notifyError);
    }

    return payout as PayoutRow;
  },

  async updatePayoutStatus(id: string, status: PayoutStatus): Promise<PayoutRow> {
    const supabase = getSupabaseClient();

    const { data: payout, error } = await supabase
      .from("payouts")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("❌ [TRANSACTIONS] Failed to update payout status:", error);
      throw error;
    }

    if (status === 'paid' || status === 'rejected') {
        try {
            await notificationService.create({
                user_id: payout.realtor_id,
                type: status === 'paid' ? 'success' : 'error',
                title: `Withdrawal ${status === 'paid' ? 'Approved' : 'Rejected'}`,
                message: status === 'paid' 
                    ? `Your withdrawal of ₦${payout.amount.toLocaleString()} has been processed.`
                    : `Your withdrawal request for ₦${payout.amount.toLocaleString()} has been rejected.`,
                seen: false,
                metadata: {
                    payout_id: payout.id,
                    amount: payout.amount,
                    status: status
                }
            });
            logger.info(`🔔 [TRANSACTIONS] Notification sent for payout ${id} (${status})`);
        } catch (notifyError) {
            logger.warn('⚠️ [TRANSACTIONS] Failed to send notification:', notifyError);
        }
    }

    return payout as PayoutRow;
  }
};
