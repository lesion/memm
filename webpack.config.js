var path = require('path')
var webpack = require('webpack')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var packageJson = require('./package.json')

const bubleOptions = {
  transforms: {
    modules: false
  }
}

module.exports = {
  entry: {
    options: './app/options.js',
    popup: './app/popup.js',
    background: './app/background'
  },
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      vue: {
        js: {
          buble: bubleOptions
        }
      },
      buble: bubleOptions
    }),
    new webpack.optimize.UglifyJsPlugin({compress: { warnings: false}, output: { comments: false }, minimize: true, sourceMap: false}),
    new webpack.DefinePlugin({ ENV: {
      RELEASE: '"' + packageJson.version + '"'
    }}),
    new CopyWebpackPlugin([
      {from: 'app/popup.html'},
      {from: 'app/options.html'},
      {context: 'assets/', from: '**/*'}
    ])
  ],
  externals: { 'xmlhttprequest': 'XMLHttpRequest' },
  devtool: 'source-map',
  module: {
    rules: [
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.js$/, exclude: /(node_modules|dist)/, loader: 'buble-loader', options: bubleOptions },
      { test: /\.vue$/, loader: 'vue-loader', exclude: /node_modules/ },
      { test: /\.png$/, loader: 'file-loader', query: { name: '[path][name].[ext]' } },
      { test: /\.css$/, loader: 'style-loader!css-loader' }
    ]
  },
  resolve: {
    alias: { 'vue$': 'vue/dist/vue.runtime.esm' },
    extensions: ['.js', '.vue']
  }
}
