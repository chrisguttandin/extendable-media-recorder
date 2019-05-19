module.exports = {
    'continuous': {
        configFile: 'config/karma/config.js'
    },
    'test': {
        configFile: 'config/karma/config.js',
        singleRun: true
    },
    'test-chrome': {
        configFile: 'config/karma/expectation-chrome.js',
        singleRun: true
    },
    'test-firefox': {
        configFile: 'config/karma/expectation-firefox.js',
        singleRun: true
    }
};
