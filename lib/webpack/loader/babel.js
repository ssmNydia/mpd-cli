/*
* babel 配置
*/

module.exports = function babelLoader (options = {}) {
  return {
    loader: require.resolve('babel-loader'),
    options: {
      babelrc: false,
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            modules: false,
            targets: [
              '> 1%',
              'last 2 versions',
              'not ie <= 7',
              'iOS > 7',
              'android >= 4.4'
            ]
          }
        ]
      ],
      cacheDirectory: true,
      plugins: [
        [
          require('@babel/plugin-transform-runtime'),
          {
            corejs: 3,
            helpers: true,
            regenerator: true,
            absoluteRuntime: options.resolveModule('@babel/runtime-corejs3'),
            useESModules: true
          }
        ],
        require('@babel/plugin-syntax-dynamic-import'),
        [
          require('@babel/plugin-proposal-class-properties'),
          {
            loose: true
          }
        ]
      ]
    }
  }
}