const path = require('path')
const open = require('open')
const os = require('os')
const Server  = require('./server')
const autoRouter = require('./server/router')
const cli = require('./cli')

const chalk = cli.chalk

process.on('unhandledRejection', (reason, p) => {
  cli.error(reason)
})

module.exports = async options => {
  options.dir = path.resolve(process.cwd(), options.dir || '')
  options.port = options.port || 9100
  options.livereload = options.livereload || false
  options.openProxy = options.openProxy || false
  options.env = 'development'

  process.env.NODE_ENV = options.env

  if (options.static) {
    options.static = options.static.replace(/\/$/, '').replace(/:\d+/, '') + ':' + options.port
  } else {
    let localip = cli.getLocalIP(os.networkInterfaces())
    options.static = 'http://'+localip+':' + options.port
  }

  const server = new Server(options)
  const autorouter = new autoRouter(server, options)
  autorouter.init()

  try {
    await server.run()

    console.log()
    console.log()
    cli.info(`服务启动成功，正在监听 ${options.static}`)
    console.log()
    console.log(chalk.yellow('页面开发:'))
    console.log(`页面放在 /pages/{页面名} 目录下，可通过 ${chalk.green(options.static + '/{页面名}.html')} 进行预览。`)
    console.log(`或是 按照路由配置文件 router.js 的路由进行预览`)
    console.log()
    console.log(chalk.yellow('组件开发:'))
    console.log(`组件放在 /components/{组件名} 目录下，可通过 ${chalk.green(options.static + '/c/{组件名}/index.html')} 进行预览。`)
    console.log(`开发阶段下组件编译产物 URL 为 ${chalk.green(options.static + '/{组件名}/{组件名}.js')} ，可在 HTML 页面直接引入进行调试。`)
    console.log()
    console.log()

    let autoopen = options.autoopen

    if (autoopen) {
      if (/^\//.test(autoopen)) {
        autoopen = `${options.static}${autoopen}`
      }else{
        autoopen = `${options.static}`
      }

      cli.info(`正在打开网页 ${autoopen}`)
      open(autoopen)
    }
  } catch (e) {
    cli.error(e, '服务器启动失败')
  }
}