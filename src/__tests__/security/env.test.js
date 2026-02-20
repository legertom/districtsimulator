import { describe, it, expect, vi, afterEach } from 'vitest';
import { getNumericEnv, ENV } from '@/lib/security/env';

describe('Security Env Primitives', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should parse valid numeric env vars', () => {
        vi.stubEnv('TEST_NUM', '42');
        expect(getNumericEnv('TEST_NUM', 10)).toBe(42);
    });

    it('should fallback to default for invalid or negative numbers', () => {
        vi.stubEnv('TEST_NUM', 'abc');
        expect(getNumericEnv('TEST_NUM', 10)).toBe(10);

        vi.stubEnv('TEST_NUM2', '-5');
        expect(getNumericEnv('TEST_NUM2', 15)).toBe(15);
    });

    it('should fallback to default if missing', () => {
        expect(getNumericEnv('MISSING_VAR', 99)).toBe(99);
    });

    it('should throw Error if NEXTAUTH_SECRET is weak in production', () => {
        vi.stubEnv('NODE_ENV', 'production');
        vi.stubEnv('NEXTAUTH_SECRET', 'short');
        expect(() => ENV.validateAuthSecret()).toThrow(/CRITICAL: NEXTAUTH_SECRET is weakly configured/);

        vi.stubEnv('NEXTAUTH_SECRET', '12345678901234567890123456789012'); // 32 chars
        expect(() => ENV.validateAuthSecret()).not.toThrow();
    });

    it('should not throw Error if NODE_ENV is not production', () => {
        vi.stubEnv('NODE_ENV', 'development');
        vi.stubEnv('NEXTAUTH_SECRET', 'short');
        expect(() => ENV.validateAuthSecret()).not.toThrow();
    });
});
