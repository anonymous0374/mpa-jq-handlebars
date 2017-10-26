module.exports = {
  mode: 'mul', // 'mul': multiple pages application, 'single': single page application
  // 别名
  alias: {
    // 目录别名
    fonts: './src/assets/fonts',
    imgs: './src/assets/imgs',
    layout: './src/layout',
    pages: './src/pages',
    utils: './src/utils',
    vendor: './src/vendor',
    // 文件别名
    layout: './src/pages/layout/layout.js',
    'babel-polyfill': './node_modules/babel-polyfill/dist/polyfill.js', // 因为IE兼容，不用min版的，自己压缩
    jquery: './node_modules/jquery/dist/jquery.js'
  },
  useESlint: false,

  dll: {
    srcPath: './vendor', // 打包要读取的文件夹目录
    outputPath: './src/vendor', // 文件打包到哪个目录

    // 读取哪些文件打包，
    // 注意，除了node_modules目录下面的，只能是srcPath目录下面的文件
    entry: {
      vendor: ['jquery', 'babel-polyfill'],
      css: ['./vendor/a.css', './vendor/b.css'],
      iePolyfill: [
        // 'es5-shim',
        // './vendor/ie8_patch/es5_safe.min.js',
        './vendor/ie8_patch/html5shiv.min.js',
        './vendor/ie8_patch/json.min.js',
        './vendor/ie8_patch/respond.min.js',
      ]
    }
  },

}
