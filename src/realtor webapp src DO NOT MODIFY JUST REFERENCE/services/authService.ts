import { getSupabaseClient } from './supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { User } from './types';
import { logger } from '../utils/logger';

export interface SignUpData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    gender?: 'male' | 'female' | 'other';
    referralCode?: string;
}

export interface AuthResponse {
    user: User | null;
    error: Error | null;
}

/**
 * Auth Service for Supabase Authentication
 */
export const authService = {
    async markCurrentUserDeleted() {
        const supabase = getSupabaseClient();
        const deletedAt = new Date().toISOString();
        logger.info('🗑️ [AUTH] Marking current user as deleted', { deletedAt });

        const result = await supabase.auth.updateUser({
            data: {
                deleted_at: deletedAt,
            },
        });

        if (result.error) {
            logger.error('❌ [AUTH] Failed to mark user as deleted:', {
                message: result.error.message,
                status: result.error.status,
            });
        } else {
            logger.info('✅ [AUTH] User marked as deleted');
        }

        return result;
    },
    /**
     * Sign up a new user with email and password
     * Creates auth user and user profile in database
     */
    async signUp(data: SignUpData): Promise<AuthResponse> {
        logger.info('🔐 [AUTH] Starting signup process', { email: data.email });

        try {
            const supabase = getSupabaseClient();

            const referralCode = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

            // Step 1: Create auth user
            logger.info('👤 [AUTH] Creating auth user...');
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                    data: {
                        first_name: data.firstName,
                        last_name: data.lastName,
                        phone_number: data.phoneNumber,
                        gender: data.gender?.toLowerCase(),
                        referral_code: referralCode,
                        referral_input_code: data.referralCode?.trim() ?? null,
                        referred_by: null,
                        role: 'realtor',
                        kyc_status: 'pending',
                    },
                },
            });

            if (authError) {
                logger.error('❌ [AUTH] Auth signup failed:', {
                    message: authError.message,
                    status: authError.status,
                    name: authError.name,
                });

                // Check if email already exists
                if (
                    authError.message.includes('User already registered') ||
                    authError.message.includes('already registered') ||
                    authError.message.includes('email address is already registered') ||
                    authError.status === 422
                ) {
                    const emailExistsError = new Error('This email address is already registered. Please use a different email or try logging in.');
                    emailExistsError.name = 'EmailExistsError';
                    return { user: null, error: emailExistsError };
                }

                return { user: null, error: authError };
            }

            if (!authData.user) {
                logger.error('❌ [AUTH] Auth user creation returned no user');
                return { user: null, error: new Error('Failed to create user') };
            }

            logger.info('✅ [AUTH] Auth user created:', authData.user.id);

            if (!authData.session) {
                return { user: null, error: null };
            }

            await supabase.auth.setSession({
                access_token: authData.session.access_token,
                refresh_token: authData.session.refresh_token,
            });

            let referredBy: string | null = null;
            if (data.referralCode?.trim()) {
                logger.info('🔍 [AUTH] Looking up referral code:', data.referralCode.trim());
                try {
                    const { data: referrer, error: referralError } = await supabase
                        .from('users')
                        .select('id')
                        .eq('referral_code', data.referralCode.trim())
                        .maybeSingle();

                    if (referralError) {
                        logger.warn('⚠️ [AUTH] Referral code lookup failed:', referralError.message);
                    } else if (referrer?.id) {
                        referredBy = referrer.id;
                        logger.info('✅ [AUTH] Referral code found, referrer ID:', referredBy);
                    } else {
                        logger.warn('⚠️ [AUTH] Referral code not found:', data.referralCode.trim());
                    }
                } catch (referralLookupError) {
                    logger.error('❌ [AUTH] Error during referral lookup:', referralLookupError);
                }
            }

            const userProfileData = {
                id: authData.user.id,
                email: data.email,
                first_name: data.firstName,
                last_name: data.lastName,
                phone_number: data.phoneNumber,
                gender: data.gender?.toLowerCase() as 'male' | 'female' | 'other' | null,
                referral_code: referralCode,
                referred_by: referredBy,
                role: 'realtor' as const,
                kyc_status: 'pending' as const,
            };

            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert(userProfileData)
                .select()
                .single();

            if (userError) {
                logger.error('❌ [AUTH] User profile creation failed:', {
                    message: userError.message,
                    code: userError.code,
                    details: userError.details,
                    hint: userError.hint,
                });

                if (
                    userError.message?.toLowerCase().includes('row-level security') ||
                    userError.message?.toLowerCase().includes('row level security') ||
                    userError.code === '42501'
                ) {
                    logger.warn('⚠️ [AUTH] User profile insert blocked by RLS during signup. Deferring profile creation until login.');
                    return { user: null, error: null };
                }

                if (userError.code === '23505') {
                    const match = userError.details?.match(/\(([^)]+)\)=\(([^)]+)\)/);
                    const violatedField = match ? match[1] : undefined;
                    const violatedValue = match ? match[2] : undefined;

                    const isEmailViolation =
                        violatedField === 'email' ||
                        (userError.message && userError.message.includes('users_email_key'));
                    const isPhoneViolation =
                        violatedField === 'phone_number' ||
                        (userError.message && userError.message.includes('users_phone_number_key'));

                    if (isEmailViolation) {
                        const email = violatedValue ?? data.email;
                        const emailExistsError = new Error(
                            `This email address (${email}) is already registered. Please use a different email or try logging in.`
                        );
                        emailExistsError.name = 'EmailExistsError';
                        return { user: null, error: emailExistsError };
                    }

                    if (isPhoneViolation) {
                        const phone = violatedValue ?? data.phoneNumber;
                        const phoneExistsError = new Error(
                            `This phone number (${phone}) is already registered. Please use a different phone number or try logging in.`
                        );
                        phoneExistsError.name = 'PhoneExistsError';
                        return { user: null, error: phoneExistsError };
                    }

                    if (violatedField && violatedValue) {
                        const uniqueError = new Error(
                            `The value (${violatedValue}) for ${violatedField} is already registered. Please use a different value or try logging in.`
                        );
                        uniqueError.name = 'UniqueViolationError';
                        return { user: null, error: uniqueError };
                    }
                }

                try {
                    const created = await authService.ensureUserProfile({ referredBy });
                    if (created) return { user: created, error: null };
                } catch (ensureError) {
                    logger.error('❌ [AUTH] Failed to recover by ensuring user profile:', ensureError);
                }

                return { user: null, error: userError };
            }

            if (referredBy) {
                const { error: referralError } = await supabase
                    .from('referrals')
                    .insert({
                        upline_id: referredBy,
                        downline_id: userData.id,
                        level: 1,
                        commission_earned: 0,
                    });

                if (referralError) {
                    logger.error('❌ [AUTH] Failed to create referral record:', referralError);
                }
            }

           
            

            return { user: userData, error: null };
        } catch (error) {
            logger.error('❌ [AUTH] Unexpected error during signup:', error);
            return {
                user: null,
                error: error instanceof Error ? error : new Error('Unknown error during signup'),
            };
        }
    },

    async ensureUserProfile(options?: { referredBy?: string | null }): Promise<User | null> {
        const supabase = getSupabaseClient();
        const session = await supabase.auth.getSession();
        const authUser = session.data.session?.user;
        if (!authUser) return null

        const meta = (authUser.user_metadata ?? {}) as Record<string, unknown>;

        const { data: existing, error: existingError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();

        if (existingError) throw existingError;
        const firstName =
            typeof meta.first_name === 'string'
                ? meta.first_name
                : typeof meta.firstName === 'string'
                    ? meta.firstName
                    : '';
        const lastName =
            typeof meta.last_name === 'string'
                ? meta.last_name
                : typeof meta.lastName === 'string'
                    ? meta.lastName
                    : '';
        const phoneNumber =
            typeof meta.phone_number === 'string'
                ? meta.phone_number
                : typeof meta.phoneNumber === 'string'
                    ? meta.phoneNumber
                    : typeof meta.phone === 'string'
                        ? meta.phone
                        : '';

        const genderValue = typeof meta.gender === 'string' ? meta.gender.toLowerCase() : null;
        const gender =
            genderValue === 'male' || genderValue === 'female' || genderValue === 'other'
                ? (genderValue as 'male' | 'female' | 'other')
                : null;

        if (existing) {
            const updates: Partial<User> = {};
            if (!existing.first_name?.trim() && firstName.trim()) updates.first_name = firstName;
            if (!existing.last_name?.trim() && lastName.trim()) updates.last_name = lastName;
            if (!existing.phone_number?.trim() && phoneNumber.trim()) updates.phone_number = phoneNumber;
            if (!existing.gender && gender) updates.gender = gender;

            if (Object.keys(updates).length) {
                const { data: repaired, error: repairError } = await supabase
                    .from('users')
                    .update(updates)
                    .eq('id', authUser.id)
                    .select()
                    .single();

                if (repairError) {
                    logger.warn('⚠️ [AUTH] Failed to backfill profile fields from auth metadata:', {
                        message: repairError.message,
                        code: repairError.code,
                    });
                    return existing;
                }
                return repaired;
            }

            return existing;
        }

        if (typeof meta.deleted_at === 'string' && meta.deleted_at.trim()) {
            return null;
        }

        const role = (typeof meta.role === 'string' ? meta.role : 'realtor') as 'realtor' | 'admin';
        const kycStatus = (typeof meta.kyc_status === 'string' ? meta.kyc_status : 'pending') as
            | 'pending'
            | 'approved'
            | 'rejected';

        const referralCode =
            typeof meta.referral_code === 'string' && meta.referral_code.trim()
                ? meta.referral_code
                : `REF-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        const referredByFromMeta = typeof meta.referred_by === 'string' ? meta.referred_by : null;
        const referredBy = options?.referredBy ?? referredByFromMeta;

        const insertData = {
            id: authUser.id,
            email: authUser.email ?? '',
            first_name: firstName,
            last_name: lastName,
            phone_number: phoneNumber,
            gender,
            role,
            referral_code: referralCode,
            referred_by: referredBy,
            kyc_status: kycStatus,
        };

        const { data: created, error: createError } = await supabase
            .from('users')
            .insert(insertData)
            .select()
            .single();

        if (createError) throw createError;

        if (referredBy) {
            const { error: referralError } = await supabase
                .from('referrals')
                .insert({
                    upline_id: referredBy,
                    downline_id: authUser.id,
                    level: 1,
                    commission_earned: 0,
                });

            if (referralError) {
                logger.error('❌ [AUTH] Failed to create referral record:', referralError);
            }
        }

        return created;
    },

    /**
     * Sign in with email and password
     */
    async signIn(email: string, password: string) {
        logger.info('🔐 [AUTH] Attempting sign in', { email });
        const supabase = getSupabaseClient();
        const result = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (result.error) {
            logger.error('❌ [AUTH] Sign in failed:', {
                message: result.error.message,
                status: result.error.status,
            });
        } else {
            logger.info('✅ [AUTH] Sign in successful:', result.data.user?.id);
        }

        return result;
    },

    /**
     * Sign in with Google OAuth
     */
    async signInWithGoogle() {
        logger.info('🔐 [AUTH] Initiating Google Sign In');
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            },
        });

        if (error) {
            logger.error('❌ [AUTH] Google Sign In failed:', error);
            return { error };
        }

        return { data, error: null };
    },

    /**
     * Sign out current user
     */
    async signOut() {
        const supabase = getSupabaseClient();
        return await supabase.auth.signOut();
    },

    /**
     * Get current authenticated user
     */
    async getCurrentUser() {
        const supabase = getSupabaseClient();
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    /**
     * Get current session
     */
    async getSession() {
        const supabase = getSupabaseClient();
        return await supabase.auth.getSession();
    },

    /**
     * Listen to auth state changes
     */
    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        const supabase = getSupabaseClient();
        return supabase.auth.onAuthStateChange(callback);
    },

    /**
     * Resend confirmation email to user
     */
    async resendConfirmationEmail(email: string) {
        logger.info('📧 [AUTH] Resending confirmation email', { email });
        const supabase = getSupabaseClient();
        
        const result = await supabase.auth.resend({
            type: 'signup',
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/login`,
            },
        });

        if (result.error) {
            logger.error('❌ [AUTH] Failed to resend confirmation email:', {
                message: result.error.message,
                status: result.error.status,
            });
            
            // Check for rate limiting
            if (result.error.status === 429) {
                return { 
                    error: new Error('Too many requests. Please wait a minute before trying again.') 
                };
            }
            
            return { error: result.error };
        }

        logger.info('✅ [AUTH] Confirmation email resent successfully');
        return { error: null };
    },

    /**
     * Send password reset email (recovery link)
     */
    async resetPasswordForEmail(email: string) {
        const redirectTo = `${window.location.origin}/login?mode=recovery`;
        logger.info('📧 [AUTH] Sending password reset email', { email, redirectTo });
        const supabase = getSupabaseClient();

        const result = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo,
        });

        if (result.error) {
            logger.error('❌ [AUTH] Failed to send password reset email:', {
                message: result.error.message,
                status: result.error.status,
            });
        } else {
            logger.info('✅ [AUTH] Password reset email sent successfully');
        }

        return result;
    },

    async sendAccountDeletionEmail(email: string) {
        logger.info('📧 [AUTH] Sending account deletion confirmation email', { email });
        const supabase = getSupabaseClient();

        const result = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false,
                emailRedirectTo: `${window.location.origin}/dashboard?tab=Settings&settingsTab=Profile&confirmDelete=1`,
            },
        });

        if (result.error) {
            logger.error('❌ [AUTH] Failed to send account deletion confirmation email:', {
                message: result.error.message,
                status: result.error.status,
            });
        } else {
            logger.info('✅ [AUTH] Account deletion confirmation email sent successfully');
        }

        return result;
    },

    /**
     * Verify OTP token for password reset
     * Uses 'email' type since we're using signInWithOtp for password recovery
     */
    async verifyOtp(email: string, token: string, type: 'email' | 'recovery' = 'email') {
        logger.info('🔐 [AUTH] Verifying OTP', { email, type });
        const supabase = getSupabaseClient();

        const result = await supabase.auth.verifyOtp({
            email,
            token,
            type,
        });

        if (result.error) {
            logger.error('❌ [AUTH] OTP verification failed:', {
                message: result.error.message,
                status: result.error.status,
            });
        } else {
            logger.info('✅ [AUTH] OTP verified successfully');
        }

        return result;
    },

    /**
     * Update user password (must be called after OTP verification)
     */
    async updatePassword(newPassword: string) {
        logger.info('🔑 [AUTH] Updating password');
        const supabase = getSupabaseClient();

        const result = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (result.error) {
            logger.error('❌ [AUTH] Failed to update password:', {
                message: result.error.message,
                status: result.error.status,
            });
        } else {
            logger.info('✅ [AUTH] Password updated successfully');
        }

        return result;
    },
};

