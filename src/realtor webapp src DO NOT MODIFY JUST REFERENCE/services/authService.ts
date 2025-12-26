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
    /**
     * Sign up a new user with email and password
     * Creates auth user and user profile in database
     */
    async signUp(data: SignUpData): Promise<AuthResponse> {
        logger.info('🔐 [AUTH] Starting signup process', { email: data.email });

        try {
            const supabase = getSupabaseClient();

            // Step 1: Look up referral code BEFORE auth signup (to avoid RLS issues)
            // This is done while anonymous, so RLS policies that allow public read should work
            let referredBy: string | null = null;
            if (data.referralCode) {
                logger.info('🔍 [AUTH] Looking up referral code:', data.referralCode.trim());
                try {
                    const { data: referrer, error: referralError } = await supabase
                        .from('users')
                        .select('id')
                        .eq('referral_code', data.referralCode.trim())
                        .single();

                    if (referralError) {
                        logger.warn('⚠️ [AUTH] Referral code lookup failed:', referralError.message);
                        // Continue without referral - not a critical error
                    } else if (referrer) {
                        referredBy = referrer.id;
                        logger.info('✅ [AUTH] Referral code found, referrer ID:', referredBy);
                    } else {
                        logger.warn('⚠️ [AUTH] Referral code not found:', data.referralCode);
                    }
                } catch (referralLookupError) {
                    logger.error('❌ [AUTH] Error during referral lookup:', referralLookupError);
                    // Continue without referral - not a critical error
                }
            }

            // Step 2: Create auth user
            logger.info('👤 [AUTH] Creating auth user...');
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
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

            // Step 3: Generate unique referral code for new user
            // Use a combination of timestamp and random string for uniqueness
            const referralCode = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            logger.info('🎫 [AUTH] Generated referral code:', referralCode);

            // Step 4: Create user profile in database
            logger.info('📝 [AUTH] Creating user profile in database...');
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

            logger.info('📋 [AUTH] User profile data:', {
                ...userProfileData,
                password: '[REDACTED]',
            });

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

                // Handle unique constraint violations specifically
                if (userError.code === '23505') {
                    // Try to extract the violated field and value from details
                    const match = userError.details?.match(/\(([^)]+)\)=\(([^)]+)\)/);
                    const violatedField = match ? match[1] : undefined;
                    const violatedValue = match ? match[2] : undefined;

                    // Fallback detection via message text
                    const isEmailViolation =
                        violatedField === 'email' ||
                        (userError.message && userError.message.includes('users_email_key'));
                    const isPhoneViolation =
                        violatedField === 'phone_number' ||
                        (userError.message && userError.message.includes('users_phone_number_key'));

                    if (isEmailViolation) {
                        const email = violatedValue ?? data.email;
                        logger.info('📧 [AUTH] Duplicate email detected:', email);
                        const emailExistsError = new Error(
                            `This email address (${email}) is already registered. Please use a different email or try logging in.`
                        );
                        emailExistsError.name = 'EmailExistsError';
                        return { user: null, error: emailExistsError };
                    }

                    if (isPhoneViolation) {
                        const phone = violatedValue ?? data.phoneNumber;
                        logger.info('📱 [AUTH] Duplicate phone number detected:', phone);
                        const phoneExistsError = new Error(
                            `This phone number (${phone}) is already registered. Please use a different phone number or try logging in.`
                        );
                        phoneExistsError.name = 'PhoneExistsError';
                        return { user: null, error: phoneExistsError };
                    }

                    // Generic unique violation fallback
                    if (violatedField && violatedValue) {
                        const uniqueError = new Error(
                            `The value (${violatedValue}) for ${violatedField} is already registered. Please use a different value or try logging in.`
                        );
                        uniqueError.name = 'UniqueViolationError';
                        return { user: null, error: uniqueError };
                    }
                }

                // If user profile creation fails, we should clean up the auth user
                // But Supabase doesn't allow deleting auth users easily, so we'll just return error
                return { user: null, error: userError };
            }

            logger.info('✅ [AUTH] User profile created successfully:', userData.id);

            // Step 5: Create referral record if referred
            if (referredBy) {
                const { data: sessionData } = await supabase.auth.getSession();
                if (!sessionData.session?.user) {
                    logger.info('ℹ️ [AUTH] Skipping referral record creation (no active session)', {
                        downline: userData.id,
                        upline: referredBy,
                    });
                } else {
                    logger.info('🔗 [AUTH] Creating referral record...', { upline: referredBy, downline: userData.id });
                    const { error: referralError } = await supabase
                        .from('referrals')
                        .insert({
                            upline_id: referredBy,
                            downline_id: userData.id,
                            level: 1,
                            commission_earned: 0
                        });

                    if (referralError) {
                        logger.error('❌ [AUTH] Failed to create referral record:', referralError);
                    } else {
                        logger.info('✅ [AUTH] Referral record created successfully');
                    }
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
        logger.info('📧 [AUTH] Sending password reset email', { email });
        const supabase = getSupabaseClient();

        const result = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/login?mode=recovery`,
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

