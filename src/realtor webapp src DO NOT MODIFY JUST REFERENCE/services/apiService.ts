import { getSupabaseClient } from './supabaseClient';
import { authService } from './authService';
import { logger } from '../utils/logger';
import type {
    User,
    UserInsert,
    UserUpdate,
    Property,
    PropertyInsert,
    PropertyUpdate,
    Receipt,
    ReceiptInsert,
    ReceiptUpdate,
    Commission,
    CommissionInsert,
    CommissionUpdate,
    Referral,
    ReferralInsert,
    ReferralUpdate,
    Notification,
    NotificationInsert,
    NotificationUpdate,
} from './types';

// ==================== USERS SERVICE ====================

export const userService = {
    // Get all users
    async getAll(): Promise<User[]> {
        logger.info('📋 [API] Fetching all users');
        const { data, error } = await getSupabaseClient()
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('❌ [API] Failed to fetch all users:', error);
            throw error;
        }
        logger.info('✅ [API] Fetched users:', data?.length || 0);
        return data || [];
    },

    // Get user by ID
    async getById(id: string): Promise<User | null> {
        logger.info('🔍 [API] Fetching user by ID:', id);
        const { data, error } = await getSupabaseClient()
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                logger.warn('⚠️ [API] User not found:', id);
                return null; // Not found
            }
            logger.error('❌ [API] Failed to fetch user:', {
                id,
                message: error.message,
                code: error.code,
            });
            throw error;
        }
        logger.info('✅ [API] User fetched successfully:', id);
        return data;
    },

    // Get user by email
    async getByEmail(email: string): Promise<User | null> {
        const { data, error } = await getSupabaseClient()
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },

    // Get user by referral code
    async getByReferralCode(referralCode: string): Promise<User | null> {
        logger.info('🔍 [API] Fetching user by referral code:', referralCode);
        const { data, error } = await getSupabaseClient()
            .from('users')
            .select('*')
            .eq('referral_code', referralCode)
            .maybeSingle();

        if (error) {
            logger.error('❌ [API] Failed to fetch user by referral code:', {
                referralCode,
                message: error.message,
                code: error.code,
            });
            throw error;
        }
        if (!data) {
            logger.warn('⚠️ [API] Referral code not found:', referralCode);
            return null;
        }
        logger.info('✅ [API] User found by referral code:', data.id);
        return data;
    },

    // Create new user
    async create(user: UserInsert): Promise<User> {
        const { data, error } = await getSupabaseClient()
            .from('users')
            .insert(user)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update user
    async update(id: string, updates: UserUpdate): Promise<User> {
        logger.info('🔄 [API] Updating user:', id, { updates });
        const supabase = getSupabaseClient();

        const attemptUpdate = async () => {
            const { data, error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', id)
                .select()
                .maybeSingle();

            if (error) {
                const code = (error as unknown as { code?: string }).code;
                const status = (error as unknown as { status?: number }).status;
                if (code === 'PGRST116' || status === 406) {
                    logger.warn('⚠️ [API] User update returned no row or 406; will attempt recovery', {
                        id,
                        code,
                        status,
                        message: error.message,
                    });
                    return null;
                }
                logger.error('❌ [API] Failed to update user:', {
                    id,
                    message: error.message,
                    code: error.code,
                    details: error.details,
                    hint: error.hint,
                });
                throw error;
            }

            return data;
        };

        let updated = await attemptUpdate();
        if (updated) {
            logger.info('✅ [API] User updated successfully:', id);
            return updated;
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const currentUserId = sessionData.session?.user?.id ?? null;

        if (currentUserId && currentUserId === id) {
            try {
                await authService.ensureUserProfile();
            } catch (ensureError) {
                logger.warn('⚠️ [API] Failed to ensure user profile before retrying update:', ensureError);
            }

            updated = await attemptUpdate();
            if (updated) {
                logger.info('✅ [API] User updated successfully after profile ensure:', id);
                return updated;
            }

            try {
                const { data: fnData, error: fnError } = await supabase.functions.invoke('users-update-self', {
                    body: { updates },
                });

                if (fnError) throw fnError;

                const maybeUser = (fnData as unknown as { user?: User | null })?.user ?? null;
                if (maybeUser) {
                    logger.info('✅ [API] User updated successfully via Edge Function:', id);
                    return maybeUser;
                }
            } catch (fnInvokeError) {
                logger.warn('⚠️ [API] Edge Function update fallback failed:', fnInvokeError);
            }
        }

        const { data: exists, error: existsError } = await supabase
            .from('users')
            .select('id')
            .eq('id', id)
            .maybeSingle();

        if (existsError) throw existsError;

        if (exists?.id) {
            const noRowsError = new Error('Failed to update user profile. Please try again.');
            (noRowsError as unknown as { code?: string }).code = 'NO_ROWS_UPDATED';
            throw noRowsError;
        }

        const notFoundError = new Error('User profile not found. Please sign out and sign in again.');
        (notFoundError as unknown as { code?: string }).code = 'USER_NOT_FOUND';
        throw notFoundError;
    },

    // Update bank details
    async updateBankDetails(userId: string, bankData: { bankName: string; accountNo: string; accountName: string }): Promise<User> {
        logger.info('🏦 [API] Updating bank details for user:', userId);
        
        // First get current user to retrieve existing bank details
        let currentUser = await this.getById(userId);
        if (!currentUser) {
            const supabase = getSupabaseClient();
            const { data: sessionData } = await supabase.auth.getSession();
            const currentUserId = sessionData.session?.user?.id ?? null;

            if (currentUserId && currentUserId === userId) {
                try {
                    await authService.ensureUserProfile();
                } catch (ensureError) {
                    logger.warn('⚠️ [API] Failed to ensure user profile before updating bank details:', ensureError);
                }
                currentUser = await this.getById(userId);
            }
        }
        if (!currentUser) {
            throw new Error('User not found');
        }

        // Initialize bank_details if null
        const currentBankDetails = Array.isArray(currentUser.bank_details) ? currentUser.bank_details : [];
        
        // Add new bank details
        const updatedBankDetails = [...currentBankDetails, bankData];

        const updatedUser = await this.update(userId, { bank_details: updatedBankDetails });
        logger.info('✅ [API] Bank details updated successfully');
        return updatedUser;
    },

    async removeBankDetails(userId: string, bankData: { bankName: string; accountNo: string; accountName: string }): Promise<User> {
        logger.info('🏦 [API] Removing bank details for user:', userId);

        let currentUser = await this.getById(userId);
        if (!currentUser) {
            const supabase = getSupabaseClient();
            const { data: sessionData } = await supabase.auth.getSession();
            const currentUserId = sessionData.session?.user?.id ?? null;

            if (currentUserId && currentUserId === userId) {
                try {
                    await authService.ensureUserProfile();
                } catch (ensureError) {
                    logger.warn('⚠️ [API] Failed to ensure user profile before removing bank details:', ensureError);
                }
                currentUser = await this.getById(userId);
            }
        }
        if (!currentUser) {
            throw new Error('User not found');
        }

        const currentBankDetails = Array.isArray(currentUser.bank_details) ? currentUser.bank_details : [];

        const matchIndex = currentBankDetails.findIndex((d) => {
            if (!d || typeof d !== 'object') return false;
            const row = d as unknown as Record<string, unknown>;
            return (
                row.bankName === bankData.bankName &&
                row.accountNo === bankData.accountNo &&
                row.accountName === bankData.accountName
            );
        });

        if (matchIndex === -1) {
            return await this.update(userId, { bank_details: currentBankDetails });
        }

        const updatedBankDetails = [
            ...currentBankDetails.slice(0, matchIndex),
            ...currentBankDetails.slice(matchIndex + 1),
        ];

        const updatedUser = await this.update(userId, { bank_details: updatedBankDetails });
        logger.info('✅ [API] Bank details removed successfully');
        return updatedUser;
    },

    // Delete user
    async delete(id: string): Promise<void> {
        const supabase = getSupabaseClient();

        const { error } = await supabase.from('users').delete().eq('id', id);
        if (!error) return;

        logger.warn('⚠️ [API] Failed to delete user row, attempting scrub update:', {
            id,
            message: error.message,
            code: error.code,
        });

        const placeholderEmail = `deleted+${id}@deleted.local`;
        const placeholderPhone = `del-${id}`.slice(0, 20);

        const { error: scrubError } = await supabase
            .from('users')
            .update({
                first_name: 'Deleted',
                last_name: 'User',
                email: placeholderEmail,
                phone_number: placeholderPhone,
                gender: null,
                avatar_url: null,
                bank_details: null,
            })
            .eq('id', id);

        if (scrubError) throw error;
    },
};

// ==================== PROPERTIES SERVICE ====================

export const propertyService = {
    // Get all properties
    async getAll(filters?: {
        type?: 'land' | 'housing';
        status?: 'available' | 'sold' | 'pending';
        limit?: number;
        offset?: number;
    }): Promise<Property[]> {
        let query = getSupabaseClient()
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        if (filters?.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    },

    // Get property by ID
    async getById(id: string): Promise<Property | null> {
        const { data, error } = await getSupabaseClient()
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },

    // Search properties
    async search(query: string, filters?: {
        type?: 'land' | 'housing';
        status?: 'available' | 'sold' | 'pending';
        minPrice?: number;
        maxPrice?: number;
    }): Promise<Property[]> {
        let dbQuery = getSupabaseClient()
            .from('properties')
            .select('*')
            .or(`title.ilike.%${query}%,location.ilike.%${query}%,description.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        if (filters?.type) {
            dbQuery = dbQuery.eq('type', filters.type);
        }

        if (filters?.status) {
            dbQuery = dbQuery.eq('status', filters.status);
        }

        if (filters?.minPrice) {
            dbQuery = dbQuery.gte('price', filters.minPrice);
        }

        if (filters?.maxPrice) {
            dbQuery = dbQuery.lte('price', filters.maxPrice);
        }

        const { data, error } = await dbQuery;

        if (error) throw error;
        return data || [];
    },

    // Create new property
    async create(property: PropertyInsert): Promise<Property> {
        const { data, error } = await getSupabaseClient()
            .from('properties')
            .insert(property)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update property
    async update(id: string, updates: PropertyUpdate): Promise<Property> {
        const { data, error } = await getSupabaseClient()
            .from('properties')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete property
    async delete(id: string): Promise<void> {
        const { error } = await getSupabaseClient()
            .from('properties')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ==================== RECEIPTS SERVICE ====================

export const receiptService = {
    // Get all receipts
    async getAll(filters?: {
        realtor_id?: string;
        status?: 'pending' | 'approved' | 'rejected';
        limit?: number;
        offset?: number;
    }): Promise<Receipt[]> {
        let query = getSupabaseClient()
            .from('receipts')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.realtor_id) {
            query = query.eq('realtor_id', filters.realtor_id);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        if (filters?.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    },

    // Get receipt by ID
    async getById(id: string): Promise<Receipt | null> {
        const { data, error } = await getSupabaseClient()
            .from('receipts')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },

    // Get receipts by realtor ID
    async getByRealtorId(realtorId: string): Promise<Receipt[]> {
        const { data, error } = await getSupabaseClient()
            .from('receipts')
            .select('*')
            .eq('realtor_id', realtorId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Create new receipt
    async create(receipt: ReceiptInsert): Promise<Receipt> {
        const { data, error } = await getSupabaseClient()
            .from('receipts')
            .insert(receipt)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update receipt
    async update(id: string, updates: ReceiptUpdate): Promise<Receipt> {
        const { data, error } = await getSupabaseClient()
            .from('receipts')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Notification Logic
        if (updates.status && ['approved', 'rejected'].includes(updates.status) && data.realtor_id) {
            try {
                const isApproved = updates.status === 'approved';
                await notificationService.create({
                    user_id: data.realtor_id,
                    type: isApproved ? 'success' : 'error',
                    title: `Receipt ${isApproved ? 'Approved' : 'Rejected'}`,
                    message: `Your receipt for client ${data.client_name} has been ${updates.status}.`,
                    seen: false,
                    metadata: {
                        receipt_id: data.id,
                        client_name: data.client_name,
                        status: updates.status,
                    },
                });
                logger.info(`🔔 [RECEIPT] Notification sent for receipt ${id} (${updates.status})`);
            } catch (notifyError) {
                logger.warn('⚠️ [RECEIPT] Failed to send notification:', notifyError);
            }
        }

        return data;
    },

    // Delete receipt
    async delete(id: string): Promise<void> {
        const { error } = await getSupabaseClient()
            .from('receipts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ==================== COMMISSIONS SERVICE ====================

export const commissionService = {
    // Get all commissions
    async getAll(filters?: {
        realtor_id?: string;
        status?: 'pending' | 'approved' | 'paid';
        limit?: number;
        offset?: number;
    }): Promise<Commission[]> {
        let query = getSupabaseClient()
            .from('commissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.realtor_id) {
            query = query.eq('realtor_id', filters.realtor_id);
        }

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        if (filters?.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    },

    // Get commission by ID
    async getById(id: string): Promise<Commission | null> {
        const { data, error } = await getSupabaseClient()
            .from('commissions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },

    // Get commissions by realtor ID
    async getByRealtorId(realtorId: string): Promise<Commission[]> {
        const { data, error } = await getSupabaseClient()
            .from('commissions')
            .select('*')
            .eq('realtor_id', realtorId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Get commissions by receipt ID
    async getByReceiptId(receiptId: string): Promise<Commission[]> {
        const { data, error } = await getSupabaseClient()
            .from('commissions')
            .select('*')
            .eq('receipt_id', receiptId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Create new commission
    async create(commission: CommissionInsert): Promise<Commission> {
        const { data, error } = await getSupabaseClient()
            .from('commissions')
            .insert(commission)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update commission
    async update(id: string, updates: CommissionUpdate): Promise<Commission> {
        const { data, error } = await getSupabaseClient()
            .from('commissions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Notification Logic
        if (updates.status && ['approved', 'paid', 'rejected'].includes(updates.status)) {
            try {
                const isSuccess = updates.status === 'approved' || updates.status === 'paid';
                await notificationService.create({
                    user_id: data.realtor_id,
                    type: isSuccess ? 'success' : 'error',
                    title: `Commission ${updates.status === 'paid' ? 'Paid' : updates.status === 'approved' ? 'Approved' : 'Rejected'}`,
                    message: isSuccess
                        ? `Your commission of ₦${data.amount.toLocaleString()} has been ${updates.status}.`
                        : `Your commission of ₦${data.amount.toLocaleString()} has been rejected.`,
                    seen: false,
                    metadata: {
                        commission_id: data.id,
                        amount: data.amount,
                        status: updates.status,
                    },
                });
                logger.info(`🔔 [COMMISSION] Notification sent for commission ${id} (${updates.status})`);
            } catch (notifyError) {
                logger.warn('⚠️ [COMMISSION] Failed to send notification:', notifyError);
            }
        }

        return data;
    },

    // Delete commission
    async delete(id: string): Promise<void> {
        const { error } = await getSupabaseClient()
            .from('commissions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ==================== REFERRALS SERVICE ====================

export const referralService = {
    // Get all referrals
    async getAll(filters?: {
        upline_id?: string;
        downline_id?: string;
        level?: number;
    }): Promise<Referral[]> {
        let query = getSupabaseClient()
            .from('referrals')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.upline_id) {
            query = query.eq('upline_id', filters.upline_id);
        }

        if (filters?.downline_id) {
            query = query.eq('downline_id', filters.downline_id);
        }

        if (filters?.level) {
            query = query.eq('level', filters.level);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    },

    // Get referral by ID
    async getById(id: string): Promise<Referral | null> {
        const { data, error } = await getSupabaseClient()
            .from('referrals')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },

    // Get referrals by upline ID with downline details
    async getReferralsByUpline(
        uplineId: string
    ): Promise<(Referral & { downline?: { first_name: string | null; last_name: string | null; email?: string | null; phone_number?: string | null } | null })[]> {
        const { data, error } = await getSupabaseClient()
            .from('referrals')
            .select('*, downline:users!referrals_downline_id_fkey(first_name,last_name,email,phone_number)')
            .eq('upline_id', uplineId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Get referral stats
    async getReferralStats(userId: string): Promise<{ totalReferrals: number; totalCommission: number }> {
        const { data, error } = await getSupabaseClient()
            .from('referrals')
            .select('commission_earned')
            .eq('upline_id', userId);

        if (error) throw error;

        const totalReferrals = data?.length || 0;
        const totalCommission = data?.reduce((sum, ref) => sum + (ref.commission_earned || 0), 0) || 0;

        return { totalReferrals, totalCommission };
    },

    // Get referrals by upline ID
    async getByUplineId(
        uplineId: string
    ): Promise<(Referral & { downline?: { first_name: string | null; last_name: string | null; email?: string | null; phone_number?: string | null } | null })[]> {
        const { data, error } = await getSupabaseClient()
            .from('referrals')
            .select('*, downline:users!referrals_downline_id_fkey(first_name,last_name,email,phone_number)')
            .eq('upline_id', uplineId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Get referrals by downline ID
    async getByDownlineId(downlineId: string): Promise<Referral[]> {
        const { data, error } = await getSupabaseClient()
            .from('referrals')
            .select('*')
            .eq('downline_id', downlineId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    // Create new referral
    async create(referral: ReferralInsert): Promise<Referral> {
        const { data, error } = await getSupabaseClient()
            .from('referrals')
            .insert(referral)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update referral
    async update(id: string, updates: ReferralUpdate): Promise<Referral> {
        const { data, error } = await getSupabaseClient()
            .from('referrals')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete referral
    async delete(id: string): Promise<void> {
        const { error } = await getSupabaseClient()
            .from('referrals')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async attachReferralCode(referralCode: string): Promise<void> {
        const trimmed = referralCode.trim();
        if (!trimmed) throw new Error('Referral code is required');

        const supabase = getSupabaseClient();
        const { data, error } = await supabase.functions.invoke('referrals-attach', {
            body: { referralCode: trimmed },
        });

        if (error) throw error;
        if (data && typeof (data as { error?: unknown }).error === 'string') {
            throw new Error((data as { error: string }).error);
        }
    },
};

// ==================== NOTIFICATIONS SERVICE ====================

export const notificationService = {
    // Get all notifications
    async getAll(filters?: {
        user_id?: string;
        seen?: boolean;
        type?: string;
        limit?: number;
        offset?: number;
    }): Promise<Notification[]> {
        let query = getSupabaseClient()
            .from('notifications')
            .select('*')
            .or('target_role.is.null,target_role.neq.admin')
            .order('created_at', { ascending: false });

        if (filters?.user_id) {
            query = query.eq('user_id', filters.user_id);
        }

        if (filters?.seen !== undefined) {
            query = query.eq('seen', filters.seen);
        }

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        if (filters?.offset) {
            query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    },

    // Get notification by ID
    async getById(id: string): Promise<Notification | null> {
        const { data, error } = await getSupabaseClient()
            .from('notifications')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    },

    // Get notifications by user ID
    async getByUserId(userId: string, filters?: {
        seen?: boolean;
        type?: string;
    }): Promise<Notification[]> {
        let query = getSupabaseClient()
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (filters?.seen !== undefined) {
            query = query.eq('seen', filters.seen);
        }

        if (filters?.type) {
            query = query.eq('type', filters.type);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data || [];
    },

    // Get unread notifications count
    async getUnreadCount(userId: string): Promise<number> {
        const { count, error } = await getSupabaseClient()
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('seen', false);

        if (error) throw error;
        return count || 0;
    },

    // Create new notification
    async create(notification: NotificationInsert): Promise<Notification> {
        const { data, error } = await getSupabaseClient().rpc('create_notification', {
            p_user_id: notification.user_id,
            p_type: notification.type,
            p_title: notification.title ?? null,
            p_message: notification.message ?? null,
            p_seen: notification.seen ?? false,
            p_metadata: notification.metadata ?? null,
        });

        if (error) throw error;
        return data as Notification;
    },

    // Update notification
    async update(id: string, updates: NotificationUpdate): Promise<Notification> {
        const { data, error } = await getSupabaseClient()
            .from('notifications')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Mark notification as seen
    async markAsSeen(id: string): Promise<Notification> {
        return this.update(id, { seen: true });
    },

    // Mark all notifications as seen for a user
    async markAllAsSeen(userId: string): Promise<void> {
        const { error } = await getSupabaseClient()
            .from('notifications')
            .update({ seen: true })
            .eq('user_id', userId)
            .or('target_role.is.null,target_role.neq.admin')
            .eq('seen', false);

        if (error) throw error;
    },

    // Delete notification
    async delete(id: string): Promise<void> {
        const { error } = await getSupabaseClient()
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ==================== EXPORT ALL SERVICES ====================

export default {
    userService,
    propertyService,
    receiptService,
    commissionService,
    referralService,
    notificationService,
};

