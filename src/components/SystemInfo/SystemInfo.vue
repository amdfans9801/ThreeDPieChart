<template>
    <div id="systeminfo">
        <div id="titlecontiner">
            <span class="titlespan">系统概览</span>
        </div>
        <div id="cpu" class="systemitem">
            <span class="itemtitle">CPU：</span>
            <span class="itemvalue">{{cpuname}}</span>
        </div>
        <div id="memory" class="systemitem">
            <span class="itemtitle">内存：</span>
            <span class="itemvalue">{{totalram}}</span>
        </div>
        <!-- <div id="jsramusage" class="systemitem">
            <span class="itemtitle">JS(V8引擎)占用内存情况：</span>
            <span class="itemvalue">{{jsraminfo}}</span>
        </div> -->
        <div id="gpu" class="systemitem">
            <span class="itemtitle">显卡：</span>
            <span class="itemvalue">{{gpuname}}</span>
        </div>
        <div id="operation" class="systemitem">
            <span class="itemtitle">操作系统：</span>
            <span class="itemvalue">{{operationsystem}}</span>
        </div>

    </div>
</template>

<script setup>
    import { ref, onMounted, computed } from "vue";
    
    const SystemInfo = ref(SYSTEMINFO);   //这项备用
    const System_CPU = ref(SYSTEMINFO.System_CPU);
    const System_CPUARCH = ref(SYSTEMINFO.System_CPUARCH);
    const System_TOTALMEMORY = ref(SYSTEMINFO.System_TOTALMEMORY);
    const System_VERSION = ref(SYSTEMINFO.System_VERSION);
    const System_OPERATION = ref(SYSTEMINFO.System_OPERATION);
    const System_NETWORK = ref(SYSTEMINFO.System_NETWORK);
    /**
     * 这里的空闲内存是vue打包的时候nodejs记录下当时的空闲内存，
     * 在终端中可以获取实时内存，但是打包之后这个值，就无法改变了，所以获取补不到整个系统的实时占用内存
     * 但是可以获取到当前页面占用的内存
    */
    // const System_FREEMEMORY = ref(SYSTEMINFO.System_FREEMEMORY);
    // let MemoryUsage = computed(() => {
    //     let totalmemory_GB = (System_TOTALMEMORY.value / ( 1024 * 1024 * 1024));
    //     let freememory_GB = (System_FREEMEMORY.value / ( 1024 * 1024 * 1024));
    //     let usedmemorytext = (totalmemory_GB - freememory_GB).toFixed(2);
    //     let totalmemorytext = (totalmemory_GB).toFixed(2);
    //     let usage = Math.round(((totalmemory_GB - freememory_GB) / totalmemory_GB) * 100);
    //     return usedmemorytext + '/' + totalmemorytext + 'GB' + '(' + usage + '%)';
    // });
    let refreshMemoryInterval = null
    let JSARMUsage = null;

    let cpuname = computed(() => {
        return System_CPU.value[0].model;
    });
    let totalram = computed(() => {
        return (System_TOTALMEMORY.value / ( 1024 * 1024 * 1024)).toFixed(2) + 'GB';
    });
    let gpuname = computed(() => {
        //ANGLE (NVIDIA, NVIDIA GeForce GTX 750 Direct3D11 vs_5_0 ps_5_0, D3D11)
        let gpuinfo = getGPU();
        let temparr = gpuinfo.split(', ');
        let splitarr = temparr[1].split(' Direct');
        return splitarr[0];
    });
    let operationsystem = computed(() => {
        return System_OPERATION.value + ' ' + System_VERSION.value;
    });

    let jsraminfo = computed(() => {
        return JSARMUsage;
    });

    onMounted(() => {
        getGPU();
        //getSystemInfo();
        //每两秒获取一次JS 对象（包括V8引擎内部对象）占用的内存
        // refreshMemoryInterval = setInterval(() => {
        //     JSARMUsage = getJSARMUsage();
        // }, 2000);

    });
        

    function getGPU(){
        const canvas = document.createElement('canvas');
        let gl = canvas.getContext('experimental-webgl');
        let debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        let gpuinfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return gpuinfo;
    }

     /**
     * window.performance.memory对象含有三个属性
     * jsHeapSizeLimit：js堆内存大小限制
     * totalJSHeapSize：当前js堆栈内存总大小
     * usedJSHeapSize：JS 对象（包括V8引擎内部对象）占用的内存  
     * usedJSHeapSize一定要小于totalJSHeapSize
     */
     function getJSARMUsage() {
        let ramUsage = window.performance.memory;
        let totalJSRAM = 0;
        let totalJSRAMText = '';
        let usedJSRAM = 0;
        let usedJSRAMText = '';
        let JSRAMUsageText = '';
        if(ramUsage != null){
            //1GB = 1024 * 1024 * 1024 = 1073741824
            if(ramUsage.totalJSHeapSize >= 1073741824){
                totalJSRAM =  (ramUsage.totalJSHeapSize / ( 1024 * 1024 * 1024)).toFixed(2);
                totalJSRAMText = totalJSRAM + 'GB';
            } else{
                totalJSRAM = (ramUsage.totalJSHeapSize / ( 1024 * 1024)).toFixed(2);
                totalJSRAMText = totalJSRAM + 'MB'
            }
            if(ramUsage.usedJSHeapSize >= 1073741824){
                usedJSRAM = (ramUsage.usedJSHeapSize / ( 1024 * 1024 * 1024)).toFixed(2);
                usedJSRAMText = usedJSRAM + 'GB';
            } else{
                usedJSRAM = (ramUsage.usedJSHeapSize / ( 1024 * 1024)).toFixed(2);
                usedJSRAMText = usedJSRAM + 'MB';
            }
            let JSRAMUsageText = Math.round((usedJSRAM / totalJSRAM) * 100) + '%';
            return usedJSRAMText + ' / ' + totalJSRAMText + ' (' + JSRAMUsageText + ')';
        }
        return '';
    };


    
</script>

<style scoped>
    @import './css/systeminfo.css';
</style>