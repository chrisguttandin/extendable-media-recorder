import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            isolate: false,
            instances: [
                { browser: 'webkit', name: 'Safari', provider: playwright({ launchOptions: { executablePath: 'webkit-v18-4/pw_run.sh' } }) }
            ]
        },
        dir: 'test/expectation/safari/previous/',
        include: ['**/*.js'],
        watch: false
    }
});
