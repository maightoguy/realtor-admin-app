/* eslint-disable @typescript-eslint/no-explicit-any */
import { authService, type SignUpData } from './authService';
import { storageService } from './storageService';
import { userService } from './apiService';
import type { User } from './types';
import { logger } from '../utils/logger';

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
            // Step 1: Sign up user (creates auth user + user profile)
            logger.info('👤 [REGISTRATION] Step 1: Creating user account...');
            const signUpData: SignUpData = {
                email: data.email,
                password: data.password,
                firstName: data.firstName,
                lastName: data.lastName,
                phoneNumber: data.phone,
                gender: this.mapGender(data.gender),
                referralCode: data.referralCode,
            };

            const { user, error: signUpError } = await authService.signUp(signUpData);

            if (signUpError || !user) {
                logger.error('❌ [REGISTRATION] User signup failed:', signUpError);

                // Check for email already exists error
                let errorMessage = signUpError?.message || 'Failed to create user account';

                // Specific duplicate errors bubbled up from authService
                if (signUpError?.name === 'EmailExistsError') {
                    errorMessage = signUpError.message;
                } else if (signUpError?.name === 'PhoneExistsError') {
                    errorMessage = signUpError.message;
                } else if ((signUpError as any)?.code === '23505') {
                    // Fallback: infer field from message/details for friendliness
                    const details: string = (signUpError as any)?.details || '';
                    const msg: string = (signUpError as any)?.message || '';
                    if (details.includes('users_email_key') || msg.includes('users_email_key') || details.includes('(email)')) {
                        errorMessage = 'This email address is already registered. Please use a different email or try logging in.';
                    } else if (details.includes('users_phone_number_key') || msg.includes('users_phone_number_key') || details.includes('(phone_number)')) {
                        errorMessage = 'This phone number is already registered. Please use a different phone number or try logging in.';
                    } else {
                        errorMessage = 'Duplicate data detected. Please use different values and try again.';
                    }
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

