/*
* @title MPD 项目基础配置
* @author: sansui
*/
module.exports = {
  /**
   * 启动 web和H5同步开发模式
   * @type {Boolean} 默认为false
   */
  isH5: false,  
  dev:{
    /**
     * 启用代理 启用代理需要配置 proxy
     * @type {Boolean} 默认false
     */
    openProxy: true,
    /**
     * 设置代理对应关系
     * @type {Object}
     */
    proxy:{
      '/api':'http://api.mpd-cli.com/'
    },
    /**
     * 设置 dev服务器端口号
     * @type {Number} 默认9000
     */
    port: 9100,

    /**
     * 启用页面自动刷新
     * @type {Boolean} 默认false
     */
    livereload: true,

    /**
     * dev服务器启动自动打开页面
     * @type {Boolean} 默认false
     */
    autoopen: true
  },

  build:{
    /**
     * 打包前删除打包目录
     * @type {Boolean} 默认true
     */
    clean: false,
    /**
     * 启用HTML压缩
     * @type {Boolean} 默认false
     */
    openMinify: false,
    /**
     * 设置打包目录名称
     * @type {String} 默认dist
     */
    dir:'assets',
    /**
     * 对应的公开 资源URL
     * @type {String}
     */
    publicPath: '',
    /**
     * 对应的公开 访问URL
     * @type {String}
     */
    publicUrl: ''
  }
}