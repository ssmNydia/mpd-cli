/*
* @Author: shl
* @title: 
* @Date:   2020-03-06 12:00:02
* @Last Modified by:   shl
* @Last Modified time: 2020-03-11 16:58:56
*/
const path = require('path')

module.exports = function postcssLoader (options = {}) {
  return {
    loader: require.resolve('postcss-loader'),
    options: {
      ident: 'postcss',
      plugins: [
        require('postcss-import')(),
        require('postcss-url')(),
        require('autoprefixer')({
          overrideBrowserslist: [
            "> 1%",
            "last 2 versions",
            "not ie <= 7"
          ]
        }),
        require('cssnano')({
          autoprefixer: false,
          discardUnused: false,
          reduceIdents: false,
          zindex: false
        })
      ]
    }
  }
}