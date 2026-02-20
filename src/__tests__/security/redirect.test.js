import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSafeRedirectUrl } from '@/lib/security/redirect';
import * as audit from '@/lib/security/audit';

vi.mock('@/lib/security/audit', () => ({
    logSecurityEvent: vi.fn()
}));

describe('Redirect Primitive', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should safely handle relative redirects', () => {
        const result = getSafeRedirectUrl('/dashboard', 'http://localhost:3000');
        expect(result).toBe('http://localhost:3000/dashboard');
        expect(audit.logSecurityEvent).not.toHaveBeenCalled();
    });

    it('should safely handle same-origin absolute redirects', () => {
        const result = getSafeRedirectUrl('http://localhost:3000/settings', 'http://localhost:3000');
        expect(result).toBe('http://localhost:3000/settings');
        expect(audit.logSecurityEvent).not.toHaveBeenCalled();
    });

    it('should block untrusted cross-origin redirects and log event', () => {
        const result = getSafeRedirectUrl('https://evil.com/phishing', 'http://localhost:3000');
        expect(result).toBe('http://localhost:3000');
        expect(audit.logSecurityEvent).toHaveBeenCalledWith('blocked-redirect', { url: 'https://evil.com/phishing', baseUrl: 'http://localhost:3000' });
    });

    it('should handle unparseable urls safely', () => {
        const result = getSafeRedirectUrl('not-a-valid-url://xyz', 'http://localhost:3000');
        expect(result).toBe('http://localhost:3000');
        expect(audit.logSecurityEvent).toHaveBeenCalled();
    });
});
