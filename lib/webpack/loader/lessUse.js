/*
* @Author: shl
* @title: 
* @Date:   2020-05-29 09:53:18
* @Last Modified by:   shl
* @Last Modified time: 2020-05-29 10:01:48
*/
const postcssLoader = require('./postcss')

module.exports = function lessUse (options = {}, MiniCssExtractPlugin, isDev) {
  return [
    isDev ? {
      loader:require.resolve('style-loader')
    } : MiniCssExtractPlugin.loader,
    {
      loader:require.resolve('css-loader')
    },
    postcssLoader(),
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
}