#!/usr/bin/env node

const chalk = require('chalk');
const spawn = require('cross-spawn');

const script = process.argv[2];
const args = process.argv.slice(3);

if (!script) {
  console.log('支持命令：\n\tnpm start : 开发环境 \n\tnpm run vendor : 生成第3方文件 \n\tnpm run build : 生产环境  \n\tnpm start2: 开发环境(待定)');
  return
}

switch (script) {
  case '-v':
  case '--version':
    console.log(require('../package.json').version);
    break;
  case 'start':
  case 'build':
  case 'vendor':
    var result = spawn.sync(
      /*'npm',
      ['run', script],
      { stdio: 'inherit' } */
      'node',
      [require.resolve(`./${script}`)].concat(args),
      { stdio: 'inherit' }
    );
    process.exit(result.status);
    break;
  default:
    console.log(`未知的脚本命令： ${chalk.cyan(script)}.`);
    break;
}