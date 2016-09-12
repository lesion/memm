module.exports = {
  entry: {
    'popup.js': './app/popup.js',
    'background.js': './app/background.js'
  },
  output: {
    path: 'dist',
    filename: '[name]'
  },
  module: {
    loaders: [
      {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  resolve: {
    // resolve file extensions
    extensions: ['.js', '']
  }
}
