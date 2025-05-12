const { env } = require('process');
const { DefinePlugin } = require('webpack');

module.exports = (config) => {
    config.set({
        basePath: '../../',

        browserDisconnectTimeout: 100000,

        browserNoActivityTimeout: 100000,

        browsers: ['FirefoxDeveloperHeadlessWithPrefs'],

        client: {
            mocha: {
                bail: true,
                timeout: 20000
            }
        },

        concurrency: 1,

        customLaunchers: {
            FirefoxDeveloperHeadlessWithPrefs: {
                base: 'FirefoxDeveloperHeadless',
                prefs: {
                    'media.autoplay.default': 0
                }
            }
        },

        files: ['test/expectation/firefox/developer/**/*.js'],

        frameworks: ['mocha', 'sinon-chai'],

        preprocessors: {
            'test/expectation/firefox/developer/**/*.js': 'webpack'
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
};
