import { webdriverio } from '@vitest/browser-webdriverio';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        browser: {
            enabled: true,
            instances: [
                {
                    browser: 'firefox',
                    name: 'Firefox Developer',
                    provider: webdriverio({
                        capabilities: {
                            'moz:firefoxOptions': {
                                args: ['-headless'],
                                prefs: {
                                    'media.autoplay.default': 0,
                                    'binary': '/Applications/Firefox\ Developer\ Edition.app/Contents/MacOS/firefox'
                                }
                            }
                        }
                    })
                }
            ]
        },
        dir: 'test/expectation/firefox/developer/',
        include: ['**/*.js'],
        watch: false
    }
});
