/*
* @Author: smm
* @Date:   2019-04-20 15:54:30
* @Last Modified by:   shl
* @Last Modified time: 2019-04-25 10:09:33
*/
const path = require('path')
const fs = require('fs-extra')
const chokidar = require('chokidar')
const Render = require('./render')

module.exports  =  class autoRouter {
  constructor (server, options) {
    options.pagePaths = {}
    this.options = options
    this.server = server  
  }

  async renderr(ctx, filename){
    // 自动补全页面路径
    if(!/^(\.\/)?pages\//.test(filename)){
      filename = this.options.dir+'/pages/'+filename+'/'+filename
    }
    // 自动补全扩展名 .html
    if(!/\.html$/.test(filename)){
      filename += '.html'
    }
    let fullpath = path.resolve(process.cwd(), filename)
    
    this.options.pagePaths[ctx.request.url] = fullpath

    let htm = fs.readFileSync(fullpath, 'utf8')
    ctx.htm  = htm
  }

  async init(){
    let routerPath = path.resolve(process.cwd(), 'router.js')

    let router = require(routerPath)
    
    router = Object.assign({
      '/':'index',
      '/:pagename.html':'ctx.params.pagename'
    }, router)
    

    this.options.routers = router

    let mid = await Render(this.options)

    let loadRouter = key => {  
      this.server.router.get(key, async (ctx, next) => {
        try {
          let name = router[key]
          if(name.indexOf('ctx')>-1){
            name = eval(name)
          }
          await this.renderr(ctx, name)
          next()
        } catch (e) {
          ctx.status = 404
          ctx.body = '您访问的页面可能已被删除'
        }
      }, ...mid)
    }

    if(this.options.livereload){
      let watcher = chokidar.watch(routerPath)
      watcher.on('change', filePath => {
        console.log('路由已更新')
        let normalizedPath = path.normalize(filePath)
        require.cache[normalizedPath] = null;
        router = require(filePath)
        this.options.routers = router
        Object.keys(router).forEach(key => loadRouter(key))
      })
      watcher.on('unlink', path => {
        
      })
    }

    Object.keys(router).forEach(key => loadRouter(key))
  }
}