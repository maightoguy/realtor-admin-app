import { useEffect, useRef, useCallback, useState } from 'react';
import { authService } from '../services/authService';
import { authManager } from '../services/authManager';
import { logger } from '../utils/logger';

// Default timeout: 30 minutes
const DEFAULT_TIMEOUT = 30 * 60 * 1000;
// Default warning time: 60 seconds before timeout
const DEFAULT_WARNING_TIME = 60 * 1000;

interface UseIdleTimeoutOptions {
  timeout?: number;
  warningTime?: number;
  enabled?: boolean;
}

interface UseIdleTimeoutReturn {
  isWarning: boolean;
  resetTimer: () => void;
  logout: () => Promise<void>;
}

export const useIdleTimeout = ({
  timeout = DEFAULT_TIMEOUT,
  warningTime = DEFAULT_WARNING_TIME,
  enabled = true,
}: UseIdleTimeoutOptions = {}): UseIdleTimeoutReturn => {
  const [isWarning, setIsWarning] = useState(false);
  const idleTimerRef = useRef<number | null>(null);
  const logoutTimerRef = useRef<number | null>(null);
  const isWarningRef = useRef(isWarning);

  // Sync ref with state
  useEffect(() => {
    isWarningRef.current = isWarning;
  }, [isWarning]);

  // Determine when to show warning
  const idleTimeout = Math.max(0, timeout - warningTime);

  const performLogout = useCallback(async () => {
    logger.info('⏰ [IDLE TIMEOUT] User inactive for too long, logging out...');
    try {
      await authService.signOut();
      authManager.clearUser();
      authManager.clearSession();
      window.location.href = '/login';
    } catch (error) {
      logger.error('❌ [IDLE TIMEOUT] Failed to sign out:', error);
      // Force clear local storage just in case
      authManager.clearUser();
      authManager.clearSession();
      window.location.href = '/login';
    }
  }, []);

  const showWarning = useCallback(() => {
    logger.info('⚠️ [IDLE TIMEOUT] Showing warning...');
    setIsWarning(true);
    // Start the final countdown to logout
    if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
    logoutTimerRef.current = window.setTimeout(performLogout, warningTime);
  }, [performLogout, warningTime]);

  const resetTimer = useCallback(() => {
    // Clear both timers
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
    if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);

    // Reset state
    setIsWarning(false);

    // Restart idle timer only if enabled
    if (enabled) {
      idleTimerRef.current = window.setTimeout(showWarning, idleTimeout);
    }
  }, [idleTimeout, showWarning, enabled]);

  useEffect(() => {
    // If disabled, clear everything
    if (!enabled) {
        if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
        if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
        setIsWarning(false);
        return;
    }

    // Events to listen for
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Initial set
    resetTimer();

    // Add event listeners
    const handleActivity = () => {
      // If we are already in warning state, DO NOT auto-reset on movement.
      // User must explicitly interact with the modal (which calls resetTimer).
      // This prevents accidental dismissal if user is away and just bumps the desk.
      if (!isWarningRef.current) {
        resetTimer();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Cleanup
    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current);
      if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [resetTimer, enabled]); // Removed isWarning to prevent loop

  return {
    isWarning,
    resetTimer,
    logout: performLogout,
  };
};
