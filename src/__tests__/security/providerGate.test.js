import { describe, it, expect, vi, afterEach } from 'vitest';
import { isGoogleProviderEnabled } from '@/lib/security/providerGate';

describe('Provider Gate', () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it('should return true when legitimate credentials exist', () => {
        vi.stubEnv('GOOGLE_CLIENT_ID', 'valid-id');
        vi.stubEnv('GOOGLE_CLIENT_SECRET', 'valid-secret');
        expect(isGoogleProviderEnabled()).toBe(true);
    });

    it('should return false when credentials are placeholders', () => {
        vi.stubEnv('GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID');
        vi.stubEnv('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET');
        expect(isGoogleProviderEnabled()).toBe(false);

        vi.stubEnv('GOOGLE_CLIENT_ID', 'placeholder_id');
        vi.stubEnv('GOOGLE_CLIENT_SECRET', 'valid');
        expect(isGoogleProviderEnabled()).toBe(false);
    });

    it('should return false when credentials are missing', () => {
        vi.stubEnv('GOOGLE_CLIENT_ID', '');
        vi.stubEnv('GOOGLE_CLIENT_SECRET', '');
        expect(isGoogleProviderEnabled()).toBe(false);
    });
});
