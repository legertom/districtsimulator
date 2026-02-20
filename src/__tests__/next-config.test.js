import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config.mjs';

describe('next.config.mjs Security Headers Configuration', () => {
    it('should export an async headers function returning conservative security headers', async () => {
        const headersResult = await nextConfig.headers();
        expect(Array.isArray(headersResult)).toBe(true);
        expect(headersResult.length).toBeGreaterThan(0);

        const globalHeaders = headersResult.find(route => route.source === '/(.*)');
        expect(globalHeaders).toBeDefined();

        const getHeader = (key) => globalHeaders.headers.find(h => h.key === key)?.value;

        expect(getHeader('X-Frame-Options')).toBe('DENY');
        expect(getHeader('X-Content-Type-Options')).toBe('nosniff');
        expect(getHeader('Referrer-Policy')).toBe('origin-when-cross-origin');
        expect(getHeader('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
        expect(getHeader('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
        expect(getHeader('Content-Security-Policy')).toContain("default-src 'self'");
    });
});
