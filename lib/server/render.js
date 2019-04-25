/*
* @Author: smm
* @Date:   2019-04-21 10:23:09
* @Last Modified by:   shl
* @Last Modified time: 2019-04-25 15:59:01
*/
const fs = require('fs-extra')
const path = require('path')

module.exports = async function (config) {
  return [
    async (ctx, next) => {
      let basename = config.routers[ctx.request.url]
      if(typeof basename==='undefined'){
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
          htm = injectGlobalJs(htm, config.global)
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

function injectGlobalJs(content, arr) {
  return content
}

function injectSameJs(content,basename) {
  return content
      + `<script src="${basename}.js"></script>`;
}

function injectLivereload (content) {
  /* eslint-disable */
  return content
      + `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`;
}