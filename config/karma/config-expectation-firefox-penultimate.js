const { env } = require('process');
const { DefinePlugin } = require('webpack');

module.exports = (config) => {
    config.set({
        basePath: '../../',

        browserDisconnectTimeout: 100000,

        browserNoActivityTimeout: 100000,

        browsers: ['penultimateFirefoxHeadless'],

        client: {
            mocha: {
                bail: true,
                timeout: 20000
            }
        },

        concurrency: 1,

        customLaunchers: {
            penultimateFirefoxHeadless: {
                base: 'FirefoxHeadless',
                command: 'firefox-v119/firefox/Firefox.app/Contents/MacOS/firefox'
            }
        },

        files: ['test/expectation/firefox/penultimate/**/*.js'],

        frameworks: ['mocha', 'sinon-chai'],

        preprocessors: {
            'test/expectation/firefox/penultimate/**/*.js': 'webpack'
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
