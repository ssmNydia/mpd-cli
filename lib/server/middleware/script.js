/*
* @Author: shl
* @title: 
* @Date:   2019-04-24 16:42:17
* @Last Modified by:   shl
* @Last Modified time: 2019-04-24 16:42:56
*/
const Builder = require('../../webpack/dev')

module.exports = async function (options) {
  let builder = new Builder(options)

  options.app.builder = builder
  await builder.loaded

  return [
    builder.dev.bind(builder)
  ]
}