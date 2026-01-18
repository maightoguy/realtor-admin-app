/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseClient } from './supabaseClient';
import { logger } from '../utils/logger';
import { referralService, userService } from './apiService';
import type { User } from './types';

/**
 * Auth Manager - Handles user persistence and token management
 * Supabase automatically handles token storage and refresh
 */

// Storage keys
const USER_STORAGE_KEY = 'realtor_app_user';
const SESSION_STORAGE_KEY = 'realtor_app_session';
const RECOVERY_MODE_STORAGE_KEY = 'realtor_app_recovery_mode';

export const authManager = {
    async attachPendingReferral(userProfile: User, meta: Record<string, unknown>) {
        if (userProfile.referred_by) return;

        const metaCode = typeof meta.referral_input_code === 'string' ? meta.referral_input_code.trim() : '';
        const storageCode = localStorage.getItem('pending_referral_code')?.trim() ?? '';
        const code = metaCode || storageCode;
        if (!code) return;

        try {
            await referralService.attachReferralCode(code);
            localStorage.removeItem('pending_referral_code');
            const refreshed = await userService.getById(userProfile.id);
            if (refreshed) this.saveUser(refreshed);
        } catch (error) {
            logger.warn('⚠️ [AUTH MANAGER] Failed to attach pending referral code:', error);
        }
    },

    async ensureReferralRecord(userProfile: User) {
        if (!userProfile.referred_by) return;
        if (userProfile.referred_by === userProfile.id) return;

        try {
            const supabase = getSupabaseClient();
            const { data: existing, error: existingError } = await supabase
                .from('referrals')
                .select('id')
                .eq('upline_id', userProfile.referred_by)
                .eq('downline_id', userProfile.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (existingError) {
                logger.warn('⚠️ [AUTH MANAGER] Failed to check existing referral record:', {
                    message: existingError.message,
                    code: existingError.code,
                });
                return;
            }

            if (existing?.id) return;

            const { error: insertError } = await supabase
                .from('referrals')
                .insert({
                    upline_id: userProfile.referred_by,
                    downline_id: userProfile.id,
                    level: 1,
                    commission_earned: 0,
                });

            if (insertError) {
                logger.warn('⚠️ [AUTH MANAGER] Failed to create referral record after sign-in:', {
                    message: insertError.message,
                    code: insertError.code,
                });
            } else {
                logger.info('✅ [AUTH MANAGER] Referral record created after sign-in', {
                    upline: userProfile.referred_by,
                    downline: userProfile.id,
                });
            }
        } catch (error) {
            logger.warn('⚠️ [AUTH MANAGER] Unexpected error ensuring referral record:', error);
        }
    },

    /**
     * Initialize auth state listener
     * Should be called once on app startup
     */
    initialize() {
        logger.info('🔐 [AUTH MANAGER] Initializing auth state listener...');

        const supabase = getSupabaseClient();

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                logger.info('🔄 [AUTH MANAGER] Auth state changed:', {
                    event,
                    userId: session?.user?.id,
                    hasSession: !!session,
                });

                const isRecovery = (() => {
                    try {
                        const urlRecovery =
                            window.location.search.includes('mode=recovery') ||
                            window.location.hash.includes('type=recovery');
                        const storageRecovery = localStorage.getItem(RECOVERY_MODE_STORAGE_KEY) === '1';
                        return urlRecovery || storageRecovery || event === 'PASSWORD_RECOVERY';
                    } catch {
                        return (
                            window.location.search.includes('mode=recovery') ||
                            window.location.hash.includes('type=recovery') ||
                            event === 'PASSWORD_RECOVERY'
                        );
                    }
                })();

                if (event === 'PASSWORD_RECOVERY') {
                    try {
                        localStorage.setItem(RECOVERY_MODE_STORAGE_KEY, '1');
                    } catch {
                        // ignore
                    }
                    this.clearUser();
                }

                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    if (session?.user) {
                        if (isRecovery) {
                            this.clearUser();
                            this.saveSession(session);
                            logger.info('🔐 [AUTH MANAGER] Recovery session detected, skipping profile fetch', {
                                userId: session.user.id,
                                event,
                            });
                            return;
                        }

                        const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
                        if (typeof meta.deleted_at === 'string' && meta.deleted_at.trim()) {
                            logger.warn('⚠️ [AUTH MANAGER] Deleted account signed in, signing out', {
                                userId: session.user.id,
                            });
                            await supabase.auth.signOut();
                            this.clearUser();
                            this.clearSession();
                            return;
                        }
                        logger.info('✅ [AUTH MANAGER] User signed in / token refreshed', {
                            userId: session.user.id,
                            email: session.user.email,
                        });

                        // Fetch and store user profile (non-blocking)
                        // Use setTimeout to prevent blocking the auth flow
                        setTimeout(async () => {
                            try {
                                const userProfile = await userService.getById(session.user.id);
                                if (userProfile) {
                                    this.saveUser(userProfile);
                                    await this.ensureReferralRecord(userProfile);
                                    await this.attachPendingReferral(userProfile, meta);
                                    logger.info('✅ [AUTH MANAGER] User profile saved:', userProfile.id);
                                } else {
                                    logger.warn('⚠️ [AUTH MANAGER] User profile not found in database');
                                }
                            } catch (error) {
                                logger.error('❌ [AUTH MANAGER] Failed to fetch user profile:', error);
                            }
                        }, 0);

                        // Save session info (Supabase already stores tokens)
                        this.saveSession(session);
                    }
                }

                if (event === 'SIGNED_OUT') {
                    logger.info('👋 [AUTH MANAGER] User signed out');
                    this.clearUser();
                    this.clearSession();
                    try {
                        localStorage.removeItem(RECOVERY_MODE_STORAGE_KEY);
                    } catch {
                        // ignore
                    }
                }

                if (event === 'USER_UPDATED') {
                    logger.info('🔄 [AUTH MANAGER] User updated');
                    if (session?.user) {
                        setTimeout(async () => {
                            try {
                                const userProfile = await userService.getById(session.user.id);
                                if (userProfile) {
                                    this.saveUser(userProfile);
                                }
                            } catch (error) {
                                logger.error('❌ [AUTH MANAGER] Failed to update user profile:', error);
                            }
                        }, 0);
                    }
                }
            }
        );

        // Check for existing session on startup
        this.checkExistingSession();

        return subscription;
    },

    /**
     * Check for existing session on app startup
     */
    async checkExistingSession() {
        try {
            const supabase = getSupabaseClient();
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                logger.error('❌ [AUTH MANAGER] Error checking session:', error);
                return;
            }

            if (session?.user) {
                const urlRecovery =
                    window.location.search.includes('mode=recovery') ||
                    window.location.hash.includes('type=recovery');
                const storageRecovery = (() => {
                    try {
                        return localStorage.getItem(RECOVERY_MODE_STORAGE_KEY) === '1';
                    } catch {
                        return false;
                    }
                })();

                if (urlRecovery || storageRecovery) {
                    try {
                        localStorage.setItem(RECOVERY_MODE_STORAGE_KEY, '1');
                    } catch {
                        // ignore
                    }
                    this.clearUser();
                    this.saveSession(session);
                    logger.info('🔐 [AUTH MANAGER] Recovery session detected, skipping profile restore', {
                        userId: session.user.id,
                    });
                    return;
                }

                logger.info('✅ [AUTH MANAGER] Existing session found:', {
                    userId: session.user.id,
                    expiresAt: new Date(session.expires_at! * 1000).toISOString(),
                });

                // Fetch and store user profile
                try {
                    const userProfile = await userService.getById(session.user.id);
                    if (userProfile) {
                        this.saveUser(userProfile);
                        this.saveSession(session);
                        logger.info('✅ [AUTH MANAGER] User profile restored from session');
                    }
                } catch (error) {
                    logger.error('❌ [AUTH MANAGER] Failed to restore user profile:', error);
                }
            } else {
                logger.info('ℹ️ [AUTH MANAGER] No existing session found');
                this.clearUser();
                this.clearSession();
                try {
                    localStorage.removeItem(RECOVERY_MODE_STORAGE_KEY);
                } catch {
                    // ignore
                }
            }
        } catch (error) {
            logger.error('❌ [AUTH MANAGER] Error in checkExistingSession:', error);
        }
    },

    /**
     * Save user profile to localStorage
     */
    saveUser(user: User) {
        try {
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
            logger.info('💾 [AUTH MANAGER] User saved to localStorage');
        } catch (error) {
            logger.error('❌ [AUTH MANAGER] Failed to save user to localStorage:', error);
        }
    },

    /**
     * Get user profile from localStorage
     */
    getUser(): User | null {
        try {
            const userStr = localStorage.getItem(USER_STORAGE_KEY);
            if (userStr) {
                return JSON.parse(userStr) as User;
            }
        } catch (error) {
            logger.error('❌ [AUTH MANAGER] Failed to get user from localStorage:', error);
        }
        return null;
    },

    /**
     * Save session info to localStorage (for reference, tokens are handled by Supabase)
     */
    saveSession(session: any) {
        try {
            const sessionInfo = {
                userId: session.user.id,
                email: session.user.email,
                expiresAt: session.expires_at,
                refreshedAt: Date.now(),
            };
            localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionInfo));
            logger.info('💾 [AUTH MANAGER] Session info saved');
        } catch (error) {
            logger.error('❌ [AUTH MANAGER] Failed to save session info:', error);
        }
    },

    /**
     * Get session info from localStorage
     */
    getSessionInfo(): { userId: string; email: string; expiresAt: number; refreshedAt: number } | null {
        try {
            const sessionStr = localStorage.getItem(SESSION_STORAGE_KEY);
            if (sessionStr) {
                return JSON.parse(sessionStr);
            }
        } catch (error) {
            logger.error('❌ [AUTH MANAGER] Failed to get session info:', error);
        }
        return null;
    },

    /**
     * Clear user from localStorage
     */
    clearUser() {
        try {
            localStorage.removeItem(USER_STORAGE_KEY);
            logger.info('🗑️ [AUTH MANAGER] User cleared from localStorage');
        } catch (error) {
            logger.error('❌ [AUTH MANAGER] Failed to clear user:', error);
        }
    },

    /**
     * Clear session from localStorage
     */
    clearSession() {
        try {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            logger.info('🗑️ [AUTH MANAGER] Session cleared from localStorage');
        } catch (error) {
            logger.error('❌ [AUTH MANAGER] Failed to clear session:', error);
        }
    },

    /**
     * Refresh user profile from database
     */
    async refreshUser(): Promise<User | null> {
        try {
            const supabase = getSupabaseClient();
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                logger.warn('⚠️ [AUTH MANAGER] No authenticated user to refresh');
                return null;
            }

            const userProfile = await userService.getById(authUser.id);
            if (userProfile) {
                this.saveUser(userProfile);
                logger.info('✅ [AUTH MANAGER] User profile refreshed');
                return userProfile;
            }

            return null;
        } catch (error) {
            logger.error('❌ [AUTH MANAGER] Failed to refresh user:', error);
            return null;
        }
    },
};

