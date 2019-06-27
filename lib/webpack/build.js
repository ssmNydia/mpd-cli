const webpack = require('webpack')
const path = require('path')
const fs = require('fs-extra')
const Base = require('./base')

module.exports = class Build extends Base {
  constructor (options) {
    super(options)
    this.options = options
  }

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
      cwd: this.outputDir,
      root: this.outputDir
    }
    let pages = await this.globFn('*.html', glbOpPg)

    pages = pages.reduce((ent, pathname) => {
      let basename = path.basename(pathname, path.extname(pathname))
      ent[`${basename}`] = path.resolve(this.outputDir, pathname)
      return ent
    }, {})

    Object.keys(pages).forEach(filename => {
      let htm = fs.readFileSync(pages[filename], 'utf8')

      // 注入全局引入的库
      if(this.options.global){
        htm = injectGlobal(htm, this.options.global, filename.replace('.html',''))
      }
      // 注入指定页面的指定库
      if(this.options.assign){
        htm = injectAssign(htm, filename.replace('.html',''), this.options.assign)
      }

      fs.writeFileSync(this.options.output+'/'+filename+'.html',htm,'utf8');
    })
  }
}

function injectGlobal(content, arr, name) {
  let js = ''
  let css = ''
  arr.forEach(a => {
    if(a.indexOf('.js')>-1){
      js += _injectJs(content,a)
    }else if(a.indexOf('.css')>-1){
      css += _injectCss(content,a)
    }
  })
  return _inject(content, css, js, name)
}

function injectAssign(content, name, obj) {
  let js = ''
  let css = ''
  obj.forEach(o => {
    o.pages.forEach(pagename => {
      if(name===pagename){
        o.urls.forEach(a => {
          if(a.indexOf('.js')>-1){
            js += _injectJs(content,a)
          }else if(a.indexOf('.css')>-1){
            css += _injectCss(content,a)
          }
        })
      }
    })
  })
  return _inject(content, css, js, name)
}

function _inject(content, css, js, name) {
  let head = content.split('</head>')
  let start = head[0]
  let main = head[1].split(`<script type="text/javascript" src="/js/${name}.js"></script>`)
  if (main.length !== 2) {
    main = head[1].split(`<script type="text/javascript" src="./js/${name}.js"></script>`)
  }
  let body = '</head>'+main[0]
  let end = `<script type="text/javascript" src="./js/${name}.js"></script>\n`+main[1]
  return start+
    css+
    body+
    js+
    end
}

function _injectJs(str, url) {
  return `${str.indexOf('script')>-1?'\n':''}  <script src="${url}"></script>`
}

function _injectCss(str, url) {
  return `${str.indexOf('link')>-1?'\n':''}  <link rel="stylesheet" href="${url}"/>`
}

function injectSameCss(content, url) {
  let start = content.split('</head>')
  let end = '\n</head>'+start[1]
  start = start[0]
  return start
    + `${start.indexOf('link')>-1?'\n':''}  <link rel="stylesheet" href="${url}.css" />`
    + end
}

function injectSameJs(content, url) {
  let start = content.split('</body>')
  let end = '\n</body>'+start[1]
  start = start[0]
  return start
      + `${start.indexOf('script')>-1?'\n':''}  <script src="${url}.js"></script>`
      + end
}