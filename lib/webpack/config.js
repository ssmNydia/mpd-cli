const webpack = require('webpack')
const path = require('path')
const fs = require('fs-extra')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const resolveModule = (moduleName) => {
  let possiblePath = [path.resolve(__dirname, '../../node_modules')].map(p => path.resolve(p, moduleName))

  if(fs.existsSync(possiblePath[0])){
    return possiblePath[0]
  }
}

module.exports = function(options) {
  let config = {
    mode: options.env === 'development' ? 'development' : 'production',
    entry: options.entry,
    output: {
      path: options.outputPath,
      filename: '[name].js',
      publicPath: options.static.replace(/\/$/, '') + '/'
    },
    devtool: options.env === 'development' ? 'inline-source-map' : false,
    module: {
      rules: [
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
                    "corejs": false,
                    "regenerator": true,
                    "absoluteRuntime": resolveModule("@babel/runtime"),
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
          test: /\.(png|jpe?g|gif)$/,
          use: [
            {
              loader: require.resolve('url-loader'),
              options: {
                limit: 1000,
                publicPath: options.publicPath,//发布目录
                outputPath: './images',
                name: '[name].[ext]'
              }
            }
          ]
        },
        {
          test: /\.(woff2?|svg|eot|ttf|otf)\??.*$/,
          use: [
            {
              loader: require.resolve('url-loader'),
              options: {
                limit: 1000,
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
                    browsers: [
                      '> 1%',
                      'last 2 versions',
                      'ie 8-10'
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
              loader: require.resolve('less-loader')
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
              loader:require.resolve('css-loader')
            },
            {
              loader: require.resolve('postcss-loader'),
              options: {
                ident: 'postcss',
                plugins: [
                  require('autoprefixer')({
                    browsers: [
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
    externals: [

    ],
    resolve: {
      extensions: ['.js', '.json'],
      alias: options.alias
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(options.env),
        IS_DEV: JSON.stringify(options.env==='development'?true:false),
      })
    ]
  }

  let plugins = config.plugins

  if ( options.env !== 'development' ) {
    config.output.filename = 'js/[name].js'
    plugins.push(new MiniCssExtractPlugin({
      filename: './css/[name].css',
      chunkFilename:'css/[name].css'
    }))
  } else {
    plugins.push(new webpack.NamedModulesPlugin())
  }

  config.plugins = plugins

  return config
}