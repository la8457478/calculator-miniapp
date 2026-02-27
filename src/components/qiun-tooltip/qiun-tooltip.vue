<template>
<view class="qiun-tooltip" v-if="show" :style="{left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px'}">
<slot></slot>
</view>
</template>

<script>
export default {
name: 'qiun-tooltip',
props: {
show: { type: Boolean, default: false },
tooltipPosition: { type: Object, default: () => { return { x: 0, y: 0 } } }
}
}
</script>

<style scoped>
.qiun-tooltip {
position: absolute;
z-index: 999;
background: rgba(0, 0, 0, 0.7);
color: #fff;
padding: 5px 10px;
border-radius: 4px;
font-size: 12px;
pointer-events: none;
}
</style>
