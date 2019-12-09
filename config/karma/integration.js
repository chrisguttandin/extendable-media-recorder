const { env } = require('process');
const { DefinePlugin } = require('webpack');

module.exports = (config) => {

    config.set({

        browserNoActivityTimeout: 20000,

        concurrency: 1,

        files: [
            '../../test/integration/**/*.js'
        ],

        frameworks: [
            'mocha',
            'sinon-chai'
        ],

        preprocessors: {
            '../../test/integration/**/*.js': 'webpack'
        },

        webpack: {
            mode: 'development',
            module: {
                rules: [ {
                    test: /\.ts?$/,
                    use: {
                        loader: 'ts-loader'
                    }
                } ]
            },
            plugins: [
                new DefinePlugin({
                    'process.env': {
                        TARGET: JSON.stringify(env.TARGET),
                        TRAVIS: JSON.stringify(env.TRAVIS)
                    }
                })
            ],
            resolve: {
                extensions: [ '.js', '.ts' ]
            }
        },

        webpackMiddleware: {
            noInfo: true
        }

    });

    if (env.TRAVIS) {

        config.set({

            browserStack: {
                accessKey: env.BROWSER_STACK_ACCESS_KEY,
                build: `${ env.TRAVIS_REPO_SLUG }/${ env.TRAVIS_JOB_NUMBER }/integration-${ env.TARGET }`,
                username: env.BROWSER_STACK_USERNAME,
                video: false
            },

            browsers: (env.TARGET === 'chrome')
                ? [
                    'ChromeBrowserStack'
                ]
                : (env.TARGET === 'firefox' || env.TARGET === 'firefox-unsupported')
                    ? [
                        'FirefoxBrowserStack'
                    ]
                    : [
                        'ChromeBrowserStack',
                        'FirefoxBrowserStack'
                    ],

            captureTimeout: 120000,

            customLaunchers: {
                ChromeBrowserStack: {
                    base: 'BrowserStack',
                    browser: 'chrome',
                    os: 'OS X',
                    os_version: 'Mojave' // eslint-disable-line camelcase
                },
                FirefoxBrowserStack: {
                    base: 'BrowserStack',
                    browser: 'firefox',
                    ...(env.TARGET.endsWith('-unsupported') ? { browser_version: '70' } : null), // eslint-disable-line camelcase
                    os: 'Windows',
                    os_version: '10' // eslint-disable-line camelcase
                }
            }

        });

    } else {

        config.set({

            browsers: [
                'ChromeCanaryHeadlessWithNoRequiredUserGesture',
                'ChromeHeadlessWithNoRequiredUserGesture',
                'FirefoxDeveloperHeadless',
                'FirefoxHeadless'
            ],

            customLaunchers: {
                ChromeCanaryHeadlessWithNoRequiredUserGesture: {
                    base: 'ChromeCanaryHeadless',
                    flags: [ '--autoplay-policy=no-user-gesture-required' ]
                },
                ChromeHeadlessWithNoRequiredUserGesture: {
                    base: 'ChromeHeadless',
                    flags: [ '--autoplay-policy=no-user-gesture-required' ]
                }
            }

        });

    }

};
