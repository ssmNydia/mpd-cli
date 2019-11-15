const path = require('path')
const fs = require('fs-extra')
const chokidar = require('chokidar')
const Render = require('./render')
const koaWebpack = require('koa-webpack')

module.exports  =  class autoRouter {
  constructor (server, options) {
    options.pagePaths = {}
    this.options = options
    this.server = server
  }

  async renderr(ctx, filename, pname){
    // 自动补全页面路径
    if(!/^(\.\/)?pages\//.test(filename)){
      if (typeof pname !== 'undefined' && pname !== '' && filename !== 'index') {
        // 若有父目录，则补上
        filename = this.options.dir+'/pages/'+ pname + '/' +filename+'/'+filename
      } else {
        filename = this.options.dir+'/pages/'+filename+'/'+filename
      }
    }
   
    // 自动补全扩展名 .html
    if(!/\.html$/.test(filename)){
      filename += '.html'
    }

    let fullpath = path.resolve(process.cwd(), filename)
    // console.log('fullpath', fullpath)
    this.options.pagePaths[ctx.request.url] = fullpath

    let htm = fs.readFileSync(fullpath, 'utf8')
    ctx.htm  = htm
  }

  async init(){
    let routerPath = path.resolve(process.cwd(), this.options.dir, 'router.js')

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
          let partenName = ''
          // console.log('router', router, key)
          if (name.indexOf(',') > -1 && name.indexOf('ctx') > -1) {
            let a = name.split(',')
            partenName = eval(a[0])
            name = eval(a[1])
          } else if(name.indexOf('ctx')>-1){
            name = eval(name)
            console.log('name', name)
          }
          await this.renderr(ctx, name, partenName)
          next()
        } catch (e) {
          // console.log('middleware htm ', ctx.htm)
          console.log('err', e)
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
        router = Object.assign({
          '/':'index',
          '/:pagename.html':'ctx.params.pagename'
        }, router)
        this.options.routers = router
        Object.keys(router).forEach(key => loadRouter(key))
      })
      watcher.on('unlink', path => {
        
      })
    }

    Object.keys(router).forEach(key => loadRouter(key))
  }
}