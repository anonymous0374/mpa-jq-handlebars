const entries = require('./entry.js');
const config = require('./mergedConfig.js');

// html-loader：1、文件复制；2、默认处理html中的<img src="image.png">为require("./image.png")
let htmlLoader = {
  loader: 'html-loader',
  options: {
    attrs: ['img:data-src', 'img:src', 'link:href', 'script:src' /*, 'a:href'*/ ],
    root: config.srcPath,
    minimize: config.htmlMini
  }
}

module.exports = {
  rules: [{
      test: /\.js$/,
      include: config.srcPath,
      exclude: config.dll.outputPath,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['es2015-loose', 'stage-0'],
          cacheDirectory: true
        }
      }, {
        // 参考：https://github.com/AriaFallah/WebpackTutorial/tree/master/part1/html-reload
        loader: 'tf-html-hot-loader',
        options: {
          files: entries,
          content: function () {
            return `
                    if (process.env.NODE_ENV !== 'production') {\n
                        require('./${config.contentPageName}')\n
                    }`;
          }
        }
      }]
    }, { // IE兼容
      test: /\.js$/,
      // include: config.srcPath,
      enforce: 'post',
      loader: 'es3ify-loader'
    }, {
      test: /\.html$/,
      include: config.srcPath,
      use: [
        htmlLoader
      ]
    }, {
      test: /\.ejs$/, // 模版
      include: config.srcPath,
      use: [
        htmlLoader, {
          loader: 'ejs-loader',
          options: {
            variable: 'data'
          }
        }
      ]
    }, {
      // 图片加载器，雷同file-loader，更适合图片，可以将较小的图片转成base64，减少http请求
      test: /\.(png|jpg|gif)$/,
      include: config.srcPath,
      loader: 'url-loader',
      options: {
        limit: config.imgBase64Limit,
        name: 'assets/imgs/[name].[hash:8].[ext]'
      }
    }, {
      // iconfont，后面可能会带一串时间戳
      test: /\.(woff|woff2|svg|eot|ttf)(\?.*)?$/,
      loader: 'file-loader',
      include: config.srcPath,
      // exclude: config.svgPath,
      options: {
        name: 'assets/fonts/[name].[hash].[ext]'
      }
    },
    /*{
           // 把 svgPath 路径下的所有 svg 文件交给 svg-sprite-loader 插件处理
           test: /\.(svg)$/i,
           loader: 'svg-sprite-loader',
           include: config.svgPath
         },*/
    {
      // file-loader只有在页面里面实际用到了才会拷贝过去，
      // 处理vendor文件夹的内容
      test: /\.*$/,
      loader: 'file-loader',
      include: config.dll.outputPath,
      options: {
        name: config.vendorOutputPath + '/[name].[hash].[ext]'
      }
    }
  ],

  // 不需要webpack的解析，有些库是自成一体不依赖其他库的没有使用模块化的，比如jquey、moment等
  noParse: /node_modules\/(jquey|moment|chart\.js)/
}
