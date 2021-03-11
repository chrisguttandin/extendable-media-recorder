const { env } = require('process');
const { DefinePlugin } = require('webpack');

module.exports = (config) => {
    config.set({
        basePath: '../../',

        browserDisconnectTimeout: 100000,

        browserNoActivityTimeout: 100000,

        browsers: ['ChromeCanaryHeadlessWithNoRequiredUserGesture'],

        concurrency: 1,

        customLaunchers: {
            ChromeCanaryHeadlessWithNoRequiredUserGesture: {
                base: 'ChromeCanaryHeadless',
                flags: ['--autoplay-policy=no-user-gesture-required']
            }
        },

        files: ['test/expectation/chrome/canary/**/*.js'],

        frameworks: ['mocha', 'sinon-chai'],

        preprocessors: {
            'test/expectation/chrome/canary/**/*.js': 'webpack'
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
