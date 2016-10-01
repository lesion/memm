const path = require('path')
const production = process.env.production

module.exports = {
  entry: {
    'popup.js': './app/popup.js',
    'background.js': './app/background.js',
    'options.js': './app/options.js'
  },
  output: {
    path: 'lib',
    filename: '[name]'
  },
  externals: { 'xmlhttprequest': 'XMLHttpRequest' },
  module: {
    loaders: [
      {test: /\.js$/, exclude: '/node_modules/', loader: 'buble' },
      {test: /\.vue/, loader: 'vue' }
    ]
  },
  resolveLoader: { fallback: path.join(__dirname, "node_modules") },
  devtool: 'source-map',
  resolve: {
    fallback: path.join(__dirname, "node_modules"),
    // resolve file extensions
    extensions: ['.js', '', '.vue']
  }
}
