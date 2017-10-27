const fs = require('fs');
const path = require('path');
const config = require('./mergedConfig.js');

const utils = require('../tools/utils');

// 获取代码根路径下文件及文件夹的名称，用以提示名称冲突
function getSrcFilesName() {
  var obj = {};
  let srcPath = config.srcPath;

  fs.readdirSync(srcPath).forEach(function (file) {
    var v = file.replace(/\.[a-zA-Z]+$/, '')
    obj[v] = {
      name: file,
      isDir: fs.statSync(path.join(srcPath, file)).isDirectory()
    };
  })

  return obj;
}

// 检查根路径下文件及文件夹的名称 与 页面路径 是否有冲突，防止文件覆盖
// 如果是单页面模式，还会检查去掉singleFullPagePrefix前缀，是否有冲突
function checkNameConflict(pagesNames, srcNames) {
  for (let i in srcNames) {
    if (pagesNames[i] &&
      pagesNames[i].isDir === srcNames[i].isDir) {
      utils.log('文件名称冲突', `根路径 ${srcNames[i].name} ---->  页面路径 ${pagesNames[i].name}`, 'red');
      throw new Error('');
    }
  }

  // 去掉singleFullPagePrefix前缀，校验是否与当前以及根路径有名称冲突
  if (config.mode === 'single') {
    console.log(`spa mode`)
    let obj = {};

    for (let i in pagesNames) {
      let info = utils.getSingleFullPageInfo(i);

      if (!info.isEqual && pagesNames[info.realName]) {
        utils.log('文件名称冲突', `页面路径1 ${pagesNames[temp].name} ---->  页面路径2 ${pagesNames[i].name}`, 'red');
        throw new Error('');
      } else {
        obj[i] = {
          name: i,
          isDir: pagesNames[i].isDir
        };
      }
    }

    for (let i in srcNames) {
      if (obj[i] &&
        obj[i].isDir === srcNames[i].isDir) {
        utils.log('文件名称冲突', `根路径 ${srcNames[i].name} ---->  页面路径 ${obj[i].name}`, 'red');
        throw new Error('');
      }
    }
  }
}

// 取得入口目录名称
let dirsNameReg = utils.escapeReg(`^${config.skipDirPrefix}`, '^');

function getDirsName(dir, arr, prefix) {
  arr = arr || [];
  prefix = prefix ? prefix + '/' : '';

  fs.readdirSync(dir).forEach(function (file) {
    let pathname = path.join(dir, file);

    // 考虑到多个页面可能共用HTML等资源的情况，跳过以config.skipDirPrefix开头的目录
    if (fs.statSync(pathname).isDirectory() &&
      !dirsNameReg.test(file)) {
      let name = prefix + file;
      arr.push(name);
      getDirsName(pathname, arr, name);
    }
  });

  return arr;
}

function getEntries() {
  let obj = {},
    pagesNames = {};

  let dirs = getDirsName(config.pagesPath);

  dirs.forEach(function (v) {
    let jsPath = path.resolve(config.pagesPath, path.join(v, config.entryName));
    let pagePath = path.resolve(config.pagesPath, path.join(v, config.contentPageName));

    if (fs.existsSync(jsPath) && fs.existsSync(pagePath)) {
      obj[v] = jsPath;
      pagesNames[v] = {
        name: v,
        path: jsPath,
        isDir: v.indexOf('/') > -1
      };
    }

  });

  // 检查名称是否有冲突
  checkNameConflict(pagesNames, getSrcFilesName());

  // 公共基础JS依赖
  // obj['commons/vendor'] = Object.keys(pkg.dependencies);
  return obj;
}

module.exports = getEntries();
