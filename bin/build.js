const webpack = require('webpack');
const webpackConfig = require('../lib/webpack.config.production.js');

let compiler = webpack(webpackConfig);

compiler.run(function(err) {
    if (err) {
        return console.log(err);
    }

})