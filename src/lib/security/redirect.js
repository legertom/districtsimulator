import { logSecurityEvent } from './audit';

export function getSafeRedirectUrl(url, baseUrl) {
    try {
        if (url.startsWith("/")) {
            return new URL(url, baseUrl).toString();
        } else if (new URL(url).origin === baseUrl) {
            return url;
        }
    } catch (error) {
        // Ignore parse errors, fallback will apply
    }

    logSecurityEvent('blocked-redirect', { url, baseUrl });
    return baseUrl;
}
