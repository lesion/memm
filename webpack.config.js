var path = require('path')
var CopyWebpackPlugin = require('copy-webpack-plugin')
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
    new CopyWebpackPlugin([
      {from: 'app/popup.html'},
      {from: 'app/options.html'},
      {context: 'assets/', from: '**/*'}
    ])
  ],
  externals: { 'xmlhttprequest': 'XMLHttpRequest' },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules|dist/, loader: 'babel-loader?presets[]=es2015' },
      { test: /\.vue$/, loader: 'vue', exclude: /node_modules/ },
      { test: /\.png$/, loader: 'url' }
    ]
  },
  // resolveLoader: { fallback: path.join(__dirname, 'node_modules') },
  devtool: '#source-map',
  resolve: {
    // fallback: path.join(__dirname, 'node_modules'),
    // resolve file extensions
    extensions: ['.js', '', '.vue']
  },
  vue: {
    loaders: {
      js: 'babel'
    }
  }
}
