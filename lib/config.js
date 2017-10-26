const fs = require('fs');
const path = require('path');
const defaultCfg = require('./default.config.js'); // 默认配置项

let config = defaultCfg;
let rootPath = process.cwd(); //path.resolve(__dirname, '../');
let configPath = path.resolve(rootPath, 'config.js');

// 如果有自定义配置，合并
if (fs.existsSync(configPath)) {
  config = require(configPath);
  config = Object.assign({}, defaultCfg, config);
}

// 需要绝对路径
for (let i in config.alias) {
  config.alias[i] = path.resolve(rootPath, config.alias[i]);
}
config.rootPath = rootPath;
config.srcPath = path.resolve(rootPath, config.srcPath);
// config.assetsPath = path.resolve(rootPath, config.assetsPath)
config.outputPath = path.resolve(rootPath, config.outputPath)
config.node_modules = path.resolve(rootPath, 'node_modules')

// dll vendor
config.dll.outputPath = path.resolve(rootPath, config.dll.outputPath)
config.dll.srcPath = path.resolve(rootPath, config.dll.srcPath)
  // vendor目录输出路径，因为可能不叫vendor
config.vendorOutputPath = config.dll.outputPath
  .replace(config.srcPath, '').replace(/^\\/, '');


if (config.https) {
  for (let i in config.https) {
    config.https[i] = fs.readFileSync(path.resolve(rootPath, config.https[i]));
  }
}

// config.svgPath = path.resolve(rootPath, config.svgPath)

module.exports = config;
