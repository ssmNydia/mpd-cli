const webpack = require('webpack')
const path = require('path')
const fs = require('fs-extra')
const Base = require('./base')
const injectCode = require('./plugin/html')

process.on('unhandledRejection', (reason, p) => {
  console.error('=== 错误： ', reason)
})

module.exports = class Build extends Base {
  constructor (options) {
    super(options)
    this.options = options
  }

  async build () {
    await this.initConfig()

    let result = await this.pify(webpack)(this.config)

    if (result.hasErrors()) {
      throw Error(result.compilation.errors)
    }

    return result
  }

  async html () {
    let glbOpPg = {
      cwd: this.outputDir,
      root: this.outputDir
    }
    let pages = await this.globFn('*.html', glbOpPg)

    pages = pages.reduce((ent, pathname) => {
      let basename = path.basename(pathname, path.extname(pathname))
      ent[`${basename}`] = path.resolve(this.outputDir, pathname)
      return ent
    }, {})

    Object.keys(pages).forEach(filename => {
      let htm = fs.readFileSync(pages[filename], 'utf8')

      let opt = injectCode(htm, this.options)
      // 注入全局引入的库
      if(this.options.global){
        opt.global(this.options.global, filename.replace('.html', ''))
      }
      // 注入指定页面的指定库
      if(this.options.assign){
        opt.assign(this.options.assign, filename.replace('.html', ''))
      }

      fs.writeFileSync(this.options.output+'/'+filename+'.html', opt.content, 'utf8');
    })
  }
}
