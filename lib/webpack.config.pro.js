const webpack = require('webpack');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
// const CleanWebpackPlugin = require('clean-webpack-plugin');

const config = require('./config.js');
const utils = require('./utils.js');
// let webpackConfig = require('./config/webpack.config.base.js');

// 抽取css，开发环境不能用这个，否则修改css无法自动刷新
const extractLess = new ExtractTextPlugin({
    filename: '[name].[contenthash].css',
    allChunks: config.extractAllChunks,
    disable: false // 因为一直在生产环境
});

module.exports = {
    module: {
        rules: [{
            test: /\.css$/,
            include: config.srcPath,
            use: extractLess.extract({
                use: utils.getCssLoader(true, true),
                fallback: 'style-loader'
            })
        }, {
            test: /\.less$/,
            include: config.srcPath,
            use: extractLess.extract({
                use: utils.getCssLoader(true, false),
                // use style-loader in development
                fallback: 'style-loader'
            })
        }]
    },

    // devtool: 'cheap-eval-source-map', // 加了这个文件打包大很多

    plugins: [
        // 清除
        // new CleanWebpackPlugin([config.outputPath]),
        
        // 防止hash随着 module.id 的修改，而发生变化，插件NamedModulesPlugin有一样的功能，但是执行时间会长一些
        // 参照：https://doc.webpack-china.org/guides/caching/
        new webpack.HashedModuleIdsPlugin(),

        // 压缩
        new webpack.optimize.UglifyJsPlugin({
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
            /*mangle: {
                screw_ie8: false
            },*/
            ie8: true // ie
        }),

        // React依赖process.env.NODE_ENV进行优化.如果我们设置React为production， React将以优化了的方式进行构建， 这样做会禁用一些检查(如，属性类型检查)。最重要的是它可以减小包的体积并提升性能
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify("production")
        }),
        
        // 压缩图片
        new ImageminPlugin({
            test: /\.(jpe?g|png|gif|svg)$/i,
            minFileSize: config.imgCompressLimit
        }),

        extractLess
    ]
};
