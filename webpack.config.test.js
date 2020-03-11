const path = require('path');

module.exports = {
    entry: './test/6/src/index.js',
    mode: 'development',
    devtool: 'source-map',
    output: {
        filename: 'test.js',
        path: path.resolve(__dirname, './test/6/build'),

    }
};