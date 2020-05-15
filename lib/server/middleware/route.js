/*
* @Author: sansui
* @title: 页面的路由控制
*/
const { pathToRegexp, match, parse, compile } = require("path-to-regexp")
const nopage = require('../plugin/404')

module.exports = async function (options) {
  return [
    async (ctx, next) => {
      const { routers } = options
      const { params, query, req, res } = ctx
      const { compiler } = options
      const accept = ctx.req.headers.accept
      const ofs = compiler.outputFileSystem
      const config = compiler.options
      let url = ctx.request.url
      let pages = []
      Object.keys(config.entry).forEach(page => {
        pages.push(page)
      })

      if (/\?/g.test(url)) {
        url = url.split('?')[0]
      }

      if (!/text\/html/g.test(accept)) {
        await next()
      } else {
        // html格式的访问，才执行路由配置
        if (typeof params.pagename !== 'undefined' && !/\./g.test(params.pagename) && pages.includes(params.pagename)) {
          // 基础路由
          let file = compiler.outputPath + '/' + params.pagename + '.html'
          // console.log('file', file)
          let htm = ofs.readFileSync(file, 'utf-8')
          // console.log('htm', htm)
          ctx.body = htm
        } else {
          // 自定义路由
          // 匹配路由
          let target = null
          Object.keys(routers).forEach(rule => {
            let o = {
              rule,
              key: [],
              page: routers[rule]
            }
            o.reg = pathToRegexp(rule, o.key)
            // console.log('regs reg', o.reg)
            // console.log('regs key', o.key)
            if (o.reg.test(url)) {
              target = o
            }
          })
          if (target) {
            let file = compiler.outputPath + '/' + target.page + '.html'
            let htm = ofs.readFileSync(file, 'utf-8')
            ctx.body = htm
          } else {
            ctx.body = nopage()
          }
        }
        await next()
      }
    }
  ]
}
