import { createApp } from 'vue'
import App from './App.vue'

import router from './router/index'
import store from './store/index'
import elementplus from "element-plus"
import 'element-plus/theme-chalk/index.css';

import * as echarts from 'echarts';
import 'echarts-gl';
import axios from 'axios';

//全局的css样式
import '@/assets/css/style.css';

const app = createApp(App);
app.use(router);
app.use(store);
app.use(elementplus);


app.mount('#app');

console.log(SYSTEMINFO);

//路由拦截器
// router.beforeEach((to, from, next) => {
//     //do something...

// });

//请求拦截器
axios.interceptors.request.use(
    (config) => {

    }, 
    (error) => {

    }
);

//相应拦截器
axios.interceptors.response.use(
    (response) => {

    },
    (error) => {

    }
);