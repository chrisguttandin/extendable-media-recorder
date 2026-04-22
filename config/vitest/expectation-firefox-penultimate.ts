import { webdriverio } from '@vitest/browser-webdriverio';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            instances: [
                {
                    browser: 'firefox',
                    name: 'Firefox',
                    provider: webdriverio({
                        capabilities: {
                            'moz:firefoxOptions': {
                                args: ['-headless'],
                                binary: 'firefox-v148/firefox/Firefox.app/Contents/MacOS/firefox',
                                prefs: { 'media.autoplay.default': 0 }
                            }
                        }
                    })
                }
            ]
        },
        dir: 'test/expectation/firefox/penultimate/',
        include: ['**/*.js'],
        watch: false
    }
});
