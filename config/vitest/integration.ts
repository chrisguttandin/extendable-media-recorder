import { env } from 'node:process';
import { webdriverio } from '@vitest/browser-webdriverio';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        bail: 1,
        watch: false,
        browser: {
            enabled: true,
            instances: env.CI
                ? env.TARGET === 'chrome'
                    ? [
                          {
                              browser: 'chrome',
                              name: 'Chrome',
                              provider: webdriverio({
                                  capabilities: { 'goog:chromeOptions': { args: ['--autoplay-policy=no-user-gesture-required'] } }
                              })
                          }
                      ]
                    : env.TARGET === 'firefox'
                      ? [
                            {
                                browser: 'firefox',
                                name: 'Firefox',
                                provider: webdriverio({
                                    capabilities: { 'moz:firefoxOptions': { prefs: { 'media.autoplay.default': 0 } } }
                                })
                            }
                        ]
                      : []
                : [
                      {
                          browser: 'chrome',
                          name: 'Chrome',
                          provider: webdriverio({
                              capabilities: {
                                  'goog:chromeOptions': {
                                      args: ['--autoplay-policy=no-user-gesture-required', '--headless']
                                  }
                              }
                          })
                      },
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
                      },
                      {
                          name: 'Firefox Developer',
                          browser: 'firefox',
                          provider: webdriverio({
                              capabilities: {
                                  'moz:firefoxOptions': {
                                      args: ['-headless'],
                                      prefs: { 'media.autoplay.default': 0 },
                                      binary: '/Applications/Firefox\ Developer\ Edition.app/Contents/MacOS/firefox'
                                  }
                              }
                          })
                      },
                      {
                          browser: 'firefox',
                          name: 'Firefox',
                          provider: webdriverio({
                              capabilities: {
                                  'moz:firefoxOptions': {
                                      args: ['-headless'],
                                      prefs: { 'media.autoplay.default': 0 }
                                  }
                              }
                          })
                      },
                      // @ts-expect-error
                      { browser: 'safari', name: 'Safari', provider: webdriverio({ capabilities: { 'webkit:alwaysAllowAutoplay': true } }) }
                  ]
        },
        dir: 'test/integration/',
        include: ['**/*.js'],
        setupFiles: ['config/vitest/integration-setup.ts']
    }
});
