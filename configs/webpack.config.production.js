const merge = require('webpack-merge');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const config = require('./mergedConfig.js');

const utils = require('./utils.js');

let baseConfig = require('./webpack.config.base.js');
let proConfig = require('./webpack.config.pro.js');

let webpackConfig = merge({
  plugins: [
    new CleanWebpackPlugin([config.outputPath], {
      root: config.rootPath
    }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
}, baseConfig, proConfig);

module.exports = utils.applyWebpackConfig(webpackConfig, 'production');
