import { getSupabaseClient } from './supabaseClient';
import { logger } from '../utils/logger';

/**
 * Storage Service for Supabase Storage
 */
export const storageService = {
    /**
     * Upload a file to Supabase Storage
     * @param bucket - Storage bucket name
     * @param path - File path in bucket
     * @param file - File to upload
     * @param options - Upload options
     */
    async uploadFile(
        bucket: string,
        path: string,
        file: File,
        options?: {
            cacheControl?: string;
            contentType?: string;
            upsert?: boolean;
        }
    ) {
        logger.info('📤 [STORAGE] Uploading file', {
            bucket,
            path,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
        });

        const supabase = getSupabaseClient();

        // Check session before upload
        const { data: sessionCheck } = await supabase.auth.getSession();
        logger.info('🔐 [STORAGE] Session check before upload:', {
            hasSession: !!sessionCheck.session,
            userId: sessionCheck.session?.user?.id,
        });

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: options?.cacheControl || '3600',
                upsert: options?.upsert || false,
                contentType: options?.contentType || file.type,
            });

        if (error) {
            const statusCode =
                typeof error === 'object' && error !== null && 'statusCode' in error
                    ? (error as { statusCode?: unknown }).statusCode
                    : undefined;
            logger.error('❌ [STORAGE] File upload failed:', {
                message: error.message,
                name: error.name,
                statusCode,
            });
            throw error;
        }

        logger.info('✅ [STORAGE] File uploaded successfully:', data.path);
        return data;
    },

    /**
     * Get public URL for a file
     * @param bucket - Storage bucket name
     * @param path - File path in bucket
     */
    getPublicUrl(bucket: string, path: string): string {
        const supabase = getSupabaseClient();
        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    },

    /**
     * Delete a file from storage
     * @param bucket - Storage bucket name
     * @param path - File path in bucket
     */
    async deleteFile(bucket: string, path: string) {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.storage.from(bucket).remove([path]);
        if (error) throw error;
        return data;
    },

    /**
     * Upload KYC document
     * @param userId - User ID
     * @param file - Document file
     * @param documentType - Type of document (id, passport, license, utility)
     */
    async uploadKYCDocument(
        userId: string,
        file: File,
        documentType: string
    ): Promise<string> {
        logger.info('📄 [STORAGE] Uploading KYC document', {
            userId,
            documentType,
            fileName: file.name,
            fileSize: file.size,
        });

        const supabase = getSupabaseClient();

        // Verify user is authenticated before upload
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
            logger.error('❌ [STORAGE] No active session found:', sessionError);
            throw new Error('You must be logged in to upload documents. Please try again after confirming your email.');
        }

        logger.info('✅ [STORAGE] Session verified:', {
            userId: sessionData.session.user.id,
            matchesUploadUserId: sessionData.session.user.id === userId,
        });

        // Verify the userId matches the authenticated user
        if (sessionData.session.user.id !== userId) {
            logger.error('❌ [STORAGE] User ID mismatch:', {
                sessionUserId: sessionData.session.user.id,
                providedUserId: userId,
            });
            throw new Error('User ID mismatch. Cannot upload document.');
        }

        // Generate unique filename - ensure folder name matches auth.uid()
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}/${documentType}-${Date.now()}.${fileExt}`;
        const bucket = 'kyc-documents';

        logger.info('📁 [STORAGE] File path structure:', {
            fileName,
            folderName: userId,
            expectedByPolicy: 'auth.uid()::text',
            matches: sessionData.session.user.id === userId,
        });

        try {
            // Upload file
            await this.uploadFile(bucket, fileName, file, {
                contentType: file.type,
                upsert: false,
            });

            // Get public URL
            const publicUrl = this.getPublicUrl(bucket, fileName);
            logger.info('✅ [STORAGE] KYC document URL:', publicUrl);
            return publicUrl;
        } catch (error: unknown) {
            const err = error as { message?: unknown; name?: unknown; statusCode?: unknown } | null;
            logger.error('❌ [STORAGE] Error uploading KYC document:', {
                message: err?.message,
                name: err?.name,
                statusCode: err?.statusCode,
            });

            // Provide more helpful error message
            if (typeof err?.message === 'string' && err.message.includes('row-level security policy')) {
                throw new Error(
                    'Storage upload failed due to permissions. Please ensure you are logged in and try again. ' +
                    'If the issue persists, you can upload your KYC document later from your profile settings.'
                );
            }

            throw error;
        }
    },
};

