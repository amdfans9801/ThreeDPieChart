import {createRouter,createWebHashHistory} from 'vue-router'

export default createRouter({
    history:createWebHashHistory(),
	routes:[
        {
			path: '/',
			redirect: '/home'
		},
        {
			path: "/home",
			name: "home",
			meta: {
				// requireAuth: true,
				title: '主页'
			},
			component:()=>import('@/components/Home/home.vue')
		},
    ]
});