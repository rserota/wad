const path = require('path');

module.exports = {
	entry: './src/main.js',
	mode: 'development',
	devtool: 'source-map',
	devServer: {
		contentBase: './test',
		watchContentBase: true,
		open:true,
	},
	output: {
		filename: 'wad.js',
		path: path.resolve(__dirname, 'build'),
		library: 'Wad',
		libraryTarget: 'umd',
		libraryExport: 'default'
	}
};
