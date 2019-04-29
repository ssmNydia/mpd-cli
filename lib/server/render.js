/*
* @Author: smm
* @Date:   2019-04-21 10:23:09
* @Last Modified by:   shl
* @Last Modified time: 2019-04-29 09:45:34
*/
const fs = require('fs-extra')
const path = require('path')

module.exports = async function (config) {
  return [
    async (ctx, next) => {
      let basename = config.routers[ctx.request.url]
      Object.keys(config.routers).forEach((rule) => {
        let url = ctx.request.url
        let pagename = config.routers[rule]
        if(rule.indexOf(':')>-1){
          // 携带正则
          let rkey = rule.split(':')
          let reg = null
          if(rkey[1]==='id'){
            reg = new RegExp(`${rkey[0]}[0-9,a-z]*`,'i')
            if(reg.test(url)){
              basename = pagename
            }
          }
        }else{
          if(url===rule){
            basename = pagename
          }
        }
      })
      if(typeof basename==='undefined'){
        // 需要判断是否有设置了正则的路由  
        basename = ctx.params.pagename
      } 
      let isc = false
      if(typeof basename==='undefined'&&ctx.request.url.indexOf('index.html')>-1){
        isc = true

        let dirname = ctx.request.url.replace(/^\//,'')
        // 组件需要获取内容
        ctx.htm = fs.readFileSync(path.resolve(process.cwd(), 'components/', dirname), 'utf8')
      }
      try {
        let htm = ctx.htm

        // 注入全局引入的库
        if(config.global){
          htm = injectGlobal(htm, config.global)
        }
        // 注入指定页面的指定库
        if(config.assign){
          htm = injectAssign(htm, basename, config.assign)
        }

        // 页面才注入同名脚本
        if(!isc){
          htm = injectSameJs(htm, basename)
        }

        // 注入 livereload 脚本
        if (config.livereload) {
          htm = injectLivereload(htm)
        }

        ctx.body = htm
      } catch (e) {
        ctx.throw(404, 'no such file in: ' + ctx.request.url)
      }
    }
  ]
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
  let body = '</head>'+main[0]
  let end = '</body>'+main[1]

  return start+
    css+
    body+
    js+
    end
}

function _injectJs(url) {
  return `<script src="${url}"></script>`
}

function _injectCss(url) {
  return `<link rel="stylesheet" href="${url}"/>`
}

function injectSameJs(content,basename) {
  return _inject(content,'',`<script src="${basename}.js"></script>`);
}

function injectLivereload (content) {
  /* eslint-disable */
  return content
      + `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`;
}