const path = require('path')
const open = require('open')
const os = require('os')
const Server  = require('./server')
const cli = require('./cli')

const chalk = cli.chalk

process.on('unhandledRejection', (reason, p) => {
  cli.error(' dev error: ', reason)
})

const defDev = {
  env: 'development',
  outputPath: path.resolve(process.cwd(), 'dist'),
  dir: path.resolve(process.cwd(), ''),
  port: 9100,
  liveport: 35729,
  openProxy: false,
  openHttps: false,
  openLint: false,
  livereload: false,
  useUglify: true,
  ie8: true,
  imgBase64: 1024,
  publicPath: { source: '', img: '' },
  mode: 'alone',
  merge: 'base',
  debug: true
}

module.exports = async options => {
  if (typeof options.dir !== 'undefined') {
    options.dir = path.resolve(process.cwd(), options.dir)
  }
  if (typeof options.output !== 'undefined') {
    options.outputPath = path.resolve(process.cwd(), options.output)
  }
  options = Object.assign(defDev, options)
  process.env.NODE_ENV = options.env

  if (options.static) {
    options.static = options.static.replace(/\/$/, '').replace(/:\d+/, '') + ':' + options.port
  } else {
    options.localip = cli.getLocalIP(os.networkInterfaces())
  }

  const server = new Server(options)

  try {
    await server.run()
    options.static = `http${options.openHttps?'s':''}://${options.localip}:${options.port}`

    console.log()
    console.log(chalk.yellow('  页面开发:'))
    console.log(`  - 存放目录: pages`)
    console.log(`  - 预览: ${chalk.cyan(options.static + '/{页面名}.html')}`)
    console.log(`  - Or: 按路由配置文件 router.js 的路由进行预览`)
    console.log()
    console.log(chalk.yellow('  组件开发:'))
    console.log(`  - 存放目录: components`)
    console.log(`  - 组件列表: ${chalk.cyan(options.static + '/c')}`)
    console.log(`  - 单个组件预览: ${chalk.cyan(options.static + '/c/{组件名}/index.html')}`)
    console.log(`  - html页面内引用路径: ${chalk.green('/{组件名}/{组件名}.js')}`)
    console.log(`  - js内引用路径: ${chalk.green('{组件名}')}`)
    console.log()
    console.log(`  调试服务器启动:`)
    console.log(`  - Local:   ${chalk.cyan(`http${options.openHttps?'s':''}://localhost:${options.port}`)}`)
    console.log(`  - Network: ${chalk.cyan(options.static)}`)
    console.log()

    let autoopen = options.autoopen

    if (autoopen) {
      if (/^\//.test(autoopen)) {
        autoopen = `${options.static}${autoopen}`
      }else{
        autoopen = `${options.static}`
      }

      // 预告：
      cli.info(`在HTML页面中引用静态资源时，请用"/"替代"/assets/"。`)
      open(autoopen)
    }
  } catch (e) {
    cli.error(e, '服务器启动失败')
  }
}