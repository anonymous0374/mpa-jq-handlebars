const config = require('./config.js');

module.exports = {
  // 别名
  alias: config.alias,

  // 让webpack先使用jsnext:main字段，在没有时使用main字段。这样就可以优化支持tree-shaking的库
  // mainFields: ['jsnext:main', 'browser', 'main'], // 写了这个可能会报错

  // 减少搜索路径
  modules: [config.node_modules, config.srcPath],

  // 自动扩展文件后缀名，意味着我们import模块可以省略不写后缀名, webpack2不需要写''
  extensions: ['.js', '.css', '.less', '.json']
}
