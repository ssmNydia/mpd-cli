/*
* @Author: sansui
* @title: html打包时引入配置的库
*/
class Inject {
  constructor(options) {
    Object.keys(options).forEach(k => {
      this[k] = options[k]
    })

    this.init()
  }

  init() {
    let content = this.content
    let link = ''
    let script = ''
    content.replace(new RegExp('<link href="(.*).css" rel="stylesheet">'), function (rp) {
      link = rp
    })
    content.replace(new RegExp('<script type="text/javascript" src="(.*).js"></script>'), function (rp) {
      script = rp
    })
    this.content = content.replace(link, link+'\n').replace(script,script+'\n')
  }

  global(arr, name) {
    let content = [this.content]
    // 默认引入规则，js默认底部写入 ， css头部写入
    arr.forEach(a => {
      if (typeof a !== 'string') {
        // 对象
        if (a.ishead) {
          let str = this.addJS(a.url)
          if (a.url.indexOf('.css') > -1) {
            str = this.addCSS(a.url)
          }
          this.injectHead(str, name)
        } else if (a.islast) {
          let str = this.addJS(a.url)
          if (a.url.indexOf('.css') > -1) {
            str = this.addCSS(a.url)
          }
          this.injectLast(str)
        } else {
          if (a.url.indexOf('.css')>-1){
            this.injectHead(this.addCSS(a.url), name)
          } else {
            this.injectFoot(this.addJS(a.url), name)
          }
        }
      } else {
        if(a.indexOf('.css')>-1){
          this.injectHead(this.addCSS(a), name)
        } else {
          this.injectFoot(this.addJS(a), name)
        }
      }
    })
  }

  assign(obj, name) {
    let content = [this.content]
    obj.forEach(o => {
      o.pages.forEach(pagename => {
        if(name===pagename){
          o.urls.forEach(a => {
            if(a.indexOf('.css')>-1){
              this.injectHead(this.addCSS(a), name)
            } else {
              this.injectFoot(this.addJS(a), name)
            }
          })
        }
      })
    })
  }

  page(name) {
    this.injectFoot(this.addJS(name+'.js'), name)
  }

  beautify(str) {
    // 美化格式
    let content = str.split('\n')
    let body = []
    content.forEach((a, i) => {
      if (/^<link/.test(a)) {
        content[i] = '  '+a
      } else if (/^<scrip/.test(a)) {
        content[i] = '  '+a
      }
    })
    return content.join("\n")
  }

  injectHead(str, name) {
    let content = [this.content]
    let x = content.pop()
    let key = '</head>'
    let head = x.substr(0, x.indexOf('</head>'))
    // 无src的script应在有src的script后引入
    if (head.indexOf('<script>') > -1 || head.indexOf('<script type="text/javascript">') > -1) {
      head.replace(new RegExp('<script[^<]*</script>'), function (rp) {
        key = rp
      })
    } else if (head.indexOf(`${name}.css`) > -1) {
      // 同名的css一定是在最后引入的
      head.replace(new RegExp(`<link href="(.*)${name}.css" rel="stylesheet">`), function (rp) {
        key = rp
      })
    }
    // 从页面末尾代码开始加入
    content.push(x.substr(x.indexOf(key), x.length))
    content.push(str + '\n')
    content.push(x.substr(0, x.indexOf(key)))
    content.reverse()
    this.content = this.beautify(content.join(""))
  }

  injectFoot(str, name) {
    let content = [this.content]
    let x = content.pop()
    let key = '</body>'
    // 同名的js 再第三方库的后面，但在统计代码前
    let body = x.substr(0, x.indexOf('</body>'))
    if (body.indexOf(`${name}.js`) > -1) {
      body.replace(new RegExp(`<script type="text/javascript" src="(.*)${name}.js"></script>`), function (rp) {
        key = rp
      })
    }
    content.push(x.substr(x.indexOf(key), x.length))
    content.push(str + '\n')
    content.push(x.substr(0, x.indexOf(key)))
    content.reverse()
    this.content = this.beautify(content.join(""))
  }

  injectLast(str) {
    /* 底部引入 */
    let content = [this.content]
    let x = content.pop()
    let key = '</body>'
    content.push(x.substr(x.indexOf(key), x.length))
    content.push(str + '\n')
    content.push(x.substr(0, x.indexOf(key)))
    content.reverse()
    this.content = this.beautify(content.join(""))
  }

  addJS(url) {
    return `<script type="text/javascript" src="${url}"></script>`
  }

  addCSS(url) {
    return `<link href="${url}" rel="stylesheet">`
  }
}

module.exports = function injectCode (content, options) {
  return new Inject({
    content,
    options
  })
}