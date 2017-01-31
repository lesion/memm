var path = require('path')
var webpack = require('webpack')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var packageJson = require('./package.json')

module.exports = {
  entry: {
    options: './app/options.js',
    popup: './app/popup.js',
    background: './app/background',
  },
  output: {
    path: 'dist',
    filename: '[name].js'
  },
  plugins: [
    new webpack.DefinePlugin({  ENV: {
        RELEASE: '"' + packageJson.version + '"'
      }
    }),
    new CopyWebpackPlugin([
      {from: 'app/popup.html'},
      {from: 'app/options.html'},
      {context: 'assets/', from: '**/*'}
    ])
  ],
  externals: { 'xmlhttprequest': 'XMLHttpRequest' },
  module: {
    loaders: [
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.js$/, exclude: /node_modules|dist/, loader: 'babel-loader?presets[]=es2015' },
      { test: /\.vue$/, loader: 'vue-loader', exclude: /node_modules/ },
      { test: /\.png$/, loader: 'url-loader' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
    ]
  },
  devtool: '#source-map',
  resolve: {
    extensions: ['.js', '.vue']
  },
}
