// 参考：http://webpack.github.io/docs/webpack-dev-server.html
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const OpenBrowserPlugin = require('open-browser-webpack-plugin');
const config = require('../lib/config.js');
const webpackConfig = require('../lib/webpack.config.develop.js');

// 热替换  node调用方式与命令行方式不同 
let obj = {};
let entries = webpackConfig.entry;
for(let i in entries) {
    obj[i] = ['webpack-dev-server/client?http://0.0.0.0:' + config.port + '/', 'webpack/hot/dev-server'].concat(entries[i]);
}
webpackConfig.entry = obj;

webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),

    new OpenBrowserPlugin({ url: 'http://localhost:' + config.port })
);

/*// 错误信息提示
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin'); // 错误信息提示插件
const notifier = require('node-notifier'); // 消息通知插件
webpackConfig.plugins.push(new FriendlyErrorsWebpackPlugin({
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
}));*/


// 执行
let compiler = webpack(webpackConfig);

var server = new WebpackDevServer(compiler, {
    // webpack-dev-server options

    contentBase: config.srcPath,
    // Can also be an array, or: contentBase: "http://localhost/",
    
    // inline: true, // 无效
    // open: true, // 无效
    host: config.host,

    hot: true,
    // Enable special support for Hot Module Replacement
    // Page is no longer updated, but a "webpackHotUpdate" message is sent to the content
    // Use "webpack/hot/dev-server" as additional module in your entry point
    // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does. 

    historyApiFallback: true,
    // Set this as true if you want to access dev server from arbitrary url.
    // This is handy if you are using a html5 router.

    compress: true,
    // Set this if you want to enable gzip compression for assets

    proxy: config.proxy,
    // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
    // Use "**" to proxy all paths to the specified server.
    // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
    // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).

    /*setup: function(app) {
        // Here you can access the Express app object and add your own custom middleware to it.
        // For example, to define custom handlers for some paths:
        // app.get('/some/path', function(req, res) {
        //   res.json({ custom: 'response' });
        // });
    },*/

    // pass [static options](http://expressjs.com/en/4x/api.html#express.static) to inner express server
    // staticOptions: {},

    clientLogLevel: "info",
    // Control the console log messages shown in the browser when using inline mode. Can be `error`, `warning`, `info` or `none`.

    // webpack-dev-middleware options
    quiet: true,

    // noInfo: false,
    // lazy: true,
    
    watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
    },

    // It's a required option.
    publicPath: config.publicPath,
    // headers: { "X-Custom-Header": "yes" },
    stats: { colors: true },

    https: config.https /* {
        cert: fs.readFileSync("path-to-cert-file.pem"),
        key: fs.readFileSync("path-to-key-file.pem"),
        cacert: fs.readFileSync("path-to-cacert-file.pem")
    }*/
});

server.listen(config.port, "0.0.0.0", function(err) {
    if (err) {
        return console.log(err);
    }

    console.log('开始监听...');
});
