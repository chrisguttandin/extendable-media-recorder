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
        'eslint',
        // @todo Use grunt-lint again when it support the type-check option.
        'sh:lint'
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
