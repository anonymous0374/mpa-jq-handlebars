let fs = require('fs')
let path = require('path')
let utils = require('./utils.js')
let config = require('./config.js')

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

// 清空目录
function clean() {
  console.log(`start to clean, and output path is: ${outputPath}...`)
    // utils.log('清空目录', outputPath, 'cyan')
  utils.rmdirSync(outputPath)
  console.log(`clean done`)
}

// 处理 node_modules路径
// webpack mainFields默认值为 ['browser', 'module', 'main']，这里按照webpack的来
function handleNodeMudulesPath(way) {
  let alias = config.alias[way]

  if (alias) { // 别名
    way = path.resolve(node_modules, alias)
  } else {
    let base = path.resolve(node_modules, way)
    let pk = path.resolve(base, 'package.json')
    let pkConfig = JSON.parse(fs.readFileSync(pk, 'utf-8'));

    ['browser', 'module', 'main'].some(function (v) {
      if (pkConfig[v]) {
        way = path.resolve(base, pkConfig[v])
        return true
      }
    })
  }

  utils.log('node_modules路径', way, 'yellow')

  return way
}

// 处理压缩
function handleMini(way) {
  let suffix = way.match(SUFFIX_RE)

  if (suffix === null) { // 没有后缀
    let t1 = way + '.js'
    let t2 = way + '.css'

    // 先尝试JS后缀，再尝试CSS后缀
    if (fs.existsSync(t1)) {
      way = t1
      suffix = 'js'
    } else if (fs.existsSync(t2)) {
      way = t2
      suffix = 'css'
    }
  } else {
    suffix = suffix[1]
  }

  if (!fs.existsSync(way)) {
    throw new Error('文件: ' + way + '不存在')
  }

  let code = fs.readFileSync(way, 'utf-8')

  if (suffix === 'js') {
    utils.log('压缩JS', way, 'white')
    code = miniJS(code)
  }

  if (suffix === 'css') {
    utils.log('压缩CSS', way, 'white')
    code = miniCSS(code)
  }

  return {
    suffix: suffix,
    code: code
  }
}

// 合并JS和CSS
function combine() {
  console.log(`start to combine...`)
  console.log(`vendor entries are: `);
  console.log(entry);

  for (let i in entry) {
    let code = {}
    let temp = [].concat(entry[i])

    temp.forEach(function (v) {
      let way = '',
        mini = {}

      console.log(`vendor path: ${v}`)
      try {
        if (DOT_RE.test(v)) { // 相对路径

          way = path.resolve(rootPath, v)
        } else { // node_modules路径
          way = handleNodeMudulesPath(v)
        }

        mini = handleMini(way)
        code[mini.suffix] = (code[mini.suffix] || '') + mini.code
      } catch (err) {
        console.log(`cannot find vendor: ${v}`)
      }

    })

    for (let n in code) {
      mkdirSync(outputPath, function () {
        let file = path.join(outputPath, i + '.' + n)
        utils.log('生成文件', file, 'green')
        fs.writeFileSync(file, code[n])
      })
    }
  }

  console.log(`combine job done`)
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

// 没有引用过的文件拷贝一份过去
function copyFiles() {
  console.log(`copy files...`)

  let files = getFiles()

  travel(srcPath, function (p) {
    if (!files[p]) {
      let name = p.replace(srcPath, '')
      let dist = path.join(outputPath, name)
      utils.log('拷贝文件', dist, 'green')
      copy(p, dist)
    }
  })

  console.log(`copy files done`)
}

// 执行
clean()
combine()
copyFiles()
