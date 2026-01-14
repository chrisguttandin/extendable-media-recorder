import { webdriverio } from '@vitest/browser-webdriverio';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            instances: [
                {
                    browser: 'chrome',
                    name: 'Chrome',
                    provider: webdriverio({
                        capabilities: { 'goog:chromeOptions': { args: ['--autoplay-policy=no-user-gesture-required', '--headless'] } }
                    })
                }
            ]
        },
        dir: 'test/expectation/chrome/current/',
        include: ['**/*.js'],
        watch: false
    }
});
