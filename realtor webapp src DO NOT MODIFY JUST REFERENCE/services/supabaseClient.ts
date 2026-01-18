import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { API_BASE_URL, API_KEY } from './app_url';
import { logger } from '../utils/logger';

// Validate environment variables
if (!API_BASE_URL) {
    logger.error('❌ VITE_API_BASE_URL is not set in environment variables');
    logger.error('Please create a .env file in the root directory with:');
    logger.error('VITE_API_BASE_URL=your_supabase_url');
}

if (!API_KEY) {
    logger.error('❌ VITE_API_KEY is not set in environment variables');
    logger.error('Please create a .env file in the root directory with:');
    logger.error('VITE_API_KEY=your_supabase_anon_key');
}

let supabase: SupabaseClient | null = null;

function initSupabaseClient(): SupabaseClient | null {
    if (supabase) return supabase;
    if (!API_BASE_URL || !API_KEY) return null;

    try {
        supabase = createClient(API_BASE_URL, API_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            },
        });
        logger.info('✅ Supabase client initialized with session persistence');
        return supabase;
    } catch (error) {
        logger.error('❌ Failed to initialize Supabase client:', error);
        return null;
    }
}

// Helper function to get supabase client or throw error
export function getSupabaseClient(): SupabaseClient {
    const client = initSupabaseClient();
    if (!client) {
        throw new Error(
            'Supabase client is not initialized. Please check your .env file and ensure VITE_API_BASE_URL and VITE_API_KEY are set correctly.'
        );
    }
    return client;
}

// Export the client (will be null if initialization failed)
export { supabase };

/**
 * Check Supabase connection status
 * Logs connection status to console
 */
export async function checkSupabaseConnection(): Promise<void> {
    try {
        logger.info('🔌 Checking Supabase connection...');


        if (!API_BASE_URL || !API_KEY) {
            logger.error('❌ Supabase connection failed: Missing API_BASE_URL or API_KEY');
            logger.error('📝 Please ensure your .env file contains:');
            logger.error('   VITE_API_BASE_URL=your_supabase_project_url');
            logger.error('   VITE_API_KEY=your_supabase_anon_key');
            return;
        }

        const supabase = initSupabaseClient();
        if (!supabase) return;

        // Test connection by making a simple query to a table (try properties first, fallback to users)
        // Using properties table as it's less likely to have RLS recursion issues
        let testTable = 'properties';
        let { error } = await supabase
            .from(testTable)
            .select('*')
            .limit(0);

        // If properties table fails with RLS recursion, try a different approach
        if (error && error.message.includes('infinite recursion')) {
            logger.warn('⚠️ RLS infinite recursion detected on properties table');
            // Try users table as fallback
            testTable = 'users';
            const usersResult = await supabase
                .from(testTable)
                .select('*')
                .limit(0);
            error = usersResult.error;
        }

        // If we get an error, it might be a permissions issue, but connection is working
        // If we get a network error, connection failed
        if (error) {
            // Check if it's a network/connection error vs permission error
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                logger.error('❌ Supabase connection failed: Network error');
                logger.error('Error details:', error);
            } else if (error.message.includes('infinite recursion')) {
                // Specific handling for RLS infinite recursion error
                logger.error('❌ RLS Policy Error: Infinite recursion detected');
                logger.error('📋 This is a database configuration issue, not a code issue.');
                logger.error('🔧 To fix this in Supabase:');
                logger.error('   1. Go to your Supabase Dashboard');
                logger.error('   2. Navigate to Authentication > Policies');
                logger.error('   3. Check the RLS policies on the "' + testTable + '" table');
                logger.error('   4. Look for policies that reference the same table they\'re protecting');
                logger.error('   5. Remove circular references or use SECURITY DEFINER functions');
                logger.error('📖 Error details:', error.message);
                logger.info('✅ Supabase client initialized successfully (connection works, RLS needs fixing)');
            } else {
                // Other permission errors mean connection is working but RLS might be blocking
                logger.warn('⚠️ Supabase connection established but query failed (may be RLS/permissions):', error.message);
                logger.info('✅ Supabase client initialized successfully');
            }
        } else {
            logger.info('✅ Supabase connection successful!');
            logger.info('📊 Database is accessible');
        }
    } catch (error) {
        logger.error('❌ Supabase connection failed:', error);
    }
}

