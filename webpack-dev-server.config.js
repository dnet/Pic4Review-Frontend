const webpack = require('webpack');
const path = require('path');
const TransferWebpackPlugin = require('transfer-webpack-plugin');

const config = {
	// Entry points to the project
	entry: {
		main: [
			// only- means to only hot reload for successful updates
			'webpack/hot/only-dev-server',
			'./src/app/app.js',
		]
	},
	// Server Configuration options
	devServer: {
		contentBase: 'src/www', // Relative directory for base of server
		hot: true, // Live-reload
		inline: true,
		port: 3000, // Port Number
		host: 'localhost', // Change to '0.0.0.0' for external facing server
	},
	devtool: 'eval',
	output: {
		path: path.resolve(__dirname, 'build'), // Path of output file
		filename: '[name].js',
	},
	plugins: [
		// Enables Hot Modules Replacement
		new webpack.HotModuleReplacementPlugin(),
		// Moves files
		new TransferWebpackPlugin([
			{from: 'www'},
		], path.resolve(__dirname, 'src')),
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					cacheDirectory: true,
				},
			},
			{
				test: /\.css$/,
				loader: 'style-loader!css-loader'
			},
			{
				test: /\.(png|jpg|svg)$/,
				loader: "file-loader?name=images/[name].[ext]"
			}
		],
	},
	resolve: {
		modules: ['node_modules', path.resolve('/src')],
		extensions: ['.js'],
		alias: {
			leaflet_css: path.resolve(__dirname, "node_modules/leaflet/dist/leaflet.css"),
			leaflet_marker: path.resolve(__dirname, "node_modules/leaflet/dist/images/marker-icon.png"),
			leaflet_marker_2x: path.resolve(__dirname, "node_modules/leaflet/dist/images/marker-icon-2x.png"),
			leaflet_marker_shadow: path.resolve(__dirname, "node_modules/leaflet/dist/images/marker-shadow.png"),
		}
	}
};

module.exports = config;
