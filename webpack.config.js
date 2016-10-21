var path = require('path')
var CopyWebpackPlugin = require('copy-webpack-plugin')
module.exports = {
  entry: {
    build: './app/main',
    background: './app/background',
    vendor: ['remotestoragejs',
      'remotestorage-module-bookmarks',
      'vue' ]
  },
  output: {
    path: 'dist',
    filename: '[name].js'
  },
  externals: { 'xmlhttprequest': 'XMLHttpRequest' },
  plugins: [
    new CopyWebpackPlugin([
      {from: 'app/popup.html'},
      {from: 'app/options.html'},
      {context: 'assets/', from: '**/*'}
    ])
  ],
  module: {
    loaders: [
      { test: /\.js$/, exclude: '/node_modules|dist/', loader: 'babel' },
      { test: /\.vue/, loader: 'vue', exclude: '/node_modules/' },
      { test: /\.png/, loader: 'url' }
    ]
  },
  resolveLoader: { fallback: path.join(__dirname, 'node_modules') },
  devtool: 'source-map',
  resolve: {
    fallback: path.join(__dirname, 'node_modules'),
    // resolve file extensions
    extensions: ['.js', '', '.vue']
  }
}
