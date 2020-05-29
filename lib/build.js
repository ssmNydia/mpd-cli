const Builder = require('./webpack/build')
const fs = require('fs-extra')
const path = require('path')
const cli = require('./cli')
const CWD = process.cwd()

const defBuild = {
  env: 'production',
  outputPath: path.resolve(CWD, 'dist'),
  dir: path.resolve(CWD, ''),
  static: '',
  outHtml: true,
  favicon: false,
  useUglify: true,
  ie8: true,
  imgBase64: 1024,
  publicPath: { source: '', img: '' },
  mode: 'alone',
  merge: 'base',
  debug: false,
  iswx: false,
  x2xOptions: {
    type: 'rem2rpx'
  }
}

module.exports = async function (options) {
  if (typeof options.dir !== 'undefined' && options.dir !== '') {
    options.dir = path.resolve(CWD, options.dir)
  }
  if (typeof options.output !== 'undefined' && (options.output !== '' && options.output !== 'dist')) {
    options.outputPath = path.resolve(CWD, options.output)
  }
  options = Object.assign(defBuild, options)

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