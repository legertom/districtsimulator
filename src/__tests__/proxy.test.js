import { proxy, config } from '@/proxy';

describe('Proxy Configuration (Next.js 16+)', () => {
    it('should export the withAuth wrapped proxy proxy', () => {
        expect(proxy).toBeDefined();
        // Since it's wrapped by next-auth, verifying it's a function is the best we can do without e2e testing the edge runtime
        expect(typeof proxy).toBe('function');
    });

    describe('Matcher Configuration', () => {
        it('should have a matcher array defined', () => {
            expect(config).toBeDefined();
            expect(Array.isArray(config.matcher)).toBe(true);
            expect(config.matcher.length).toBeGreaterThan(0);
        });

        it('should contain the specific regex for excluding public assets and auth endpoints', () => {
            const matcherRegexStr = config.matcher[0];
            expect(matcherRegexStr).toBe('/((?!login|api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)');
        });
    });
});
