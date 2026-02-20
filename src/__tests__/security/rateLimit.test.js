import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isRateLimited, clearRateLimit } from '@/lib/security/rateLimit';
import * as audit from '@/lib/security/audit';
import { ENV } from '@/lib/security/env';

vi.mock('@/lib/security/audit', () => ({
    logSecurityEvent: vi.fn()
}));

describe('Rate Limiter', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        // Stub to something other than 'test' to actually test logic
        vi.stubEnv('NODE_ENV', 'development');

        // Mock env properties manually
        vi.spyOn(ENV, 'AUTH_RATE_LIMIT_WINDOW_MS', 'get').mockReturnValue(1000);
        vi.spyOn(ENV, 'AUTH_MAX_ATTEMPTS', 'get').mockReturnValue(3);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllEnvs();
        clearRateLimit('test-user');
        vi.restoreAllMocks();
    });

    it('should trigger rate limit and log event after max attempts', () => {
        expect(isRateLimited('test-user')).toBe(false);
        expect(isRateLimited('test-user')).toBe(false);
        expect(isRateLimited('test-user')).toBe(false);
        expect(isRateLimited('test-user')).toBe(true); // Attempt #4 is limited

        expect(audit.logSecurityEvent).toHaveBeenCalledWith('rate-limit-triggered', { identifier: 'test-user' });
    });

    it('should disable rate limiting in test environment', () => {
        vi.stubEnv('NODE_ENV', 'test');
        expect(isRateLimited('test-user')).toBe(false);
        expect(isRateLimited('test-user')).toBe(false);
        expect(isRateLimited('test-user')).toBe(false);
        expect(isRateLimited('test-user')).toBe(false); // Even 4th is false
    });

    it('should reset limit after window expires', () => {
        expect(isRateLimited('test-user')).toBe(false);
        expect(isRateLimited('test-user')).toBe(false);
        expect(isRateLimited('test-user')).toBe(false);

        vi.advanceTimersByTime(1100);

        expect(isRateLimited('test-user')).toBe(false); // Reset
    });
});
