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
                        capabilities: {
                            'goog:chromeOptions': {
                                args: ['--autoplay-policy=no-user-gesture-required', '--headless'],
                                binary: 'chromium-v141/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
                            }
                        }
                    })
                }
            ]
        },
        dir: 'test/expectation/chrome/penultimate/',
        include: ['**/*.js'],
        watch: false
    }
});
