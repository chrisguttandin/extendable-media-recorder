import { webdriverio } from '@vitest/browser-webdriverio';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            instances: [
                {
                    browser: 'chrome',
                    name: 'Chrome Canary',
                    provider: webdriverio({
                        capabilities: {
                            'goog:chromeOptions': {
                                args: ['--autoplay-policy=no-user-gesture-required', '--headless'],
                                binary: '/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary'
                            }
                        }
                    })
                }
            ]
        },
        dir: 'test/expectation/chrome/canary/',
        include: ['**/*.js'],
        watch: false
    }
});
