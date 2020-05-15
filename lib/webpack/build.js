const webpack = require('webpack')
const path = require('path')
const fs = require('fs-extra')
const Base = require('./base')
const injectCode = require('./plugin/inject')

module.exports = class Build extends Base {

  async build () {
    await this.initConfig()

    let result = await this.pify(webpack)(this.config)

    if (result.hasErrors()) {
      throw Error(result.compilation.errors)
    }

    return result
  }
}
