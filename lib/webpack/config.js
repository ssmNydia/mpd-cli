module.exports = function(options) {
  mode: options.env === 'development' ? 'development' : 'production',
  entry: options.entry,
  output: {
    path: options.outputPath,
    filename: '[name].js',
    publicPath: options.publicPath.replace(/\/$/, '') + '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
            {
              loader:require.resolve('babel-loader'),
              options: {
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      modules: false,
                      targets: {
                        browsers: ['> 1%', 'last 2 versions', 'safari >= 7']
                      }
                    }
                  ],
                  ''
                ],
                plugins: [
                  [
                    '@babel/plugin-transform-runtime',
                    {
                      helpers: true,
                      polyfill: true,
                      regenerator: true
                    }
                  ]
                ]
              }
            },
            {
            loader:require.resolve('eslint-loader')
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
              name:'[name].[ext]'
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
          },
          {
            loader: require.resolve('less-loader')
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
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
  }
}