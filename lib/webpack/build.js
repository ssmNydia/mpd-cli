/*
* @Author: smm
* @Date:   2019-04-21 15:41:28
* @Last Modified by:   smm
* @Last Modified time: 2019-04-24 20:53:07
*/
const webpack = require('webpack')
const path = require('path')
const fs = require('fs-extra')
const Base = require('./base')

module.exports = class Build extends Base {
  async build () {
    await this.initConfig()
    let result = await this.pify(webpack)(this.config)

    if (result.hasErrors()) {
      throw Error(result.compilation.errors)
    }

    return result
  }

  async html () {
    let glbOpPg = {
      cwd: this.pageDir,
      root: this.pageDir
    }
    let pages = await this.globFn('*/*.js', glbOpPg)
      .then(arr => arr.filter(name => /([\w-]+)\/\1\.js$/.test(name)))

    pages = pages.reduce((ent, pathname) => {
      let basename = path.basename(pathname, path.extname(pathname))
      ent[`${basename}.html`] = path.resolve(this.pageDir, pathname.replace('.js','.html'))
      return ent
    }, {})

    Object.keys(pages).forEach(filename => {
      let htm = fs.readFileSync(pages[filename], 'utf8')

      // 注入全局引入的库
      if(this.options.global){
        htm = injectGlobal(htm, this.options.global)
      }

      // 注入同名样式
      htm = injectSameCss(htm, this.options.publicPath+'css/'+filename.replace('.html',''))
      // 注入同名脚本
      htm = injectSameJs(htm, this.options.publicPath+'js/'+filename.replace('.html',''))

      fs.writeFileSync(this.options.output+'/'+filename,htm,'utf8');
    })
  }
}

function injectGlobal(content, arr) {
  return content
}

function injectSameCss(content, url) {
  let start = content.split('</title>')
  let end = start[1]
  start = start[0]+'</title>'
  return start
    + `\n  <link rel="stylesheet" href="${url}.css" />`
    + end
}

function injectSameJs(content, url) {
  let start = content.split('</body>')
  let end = '\n</body>'+start[1]
  start = start[0]
  return start
      + `\n  <script src="${url}.js"></script>`
      + end
}