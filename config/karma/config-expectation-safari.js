module.exports = (config) => {
    config.set({
        browserNoActivityTimeout: 20000,

        browsers: ['Safari'],

        files: ['../../test/expectation/safari/**/*.js'],

        frameworks: ['mocha', 'sinon-chai'],

        preprocessors: {
            '../../test/expectation/safari/**/*.js': 'webpack'
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
