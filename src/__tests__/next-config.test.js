import { describe, it, expect } from 'vitest';
import nextConfig from '../../next.config.mjs';

describe('next.config.mjs Security Headers Configuration', () => {
    it('should configure strict production headers', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        const headersResult = await nextConfig.headers();
        const globalHeaders = headersResult.find(route => route.source === '/(.*)');
        const getHeader = (key) => globalHeaders.headers.find(h => h.key === key)?.value;

        expect(getHeader('Content-Security-Policy')).not.toContain("'unsafe-eval'");
        expect(getHeader('Strict-Transport-Security')).toContain('max-age=63072000');
        expect(getHeader('Strict-Transport-Security')).toContain('preload');

        process.env.NODE_ENV = originalEnv;
    });

    it('should configure relaxed development headers', async () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        const headersResult = await nextConfig.headers();
        const globalHeaders = headersResult.find(route => route.source === '/(.*)');
        const getHeader = (key) => globalHeaders.headers.find(h => h.key === key)?.value;

        expect(getHeader('Content-Security-Policy')).toContain("'unsafe-eval'");
        expect(getHeader('Strict-Transport-Security')).toContain('max-age=31536000');
        expect(getHeader('Strict-Transport-Security')).not.toContain('preload');

        process.env.NODE_ENV = originalEnv;
    });
});
