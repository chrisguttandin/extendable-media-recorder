module.exports = (config) => {

    config.set({

        browserNoActivityTimeout: 20000,

        files: [
            '../../test/unit/**/*.js'
        ],

        frameworks: [
            'mocha',
            'sinon-chai'
        ],

        preprocessors: {
            '../../test/unit/**/*.js': 'webpack'
        },

        webpack: {
            module: {
                loaders: [
                    {
                        loader: 'ts-loader',
                        test: /\.ts?$/
                    }
                ]
            },
            resolve: {
                extensions: [ '.js', '.ts' ]
            }
        },

        webpackMiddleware: {
            noInfo: true
        }

    });

    if (process.env.TRAVIS) {

        config.set({

            browserStack: {
                accessKey: process.env.BROWSER_STACK_ACCESS_KEY,
                username: process.env.BROWSER_STACK_USERNAME
            },

            browsers: [
                'ChromeBrowserStack',
                'FirefoxBrowserStack'
            ],

            captureTimeout: 120000,

            customLaunchers: {
                ChromeBrowserStack: {
                    base: 'BrowserStack',
                    browser: 'chrome',
                    os: 'OS X',
                    os_version: 'Sierra' // eslint-disable-line camelcase
                },
                FirefoxBrowserStack: {
                    base: 'BrowserStack',
                    browser: 'firefox',
                    os: 'OS X',
                    os_version: 'Sierra' // eslint-disable-line camelcase
                }
            },

            tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER

        });

    } else {

        config.set({

            browsers: [
                'ChromeHeadless',
                'ChromeCanaryHeadless',
                'Firefox',
                'FirefoxDeveloper'
            ]

        });

    }

};
