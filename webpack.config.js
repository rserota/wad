const path = require('path');

module.exports = {
	entry: './src/main.js',
	mode: 'development',
	devtool: 'source-map',
	output: {
		filename: 'wad.js',
		path: path.resolve(__dirname, 'build'),
		library: 'Wad',
		libraryTarget: 'umd',
		libraryExport: 'default'
	}
};
