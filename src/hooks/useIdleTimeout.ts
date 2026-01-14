import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { authManager } from '../services/authManager';
import { logger } from '../utils/logger';

export function useIdleTimeout(timeoutMs: number = 15 * 60 * 1000) { // Default 15 minutes
  const navigate = useNavigate();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      logger.info('[AUTH] Session expired due to inactivity');
      
      // Explicitly clear local storage
      authManager.clearUser();
      authManager.clearSession();
      
      // Sign out from Supabase
      try {
        await authService.signOut();
      } catch (error) {
        logger.error('[AUTH] Error signing out on timeout', { error });
      }

      // Redirect to login
      navigate('/login', { replace: true, state: { sessionExpired: true } });
    }, timeoutMs);
  };

  useEffect(() => {
    // Events to detect activity
    const events = [
      'mousedown',
      'mousemove',
      'keydown',
      'scroll',
      'touchstart',
      'click',
      'keypress'
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Initial timer start
    resetTimer();

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      // Cleanup
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [timeoutMs, navigate]);
}
