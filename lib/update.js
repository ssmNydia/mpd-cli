/*
* @Author: shl
* @title: 
* @Date:   2020-03-03 14:42:03
* @Last Modified by:   shl
* @Last Modified time: 2020-03-03 15:30:32
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
    cli.info('更新HTML页面的img路径写法...')
    let regImg = new RegExp(`/assets/images/`, 'gi')
    let pages = fs.readdirSync(path.resolve(options.dir, 'pages'))
    pages.forEach(a => {
      let pagepath = path.resolve(options.dir + '/pages', a, a + '.html')
      let htm = fs.readFileSync(pagepath, 'utf-8')
      htm = htm.replace(regImg, '/images/')

      fs.writeFileSync(pagepath, htm)
    })
  }  
}