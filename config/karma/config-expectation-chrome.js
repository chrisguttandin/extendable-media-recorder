module.exports = (config) => {
    config.set({
        browserNoActivityTimeout: 40000,

        browsers: ['ChromeCanaryHeadlessWithNoRequiredUserGesture', 'ChromeHeadlessWithNoRequiredUserGesture'],

        customLaunchers: {
            ChromeCanaryHeadlessWithNoRequiredUserGesture: {
                base: 'ChromeCanaryHeadless',
                flags: ['--autoplay-policy=no-user-gesture-required']
            },
            ChromeHeadlessWithNoRequiredUserGesture: {
                base: 'ChromeHeadless',
                flags: ['--autoplay-policy=no-user-gesture-required']
            }
        },

        files: ['../../test/expectation/chrome/**/*.js'],

        frameworks: ['mocha', 'sinon-chai'],

        preprocessors: {
            '../../test/expectation/chrome/**/*.js': 'webpack'
        },

        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.ts?$/,
                        use: {
                            loader: 'ts-loader'
                        }
                    }
                ]
            },
            resolve: {
                extensions: ['.js', '.ts']
            }
        },

        webpackMiddleware: {
            noInfo: true
        }
    });
};
