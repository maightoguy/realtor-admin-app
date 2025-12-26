import { getSupabaseClient } from './supabaseClient';
import { logger } from '../utils/logger';
import type { Receipt } from './types';
import { notificationService } from './apiService';



// 1. Define the valid statuses as a reusable type
export type ReceiptStatus = 'pending' | 'approved' | 'rejected' | 'under_review';

// Extend the Receipt type to match the new schema
// 2. Update the interface to explicitly include the new status union
export interface ReceiptWithProperty extends Omit<Receipt, 'status'> {
    property?: {
        title: string;
        location: string;
    };
    amount_paid: number;
    receipt_urls: string[]; 
    status: ReceiptStatus; // This tells TS that 'under_review' is now valid
}

export interface ReceiptInsert {
    realtor_id: string;
    property_id: string;
    client_name: string;
    amount_paid: number;
    receipt_urls: string[];
    status: 'pending' | 'approved' | 'rejected' | 'under_review';
}

export const receiptService = {
    // Upload files to Supabase Storage
    async uploadReceiptFiles(files: File[]): Promise<string[]> {
        const supabase = getSupabaseClient();
        const uploadedUrls: string[] = [];
        const user = (await supabase.auth.getUser()).data.user;

        if (!user) throw new Error('User not authenticated');

        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('receipt-uploads')
                .upload(filePath, file);

            if (uploadError) {
                logger.error('❌ Failed to upload receipt file:', uploadError);
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage
                .from('receipt-uploads')
                .getPublicUrl(filePath);
            
            uploadedUrls.push(data.publicUrl);
        }

        return uploadedUrls;
    },

    // Create a new receipt record in the database
    async createReceipt(receiptData: ReceiptInsert): Promise<ReceiptWithProperty> {
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('receipts')
            .insert(receiptData)
            .select()
            .single();

        if (error) {
            logger.error('❌ Failed to create receipt record:', error);
            throw error;
        }

        // Create notification for receipt submission
        try {
            await notificationService.create({
                user_id: receiptData.realtor_id,
                type: 'info',
                title: 'Receipt Submitted',
                message: `Receipt for client ${receiptData.client_name} has been submitted for review.`,
                seen: false,
                metadata: {
                    receipt_id: data.id,
                    amount: receiptData.amount_paid
                }
            });
            logger.info('🔔 [RECEIPT] Submission notification created');
        } catch (notifyError) {
            logger.warn('⚠️ [RECEIPT] Failed to create notification:', notifyError);
        }

        return data;
    },

    // Fetch receipts for the logged-in realtor
    async getRealtorReceipts(realtorId: string): Promise<ReceiptWithProperty[]> {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('receipts')
            .select(`
                *,
                property:properties (
                    title,
                    location
                )
            `)
            .eq('realtor_id', realtorId)
            .order('created_at', { ascending: false });

        if (error) {
            logger.error('❌ Failed to fetch receipts:', error);
            throw error;
        }

        return data as ReceiptWithProperty[];
    }
};
