/*
* @Author: shl
* @title: 
* @Date:   2020-05-29 09:53:44
* @Last Modified by:   shl
* @Last Modified time: 2020-05-29 10:01:51
*/
const postcssLoader = require('./postcss')

module.exports = function cssUse (MiniCssExtractPlugin, isDev) {
  return [
    isDev ? {
      loader:require.resolve('style-loader')
    } : MiniCssExtractPlugin.loader,
    {
      loader:require.resolve('css-loader')
    },
    postcssLoader()
  ]
}