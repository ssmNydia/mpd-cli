const webpack = require('webpack')
const path = require('path')
const fs = require('fs-extra')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const StyleLintPlugin = require('stylelint-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

// loader
const babelLoader = require('./loader/babel')
const scssUse = require('./loader/scssUse')
const lessUse = require('./loader/lessUse')
const cssUse = require('./loader/cssUse')

// plugin
const HtmlKoaWebpackPlugin = require('./plugin/html')

const resolveModule = (moduleName) => {
  let possiblePath = [path.resolve(__dirname, '../../node_modules')].map(p => path.resolve(p, moduleName))

  if(fs.existsSync(possiblePath[0])){
    return possiblePath[0]
  }
}

const resolveDir = (dirName) => {
  return path.resolve(__dirname, '../../node_modules/' + dirName)
}


module.exports = function(options) {
  const isDev = options.env === 'development'

  let publicPath = options.publicPath || {}

  if (typeof publicPath.source === 'undefined') {
    publicPath.source = options.static + '/'
  }

  let fontPath = publicPath.source || '../'
  if (fontPath === '/') {
    fontPath  = '../'
  }

  let config = {
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'inline-source-map' : false,
    entry: options.entry,
    output: {
      path: options.outputPath,
      filename: '[name].js',
      publicPath: publicPath.source
    },
    resolve: {
      extensions: ['.js', '.json'],
      alias: Object.assign({
        '@babel/runtime-corejs3': resolveModule('@babel/runtime-corejs3'),
        'normalize.css/normalize.css': require.resolve('normalize.css')
      }, options.alias)
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          include: /pages|components/,
          use: [
            {
              loader: require.resolve('html-loader'),
              options: {
                root: '../../assets',
                interpolate: true,
                minimize: options.openMinify ? true : false,
                attrs: ['img:src', 'link:href']
              }
            }
          ]
        },
        {
          test: /\.(woff2?|svg|eot|ttf|otf)\??.*$/,
          include: /assets/,
          use: [
            {
              loader: require.resolve('file-loader'),
              options: {
                esModule: false,
                publicPath: fontPath || '../',//发布目录
                name: 'font/[name].[ext]'
              }
            }
          ]
        },
        {
          test: /\.less$/,
          include: /common|pages|components/,
          use: lessUse(options, MiniCssExtractPlugin, isDev)
        },
        {
          test: /\.scss$/,
          include: /common|pages|components/,
          use: scssUse(options, MiniCssExtractPlugin, isDev)
        },
        {
          test: /\.css$/,
          include: /assets|common|node_modules/,
          use: cssUse(MiniCssExtractPlugin, isDev)
        }
      ]
    },
    optimization: {},
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(options.env),
        IS_DEV: JSON.stringify(isDev),
      }),
      new HtmlKoaWebpackPlugin({ config: options })
    ]
  }

  let plugins = config.plugins
  if (isDev) {
    // 开发环境
    // 开发调试模式时，图片输出路径写死为 ../../
    const jsbabel = {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [
        babelLoader({ resolveModule })
      ]
    }
    if (options.openLint) {
      jsbabel.use.push({
        loader: require.resolve('eslint-loader'),
        options: {
          emitWarning: true,
          fix: false
        }
      })
      plugins.push(new StyleLintPlugin({
        context: options.dir,
        configFile: path.resolve(__dirname, '../../stylelint/.stylelintrc.json'),
        files: '**/*.scss',
        fix: false,
        cache: true
      }))
    }
    config.module.rules.push(jsbabel)
    config.module.rules.push({
      enforce: 'pre',
      test: /\.(png|jpe?g|gif)$/,
      use: [
        {
          loader: require.resolve('url-loader'),
          options: {
            esModule: false,
            limit: options.imgBase64,
            publicPath: publicPath.img || '../../',//发布目录
            name: 'images/[name].[ext]'
          }
        }
      ]
    })
    plugins.push(new webpack.NamedModulesPlugin())
    // 新 - 更改HTML渲染方式
    Object.keys(options.entryPages).forEach(a => {
      let o = {
        filename: a+'.html',
        template: options.entryPages[a][0].replace('.js', '.html')
      }
      if (options.favicon) {
        o.favicon = './favicon.ico'
      }
      if (options.mode !== 'merge') {
        o.chunks = [a]
      } else {
        let name = options.entryPages[a][0].split('/')
        name = name[name.length - 1]
        o.filename = name.replace('.js', '.html')
      }
      plugins.push(new HtmlWebpackPlugin(o))
    })
    return config
  } else {
    // 生产环境
    
    config.module.rules.push({
      test: /\.js$/,
      exclude: /node_modules/,
      use: [
        babelLoader({ resolveModule }),
        {
          loader: require.resolve('eslint-loader'),
          options: {
            configFile: path.resolve(__dirname, '../../lint/.eslintrc.json'),
            emitWarning: true,
            fix: true
          }
        }
      ]
    })
    config.module.rules.push({
      test: /\.(png|jpe?g|gif)$/,
      use: [
        {
          loader: require.resolve('url-loader'),
          options: {
            esModule: false,
            limit: options.imgBase64,
            publicPath: publicPath.img || '../',//发布目录
            name: 'images/[name].[ext]'
          }
        }
      ]
    })
    // 拷贝assets内 非css、js、images、iconfont的目录到打包目录
    // _xxx 命名的目录自动忽略不被拷贝到打包目录
    const ignore = ['css', 'js', 'images', '.DS_Store', 'iconfont']
    let staticDirs = []
    let dirs = fs.readdirSync(path.resolve(options.dir, 'assets'))
    dirs.forEach(a => {
      if (!/^_./.test(a) && ignore.indexOf(a) === -1) {
        staticDirs.push({from: path.resolve(options.dir, 'assets/'+a), to: path.resolve(options.output+'/'+a)})
      }
    })
    plugins.push(new StyleLintPlugin({
      context: options.dir,
      configFile: path.resolve(__dirname, '../../lint/.stylelintrc.json'),
      files: '**/*.scss',
      fix: true,
      cache: true
    }))
    plugins.push(new CopyPlugin(staticDirs))
    if (options.mode === 'merge') {
        config.output.filename = 'js/' + options.merge + '.js'
    } else {
      config.output.filename = 'js/[name].js'
    }
    
    if (options.iswx) {
      plugins.push(new MiniCssExtractPlugin({
        filename: '[name].wxss',
        chunkFilename: '[name].wxss'
      }))
    } else {
      plugins.push(new MiniCssExtractPlugin({
        filename: options.mode === 'merge' ? 'css/' + options.merge + '.css' : 'css/[name].css',
        chunkFilename: options.mode === 'merge' ? 'css/' + options.merge + '.css' : 'css/[name].css'
      }))
    }
    
    if (options.outHtml) {
      Object.keys(options.entryPages).forEach(a => {
        let o = {
          filename: a+'.html',
          template: options.entryPages[a][0].replace('.js', '.html'),
          minify: options.openMinify
        }
        if (options.favicon) {
          o.favicon = './favicon.ico'
        }
        if (options.mode !== 'merge') {
          o.chunks = [a]
        } else {
          let name = options.entryPages[a][0].split('/')
          name = name[name.length - 1]
          o.filename = name.replace('.js', '.html')
        }
        plugins.push(new HtmlWebpackPlugin(o))
      })
    }
    config.plugins = plugins

    // 控制压缩兼容ie8 且 去掉console
    if (options.useUglify) {
      config.optimization = {
        minimizer: [new UglifyJsPlugin({
          uglifyOptions: {
            test: /\.js$/,
            exclude: /assets/,
            parallel: 4,
            cache: true,
            ie8: options.ie8,
            compress: {
              drop_console: options.debug
            }
          }
        })]
      }
    }
    return config
  } 
}