import L from "leaflet";
import "./leafletTileLayer"
import 'leaflet.wmts'
import * as Cesium from 'cesium'
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NzNiMDhkOS0wMWVkLTQ1MDYtOTE5Zi1iNjVmNzU1YzdlYzEiLCJpZCI6MTIxODIsImlhdCI6MTYzNDgyMTQwNX0.KS4Fov-Kdyfr7lxby8WHSUoYipl2XK5zhf204iwQJNE'


// const MapLeafletSwitch = (map, option) => {
//
//     let defaultOption = {'map3d':'map3d'};
//     defaultOption = Object.assign(defaultOption, option);
//     var tk = "5a5419ba24cab694576f1a5ad863ae3f";
//     var cesiumAsset = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ODA2MDdlOS0wNDY3LTRhMGItOTU2MC02Y2NjYWUzZTQ4NDgiLCJpZCI6NjE5OTEsImlhdCI6MTYyNjYxNzYwMn0.qLJ3KaNGnfjZyXwOzh7a2w2lybXq6i0ByFZ8gyEBwEI";
//
//
//     L.TileLayer.TiandituLayer = L.TileLayer.extend({
//         getTileUrl: function (tilePoint) {
//             var h = parseInt(Math.random() * 7);
//             var layerType = this.options.layerType;
//             var url = "https://t" + h + ".tianditu.gov.cn/" + layerType + "_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=" + layerType + "&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&" + "TILECOL=" + tilePoint.x + "&TILEROW=" + tilePoint.y + "&TILEMATRIX=" + tilePoint.z + '&tk=5a5419ba24cab694576f1a5ad863ae3f';
//             return url;
//         }
//     });
//     L.tileLayer.tiandituLayer = function (options) {
//         return new L.TileLayer.TiandituLayer('', options);
//     };
//
//     var layerControl = new L.Control({position: 'topright'});
//
//     // layerControl.onAdd = function  () {
//         var layerPop = document.createElement('div');
//         layerPop.className = "layer_popup";
//         layerPop.innerHTML = '<div class="layer_switch"><i></i></div>' +
//             '<div class="layer_panel inactive">' +
//             '	<i class="close"></i>' +
//             '  <h3>选择底图</h3>' +
//             '  <div class="layer-items">' +
//             '		<a href="javascript:void(0);" id="vec_type" class=""><img src="/extends/dep/leaflet1.5.1/images/vec.jpg">地图</a>' +
//             '		<a href="javascript:void(0);" id="img_type" style="margin: 0 16px"><img src="/extends/dep/leaflet1.5.1/images/img.jpg">影像</a>' +
//             '		<a href="javascript:void(0);" id="ter_type"><img src="/extends/dep/leaflet1.5.1/images/ter.jpg">地形</a>' +
//             '		<a href="javascript:void(0);" id="3d"><img src="/extends/dep/leaflet1.5.1/images/3d.png">三维</a>' +
//             '  </div>' +
//             '</div>';
//     // return layerPop;
//     // $("#switch").html(layerPop);
//     var layerPanel = document.querySelector('#switch');
//     layerPanel.innerHTML=layerPop;
//     // }
//
//     // layerControl.onRemove = function (map) {
//     //     //移除控件时要释放
//     // }
//
//     // map.addControl(layerControl);
//
//     // 图例名称
//     var legendControl = new L.Control({position: 'bottomright'});
//
//     legendControl.onAdd = function () {
//         var legend = document.createElement('div');
//         legend.className = "legend_name";
//         return legend;
//     }
//
//     legendControl.onRemove = function (map) {
//         //移除控件时要释放
//     }
//
//     map.addControl(legendControl);
//
//     var x = 10, y = 10;
//
//     if(option) {
//         if(option.x){
//             x = option.x;
//         }
//
//         if(option.y){
//             y = option.y;
//         }
//     }
//
//     // layerControl.setOffset({x:-x,y:-y});
//
//     var layerPanel = document.querySelector('.layer_panel');
//     // 控制底图选择显隐
//     var layerSwitch = document.querySelector('.layer_switch');
//     layerSwitch.addEventListener('click', function(){
//         toggleClass(layerPanel, 'inactive');
//     });
//
//     // 关闭底图
//     var layerClose = document.querySelector('i.close');
//     layerClose.addEventListener('click', function(){
//         addClass(layerPanel, 'inactive');
//     });
//
//     var mapTypes = document.querySelectorAll('.layer-items a');
//     var cacheLayers = [];
//
//     // 切换底图
//     for (var i = 0; i < mapTypes.length; i++) {
//         var mapType = mapTypes[i];
//         mapType.addEventListener('click', mapTypeClick.bind(mapType));
//     }
//     var viewer;
//
//     function initmap3d(center) {
//         if (!viewer) {
//             var subdomains = ['0', '1', '2', '3', '4', '5', '6', '7'];
//             Cesium.Ion.defaultAccessToken = cesiumAsset;
//             viewer = new Cesium.Viewer(defaultOption.map3d, {
//                 animation: false,       //动画
//                 homeButton: false,       //home键
//                 geocoder: true,         //地址编码
//                 baseLayerPicker: false, //图层选择控件
//                 timeline: false,        //时间轴
//                 fullscreenButton: false, //全屏显示
//                 infoBox: true,         //点击要素之后浮窗
//                 sceneModePicker: true,  //投影方式  三维/二维
//                 navigationInstructionsInitiallyVisible: false, //导航指令
//                 navigationHelpButton: false,     //帮助信息
//                 selectionIndicator: false, // 选择
//                 imageryProvider: new Cesium.WebMapTileServiceImageryProvider({
//                     //影像底图
//                     url: "http://t{s}.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=" + tk,
//                     subdomains: subdomains,
//                     layer: "tdtImgLayer",
//                     style: "default",
//                     format: "image/jpeg",
//                     tileMatrixSetID: "GoogleMapsCompatible",//使用谷歌的瓦片切片方式
//                     show: true
//                 })
//             });
//             viewer._cesiumWidget._creditContainer.style.display = "none";  // 隐藏cesium ion
//             viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
//                 //影像注记
//                 url: "http://t{s}.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=" + tk,
//                 subdomains: subdomains,
//                 layer: "tdtCiaLayer",
//                 style: "default",
//                 format: "image/jpeg",
//                 tileMatrixSetID: "GoogleMapsCompatible",
//                 show: true
//             }));
//         }
//         // 将三维球定位到中国
//         viewer.camera.flyTo({
//             destination: Cesium.Cartesian3.fromDegrees(center.lng || 103.84, center.lat || 31.15, 178500),
//             orientation: {
//                 heading: Cesium.Math.toRadians(348.4202942851978),
//                 pitch: Cesium.Math.toRadians(-89.74026687972041),
//                 roll: Cesium.Math.toRadians(0)
//             },
//             complete: function callback() {
//                 // 定位完成之后的回调函数
//             }
//         });
//     }
//
//     function mapTypeClick() {
//         var target = this;
//
//
//         if (target.className.indexOf('active') > -1) {
//             return;
//         }
//         for (var m = 0; m < mapTypes.length; m++) {
//             removeClass(mapTypes[m], 'active');
//         }
//         addClass(target, 'active');
//
//         var id = target.id, mapType;
//         if (id.indexOf('3d') == 0) {
//             $("#map3d").show();
//
//             initmap3d(map.getCenter());
//             $("#map2").hide();
//             return;
//         } else {
//             $("#map3d").hide();
//             $("#map2").show();
//         }
//
//
//         // 移除前图层
//         for (var c = 0; c < cacheLayers.length; c++) {
//             map.removeLayer(cacheLayers[c]);
//         }
//
//         // 清空缓存图层
//         cacheLayers = [];
//
//
//         if(id.indexOf('vec') == 0) {
//             mapType = 'vec';
//             // 矢量底图
//             var vecLayer = addLayer('vec');
//             cacheLayers.push(vecLayer);
//             // 矢量注记
//             var cvaLayer = addLayer('cva');
//             cacheLayers.push(cvaLayer);
//         } else if (id.indexOf('img') == 0) {
//             mapType = 'img';
//             // 影像底图
//             var imgLayer = addLayer('img');
//             cacheLayers.push(imgLayer);
//             // 影像国界
//             var iboLayer = addLayer('ibo');
//             cacheLayers.push(iboLayer);
//             // 影像注记
//             var ciaLayer = addLayer('cia');
//             cacheLayers.push(ciaLayer);
//         } else if (id.indexOf('ter') == 0) {
//             mapType = 'ter';
//             // 地形底图
//             var terLayer = addLayer('ter');
//             cacheLayers.push(terLayer);
//             // 地形国界
//             var tboLayer = addLayer('tbo');
//             cacheLayers.push(tboLayer);
//             // 地形注记
//             var ciaLayer = addLayer('cta');
//             cacheLayers.push(ciaLayer);
//         }
//     };
//
//
//
//
//     function remove() {
//         for (var c = 0; c < cacheLayers.length; c++) {
//             var layer = cacheLayers[c];
//             map.removeLayer(layer);
//         }
//
//         document.querySelector('.layer_popup').style.display="none";
//     }
//
//     function restore() {
//         for (var c = 0; c < cacheLayers.length; c++) {
//             var layer = cacheLayers[c];
//             map.addLayer(layer);
//             layer.setZIndex(c - cacheLayers.length + 1);
//         }
//
//         document.querySelector('.layer_popup').style.display="block";
//     }
//
//     /**
//      * dom元素添加类
//      * @param obj
//      * @param cls
//      */
//     function addClass(obj, cls){
//         var obj_class = obj.className,//获取 class 内容.
//             blank = (obj_class != '') ? ' ' : '';//判断获取到的 class 是否为空, 如果不为空在前面加个'空格'.
//         var added = obj_class + blank + cls;//组合原来的 class 和需要添加的 class.
//         obj.className = added;//替换原来的 class.
//     }
//
//     /**
//      * dom元素移除类
//      * @param obj
//      * @param cls
//      */
//     function removeClass(obj, cls){
//         var obj_class = ' '+obj.className+' ';//获取 class 内容, 并在首尾各加一个空格. ex) 'abc    bcd' -> ' abc    bcd '
//         obj_class = obj_class.replace(/(\s+)/gi, ' '),//将多余的空字符替换成一个空格. ex) ' abc    bcd ' -> ' abc bcd '
//             removed = obj_class.replace(' '+cls+' ', ' ');//在原来的 class 替换掉首尾加了空格的 class. ex) ' abc bcd ' -> 'bcd '
//         var removed = removed.replace(/(^\s+)|(\s+$)/g, '');//去掉首尾空格. ex) 'bcd ' -> 'bcd'
//         obj.className = removed;//替换原来的 class.
//     }
//
//     function toggleClass(obj, cls){
//         if (obj.className.indexOf(cls) > -1){
//             obj.className = obj.className.replace(cls, '');
//         } else {
//             var lastChar = obj.className.substr(-1);
//             if (lastChar == ' '){
//                 obj.className = obj.className + cls;
//             } else {
//                 obj.className = obj.className + ' ' + cls;
//             }
//         }
//     }
//
//     // 叠加默认底图
//     mapTypeClick.call(mapTypes[1]);
//
//     this.remove = remove;
//     this.restore = restore;
//     return this;
// }

const addLayer = (map,mapType) =>{
    var mapZoom = 18, layerZoom = 18;
    // 地形
    if (mapType == 'ter') {
        mapZoom = 14;
        layerZoom = 14;
    }

    if (mapType == 'ibo' || mapType == 'tbo') {
        layerZoom = 10;
    }

    var mapLayer = L.tileLayer.tiandituLayer({layerType:mapType, minZoom:1, maxZoom:layerZoom});

    if(mapType.indexOf('c') != 0 || true){
        map.addLayer(mapLayer);

        // 切换底图时保证底图和注记一直在最下面
        if (mapType == 'vec' || mapType == 'img' || mapType == 'ter') {
            mapLayer.setZIndex(-1);
        } else {
            mapLayer.setZIndex(0);
        }
    }

    map.setMinZoom(1);
    map.setMaxZoom(mapZoom);
    return mapLayer;
}
export {addLayer}
