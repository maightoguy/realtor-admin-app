import { getSupabaseClient } from './supabaseClient';
import { logger } from '../utils/logger';
import type { Favorite } from './types';

export const favoritesService = {
  /**
   * Get all favorites for a specific user
   */
  async getUserFavorites(userId: string): Promise<Favorite[]> {
    const supabase = getSupabaseClient();
    
    // We select the favorite record AND the related property details
    const { data, error } = await supabase
      .from('favorites')
      .select('*, property:properties(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('❌ [FAVORITES] Failed to fetch favorites:', error);
      throw error;
    }

    return (data as Favorite[]) || [];
  },

  /**
   * Add a property to favorites
   */
  async addFavorite(userId: string, propertyId: string) {
    const supabase = getSupabaseClient();
    
    // Check if already exists to avoid unique constraint error
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single();

    if (existing) {
      logger.info('ℹ️ [FAVORITES] Property already in favorites');
      return existing;
    }

    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: userId,
        property_id: propertyId
      })
      .select()
      .single();

    if (error) {
      logger.error('❌ [FAVORITES] Failed to add favorite:', error);
      throw error;
    }

    logger.info('✅ [FAVORITES] Added favorite:', propertyId);
    return data;
  },

  /**
   * Remove a property from favorites
   */
  async removeFavorite(userId: string, propertyId: string) {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) {
      logger.error('❌ [FAVORITES] Failed to remove favorite:', error);
      throw error;
    }

    logger.info('✅ [FAVORITES] Removed favorite:', propertyId);
    return true;
  }
};
