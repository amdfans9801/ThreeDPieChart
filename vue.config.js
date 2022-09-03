const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,    //关闭在保存的时候进行eslint验证

  devServer: {
		port: 8080,
		host: '0.0.0.0',
		https: false,
		open: false, // 配置自动启动浏览器
  },
})
