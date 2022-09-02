const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,

  devServer: {
		port: 8080,
		host: '0.0.0.0',
		https: false,
		open: false, // 配置自动启动浏览器
  },
})
