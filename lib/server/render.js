/*
* @Author: smm
* @Date:   2019-04-21 10:23:09
* @Last Modified by:   smm
* @Last Modified time: 2019-04-24 20:49:50
*/
const fs = require('fs-extra')
const path = require('path')

module.exports = async function (config) {
  return [
    async (ctx, next) => {
      let basename = config.routers[ctx.request.url]
      if(typeof basename=='undefined'){
        basename = ctx.params.pagename
      }
      console.log('render run')
      try {
        let htm = ctx.htm

        // 注入全局引入的库
        if(config.global){
          htm = injectGlobalJs(htm, config.global)
        }

        // 注入同名脚本
        htm = injectSameJs(htm, basename)

        // 注入 livereload 脚本
        if (config.livereload) {
          htm = injectLivereload(htm)
        }

        ctx.body = htm
      } catch (e) {
        ctx.throw(404, 'no such file in: ' + pagePath)
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