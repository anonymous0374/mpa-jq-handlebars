function JqSpaHtmlPlugin(options) {
    // Configure your plugin with options...
}

JqSpaHtmlPlugin.prototype.apply = function(compiler) {
    compiler.plugin('compilation', function(compilation) {

        compilation.plugin('html-webpack-plugin-after-emit', function(htmlPluginData, callback) {
            if (htmlPluginData.plugin.options.isSingleContentPage) { // 是单页模式的内容部分，去掉自动添加的head标签
                var source = htmlPluginData.html.source();
                source = source.replace(/\<(\/)?head\>/g, '');
                htmlPluginData.html.source = function() { return source };
            }
            callback(null, htmlPluginData);
        });
    });

};

module.exports = JqSpaHtmlPlugin;
