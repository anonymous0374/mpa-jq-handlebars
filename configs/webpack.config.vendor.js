let fs = require('fs')
let path = require('path')
let utils = require('../tools/utils.js')
let config = require('./mergedConfig.js')

let SUFFIX_RE = utils.SUFFIX_RE
let DOT_RE = utils.DOT_RE
let miniJS = utils.miniJS
let miniCSS = utils.miniCSS
let travel = utils.travel
let copy = utils.copy
let mkdirSync = utils.mkdirSync

let rootPath = config.rootPath
let node_modules = config.node_modules
let entry = config.dll.entry
let srcPath = config.dll.srcPath
let outputPath = config.dll.outputPath

// clear up vendor directory before re-generating vendor contents
function clean() {
  utils.rmdirSync(outputPath)
}

// get actual path for a specific vendor module
function handleNodeMudulesPath(module_name) {
  let alias = config.alias[module_name]
  let module_path = '';

  if (alias) {
    module_path = path.resolve(node_modules, alias)
  } else {
    utils.richlog(`${module_name} has no alias, look for its path with help of package.json.`, utils.LOGTYPE.WARNNING)
    let base = path.resolve(node_modules, module_name)
    let pk = path.resolve(base, 'package.json')
    let pkConfig = JSON.parse(fs.readFileSync(pk, 'utf-8'));

    // follow webpack's way of looking for modules
    ['browser', 'module', 'main'].some(function (v) {
      if (pkConfig[v]) {
        module_path = path.resolve(base, pkConfig[v])
        return true
      }
    })
  }

  if (module_path) {
    utils.richlog(`${module_name} found at ${module_path}`, utils.LOGTYPE.SUCCESSFUL)
  } else {
    utils.richlog(`${module_name}`, `not found at ${module_path}, please install it`, utils.LOGTYPE.FAILED)
  }

  return module_path
}

// minification
function handleMini(way) {
  let suffix = way.match(SUFFIX_RE)
  if (suffix === null) {
    let t1 = way + '.js'
    let t2 = way + '.css'

    if (fs.existsSync(t1)) { // guessing it's js
      way = t1
      suffix = 'js'
    } else if (fs.existsSync(t2)) { // if not js, then it's css
      way = t2
      suffix = 'css'
    }
  } else {
    suffix = suffix[1]
  }

  if (!fs.existsSync(way)) {
    throw new Error('file: ' + way + ' does not exist')
  }

  let code = fs.readFileSync(way, 'utf-8')

  if (suffix === 'js') {
    utils.richlog(`compress js ${way}`, utils.LOGTYPE.SUCCESSFUL)
    code = miniJS(code)
  }

  if (suffix === 'css') {
    utils.richlog(`compress css ${way}`, utils.LOGTYPE.SUCCESSFUL)
    code = miniCSS(code)
  }

  return {
    suffix: suffix,
    code: code
  }
}

// handle two kinds of vendor modules: .js and .css
function combine() {
  utils.richlog(`vendor modules to combine: `, utils.LOGTYPE.INFO)
  console.log(entry)

  for (let entry_name in entry) {
    let code = {}
    let temp = [].concat(entry[entry_name])

    temp.forEach(function (v) {
      let module_path = '',
        mini = {}

      try {
        if (DOT_RE.test(v)) { // for vendor modules under src/vendor
          module_path = path.resolve(rootPath, v)
        } else { // for vendor modules under node_modules
          module_path = handleNodeMudulesPath(v)
        }

        mini = handleMini(module_path)
        code[mini.suffix] = (code[mini.suffix] || '') + mini.code
      } catch (err) {
        utils.log(`cannot find vendor: `, `${v}`, 'red')
      }

    })

    for (let entry_type in code) {
      mkdirSync(outputPath, function () {
        let file = path.join(outputPath, entry_name + '.' + entry_type)
        utils.richlog(`generated compressed vendor file: ${file}`, utils.LOGTYPE.SUCCESSFUL)
        fs.writeFileSync(file, code[entry_type])
      })
    }
  }
}

// 获取被引用过的文件列表，
// 没有引用过的文件就拷贝一份过去，引用过的不需要处理(webpack.config.vendor.js已经处理了)
function getFiles() {
  let files = {}

  for (let i in entry) {
    let temp = [].concat(entry[i])

    temp.forEach(function (v) {
      if (DOT_RE.test(v)) {
        v = path.resolve(rootPath, v)
        files[v] = true
      }
    })
  }

  return files
}

// copy files that are not involved by also under srcPath
function copyFiles() {
  let files = getFiles()
  utils.richlog(`manually copy files that are not processed by webpack, but are under ${srcPath}`, utils.LOGTYPE.INFO)

  travel(srcPath, function (p) {
    if (!files[p]) {
      let name = p.replace(srcPath, '')
      let dist = path.join(outputPath, name)
      utils.richlog(`copy ${dist}`, utils.LOGTYPE.SUCCESSFUL)
      copy(p, dist)
    }
  })
}

// 执行
clean()
combine()
copyFiles()
