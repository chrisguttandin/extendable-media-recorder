const { env } = require('process');

// eslint-disable-next-line padding-line-between-statements
const filter = (predicate, ...tasks) => (predicate) ? tasks : [ ];
const isTarget = (...targets) => (env.TARGET === undefined || targets.includes(env.TARGET));
const isType = (...types) => (env.TYPE === undefined || types.includes(env.TYPE));

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
    test: [
        ...filter(
            isType('expectation'),
            ...filter(isTarget(), 'karma:expectation-chrome'),
            ...filter(isTarget('firefox'), 'karma:expectation-firefox'),
            ...filter(isTarget(), 'karma:expectation-firefox-developer')
        ),
        ...filter(isType('integration'), 'karma:integration'),
        ...filter(isType('unit'), 'karma:unit')
    ]
};
