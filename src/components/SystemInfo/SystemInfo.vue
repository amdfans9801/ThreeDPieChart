<template>

</template>

<script setup>
    // const os = require('os');
    // console.log(os);

    function getGPUS(){
        const canvas = document.createElement('canvas');
        let gl = canvas.getContext('experimental-webgl');
        let debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        let gpuinfo = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        return gpuinfo;
    }
</script>

<style scoped>

</style>