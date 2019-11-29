const fs = require('fs-extra')
const path = require('path')
const injectCode = require('../webpack/plugin/html')

module.exports = async function (config) {
  return [
    async (ctx, next) => {
      let basename = config.routers[ctx.request.url]
      if (typeof basename !== 'undefined' && basename.indexOf('?') > -1) {
        // 去除query查询参数后，再进行比对
        basename = basename.split('?')[0]
      }
      Object.keys(config.routers).forEach((rule) => {
        let url = ctx.request.url
        let pagename = config.routers[rule]
        if (pagename.indexOf('ctx') > -1) {
          pagename = eval(pagename)
        }
        if(rule.indexOf(':')>-1){
          // 携带正则
          Object.keys(ctx.params).forEach(a => {
            if (a !== '0') {
              url = url.replace(ctx.params[a], ':'+a)
            }
          })
          if(url===rule){
            basename = pagename
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
      let cpth = ''
      if(typeof basename === 'undefined' && ctx.request.url.indexOf('index.html') > -1){
        isc = true
        let dirname = ctx.request.url.replace(/^\/c\//,'')
        let cdir = dirname.split('/')[0]
        cpth = '/'+cdir+'/'+cdir+'.js'
        // 组件需要获取内容
        ctx.htm = fs.readFileSync(path.resolve(process.cwd(), 'components/', dirname), 'utf8')
      }
      try {
        let htm = ctx.htm

        let opt = injectCode(htm, config)      
        
        // 页面才注入同名脚本
        if(!isc){
          opt.page('/'+basename)
        }

        // 注入全局引入的库
        if(config.global){
          opt.global(config.global, basename)
        }

        // 注入指定页面的指定库
        if(config.assign){
          opt.assign(config.assign, basename)
        }

        // 注入 livereload 脚本
        if (config.livereload) {
          htm = injectLivereload(opt.content, config.liveport)
        } else {
          htm = opt.content
        }

        ctx.body = htm
      } catch (e) {
        console.log('error', e)
        ctx.throw(404, 'no such file in: ' + ctx.request.url)
      }
    }
  ]
}

function injectLivereload (content, port) {
  /* eslint-disable */
  return content
      + `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':${port}/livereload.js?snipver=1"></' + 'script>')</script>`;
}