module.exports = (grunt) => {
    const continuous = grunt.option('continuous') === true;

    return {
        'build': {
            cmd: 'npm run build'
        },
        'lint-config': {
            cmd: 'npm run lint:config'
        },
        'lint-src': {
            cmd: 'npm run lint:src'
        },
        'lint-test': {
            cmd: 'npm run lint:test'
        },
        'test-expectation-chrome': {
            cmd: `karma start config/karma/config-expectation-chrome.js ${continuous ? '--concurrency Infinity' : '--single-run'}`
        },
        'test-expectation-chrome-canary': {
            cmd: `karma start config/karma/config-expectation-chrome-canary.js ${continuous ? '--concurrency Infinity' : '--single-run'}`
        },
        'test-expectation-chrome-penultimate': {
            cmd: `karma start config/karma/config-expectation-chrome-penultimate.js ${
                continuous ? '--concurrency Infinity' : '--single-run'
            }`
        },
        'test-expectation-chrome-previous': {
            cmd: `karma start config/karma/config-expectation-chrome-previous.js ${continuous ? '--concurrency Infinity' : '--single-run'}`
        },
        'test-expectation-firefox': {
            cmd: `karma start config/karma/config-expectation-firefox.js ${continuous ? '--concurrency Infinity' : '--single-run'}`
        },
        'test-expectation-firefox-developer': {
            cmd: `karma start config/karma/config-expectation-firefox-developer.js ${
                continuous ? '--concurrency Infinity' : '--single-run'
            }`
        },
        'test-expectation-firefox-penultimate': {
            cmd: `karma start config/karma/config-expectation-firefox-penultimate.js ${
                continuous ? '--concurrency Infinity' : '--single-run'
            }`
        },
        'test-expectation-firefox-previous': {
            cmd: `karma start config/karma/config-expectation-firefox-previous.js ${continuous ? '--concurrency Infinity' : '--single-run'}`
        },
        'test-expectation-safari': {
            cmd: `karma start config/karma/config-expectation-safari.js ${continuous ? '--concurrency Infinity' : '--single-run'}`
        },
        'test-integration': {
            cmd: `karma start config/karma/config-integration.js ${continuous ? '--concurrency Infinity' : '--single-run'}`
        },
        'test-unit': {
            cmd: `karma start config/karma/config-unit.js ${continuous ? '--concurrency Infinity' : '--single-run'}`
        }
    };
};
