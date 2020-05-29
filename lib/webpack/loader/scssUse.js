/*
* scss
*/
const postcssLoader = require('./postcss')

module.exports = function scssUse (options = {}, MiniCssExtractPlugin, isDev) {
  var use = [
    isDev ? {
      loader: require.resolve('style-loader')
    } : {
      loader: MiniCssExtractPlugin.loader
    },
    {
      loader: require.resolve('css-loader')
    },
    postcssLoader()  
  ]
  var end = [
    {
      loader: require.resolve('sass-loader')
    },
    {
      loader: require.resolve('sass-resources-loader'),
      options: {
        resources: options.dir + '/common/global.scss'
      }
    }
  ]
  if (options.iswx) {
    use.push({
      loader: require.resolve('css-x2x-loader'),
      options: options.x2xOptions
    })
  }
  use = use.concat(end)
  return use
}