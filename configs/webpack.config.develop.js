// const path = require('path');
const merge = require('webpack-merge');
const eslintFormatter = require('eslint-friendly-formatter');
const webpack = require('webpack');

const config = require('./mergedConfig.js');
const utils = require('./utils.js');
let webpackConfig = require('./webpack.config.base.js');

// eslint
if (config.useESlint) {
  // 文档：https://npm.taobao.org/package/eslint-loader
  webpackConfig.module.rules.push({
    test: /\.js$/,
    enforce: 'pre', // 之前的preLoader被剔除了，但webpack2还是提供了代替方案
    loader: 'eslint-loader',
    include: config.srcPath,
    exclude: config.dll.outputPath,
    options: {
      formatter: eslintFormatter, // 编译后错误报告格式
      // fix: true,
      // cache: true,

      // failOnError: true,
      // failOnWarning: true,
      // eslintPath: path.join(config.rootPath, '.eslintrc.js')
    }
  });
}

webpackConfig = merge(webpackConfig, {
  module: {
    rules: [{
      test: /\.css$/,
      include: config.srcPath,
      use: utils.getCssLoader(false, true)
    }, {
      test: /\.less$/,
      include: config.srcPath,
      use: utils.getCssLoader(false, false)
    }]
  },

  // js source map
  devtool: 'source-map',

  devServer: {
    // 当设置为true时，访问所有服务器上不存在的文件，都会被重定向到/，也就是index.html文件
    historyApiFallback: true,
    hot: true,
    inline: true, // 设为true时可以在文件发生变化时，更新页面
    port: config.port, // 服务器使用的端口
    proxy: config.proxy,
    quiet: true, // 配合friendly-errors-webpack-plugin插件
    // contentBase: config.outputPath
  },

  plugins: [
    // 在热更新输出日志的时候，把模块id替换成模块文件名显示
    new webpack.NamedModulesPlugin()
  ],
})

module.exports = utils.applyWebpackConfig(webpackConfig, 'development')
