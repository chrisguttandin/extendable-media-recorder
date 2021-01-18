const { env } = require('process');

// eslint-disable-next-line padding-line-between-statements
const filter = (predicate, ...tasks) => (predicate ? tasks : []);
const isTarget = (...targets) => env.TARGET === undefined || targets.includes(env.TARGET);
const isType = (...types) => env.TYPE === undefined || types.includes(env.TYPE);

module.exports = {
    build: ['clean:build', 'sh:build-es2019', 'sh:build-es5'],
    lint: ['sh:lint-config', 'sh:lint-src', 'sh:lint-test'],
    test: [
        ...filter(
            isType('expectation'),
            ...filter(isTarget(), 'sh:test-expectation-chrome'),
            ...filter(isTarget('firefox'), 'sh:test-expectation-firefox'),
            ...filter(isTarget('firefox-legacy'), 'sh:test-expectation-firefox-legacy'),
            ...filter(isTarget(), 'sh:test-expectation-safari')
        ),
        ...filter(isType('integration'), 'sh:test-integration'),
        ...filter(isType('unit'), 'sh:test-unit')
    ]
};
