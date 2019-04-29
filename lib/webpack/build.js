/*
* @Author: smm
* @Date:   2019-04-21 15:41:28
* @Last Modified by:   shl
* @Last Modified time: 2019-04-29 09:23:29
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
      // 注入指定页面的指定库
      if(this.options.assign){
        htm = injectAssign(htm, basename, this.options.assign)
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
  let js = ''
  let css = ''
  arr.forEach(a => {
    if(a.indexOf('.js')>-1){
      js += _injectJs(a)
    }else if(a.indexOf('.css')>-1){
      css += _injectCss(a)
    }
  })
  return _inject(content,css,js)
}

function injectAssign(content, name, obj) {
  let js = ''
  let css = ''
  obj.forEach(o => {
    o.pages.forEach(pagename => {
      if(name===pagename){
        o.urls.forEach(a => {
          if(a.indexOf('.js')>-1){
            js += _injectJs(a)
          }else if(a.indexOf('.css')>-1){
            css += _injectCss(a)
          }
        })
      }
    })
  })
  return _inject(content,css,js)
}

function _inject(content, css, js) {
  let head = content.split('</head>')
  let start = head[0]
  let main = head[1].split('</body>')
  let body = '\n</head>'+main[0]
  let end = '\n</body>'+main[1]

  return start+
    css+
    body+
    js+
    end
}

function _injectJs(url) {
  return `\n  <script src="${url}"></script>`
}

function _injectCss(url) {
  return `\n  <link rel="stylesheet" href="${url}"/>`
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