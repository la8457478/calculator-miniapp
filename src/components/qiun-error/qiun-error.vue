<template>
<view class="qiun-error" :style="{height: errorMessage === null ? '0px' : errorShowHeight}">
<text v-if="errorMessage!==null" class="font-err">{{errorMessage}}</text>
</view>
</template>

<script>
export default {
name: 'qiun-error',
props: {
errorMessage: {
type: String,
default: null
}
},
data() {
return {

};
},
computed:{
errorShowHeight(){
return '100% '
}
}
}
</script>

<style scoped>
.qiun-error {
display: flex;
justify-content: center;
align-items: center;
width: 100%;
background-color: #f7f7f7;
}
.font-err {
color: #555555;
font-size: 14px;
}
</style>
