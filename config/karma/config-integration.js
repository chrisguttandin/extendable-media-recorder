const { env } = require('process');
const { DefinePlugin } = require('webpack');

module.exports = (config) => {
    config.set({
        basePath: '../../',

        browserDisconnectTimeout: 100000,

        browserNoActivityTimeout: 100000,

        client: {
            mocha: {
                bail: true,
                timeout: 20000
            }
        },

        concurrency: 1,

        files: [
            {
                included: false,
                pattern: 'src/**',
                served: false,
                watched: true
            },
            'test/integration/**/*.js'
        ],

        frameworks: ['mocha', 'sinon-chai'],

        preprocessors: {
            'test/integration/**/*.js': 'webpack'
        },

        reporters: ['dots'],

        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.ts?$/,
                        use: {
                            loader: 'ts-loader',
                            options: {
                                compilerOptions: {
                                    declaration: false,
                                    declarationMap: false
                                }
                            }
                        }
                    }
                ]
            },
            plugins: [
                new DefinePlugin({
                    'process.env': {
                        CI: JSON.stringify(env.CI)
                    }
                })
            ],
            resolve: {
                extensions: ['.js', '.ts'],
                fallback: { util: false }
            }
        },

        webpackMiddleware: {
            noInfo: true
        }
    });

    if (env.CI) {
        config.set({
            browserStack: {
                accessKey: env.BROWSER_STACK_ACCESS_KEY,
                build: `${env.GITHUB_RUN_ID}/integration-${env.TARGET}`,
                forceLocal: true,
                localIdentifier: `${Math.floor(Math.random() * 1000000)}`,
                project: env.GITHUB_REPOSITORY,
                username: env.BROWSER_STACK_USERNAME,
                video: false
            },

            browsers:
                env.TARGET === 'chrome'
                    ? ['ChromeBrowserStack']
                    : env.TARGET === 'firefox'
                      ? ['FirefoxBrowserStack']
                      : env.TARGET === 'safari'
                        ? ['SafariBrowserStack']
                        : ['ChromeBrowserStack', 'FirefoxBrowserStack', 'SafariBrowserStack'],

            captureTimeout: 300000,

            customLaunchers: {
                ChromeBrowserStack: {
                    base: 'BrowserStack',
                    browser: 'chrome',
                    captureTimeout: 300,
                    os: 'OS X',
                    os_version: 'Ventura' // eslint-disable-line camelcase
                },
                FirefoxBrowserStack: {
                    base: 'BrowserStack',
                    browser: 'firefox',
                    captureTimeout: 300,
                    os: 'Windows',
                    os_version: '10' // eslint-disable-line camelcase
                },
                SafariBrowserStack: {
                    base: 'BrowserStack',
                    browser: 'safari',
                    captureTimeout: 300,
                    os: 'OS X',
                    os_version: 'Sequoia' // eslint-disable-line camelcase
                }
            }
        });
    } else {
        config.set({
            browsers: [
                'ChromeCanaryHeadlessWithFlags',
                'ChromeHeadlessWithFlags',
                'FirefoxDeveloperWithPrefs',
                'FirefoxWithPrefs',
                'Safari'
            ],

            customLaunchers: {
                ChromeCanaryHeadlessWithFlags: {
                    base: 'ChromeCanaryHeadless',
                    flags: ['--autoplay-policy=no-user-gesture-required']
                },
                ChromeHeadlessWithFlags: {
                    base: 'ChromeHeadless',
                    flags: ['--autoplay-policy=no-user-gesture-required']
                },
                FirefoxDeveloperWithPrefs: {
                    base: 'FirefoxDeveloperHeadless',
                    prefs: {
                        'media.autoplay.default': 0
                    }
                },
                FirefoxWithPrefs: {
                    base: 'FirefoxHeadless',
                    prefs: {
                        'media.autoplay.default': 0
                    }
                }
            }
        });
    }
};
