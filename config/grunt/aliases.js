const { env } = require('process');

// eslint-disable-next-line padding-line-between-statements
const filter = (predicate, ...tasks) => (predicate ? tasks : []);
const isTarget = (...targets) => env.TARGET === undefined || targets.includes(env.TARGET);
const isType = (...types) => env.TYPE === undefined || types.includes(env.TYPE);

module.exports = {
    build: ['sh:build'],
    lint: ['sh:lint-config', 'sh:lint-src', 'sh:lint-test'],
    test: [
        ...filter(
            isType('expectation'),
            ...filter(isTarget(), 'sh:test-expectation-chrome'),
            ...filter(isTarget(), 'sh:test-expectation-chrome-canary'),
            ...filter(isTarget('chrome-penultimate'), 'sh:test-expectation-chrome-penultimate'),
            ...filter(isTarget('chrome-previous'), 'sh:test-expectation-chrome-previous'),
            ...filter(isTarget('firefox'), 'sh:test-expectation-firefox'),
            ...filter(isTarget(), 'sh:test-expectation-firefox-developer'),
            ...filter(isTarget('firefox-penultimate'), 'sh:test-expectation-firefox-penultimate'),
            ...filter(isTarget('firefox-previous'), 'sh:test-expectation-firefox-previous'),
            ...filter(isTarget('safari'), 'sh:test-expectation-safari')
        ),
        ...filter(isType('integration'), 'sh:test-integration'),
        ...filter(isType('unit'), 'sh:test-unit')
    ]
};
