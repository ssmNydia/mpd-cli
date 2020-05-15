/*
* webpack-dev-server
*/
const Builder = require('../../webpack/dev')

module.exports = async function (options) {
  let builder = new Builder(options)

  await builder.loaded
  options.compiler = builder.compiler
  options.compilation = builder.compilation
  options.middleware = builder.middleware
  return [
    builder.dev.bind(builder)
  ]
}