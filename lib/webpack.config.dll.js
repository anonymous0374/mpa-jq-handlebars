// 参考：http://webpack.wuhaolin.cn/4%E4%BC%98%E5%8C%96/4-2%E4%BD%BF%E7%94%A8DllPlugin.html
const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
let webpackConfig = require('./webpack.config.pro.js');
const config = require('./config.js');

webpackConfig = merge(webpackConfig, {
    entry: config.dll.entry,

    output: {
        // 输出的动态链接库的文件名称，[name] 代表当前动态链接库的名称，
        // 也就是 entry 中配置的 react 和 polyfill
        filename: '[name].dll.js',
        // 输出的文件都放到 xx 目录下
        path: config.dll.outputPath,
        // 存放动态链接库的全局变量名称，例如对应 react 来说就是 dll_react
        // 之所以在前面加上 dll_ 是为了防止全局变量冲突
        library: 'dll_[name]',
    },

    module: require('./module.js'),

    resolve: require('./resolve.js'),

    plugins: [
        // 清除
        new CleanWebpackPlugin([config.dll.outputPath], { root: config.rootPath }),

        // 接入 DllPlugin
        new webpack.DllPlugin({
            // 动态链接库的全局变量名称，需要和 output.library 中保持一致
            // 该字段的值也就是输出的 manifest.json 文件 中 name 字段的值
            // 例如 react.manifest.json 中就有 "name": "dll_react"
            name: 'dll_[name]',
            // 描述动态链接库的 manifest.json 文件输出时的文件名称
            path: path.join(config.dll.outputPath, '[name].manifest.json'),
        }),
    ],
});

webpackConfig.module.rules.forEach(function(v) {
    // 只处理dll.srcPath路径的文件，
    // js在module.js中已经配置了include和exclude(babel转义等)
    if (v.test.toString() != '/\\.js$/') {
        v.include = config.dll.srcPath;
        // delete v.include
        // v.exclude = config.node_modules;
    }
})

// 要去掉该配置，否则会报错
webpackConfig.module.rules = webpackConfig.module.rules.filter(function(v) {
    return v.test.toString() !== '/\\.*$/'
})

// css不需要hash之类
webpackConfig.plugins.forEach(function(v) {
    if (v.constructor === ExtractTextPlugin) {
        v.filename = '[name].css';
    }
})


module.exports = webpackConfig;
