/**
 * 计算页面的FPS
 * requestAnimationFrame作为原理
 * 不掉帧的情况下，requestAnimationFrame 这个方法在一秒内会执行 60 次
 * 假设动画在时间 A 开始执行，在时间 B 结束，耗时 x ms。而中间 requestAnimationFrame 一共执行了 n 次
 * 则此段动画的帧率大致为：n / (B - A)
 * 
 * 参照网络提供的代码借用修改   v1.0.0
 * date: 2022.09.06 22:15 ywq
 * (我真的不想搞，不想做任何事情....情绪也好不起来，但这可能是药物能够达到的最好状态了，已经足够稳定了。
 * 说实话，仔细比较之下能到达这种情况我应该对药物已经很满足了，不可能再奢求太多也不可能什么都靠药物，得要自己努力。
 * 但我真的真的没有力气做事情....淦，今天先到这吧，实在搞不下去23：27PM)
 * date：2022.09.07 今天查看了three.js样例的代码，发现fps也是这种方法写的。或许three.js那里才是原创？
 *       我看错了？？？ 找到了关于性能方面的源码，再看一下。
 *       不过requestAnimationFrame方法应该对cpu比较友好，性能消耗更少一些
 * 
 * v1.1.0动态图标展示
 */

/**
 * 实际实验了下，window.requestAnimationFrame(callback),每执行一次就会返回一个计数，这个计数是从1开始，
 * 每执行一次，这个返回值就会加1;
 * 查找资料得知：
 *     1、requestAnimationFrame 会把每一帧中的所有DOM操作集中起来，在一次重绘或回流中就完成，并且重绘或回流的时间间隔紧紧跟随浏览器的刷新频率，一般来说，这个频率为每秒60帧。
 *     2、在隐藏或不可见的元素中，requestAnimationFrame将不会进行重绘或回流，这当然就意味着更少的的cpu，gpu和内存使用量。
 * 
 * 个人理解：window.requestAnimationFrame(callback)这个方法写出来，就是告诉浏览器下次重绘的DOM之前，
 *          执行callback，callback执行次数通常是每秒60次；
 *          （因为显示器屏幕刷新频率60Hz，所以就意味着gpu是在一直重绘页面的，就是1000ms/60次，
 *            所以页面实际上也是重绘的（只重绘显示区域）
 */

 import * as echarts from 'echarts';

//感觉这样差不多就行了....核心代码就这么一点点？
let frames = 0;
let beginTime = Date.now();
function calculateFPS(){
    requestAnimationFrame(() => {
        frames++;
        let currTime = Date.now();

        if ( currTime >= beginTime + 1000 ) {
            var fps = Math.round((frames * 1000) / (currTime - beginTime));
            // console.log("fps=" + fps);
            updateFPS(fps);
            //updateFPSTable(fps);
            beginTime = currTime;
            frames = 0;
        }
        calculateFPS();
    });
}

function showFPS(){
    const HomeContainer = document.getElementById('home');
    let systemperformance = document.createElement('div');
    HomeContainer.appendChild(systemperformance);
    let fpsSpan = document.createElement('span');
    systemperformance.appendChild(fpsSpan);
    fpsSpan.id = 'fpsspan';
    fpsSpan.style.cssText = 'width:50px;height:20px;position:absolute;z-index:999;top:0;right:0;text-align:center;color:#000;';
    fpsSpan.innerText = '0 fps';
    //createFPSTable();
    calculateFPS();
}

function updateFPS(fps){
    let fpsspan = document.getElementById('fpsspan');
    fpsspan.innerHTML = fps + ' fps';
}


//再增加一个图表吧，正好echarts，动态数据图表2022.09.08
//2022.09.12 妈的，达不到我想要的效果....唉，淦
let dynamicFPSTable = null;
let fpsdata = [];
let fpsoption = {};
let xAxisData = [];
function createFPSTable(){
    const HomeContainer = document.getElementById('home');
    let fpsTableDiv = document.createElement('div');
    HomeContainer.appendChild(fpsTableDiv);
    fpsTableDiv.id = 'dynamicFPSTable';
    fpsTableDiv.style.width = '500px';
    fpsTableDiv.style.height = '500px';
    fpsTableDiv.style.cssText = 'width:500px;height:500px;position:absolute;z-index:998;top:0;right:0;';
    dynamicFPSTable = echarts.init(fpsTableDiv);
    //在初始化的时候就需要有10条数据，就都设置为0吧
    //let zerofpsitem = {name: nowtime, value: 0};
    let now = new Date().getTime();
    for(let i = 0; i < 10; i++){
        let timevalue = new Date(now - (10 - i) * 1000).toTimeString().split(' ')[0];
        let dateitem = {name: timevalue, value: 0};
        fpsdata.push(dateitem);
        //就这样吧初始化时间格式
        xAxisData.push(timevalue);
    }

    fpsoption = {
        title: {text: 'FPS'},
        tooltip: {

        },
        xAxis: {
            name: 'time',
            //type: 'time',
            // boundaryGap: [(new Date()).getTime() - 30, (new Date()).getTime() + 30],
            data: xAxisData,
        },
        yAxis: {
            name: 'fps',
            min: 0,
            max: 100,
            
        },
        series: [
            {
                type: 'line',
                showSymbol: false,
                data: fpsdata
            }
        ],
        //animationDuration: function(idx) {return idx * 100;}
        animationDuration: 6000,
        animationEasing: 'linear',
    };
    
}

//x轴的更新计数器，每10s更新一下x轴的数据
let xAxisUpdateCounter = 0;
function updateFPSTable(fps){
    //Array.shift() 删除数组开头元素
    fpsdata.shift();
    let nowtime = new Date().toTimeString().split(' ')[0];
    let obj = {name: nowtime, value: fps};
    fpsdata.push(obj);
    //x轴也这样更新
    xAxisUpdateCounter++;
    if(xAxisUpdateCounter >= 60){
        xAxisData.shift();
        xAxisData.push(nowtime);
    }
    
    fpsoption.series[0].data = fpsdata;
    fpsoption.xAxis.data = xAxisData;
    fpsoption.animationDuration = 6000;
    dynamicFPSTable.setOption(fpsoption);
}

export default{
    showFPS
}