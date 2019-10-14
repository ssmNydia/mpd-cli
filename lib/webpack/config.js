const webpack = require('webpack')
const path = require('path')
const fs = require('fs-extra')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
// const StyleLintPlugin = require('stylelint-webpack-plugin')
const resolveModule = (moduleName) => {
  let possiblePath = [path.resolve(__dirname, '../../node_modules')].map(p => path.resolve(p, moduleName))

  if(fs.existsSync(possiblePath[0])){
    return possiblePath[0]
  }
}

module.exports = function(options) {
  let publicPath = options.publicPath || {}
  if (typeof publicPath.source === 'undefined') {
    publicPath.source = options.static + '/'
  }
  let config = {
    mode: options.env === 'development' ? 'development' : 'production',
    devtool: options.env === 'development' ? 'inline-source-map' : false,
    entry: options.entry,
    output: {
      path: options.outputPath,
      filename: options.mode === 'merge' ? (options.merge + '.js') : '[name].js',
      publicPath: publicPath.source
    },
    resolve: {
      extensions: ['.js', '.json'],
      alias: Object.assign({'@babel/runtime-corejs3': resolveModule("@babel/runtime-corejs3")}, options.alias)
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: [     
            {
              loader: require.resolve('html-loader'),
              options: {
                root: '../..',
                minimize: options.openMinify?true:false,
                attrs: ['img:src', 'link:href']
              }
            }
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader:require.resolve('babel-loader'),
              options: {
                "babelrc": false,
                "presets": [
                  [require.resolve("@babel/preset-env"), {
                    "modules": false,
                    "targets": [
                      "> 1%",
                      "last 2 versions",
                      "not ie <= 8",
                      "iOS > 7",
                      "android >= 4.4"
                    ],
                    "useBuiltIns": false
                  }]
                ],
                "plugins": [
                  [require.resolve("@babel/plugin-transform-runtime"), {
                    "helpers": true,
                    "corejs": {
                      "version": 3,
                      "proposal": true
                    },
                    "regenerator": true,
                    "absoluteRuntime": resolveModule("@babel/runtime-corejs3"),
                    "useESModules": true
                  }],
                  require.resolve("@babel/plugin-syntax-dynamic-import"),
                  [
                    require.resolve("@babel/plugin-proposal-class-properties"),
                    {
                      "loose": true
                    }
                  ]
                ]
              }
            },
            {
              loader: require.resolve('eslint-loader')
            }
          ],
        },
        {
          test: /\.(woff2?|svg|eot|ttf|otf)\??.*$/,
          use: [
            {
              loader: require.resolve('url-loader'),
              options: {
                limit: 1000,
                publicPath: publicPath.css || '../',//发布目录
                name: 'font/[name].[ext]'
              }
            }
          ]
        },
        {
          test: /\.less$/,
          use: [
            options.env === 'development' ? {
              loader:require.resolve('style-loader')
            }:MiniCssExtractPlugin.loader,
            {
              loader:require.resolve('css-loader')
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                ident: 'postcss',
                plugins: [
                  require('autoprefixer')({
                    overrideBrowserslist: [
                      "> 1%",
                      "last 2 versions",
                      "ie 8-10"
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
            },
            {
              loader: require.resolve('less-loader'),
              options: {
                globalVars: {
                  'font-family': 'Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Arial,sans-serif', // 字体
                  'primary-color': '#2E5EEB', // 全局主色
                  'primary-color-sub': '#F6F8FB', // 全局主色辅助色
                  'bg-color': '#F4F5F9', // 背景色
                  'bg-color-secondary': '#F6F8FB', // 次背景色 
                  'link-color': '#1890ff', // 链接色
                  'success-color': '#52c41a', // 成功色
                  'warning-color': '#FFBE27', // 警告色
                  'error-color': '#FF4040', // 错误色
                  'font-size-base': '14px', // 主字号
                  'heading-color': '#303133', // 标题色
                  'text-color': '#303133', // 主文本色
                  'text-color-secondary': '#909399', // 次文本色
                  'disabled-color': 'rgba(0, 0, 0, .25)', // 失效色
                  'border-radius-base': '4px', // 组件/浮层圆角
                  'border-color-base': '#F6F8FB', // 边框色
                  'mask-base': 'rgba(0, 0, 0, .5)', // 蒙版
                  'box-shadow-base': '0 .03rem .1rem rgba(228, 231, 237, .4)'
                },
                modifyVars: options.lessTheme,
                javascriptEnabled: true
              }
            }
          ]
        },
        {
          test: /\.scss$/,
          use: [
            options.env === 'development' ? {
              loader:require.resolve('style-loader')
            }:MiniCssExtractPlugin.loader,
            {
              loader:require.resolve('css-loader')
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                ident: 'postcss',
                plugins: [
                  require('autoprefixer')({
                    overrideBrowserslist: [
                      "> 1%",
                      "last 2 versions",
                      "ie 8-10"
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
            },
            {
              loader:require.resolve('sass-loader')
            },
            {
              loader:require.resolve('sass-resources-loader'),
              options: {
                resources: path.resolve(options.dir, 'common/global.scss')
              }
            }
          ]
        },
        {
          test: /\.css$/,
          use: [
            options.env === 'development' ? {
              loader:require.resolve('style-loader')
            }:MiniCssExtractPlugin.loader,
            {
              loader:require.resolve('css-loader')
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                ident: 'postcss',
                plugins: [
                  require('autoprefixer')({
                    overrideBrowserslist: [
                      '> 1%',
                      'last 2 versions',
                      'ie 9-10'
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
          ]
        }
      ]
    },
    optimization: {
      minimize: true,
      minimizer: [
        new TerserPlugin({
          extractComments: false
        })
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(options.env),
        IS_DEV: JSON.stringify(options.env==='development'?true:false),
      }),
      // new StyleLintPlugin({
        
      // })
    ]
  }
  let plugins = config.plugins
  if (options.env === 'development') {
    // 开发环境
    // 开发调试模式时，图片输出路径写死为 ../../
    config.module.rules.push({
      test: /\.(png|jpe?g|gif)$/,
      use: [
        {
          loader: require.resolve('url-loader'),
          options: {
            limit: 1000,
            publicPath: publicPath.img || '../../',//发布目录
            name: 'images/[name].[ext]'
          }
        }
      ]
    })
    plugins.push(new webpack.NamedModulesPlugin())
    return config
  } else {
    // 生产环境
    config.module.rules.push({
      test: /\.(png|jpe?g|gif)$/,
      use: [
        {
          loader: require.resolve('url-loader'),
          options: {
            limit: 1000,
            publicPath: publicPath.img || '../',//发布目录
            name: 'images/[name].[ext]'
          }
        }
      ]
    })
    // 拷贝assets内 非css、js、images的目录到打包目录
    const ignore = ['css', 'js', 'images', '.DS_Store']
    let staticDirs = []
    let dirs = fs.readdirSync(path.resolve(options.dir, 'assets'))
    dirs.forEach(a => {
      if (ignore.indexOf(a) === -1) {
        staticDirs.push({from: path.resolve(options.dir, 'assets/'+a), to: path.resolve(options.output, a)})
      }
    })
    plugins.push(new CopyPlugin(staticDirs))
    if (options.mode === 'merge') {
        config.output.filename = 'js/' + options.merge + '.js'
    } else {
      config.output.filename = 'js/[name].js'
    }
    
    plugins.push(new MiniCssExtractPlugin({
      filename: options.mode === 'merge' ? 'css/' + options.merge + '.css' : 'css/[name].css',
      chunkFilename: options.mode === 'merge' ? 'css/' + options.merge + '.css' : 'css/[name].css'
    }))
    if (options.outHtml) {
      Object.keys(options.entryPages).forEach(a => {
        let o = {
          filename: a+'.html',
          template: options.entryPages[a].replace('.js', '.html')
        }
        if (options.mode !== 'merge') {
          o.chunks = [a]
        } else {
          let name = options.entryPages[a].split('/')
          name = name[name.length - 1]
          o.filename = name.replace('.js', '.html')
        }
        plugins.push(new HtmlWebpackPlugin(o))
      })
    }
    config.plugins = plugins
    return config
  } 
}