/* eslint-disable @typescript-eslint/no-explicit-any */
import { authService, type SignUpData } from './authService';
import { storageService } from './storageService';
import { userService } from './apiService';
import type { User } from './types';
import { logger } from '../utils/logger';
import { validateNigerianPhone } from '../utils/ngPhone';

export interface RegistrationData {
    // Step 1: Create Account
    email: string;
    password: string;

    // Step 2: Personal Info
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    referralCode?: string;

    // Step 3: KYC (optional)
    kycDocument?: File;
    documentType?: string;
}

export interface RegistrationResult {
    success: boolean;
    user: User | null;
    error: string | null;
}

/**
 * Registration Service - Handles complete registration flow
 */
export const registrationService = {
    /**
     * Complete registration process
     * 1. Sign up user with auth
     * 2. Create user profile
     * 3. Handle referral code
     * 4. Upload KYC document if provided
     * 5. Update user with KYC document URL
     */
    async register(data: RegistrationData): Promise<RegistrationResult> {
        logger.info('📝 [REGISTRATION] Starting registration process', {
            email: data.email,
            hasKycDocument: !!data.kycDocument,
            documentType: data.documentType,
        });

        try {
            const stringifyError = (err: unknown) => {
                const seen = new Set<unknown>();
                const collect = (value: unknown, depth: number): string[] => {
                    if (depth > 2) return [];
                    if (value == null) return [];
                    if (typeof value === 'string') return [value];
                    if (typeof value === 'number' || typeof value === 'boolean') return [String(value)];
                    if (typeof value !== 'object') return [];
                    if (seen.has(value)) return [];
                    seen.add(value);

                    if (Array.isArray(value)) {
                        return value.flatMap((v) => collect(v, depth + 1));
                    }

                    const obj = value as Record<string, unknown>;
                    return Object.keys(obj).flatMap((k) => {
                        const v = obj[k];
                        if (typeof v === 'string') return [`${k}: ${v}`];
                        if (typeof v === 'number' || typeof v === 'boolean') return [`${k}: ${String(v)}`];
                        if (v && typeof v === 'object') return collect(v, depth + 1);
                        return [];
                    });
                };

                return collect(err, 0).join('\n');
            };

            const isDuplicateViolation = (err: unknown) => {
                if (!err || typeof err !== 'object') return false;
                const anyErr = err as { code?: unknown };
                const code = typeof anyErr.code === 'string' ? anyErr.code : undefined;
                if (code === '23505') return true;
                const haystack = stringifyError(err).toLowerCase();
                return (
                    haystack.includes('duplicate key value violates unique constraint') ||
                    haystack.includes('sqlstate 23505') ||
                    haystack.includes('users_phone_number_key') ||
                    haystack.includes('users_email_key')
                );
            };

            const mapDuplicateMessage = (err: unknown) => {
                if (!err || typeof err !== 'object') return 'Registration failed. Please try again.';
                const haystack = stringifyError(err).toLowerCase();

                if (haystack.includes('users_phone_number_key') || haystack.includes('(phone_number)')) {
                    return 'That phone number is already in use. Please use a different number or log in.';
                }

                if (haystack.includes('users_email_key') || haystack.includes('(email)')) {
                    return 'That email is already in use. Please log in instead.';
                }

                return 'Registration failed. Please try again.';
            };

            const phoneResult = validateNigerianPhone(data.phone);
            if (!phoneResult.valid) {
                return {
                    success: false,
                    user: null,
                    error:
                        'Enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678)',
                };
            }

            // Step 1: Sign up user (creates auth user + user profile)
            logger.info('👤 [REGISTRATION] Step 1: Creating user account...');
            const signUpData: SignUpData = {
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: phoneResult.normalized,
                gender: this.mapGender(data.gender),
                referralCode: data.referralCode,
            };

            const { user, error: signUpError } = await authService.signUp(signUpData);

            if (signUpError || !user) {
                if (!signUpError && !user) {
                    if (data.kycDocument && data.documentType) {
                        return {
                            success: true,
                            user: null,
                            error:
                                'Account created. Please confirm your email, then log in to upload your KYC document.',
                        };
                    }

                    return {
                        success: true,
                        user: null,
                        error: null,
                    };
                }

                logger.error('❌ [REGISTRATION] User signup failed:', signUpError);

                let errorMessage = signUpError?.message || 'Registration failed. Please try again.';
                if (isDuplicateViolation(signUpError)) {
                    errorMessage = mapDuplicateMessage(signUpError);
                }

                return {
                    success: false,
                    user: null,
                    error: errorMessage,
                };
            }

            logger.info('✅ [REGISTRATION] User account created successfully:', user.id);

            // Step 2: Upload KYC document if provided
            if (data.kycDocument && data.documentType) {
                logger.info('📄 [REGISTRATION] Step 2: Uploading KYC document...', {
                    fileName: data.kycDocument.name,
                    fileSize: data.kycDocument.size,
                    documentType: data.documentType,
                });

                try {
                    const documentUrl = await storageService.uploadKYCDocument(
                        user.id,
                        data.kycDocument,
                        data.documentType
                    );

                    logger.info('✅ [REGISTRATION] KYC document uploaded:', documentUrl);

                    // Step 3: Update user with KYC document URL
                    logger.info('🔄 [REGISTRATION] Updating user with KYC document URL...');
                    await userService.update(user.id, {
                        id_document_url: documentUrl,
                        kyc_status: 'pending', // KYC status will be reviewed by admin
                    });

                    logger.info('✅ [REGISTRATION] User updated with KYC document');

                    // Refresh user data
                    const updatedUser = await userService.getById(user.id);
                    if (updatedUser) {
                        logger.info('✅ [REGISTRATION] Registration completed successfully with KYC');
                        return {
                            success: true,
                            user: updatedUser,
                            error: null,
                        };
                    }
                } catch (uploadError: any) {
                    // If KYC upload fails, user is still created, just log the error
                    logger.error('❌ [REGISTRATION] KYC document upload failed:', {
                        message: uploadError?.message,
                        name: uploadError?.name,
                        error: uploadError,
                    });

                    // Provide helpful message based on error type
                    let errorMessage = 'User created but KYC document upload failed. You can upload it later from your profile settings.';

                    if (uploadError?.message?.includes('row-level security policy')) {
                        errorMessage = 'User created successfully! However, KYC document upload failed due to permissions. ' +
                            'Please confirm your email first, then you can upload your KYC document from your profile settings.';
                    } else if (uploadError?.message?.includes('must be logged in')) {
                        errorMessage = 'User created successfully! Please confirm your email, then log in to upload your KYC document.';
                    }

                    // Return success but note the KYC upload failed
                    return {
                        success: true,
                        user,
                        error: errorMessage,
                    };
                }
            } else {
                logger.info('⏭️ [REGISTRATION] KYC document skipped');
            }

            logger.info('✅ [REGISTRATION] Registration completed successfully');
            return {
                success: true,
                user,
                error: null,
            };
        } catch (error) {
            logger.error('❌ [REGISTRATION] Registration failed with error:', error);
            return {
                success: false,
                user: null,
                error: error instanceof Error ? error.message : 'Registration failed',
            };
        }
    },

    /**
     * Map gender string to database format
     */
    mapGender(gender: string): 'male' | 'female' | 'other' | undefined {
        const normalized = gender.toLowerCase().trim();
        if (normalized === 'male') return 'male';
        if (normalized === 'female') return 'female';
        if (normalized === 'other') return 'other';
        return undefined;
    },

    /**
     * Validate referral code
     */
    async validateReferralCode(referralCode: string): Promise<boolean> {
        try {
            const user = await userService.getByReferralCode(referralCode.trim());
            return user !== null;
        } catch {
            return false;
        }
    },

    /**
     * Resend confirmation email
     */
    async resendConfirmationEmail(email: string) {
        return authService.resendConfirmationEmail(email);
    },
};

