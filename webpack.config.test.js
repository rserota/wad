const path = require('path');

module.exports = {
    entry: './test/es6/src/index.js',
    mode: 'development',
    output: {
        filename: 'test.js',
        path: path.resolve(__dirname, './test/es6/build'),

    }
};