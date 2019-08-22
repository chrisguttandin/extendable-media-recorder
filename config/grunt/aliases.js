const { env } = require('process');

module.exports = {
    build: [
        'clean:build',
        'sh:build-es2018',
        'sh:build-es5'
    ],
    continuous: [
        'karma:continuous'
    ],
    lint: [
        'sh:lint-config',
        'sh:lint-src',
        'sh:lint-test'
    ],
    test: (env.TRAVIS)
        ? [
            'karma:test',
            'karma:test-firefox'
        ]
        : [
            'karma:test',
            'karma:test-chrome',
            'karma:test-firefox'
        ]
};
