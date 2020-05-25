const Builder = require('./webpack/build')
const fs = require('fs-extra')
const path = require('path')
const cli = require('./cli')
const CWD = process.cwd()

module.exports = async function (options) {
  options.outputPath = path.resolve(CWD, options.output || 'dist')
  options.dir = path.resolve(CWD, options.dir || '')
  options.static = options.static || ''
  options.outHtml = options.outHtml
  options.favicon = options.favicon || false
  options.env = options.env || 'production'
  options.mode = options.mode || 'alone'
  options.merge = options.merge || 'base'
  options.useUglify = options.useUglify || true
  options.ie8 = options.ie8 || true
  options.publicPath = options.publicPath || { source: '', img: '' }

  if( typeof options.outHtml === 'undefined') {
    options.outHtml = true
  }

  process.env.NODE_ENV = options.env

  const builder = new Builder(options)

  try {
    if (options.clean) {
      await fs.remove(options.output)
    }
    cli.info('开始编译...')
    await builder.build()

    cli.info('编译成功！')
  } catch (e) {
    cli.error('编译失败')
    if (Array.isArray(e)) {
      e.forEach(err => {
        cli.error(err)
        cli.info(' ')
      })
    } else {
      cli.error(e)
    }

    throw e
  }
}