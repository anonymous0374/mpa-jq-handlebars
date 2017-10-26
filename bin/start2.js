const webpack = require('webpack');
const WebpackBrowserLog = require('../lib/webpack-browser-log');
const config = require('../lib/config.js');
const webpackConfig = require('../lib/webpack.config.develop.js');

// 热替换
let obj = {};
let entries = webpackConfig.entry;
for(let i in entries) {
    obj[i] = ['webpack-hot-middleware/client?reload=true'].concat(entries[i]);
}
webpackConfig.entry = obj;
webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin(), new webpack.NoEmitOnErrorsPlugin());


new WebpackBrowserLog(webpackConfig, {
    port : config.port // 修改启动端口
});

