const { env } = require('process');

module.exports = (config) => {

    config.set({

        browserNoActivityTimeout: 20000,

        files: [
            '../../test/expectation/firefox/any/**/*.js',
            '../../test/expectation/firefox/current/**/*.js'
        ],

        frameworks: [
            'mocha',
            'sinon-chai'
        ],

        preprocessors: {
            '../../test/expectation/firefox/any/**/*.js': 'webpack',
            '../../test/expectation/firefox/current/**/*.js': 'webpack'
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
                username: env.BROWSER_STACK_USERNAME
            },

            browsers: [
                'FirefoxBrowserStack'
            ],

            captureTimeout: 120000,

            customLaunchers: {
                FirefoxBrowserStack: {
                    base: 'BrowserStack',
                    browser: 'firefox',
                    os: 'Windows',
                    os_version: '10' // eslint-disable-line camelcase
                }
            },

            tunnelIdentifier: env.TRAVIS_JOB_NUMBER

        });

    } else {

        config.set({

            browsers: [
                'FirefoxHeadless'
            ]

        });

    }

};
