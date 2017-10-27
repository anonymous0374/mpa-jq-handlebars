// const path = require('path');
const config = require('./mergedConfig.js');

let outputPath = config.outputPath;
let publicPath = config.publicPath;

// 不需要，配置outputPath就可以了
/*if (publicPath.charAt(0) === '/' && publicPath.length > 1) {
    outputPath = path.join(outputPath, publicPath);
}*/

module.exports = {
  path: outputPath,
  publicPath: publicPath,
  filename: '[name].entry.[chunkhash].js',
  chunkFilename: '[id].[chunkhash].bundle.js'
}
