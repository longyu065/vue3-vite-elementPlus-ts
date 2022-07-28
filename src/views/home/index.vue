<template>
  <div id="map" class="map2d-container">
    <div id="map2" class="map map2d-container" v-show="!switchMapFlag"></div>
    <div id="map3d" class="map map2d-container" v-show="switchMapFlag"></div>
    <div style="position: absolute;    z-index: 1111;    right: 10px;    top: 10px;" id="switch">
      <div class="layer_popup">
      <div class="layer_switch"  @click="switchFlag = !switchFlag"><i></i></div>
      <div class="layer_panel" v-show="switchFlag">
      	<i class="close" @click="switchFlag = false" ></i>
        <h3>选择底图</h3>
        <div class="layer-items">
          <a href="javascript:void(0);" v-for="item in mapType"  :id="item.id">
            <img :src="item.img">{{item.title}}
          </a>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {computed, defineComponent, onMounted, ref} from 'vue'
import vec from '../../assets/image/map/images/vec.jpg'
import img from '../../assets/image/map/images/img.jpg'
import ter from '../../assets/image/map/images/ter.jpg'
import td from '../../assets/image/map/images/3d.png'

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {addLayer} from './switch';
import "@/plugins/leaflet-plugin/L.Control.MousePosition";
import {WebOption,WebsocketHeartbeatJs} from '@/utils/WebsocketHeartbeatJs';

//建立websocket
const websocketHeartbeatJs = new WebsocketHeartbeatJs({url:''})


const switchFlag = ref(false);
const switchMapFlag = ref(false);

const mapType = [{id:'vec_type',img:vec,title:'地图'},{id:'img_type',img:img,title:'影像'},
  {id:'ter_type',img:ter,title:'地形'},{id:'3d',img:td,title:'三维'}]
onMounted(() => {
  // 初始化地图
  initMap();
})

const initMap = ()=>{
  let map = L.map('map2', {
    zoominfoControl: true,
    zoomControl: false,
    render: L.Canvas,
    // crs: L.CRS.EPSG4326,
    minZoom: 2,
    maxZoom: 18,
    zoom: 4,
    // maxBounds:L.latLngBounds(L.latLng(-90, -360), L.latLng(90, 360)),
    attributionControl: false
  });
  map.setView([30,110], 4);
  addLayer(map,'img')
  L.control.mousePosition({lngFirst: true}).addTo(map);
  return map;
}
</script>
<style lang="scss" scoped>
@import "../../assets/css/L.Control.Zoominfo.css";
@import "../../plugins/leaflet-plugin/L.Control.MousePosition.css";
.map2d-container {
  height: calc(100% - 90px);
  position: absolute;
  width:100%;
  .map2d-container{
    width:100%;
    height: calc(100%);
    position: absolute;
  }
  .left-btn {
    position: absolute;
    right: 0;
    top: 46%;
    cursor: pointer;
    z-index: 1;
  }
}
</style>
