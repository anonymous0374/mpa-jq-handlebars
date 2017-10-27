// merge default configurations with custom configurations
// default configuration: ./lib/defaultConfig.js
// custom configuration: ./config

const fs = require('fs');
const path = require('path');
const rootPath = process.cwd();
const utils = require('../tools/utils.js');

const defaultCfg = require('./default.config.js'); // default config
var customConfig = null; // custom config

let customConfigPath = path.resolve(rootPath, 'config.js');
var customConfig = require(customConfigPath);

// merge
config = Object.assign({}, defaultCfg, customConfig);

// resolve paths of the merged config
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
// console.log((`configuration merged\n`)['green'])
utils.richlog(`configuration merged`, utils.LOGTYPE.INFO)
  // console.log(config)

module.exports = config;
