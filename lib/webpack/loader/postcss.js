/*
* postcss
*/

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