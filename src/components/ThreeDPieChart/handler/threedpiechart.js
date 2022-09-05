/**
 * summary: echarts 官方组件echarts-gl支持三维柱状图、三维散点图、三维飞线、曲面图，这里并没有三维饼图，需要利用曲面图进行绘制。
 *          其实此文件就是为了生成echart初始化绑定dom之后的chart对象的option属性，这个option属性里面包含了图标的数据样式等所有内容。
 * reference：https://blog.csdn.net/weixin_41326021/article/details/120195920
 * echarts-document: https://echarts.apache.org/zh/option-gl.html#series-surface
 * author: yanwenqing
 * time: 2022.08.19
 * version: v 1.0.0
 */

/**
 * 绘制3d饼图，提供图表的配置项和数据
 * @param pieData 饼图的数据
 * @param internalDiameterRatio:透明的空心占比
 * @param distance 视角到主体的距离
 * @param alpha 旋转角度
 * @param pieHeight 立体的高度
 * @param opacity 饼或者环的透明度
 * 此方法的返回值是一个option对象，对象格式见echarts文档
 */
function get3DPieOption(pieData, internalDiameterRatio, distance, alpha) {
    let series = [];    //option中的series数组，这个数组里有几个对象，就代表有几个图表
    let sumValue = 0;
    let startValue = 0;
    let endValue = 0;
    let pieHeight = 0;
    let opacity = 1;
    const k = 1 - internalDiameterRatio;
    //每一个饼图数据，就会生成一个series中type：surface的对象
    for(let i = 0; i< pieData.length; i++){
        sumValue += pieData[i].value;
        let seriesobj = { 
            type: 'surface',    //曲面图,支持绘制
            name: typeof pieData[i].name == 'undefined' ? `threedpie${i}` :  pieData[i].name,   //反引号``除了作为普通字符串，还可以用来定义多行字符串，还可以在字符串中加入变量和表达式
            parametric: true,   //是否为曲面boolean
            wireframe: {        //曲面的网格线
                show: false     //default:true
            },
            pieData: pieData[i],
            pieStatus: {
                selected: false,
                hovered: false,
                k: k
            },
            center: ['10%', '50%'],
        };
        if(typeof pieData[i].itemStyle !== 'undefined'){
            let itemStyle = {};
            typeof pieData[i].itemStyle.color != 'undefined' ? itemStyle.color = pieData[i].itemStyle.color : opacity;
            typeof pieData[i].itemStyle.opacity != 'undefined' ? itemStyle.opacity = pieData[i].itemStyle.opacity : opacity;
            seriesobj.itemStyle = itemStyle;
        }
        series.push(seriesobj);
    }

    // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
    // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
    for (let i = 0; i < series.length; i++) {
        endValue = startValue + series[i].pieData.value;
        pieHeight = series[i].pieData.value / 10;
        series[i].pieData.startRatio = startValue / sumValue;
        series[i].pieData.endRatio = endValue / sumValue;
        series[i].parametricEquation = getParametricEquation(series[i].pieData.startRatio, series[i].pieData.endRatio, false, false, k, pieHeight);
        startValue = endValue;
    }
    
    // 补充一个透明的圆环，用于支撑高亮功能的近似实现。
    series.push({
        name: 'mouseoutSeries',
        type: 'surface',
        parametric: true,
        wireframe: {
            show: false
        },
        itemStyle: {
            opacity: 0.5, color: '#01ADFC'
        },
        parametricEquation: {
            u: {
                min: 0,
                max: Math.PI * 2,
                step: Math.PI / 20
            },
            v: {
                min: 0,
                max: Math.PI,
                step: Math.PI / 20
            },
            x: function(u, v) {
                return Math.sin(u) + Math.sin(u) * Math.sin(v);
            },
            y: function(u, v) {
                return Math.cos(u) + Math.cos(u) * Math.sin(v);
            },
            z: function(u, v) {
                return Math.cos(v) > 0 ? -0.9 : -1;
            }
        }
    });

    // 准备待返回的配置项，把准备好的 legendData、series 传入。
    let option = {
        xAxis3D: {
            min: -1,
            max: 1
        },
        yAxis3D: {
            min: -1,
            max: 1
        },
        zAxis3D: {
            min: -1,
            max: 1
        },
        grid3D: {
            show: false,
        },
        series: series
    };

    return option;
}

/**
 * 设置曲面的参数方程
 * （官网文档：在data没被设置的时候，可以通过 parametricEquation 去声明参数参数方程。在 parametric 为true时有效。
 *            参数方程是 x、y、 z 关于参数 u、v 的方程。）
 * 所以此方法返回值应该是一个如下格式的对象
 *  {u:{max:xx,min:xx,step:xx}, v:{max:xx,min:xx,step:xx}, x:function(u,v), y:function(u,v), z:function(u,v)}
 * 这个方法的作用，就是根据传入的数据，绘制曲面图形
 * 方程组的含义是：根据u，v确定空间中构成曲面的每一个点，而u，v则是一个范围，step是取点的密度
 * u、v的范围就决定了x、y、z的范围
 * isSelected、isHovered添加点击和鼠标悬停特效
 * @param startRatio 起始点的值的比率，值=startValue / sumValue 一般startValue = 0;
 * @param endRatio 终点的值的比率， 值=(startValue + value) / sumValue;
 * @param isSelected 是否选中，偏移显示
 * @param isHovered 是否鼠标悬停，高亮显示
 * @param k 扇形的 内径/外径，没有传入的话默认值为1/3, 0 <= k < 1
 * @param value 空间中的点的高度，为value值，与z相关
 * ★★★★★★圆的参数方程：
 * x=a+r*cosθ  y=b+r*sinθ   (θ∈[0,2π])  (a,b为圆心坐标)   r为圆半径  θ为参数
 * 这里以(0,0)为圆心, 即a=0, b=0
 * ★★★★思维过程：首先为了简单，在以上的参数方程基础上，假设r=1，可得：
 *  { u:{0,Math.PI*2,step}, v:{}, x:function(u,v){cos u}, y:function(u,v){sin u}, z:function(u,v){0} }  这就是一个单纯的圆，以(0,0)为圆心，1为半径，高度为0，所有z坐标为0的一个圆
 * (step不重要，就是一个等分的值)
 *  ★★★★★★★★★★★★然后，这里是最关键的点：正常情况下，圆的内部所有点的集合是:x²+y²≤r², 圆环上的所有点可以用：(cos u, sin u)表, 在此基础上，还需要表示圆环每部的每一个点;
 *  此时, 唯一能确定的点, 即是用参数来表示出来的点, 只有(cos u,sin u), 然后将(cos u, sin u)看作一个确定的点, 那圆内所有的点到都可以找到一个小于等于r的(cos u, sin u);
 *  (就是圆内所有点到圆边上最短距离, 永远小于等于r; 由此这个圆内的所有点都可以用m²+n²≤r²来表示，这就意味着在之前的圆边上绘制圆, 竖直方向的圆，可以保证空间方向的点)
 *  那么现在也可以确定,圆内所有的点都可以在圆边上找到一个具体它r的(cos u,sin u), 所以v的意义就是以(cos u,sin u)为原点的坐标系, 绘制一个半径为1的圆
 *  ★★★以(x₀,y₀,z₀)为中心点球体的参数方程x=x₀+rsinφcosθ, y=y₀+rsinφsinθ, z=z₀+rcosφ,(0≤θ≤2π，0≤φ≤π)
 *  带入x₀=cos u, y₀=sin u
 */
function getParametricEquation(startRatio, endRatio, isSelected, isHovered, k, value) {
    const startRadian = startRatio * Math.PI * 2;   //起始点的弧度
    const endRadian = endRatio * Math.PI * 2;       //终点的弧度

    // 这里使用k作为辅助参数， k的含义是：扇形的 内径/外径，没有传入的话默认值为1/3
    k = typeof k !== 'undefined' ? k : (1/3);
    
    // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
    const offsetx = isSelected ? Math.cos() * 0.1 : 0;
    const offsety = isSelected ? Math.cos() * 0.1 : 0;
    // 计算高亮效果的放大比例（未高亮，则比例为 1）
    const hoverRate = isHovered ? 1.05 : 1;
    // 返回曲面参数方程
    return {
        // u: {
        //     min: 0,
        //     max: Math.PI * 2,
        //     step: Math.PI / 20,
        // },
        // v: {
        //     min: 0,
        //     max: Math.PI,
        //     step: Math.PI / 20
        // },
        // x: function (u, v){
        //     if(u < startRadian){
        //         return Math.cos(startRadian) + Math.cos(startRadian) * Math.sin(v) * k;
        //     }
        //     if(u > endRadian){
        //         return Math.cos(endRadian) + Math.cos(endRadian) * Math.sin(v) * k;
        //     }
        //     return Math.cos(u) + Math.cos(u) * Math.sin(v) * k;
        // },
        // y: function (u, v){
        //     if(u < startRadian){
        //         return Math.sin(startRadian) + Math.sin(startRadian) * Math.sin(v) * k;
        //     }
        //     if(u > endRadian){
        //         return Math.sin(endRadian) + Math.sin(endRadian) * Math.sin(v) * k;
        //     }
        //     return Math.sin(u) + Math.sin(u) * Math.sin(v) * k;
        // },
        // z: function (u, v){
        //     return Math.cos(v) * k > 0 ? 1 * value * 0.1 : -1;
        // }

        //文档中的写法,暂时去掉offset
        u: {
            min: -Math.PI,
            max: Math.PI * 3,
            step: Math.PI / 32
        },
        v: {
            min: 0,
            max: Math.PI * 2,
            step: Math.PI / 20
        },
        x: function (u, v) {
            if (u < startRadian) {
                return Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
            }
            if (u > endRadian) {
                return Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
            }
            return Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate;
        },
        y: function (u, v) {
            if (u < startRadian) {
              return Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate;
            }
            if (u > endRadian) {
              return Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate;
            }
            return Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate;
        },
        z: function (u, v) {
            if (u < -Math.PI * 0.5) {
              return Math.sin(u);
            }
            if (u > Math.PI * 2.5) {
              return Math.sin(u) * value * 0.1;
            }
            return Math.sin(v) > 0 ? 1 * value * 0.1 : -1;
        }

    };
}

/**
 * 获取三维饼图最高扇区的高度
 */
function getHeight(series, height) {
    series.sort((a, b) => {
        return b.pieData.value - a.pieData.value
    });
    return (height * 25) / series[0].pieData.value
}

export{ get3DPieOption, getParametricEquation}