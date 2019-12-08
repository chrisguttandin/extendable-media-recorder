module.exports = {
    'continuous': {
        configFile: 'config/karma/config.js'
    },
    'expectation-chrome': {
        configFile: 'config/karma/expectation-chrome.js',
        singleRun: true
    },
    'expectation-firefox': {
        configFile: 'config/karma/expectation-firefox.js',
        singleRun: true
    },
    'expectation-firefox-developer': {
        configFile: 'config/karma/expectation-firefox-developer.js',
        singleRun: true
    },
    'integration': {
        configFile: 'config/karma/integration.js',
        singleRun: true
    },
    'unit': {
        configFile: 'config/karma/unit.js',
        singleRun: true
    }
};
