/*
* @Author: shl
* @title: 
* @Date:   2020-03-03 14:42:03
* @Last Modified by:   shl
* @Last Modified time: 2020-03-09 10:08:54
*/
const fs = require('fs')
const path = require('path')
const cli = require('./cli')

module.exports = async (cur_version, news_version, options) => {
  if (cur_version === news_version) {
    cli.info('该项目使用的是最新版的mpd-cli开发，无需更新')
  } else {
    // console.log('cwd', process.cwd())
    // 第一步：检查HTML代码内的img引入写法
    cli.info('    1. 更新HTML页面的img路径写法...')
    let regImg = new RegExp(`/assets/images/`, 'gi')
    let pages = fs.readdirSync(path.resolve(options.dir, 'pages'))
    pages.forEach(a => {
      let pagepath = path.resolve(options.dir + '/pages', a, a + '.html')
      let htm = fs.readFileSync(pagepath, 'utf-8')
      htm = htm.replace(regImg, '/images/')

      fs.writeFileSync(pagepath, htm)
    })
    cli.info('      HTML的img路径更新完成')
    // 第二步：检查公共js common.js 文件 normalize.css 引入路径是否正确
    // cli.info('    2. 更换normalize.css引入路径')
    // 第三步：检查当前样式文件名是否是 less 是则更改文件名
    // 
    // 第四步：若样式文件名是 less ，则需对内容变量和less的常见方法更换成 scss的
    // 
    // 第五步：
  }  
}