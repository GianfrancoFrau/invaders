const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const { InjectManifest } = require('workbox-webpack-plugin')

module.exports = {
  // entry: ['./src/scripts/game.ts', './webpack/credits.js'],
  entry: ['./src/game/game.ts'],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css']
  },
  module: {
    rules: [
      { test: /\.css$/, include: path.join(__dirname, '../src'), loader: 'css-loader' },
      { test: /\.ts$/, include: path.join(__dirname, '../src'), loader: 'ts-loader' }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          filename: '[name].bundle.js'
        }
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({ gameName: 'Invaders', template: 'src/index.html' }),
    new CopyWebpackPlugin([
      { from: 'src/assets', to: 'assets' },
      { from: 'src/style.css', to: 'style.css' },
      { from: 'src/favicon.ico', to: '' }
    ])
  ]
}
