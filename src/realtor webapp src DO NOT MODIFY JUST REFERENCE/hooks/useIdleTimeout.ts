import { useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';

// Default timeout: 30 minutes
const DEFAULT_TIMEOUT = 30 * 60 * 1000;

export const useIdleTimeout = (timeout: number = DEFAULT_TIMEOUT) => {
    const timerRef = useRef<number | null>(null);

    const logout = useCallback(async () => {
        logger.info('⏰ [IDLE TIMEOUT] User inactive for too long, logging out...');
        try {
            await authService.signOut();
            window.location.href = '/login';
        } catch (error) {
            logger.error('❌ [IDLE TIMEOUT] Failed to sign out:', error);
        }
    }, []);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
        }
        timerRef.current = window.setTimeout(logout, timeout);
    }, [logout, timeout]);

    useEffect(() => {
        // Events to listen for
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        // Initial set
        resetTimer();

        // Add event listeners
        const handleActivity = () => {
            resetTimer();
        };

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Cleanup
        return () => {
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);
};
