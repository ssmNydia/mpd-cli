const Builder = require('../webpack/dev')

module.exports = async function (options) {
  let builder = new Builder(options)
  // console.log('dev options', options)
  await builder.loaded
  options.app.builder = builder
  options.webpackConfig = builder.config
  return [
    builder.dev.bind(builder)
  ]
  
}