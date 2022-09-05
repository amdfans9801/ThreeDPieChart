const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

//这里似乎可以获取到系统信息
const os = require('os');
let System_CPU = os.cpus();
let System_CPUARCH = os.arch();             //cpu架构
let System_TOTALMEMORY = os.totalmem();     //以整数的形式返回系统总内存的字节数
let System_FREEMEMORY = os.freemem();       //空闲内存
let System_PLATFORM = os.platform();        //操作系统类型
let System_VERSION = os.release();          //操作系统版本
let System_OPERATION = os.type();           //操作系统名称
let System_NETWORK = os.networkInterfaces();//网络

// setInterval(() => {
//   System_FREEMEMORY = os.freemem();
//   //console.log(System_FREEMEMORY);
// }, 2000);

let SYSTEMPLUGIN = new webpack.DefinePlugin({
  SYSTEMINFO: JSON.stringify({
    System_CPU, System_CPUARCH, System_TOTALMEMORY, System_FREEMEMORY, System_PLATFORM, System_VERSION, System_OPERATION, System_NETWORK
  })
});

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,    //关闭在保存的时候进行eslint验证

  devServer: {
		port: 8080,
		host: '0.0.0.0',
		https: false,
		open: false, // 配置自动启动浏览器
  },

  configureWebpack: (config) => {
    config.plugins.push(SYSTEMPLUGIN);
  },
  
  
})
