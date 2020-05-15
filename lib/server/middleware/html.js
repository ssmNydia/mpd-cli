/*
* @Author: sansui
* @title: 获取组件的html页面
*/
const fs = require('fs-extra')
const path = require('path')
const injectCode = require('../../webpack/plugin/inject')
const nopage = require('../plugin/404')

module.exports = async function (options) {
  return [
    async (ctx, next) => {
      const url = ctx.request.url
      let dirname = ctx.request.url.replace(/^\/c\//,'')
      let cdir = dirname.split('/')[0]
      let cpth = '/'+cdir+'/'+cdir+'.js'
      let basename = `${cdir}/${cdir}`

      const cfullpath = path.resolve(options.dir, 'components/', dirname)
      try {
        let htm = fs.readFileSync(cfullpath, 'utf8')
        let opt = injectCode(htm, options)

        // 注入全局引入的库
        if(options.global){
          opt.global(options.global, basename)
        }

        // 注入指定页面的指定库
        if(options.assign){
          opt.assign(options.assign, basename)
        }

        // 注入 livereload 脚本
        if (options.livereload) {
          htm = injectLivereload(opt.content, options.liveport)
        } else {
          htm = opt.content
        }
        ctx.body = htm
      } catch (err) {
        ctx.body = nopage()
      }
    }
  ]
}

function injectLivereload (content, port) {
  /* eslint-disable */
  return content
      + `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':${port}/livereload.js?snipver=1"></' + 'script>')</script>`;
}