const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin'); // 错误信息提示插件
const notifier = require('node-notifier'); // 消息通知插件

const utils = require('./utils');
const entries = require('./entry.js');
const config = require('./config.js');
const JqSpaHtmlPlugin = require('./jq-spa-html-plugin');
// var CopyWebpackPlugin = require('copy-webpack-plugin');

// 生成页面
function createPages() {
  let dir = config.pagesPath;
  let tplName = config.tplName;
  let pagesArr = [];

  console.log('config: ')
  console.log(config)

  if (config.mode === 'mul') {
    Object.keys(entries).forEach(function (v) {
      pagesArr.push(new HtmlWebpackPlugin({
        filename: `${v}.html`,
        template: path.resolve(dir, `${v}/${tplName}`),
        chunks: [ /*'commons/vendor',*/ 'commons/common', 'commons/runtime', v]
      }));
    });
  }

  if (config.mode === 'single') {
    let pageName = config.contentPageName;

    let entry1 = [],
      entry2 = [];

    for (let i in entries) {
      let info = utils.getSingleFullPageInfo(i);

      if (!info.isEqual) {
        entry2.push(info);
      } else {
        entry1.push(i);
      }
    }

    entry1.forEach(function (v) {
      pagesArr.push(new HtmlWebpackPlugin({
        filename: `${v}.html`,
        isSingleContentPage: true,
        // 会添加一个head标签，然后把link放到head里面，使用jq-spa-html-plugin插件处理了该问题
        template: path.resolve(dir, `${v}/${pageName}`),
        chunks: [v]
      }));
    });

    pagesArr.push(new JqSpaHtmlPlugin());

    entry2.forEach(function (v) {
      pagesArr.push(new HtmlWebpackPlugin({
        filename: `${v.realName}.html`,
        template: path.resolve(dir, `${v.name}/${pageName}`),
        chunks: ['commons/common', 'commons/runtime', v.name]
      }));
    });

  }

  return pagesArr;
}

// 动态链接库
function getDllReferences(dir) {
  var arr = []
  var files = new glob.Glob('*.json', {
    cwd: dir,
    sync: true
  }).found;

  files.forEach(function (v) {
    // 告诉 Webpack 使用了哪些动态链接库
    arr.push(new webpack.DllReferencePlugin({
      context: config.rootPath,
      // 描述 xx 动态链接库的文件内容
      manifest: require(path.resolve(dir, v))
    }))
  })

  return arr;
}

module.exports = [
  /*// 提取公共基础JS依赖
  new webpack.optimize.CommonsChunkPlugin({
      name: 'commons/vendor',
      filename: '[name].[chunkhash].js'
  }),*/

  // 抽取出通用的部分
  new webpack.optimize.CommonsChunkPlugin({
    name: 'commons/common',
    filename: '[name].[chunkhash].js',
    minChunks: 3
  }),
  // 避免稍微修改一下入口文件就会改动commonChunk，导致原本有效的浏览器缓存失效
  new webpack.optimize.CommonsChunkPlugin({
    name: 'commons/runtime',
    filename: '[name].[hash].js'
  }),

  new FriendlyErrorsWebpackPlugin({
    onErrors: function (severity, errors) {
      if (severity !== 'error') {
        return;
      }
      const error = errors[0];
      notifier.notify({
        title: '编译出错!!',
        message: severity + ': ' + error.name,
        subtitle: error.file || '',
        icon: ''
      });
    }
  }),
  /* new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery'
  }), */

  // ...getDllReferences(config.dll.outputPath),

  ...createPages()

]
