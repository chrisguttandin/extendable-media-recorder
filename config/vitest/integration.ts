import { env } from 'node:process';
import { webdriverio } from '@vitest/browser-webdriverio';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        bail: 1,
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
                          headless: true,
                          name: 'Chrome',
                          provider: webdriverio({
                              capabilities: {
                                  'goog:chromeOptions': { args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'] }
                              }
                          })
                      },
                      {
                          browser: 'chrome',
                          headless: true,
                          name: 'Chrome Canary',
                          provider: webdriverio({
                              capabilities: {
                                  'goog:chromeOptions': {
                                      args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'],
                                      binary: '/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary'
                                  }
                              }
                          })
                      },
                      {
                          browser: 'firefox',
                          headless: true,
                          name: 'Firefox Developer',
                          provider: webdriverio({
                              capabilities: {
                                  'moz:firefoxOptions': {
                                      prefs: { 'media.autoplay.default': 0 },
                                      binary: '/Applications/Firefox\ Developer\ Edition.app/Contents/MacOS/firefox'
                                  }
                              }
                          })
                      },
                      {
                          browser: 'firefox',
                          headless: true,
                          name: 'Firefox',
                          provider: webdriverio({ capabilities: { 'moz:firefoxOptions': { prefs: { 'media.autoplay.default': 0 } } } })
                      },
                      {
                          browser: 'safari',
                          headless: false,
                          name: 'Safari',
                          // @ts-expect-error
                          provider: webdriverio({ capabilities: { 'webkit:alwaysAllowAutoplay': true } })
                      }
                  ]
        },
        dir: 'test/integration/',
        include: ['**/*.js'],
        watch: false
    }
});
