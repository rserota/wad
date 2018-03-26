const path = require('path');

module.exports = {
    entry: './src/wad.js',
    mode: 'production',
    output: {
        filename: 'wad.js',
        path: path.resolve(__dirname, 'build'),
        library: 'Wad',
        libraryTarget: 'umd',
        libraryExport: 'default'
    }
};