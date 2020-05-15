/*
* @Author: shl
* @title: 
* @Date:   2020-03-03 14:42:03
* @Last Modified by:   shl
* @Last Modified time: 2020-05-08 10:21:59
*/
const fs = require('fs')
const path = require('path')
const cli = require('./cli')

module.exports = async (cur_version, news_version, options) => {
  if (cur_version === news_version) {
    cli.info('该项目使用的是最新版的mpd-cli开发，无需更新')
  } else {
    // console.log('cwd', process.cwd())
    cli.info('    1. 更新package...')
    // 更新 package.json 文件
    const package = require(path.resolve(process.cwd(), 'package.json'))
    package.scripts = {
      'fixcss': `stylelint --config ${path.resolve(__dirname, '../lint/.stylelintrc.json')} '${options.dir}/**/*.scss' --fix`
    }
    package.mpdCliVersion = news_version
    if (package.eslintConfig) {
        delete package.eslintConfig
    }
    fs.writeFileSync(path.resolve(process.cwd(), 'package.json'), JSON.stringify(package, null, 2))
    
    // config有更新再编写
    // cli.info('    2. 更新mpd.config.js...')
    // const config = require(path.resolve(process.cwd(), 'mpd.config.js'))
    // if (config) {

    // }
    
    // 第一步：检查HTML代码内的img引入写法
    cli.info('    2. 更新HTML页面的img路径写法...')
    let regImg = new RegExp(`/assets/images/`, 'gi')
    let pages = fs.readdirSync(path.resolve(options.dir, 'pages'))
    pages.forEach(a => {
      let pagepath = path.resolve(options.dir + '/pages', a, a + '.html')
      let htm = fs.readFileSync(pagepath, 'utf-8')
      htm = htm.replace(regImg, '/images/')

      fs.writeFileSync(pagepath, htm)
    })
    // cli.info('      HTML的img路径更新完成')
    // 第二步：检查公共js common.js 文件 normalize.css 引入路径是否正确
    cli.info('    3. 更换normalize.css引入路径')
    // 第三步：检查当前样式文件名是否是 less 是则更改文件名
    // 
    // 第四步：若样式文件名是 less ，则需对内容变量和less的常见方法更换成 scss的
    // 
    // 第五步：
  }  
}