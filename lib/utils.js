const fs = require('fs');
const path = require('path');
// const glob = require('glob');
let Uglify = require('uglify-js');
let CleanCSS = require('clean-css');

require('./color');
const config = require('./config.js');

// 以.或..开头
let DOT_RE = /^\.(\.)?\//;
// 后缀
let SUFFIX_RE = /\.([^\.]+)$/;

function applyWebpackConfig(webpackConfig, env) {
  const filePath = path.resolve(config.rootPath, './webpack.config.js');

  if (fs.existsSync(filePath)) {
    return require(filePath)(webpackConfig, env);
  } else {
    return webpackConfig;
  }
}

// 取得css-loader
function getCssLoader(isBuild, isCss) {
  let loaders = [{
      loader: 'style-loader'
    },

    {
      loader: 'css-loader',
      options: {
        modules: config.cssModules,
        sourceMap: true,
        minimize: isBuild,
        root: config.srcPath
      }
    },

    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true,
        plugins: (loader) => [
          require('autoprefixer')({ // CSS浏览器兼容
            browsers: config.autoprefixer
          })
        ]
      }
    }, {
      loader: 'less-loader',
      options: {
        sourceMap: true
      }
    }
  ]

  if (isBuild) {
    loaders = loaders.filter(v => v.loader !== 'style-loader')
  }

  if (isCss) {
    loaders = loaders.filter(v => v.loader !== 'less-loader')
  }

  return loaders;
}

// 遍历目录
function travel(dir, callback) {
  fs.readdirSync(dir).forEach(function (file) {
    var pathname = path.join(dir, file);

    if (fs.statSync(pathname).isDirectory()) {
      travel(pathname, callback);
    } else {
      callback(pathname);
    }
  });
}


// 确保文件夹存在
function mkdirSync(url, cb) {
  url = url.replace(/\\/g, '/')
  var arr = url.split("/");
  var mode = 0755;
  cb = cb || function () {};

  if (arr[0] === ".") { //处理 ./aaa
    arr.shift();
  }

  if (arr[0] == "..") { //处理 ../ddd/d
    arr.splice(0, 2, arr[0] + "/" + arr[1]);
  }

  if (arr[0].indexOf(':')) { //处理 d:/ddd/d
    arr.splice(0, 2, arr[0] + "/" + arr[1]);
  }

  function inner(cur) {
    if (!fs.existsSync(cur)) { //不存在就创建一个
      fs.mkdirSync(cur, mode);
    }
    if (arr.length) {
      inner(cur + "/" + arr.shift());
    } else {
      cb();
    }
  }

  arr.length && inner(arr.shift());
}

// 删除文件夹
var rmdirSync = (function () {
  function iterator(url, dirs) {
    var stat = fs.statSync(url);
    if (stat.isDirectory()) {
      dirs.unshift(url); //收集目录
      inner(url, dirs);
    } else if (stat.isFile()) {
      fs.unlinkSync(url); //直接删除文件
    }
  }

  function inner(path, dirs) {
    var arr = fs.readdirSync(path);
    for (var i = 0, el; el = arr[i++];) {
      iterator(path + "/" + el, dirs);
    }
  }
  return function (dir, cb) {
    cb = cb || function () {};
    var dirs = [];

    try {
      iterator(dir, dirs);
      for (var i = 0, el; el = dirs[i++];) {
        fs.rmdirSync(el); //一次性删除所有收集到的目录
      }
      cb()
    } catch (e) { //如果文件或目录本来就不存在，fs.statSync会报错，不过我们还是当成没有异常发生
      e.code === "ENOENT" ? cb() : cb(e);
    }
  }
})();

// 拷贝文件
function copy(src, dist) {
  mkdirSync(path.dirname(dist), function () {
    fs.createReadStream(src).pipe(fs.createWriteStream(dist));
  })
}

// 压缩JS
function miniJS(code) {
  var result = Uglify.minify(code, {
    compress: {
      properties: false, // ie
      // 在UglifyJs删除没有用到的代码时不输出警告
      warnings: false,
      // 删除所有的 `console` 语句
      drop_console: true,
      // 内嵌定义了但是只用到一次的变量
      collapse_vars: true,
      // 提取出出现多次但是没有定义成变量去引用的静态值
      reduce_vars: true,
    },
    output: {
      beautify: false,
      quote_keys: true // ie
    },
    ie8: true // ie
  });

  if (result.error) throw result.error;

  return result.code
}

// 压缩CSS
function miniCSS(code) {
  return new CleanCSS().minify(code).styles;
}

function log(tag, msg, color) {
  console.log((tag + ': ' + msg)[color || 'white']);
}

// 字符串转为正则
function escapeReg(str, exclude, flag) {
  exclude = exclude ? [].concat(exclude) : [];
  let symbol = ['-', '[', ']', '/', '{', '}', '(', ')', '*', '+', '?', '.', '\\', '^', '$', '|'];

  if (exclude.length > 0) {
    symbol = symbol.filter(function (v) {
      return exclude.indexOf(v) === -1
    })
  }

  // 最终生成类似：/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g
  let reg = new RegExp('[\\' + symbol.join('\\') + ']', 'g');
  str = str.replace(reg, "\\$&");

  return new RegExp(str, flag || '');
}

// single模式时，需要判断是否一个单独页面，以及获取去掉singleFullPagePrefix前缀的真实名称，这里统一返回这些信息
exports.getSingleFullPageInfo = function (name) {
  let reg = escapeReg(`^${config.singleFullPagePrefix}|\/${config.singleFullPagePrefix}`, ['^', '|', '/'], 'g');
  let temp = name.replace(reg, '/').replace(/^\//, '');

  return {
    isEqual: name === temp,
    name: name,
    realName: temp
  }
}

exports.escapeReg = escapeReg;
exports.getCssLoader = getCssLoader;
exports.log = log;
exports.mkdirSync = mkdirSync;
exports.rmdirSync = rmdirSync;
exports.applyWebpackConfig = applyWebpackConfig;
exports.travel = travel;
exports.copy = copy;
exports.miniJS = miniJS;
exports.miniCSS = miniCSS;
exports.DOT_RE = DOT_RE;
exports.SUFFIX_RE = SUFFIX_RE;
