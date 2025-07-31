<template>
  <div id="container" :style="mapStyle"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, defineProps, ref, watch } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";

// 接收父组件传递的样式和地名数据
const props = defineProps({
  mapStyle: {
    type: Object,
    default: () => ({
      width: "100%",  // 默认宽度
      height: "800px"  // 默认高度
    })
  },
  locationName: {
    type: String,
    required: true // 假设父组件传递了地名
  }
});

let map = null;
let marker = null;  // 用于存储标记对象

// 创建加载地图的函数
const loadMap = () => {
  window._AMapSecurityConfig = {
    securityJsCode: "ff15fa4b38c697398d3bfb3c186f650f",
  };

  AMapLoader.load({
    key: "e274919610e064e79a094317c4023d8c",
    version: "2.0", // 指定要加载的 JSAPI 的版本
    plugins: ["AMap.Scale", "AMap.Geocoder"], // 使用的插件
  })
    .then((AMap) => {
      // 初始化地图
      map = new AMap.Map("container", {
        viewMode: "3D",
        zoom: 16,
      });

      // 获取地名对应的经纬度
      const geocoder = new AMap.Geocoder({
        radius: 1000,  // 搜索半径
        extensions: "all",  // 返回所有信息
      });

      // 使用地名进行地理编码（转换为经纬度）
      geocoder.getLocation(props.locationName, (status, result) => {
        if (status === "complete" && result.info === "OK") {
          const lngLat = result.geocodes[0].location;  // 获取第一个解析的地理位置

          // 更新地图的中心点
          map.setCenter(lngLat);

          // 创建并设置标记
          marker = new AMap.Marker({
            position: lngLat,  // 将标记放置在地名对应的经纬度位置
            title: props.locationName,  // 设置标记标题为地名
          });

          // 将标记添加到地图
          marker.setMap(map);
        } else {
          console.error("地名解析失败:", result);
        }
      });
    })
    .catch((e) => {
      console.log(e);
    });
};

// 页面初始化时加载地图
onMounted(() => {
  loadMap();
});

// 监听 locationName 变化，重新加载地图
watch(
  () => props.locationName,
  (newLocationName) => {
    if (map && marker) {
      // 清除旧的标记
      marker.setMap(null);
    }
    loadMap(); // 重新加载地图
  }
);

onUnmounted(() => {
  marker?.setMap(null);  // 组件卸载时移除标记
  map?.destroy();  // 销毁地图实例
});
</script>

<style scoped>
#container {
  width: 100%;
  height: 800px;
}
</style>
