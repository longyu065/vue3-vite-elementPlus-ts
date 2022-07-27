
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {MapLeafletSwitch} from "./switch";


class MapLeafletHelper {
  constructor() {
    this.init();
  }
  detect = {};
  /**
   * 部门树结构
   */
  // setting = {
  //   view: {},
  //   check: {
  //     enable: false,
  //   },
  //   data: {
  //     simpleData: {
  //       enable: true
  //     }
  //   },
  //   edit: {
  //     enable: false
  //   },
  //   treeNode: {
  //     checked: false
  //   },
  //
  //   callback: {
  //     onClick: zTreeOnClick, //单击事件
  //   }
  // };

  //点击部门显示对应信息
  //  zTreeOnClick(event, treeId, treeNode) {
  //   if (!treeNode.isParent) {
  //     markerClick(treeNode.id.substr(1), treeNode.id.substr(0, 1));
  //   }
  // }

  //  initSiteTree() {
  //   $.ajax({
  //     type: 'POST',
  //     url: '/cache/update',
  //     data: {key: 'VDetectRegionMap'},
  //     success: function (result) {
  //       if (result.code == 200) {
  //         setTimeout(function () {
  //           //   location.reload();
  //         }, 500);
  //       } else {
  //         error(result.msg);
  //         $('.loading').hide();
  //       }
  //     }
  //   });
  //   $.ajax({
  //     type: 'GET',
  //     data: {keyword: '', time: new Date().getTime()},
  //     url: '/detectRegion/read/list',
  //     success: function (result) {
  //       if (result.code == 200) {
  //         let data = result.rows;
  //         for (let i = 0; i < data.length; i++) {
  //           data[i]['open'] = true;
  //           data[i]['pId'] = data[i].parentId;
  //           data[i]['name'] = data[i].name;
  //           data[i]['id'] = data[i].id;
  //         }
  //         $.fn.zTree.init($("#siteTree"), setting, data);
  //
  //       }
  //       $('.loading').hide();
  //     }
  //   });
  // }

  initmap(target2,target3) {

    let defaultOption = {"mapType": 'img'};
    detect.map = L.map(target2, {
      zoominfoControl: true,
      zoomControl: false,
      // render: L.Canvas,
      // crs: L.CRS.EPSG4326,
      minZoom: 2,
      maxZoom: 18,
      zoom: 4,
      // maxBounds:L.latLngBounds(L.latLng(-90, -360), L.latLng(90, 360)),
      attributionControl: false
    });

    MapLeafletSwitch(detect.map, {"mapType": defaultOption.mapType});
    L.control.mousePosition({lngFirst: true}).addTo(detect.map);

    if (option && option["center"]) {
      let center = option["center"];
      detect.map.setView([center[1], center[0]], center[2]);
    } else {
      loadData('/detect/read/getMapParam', {}, function (data) {
        let center = data.split(",");
        detect.map.setView([center[1], center[0]], center[2]);
      });
    }

    detect.markers = L.markerClusterGroup();
    detect.map.addLayer(detect.markers);
  }

  initMap3d(option) {
    loadData('/detect/read/getMapParam', {}, function (data) {
      let center = data.split(",");
      detect.map.setView([center[1], center[0]], center[2]);
    });
  }

  async initWebSocket() {
    let sessionId = window.parent.sessionId;
    let webSocketCon;
    if (!sessionId) {
      return;
    }
    let websocketHeartbeatJs = new window.WebsocketHeartbeatJs({

      url: "ws://" + window.location.host + "/websocket/map" + "/" + sessionId,
      repeatLimit: 10
    });
    websocketHeartbeatJs.onopen =  () => {
      console.log("连接成功")
    };
    websocketHeartbeatJs.onmessage =  (event) => {
      console.log(event.data);
      // port偏移
      if(event.data){
        let data = JSON.parse(event.data);
        if (data.type == "MARKER_OFFSET") {
          updateMarker(data.data);
        } else if (data.type == "MARKER_ALERT") {

        }
      }
    };
    await websocketHeartbeatJs.createWebSocket();
  }

  updateMarker(data){
    for (let i = 0; i < data.length; i++) {

      let alertCount = data[i]["alertEventCount"];
      let siteId = data[i]['id'];
      let m = detect.rowObject[siteId];
      if (!m) continue;
      let marker = detect.rowObject[siteId].marker;

      let gpsOffset = data[i]["currentOffset"];
      if (gpsOffset) {
        let updateTime = gpsOffset['update_time'];
        if (detect.rowObject[siteId] && detect.rowObject[siteId].updateTime
            < updateTime) {
          let y = 0;
          let x = 0;
          detect.rowObject[siteId].updateTime = updateTime;
          if (m.showBaseLoc == '1') {
            y = gpsOffset['nbase'] || 0;
            x = gpsOffset['ebase'] || 0;
          } else {
            //固定地点的不更新
            continue;
          }

          let latlng = new L.LatLng(m.lat, m.lng);
          let m3857 = L.CRS.EPSG3857.project(latlng);
          let m4326 = {x: m3857.x + x, y: m3857.y + y};
          latlng = L.CRS.EPSG3857.unproject(m4326);
          marker.setLatLng(latlng);

        }
      }
      let icon = new L.Icon.Default();
      marker.unbindPopup();
      if (alertCount > 0) {

        icon.options.iconUrl = 'marker-icon-red.png';
        marker.setIcon(icon);
        marker.bindPopup(() => {
          let param = "port=" + m.sourcePort + "&regionId=" + m.regionId;
          return "<a onclick='window.postMessageToMenu(\"/main/detect/alertEvent.html\",\""
              + param + "\")'>查看预警事件</a>";
        }).openPopup();
        marker.on("mouseover", function () {
          marker.openPopup();
        })
      } else {
        marker.setIcon(icon);
      }
    }

  }
  // 初始化
  init() {
    initSiteTree();
    if (!detect["map"]) {
      initmap();
      initWebSocket();
    }

    loadData('/detect/read/list', {}, function (rows) {
      detect.markers.clearLayers();
      detect.rowObject = {};

      for (let i = 0; i < rows.length; i++) {
        (function (i) {
          let a = rows[i];
          let alertEventCount = Number(a.alertEventCount);

          let y = 0;
          let x = 0;

          let gpsOffset = a['currentOffset'];
          //table 图表使用基础坐标
          a.baseLat = Number(a.baseLat || a.lat);
          a.baseLng = Number(a.baseLng || a.lng);
          //地图展示定位用
          a.lat = Number(a.lat);
          a.lng = Number(a.lng);
          // 展示以基础坐标加偏移
          if (a.showBaseLoc == 1) {

            a.lat = Number(a.baseLat);
            a.lng = Number(a.baseLng);

            y = gpsOffset && gpsOffset['nbase'] ? Number(gpsOffset['nbase'])
                : 0;
            x = gpsOffset && gpsOffset['ebase'] ? Number(gpsOffset['ebase'])
                : 0;
          }
          a.baseElevation = a.baseElevation || a.evaluate;

          let updateTime = gpsOffset && gpsOffset['update_time']
              ? gpsOffset['update_time'] : new Date().getTime();
          a.updateTime = updateTime;
          let title = a.location;
          let icon = new L.Icon.Default();
          if (alertEventCount > 0) {
            icon.options.iconUrl = 'marker-icon-red.png';
          }
          let latlng = new L.LatLng(Number(a.lat), Number(a.lng));
          let m3857 = L.CRS.EPSG3857.project(latlng);
          let m4326 = {x: m3857.x + x, y: m3857.y + y};
          latlng = L.CRS.EPSG3857.unproject(m4326);

          let marker = L.marker(latlng,
              {icon: icon, title: title});
          //   marker.bindPopup(title);
          a.marker = marker;
          if (alertEventCount > 0) {
            marker.bindPopup(() => {
              let param = "port=" + a.sourcePort + "&regionId=" + a.regionId;
              return "<a onclick='window.postMessageToMenu(\"/main/detect/alertEvent.html\",\""
                  + param + "\")'>查看预警事件</a>";
            }).openPopup();
            marker.on("mouseover", function () {
              marker.openPopup();
            })
          }
          marker.bindTooltip(title).openTooltip();

          marker.on("click", function () {
            markerClick(a.id);
          })
          a.updateTime = 0;

          detect.rowObject[a.id] = a;

          detect.markers.addLayer(marker);
        })(i)
      }
      $('.loading').hide();
    });

  }

  // 表格初始化
  option = {
    target: '.gpsGgaRecord-list',
    url: '/gpsPosRecords/read/page',
    params: {sourcePort: '', timeRange: '12', desc: 'localt'},
    searchable: true,
    filterHolder: '类型',
    iDisplayLength: 25,
    lengthMenu: [25, 50, 75, 100, 500, 1000],
    columns: [
      {"data": "nbase"},
      {"data": "ebase"},
      {"data": "ubase"},
      {"data": "fnbase"},
      {"data": "febase"},
      {"data": "fubase"},
      {"data": "localt"}
    ], "columnDefs": [{
      render: function (data, type, row) {

        return (Number(data) + Number(option.baseData.unit.y)).toFixed(4);
      },
      targets: 0
    },
      {
        render: function (data, type, row) {

          return (Number(data) + Number(option.baseData.unit.x)).toFixed(4);
        },
        targets: 1
      },
      {
        render: function (data, type, row) {

          return ((Number(data) || 0) + Number(option.baseData.baseElevation)).toFixed(4);
        },
        targets: 2
      },
      {
        render: function (data, type, row) {

          return (Number(row.nbase) - Number(option.baseData.firstNbase)).toFixed(4);
        },
        targets: 3
      },
      {
        render: function (data, type, row) {

          return (Number(row.ebase) - Number(option.baseData.firstEbase)).toFixed(4);
        },
        targets: 4
      },
      {
        render: function (data, type, row) {

          return (Number(row.ubase) - Number(option.baseData.firstUbase)).toFixed(4);
        },
        targets: 5
      }

    ],
    //导出
    buttons: {
      dom: {
        button: {
          className: 'btn btn-default'
        }
      },
      buttons: [
        'excelHtml5',
        'csvHtml5',
        'pdfHtml5'
      ]
    }
  };
  let sizeValue = '57%';
  let symbolSize = 2.5;

  option2 = {
    title: {
      text: '点位变化'
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: false
        },
        saveAsImage: {
          pixelRatio: 2
        }
      }
    },
    grid3D: {
      width: '50%',
      left: '53%',
      axisLabel: {
        formatter: function (value, index) {
          // 格式化成月/日，只在第一个刻度显示年份

          return value.toFixed(3);
        }
      },
      tooltio: {
        formatter: function (params) {
          console.log(params)
        }
      }
    },
    xAxis3D: {
      name: '北方向(N) m',
      min: function (value) {
        return (value.min - (value.max - value.min) / 2).toFixed(3);
      },
      max: function (value) {
        return ((value.max) + (value.max - value.min) / 2).toFixed(3);
      },
      minInterval: 0.05
    },
    yAxis3D: {
      name: '东方向(E) m', min: function (value) {
        return (value.min - (value.max - value.min) / 2).toFixed(3);
      },
      max: function (value) {
        return ((value.max) + (value.max - value.min) / 2).toFixed(3);
      }
    },
    zAxis3D: {
      name: '高程(H) m', min: function (value) {
        return (value.min - (value.max - value.min) / 2).toFixed(3);
      },
      max: function (value) {
        return ((value.max) + (value.max - value.min) / 2).toFixed(3);
      }
    },
    tooltip: {
      axisPointer: {
        type: 'shadow'
      },
      formatter: function (params) {
        console.log(params)

        let xName = params[0].data[0];
        let tool = "时间：" + xName + "<br/>"
        params.map(function (item, i) {
          tool += item.marker + item.seriesName + "："
              + item.data[item.encode.y[0]] + "<br>";
        })
        return tool;
      }
    },
    axisPointer: {
      link: {xAxisIndex: 'all'},
      label: {
        backgroundColor: '#777'
      }
    },

    grid: [
      {
        right: '49%', width: '43%', bottom: '75%',
        tooltip: {trigger: 'axis'}
      },
      {right: '49%', width: '43%', bottom: '40%', top: '35%', tooltip: {trigger: 'axis'}},
      {right: '49%', width: '43%', bottom: '10%', top: '70%', tooltip: {trigger: 'axis'}},
      // {left: '50%', width: '40%', bottom: sizeValue},
      // {left: '50%', width: '40%', bottom: '30%'},
      // {left: '50%', width: '40%',  top: sizeValue}
    ],
    xAxis: [
      {
        type: 'time',
        silent: false,
        splitLine: {show: false},
        splitArea: {show: false},
        gridIndex: 0,
        name: '时间',
      },
      {
        type: 'time',
        silent: false,
        splitLine: {show: false},
        splitArea: {show: false},
        gridIndex: 1,
        name: '时间'
      },
      {
        type: 'time',
        silent: false,
        splitLine: {show: false},
        splitArea: {show: false},
        gridIndex: 2,
        name: '时间'
      }
    ],
    yAxis: [
      {
        type: 'value', gridIndex: 0,
        name: '高程(H) m',
        minInterval: 0.001,
        axisLabel: {
          formatter: function (value, index) {
            return value.toFixed(3);
          }
        },
        min: function (value) {
          return (value.min - (value.max - value.min)).toFixed(3);
        },
        max: function (value) {
          return ((value.max) + (value.max - value.min)).toFixed(3);
        },
      },
      {
        type: 'value', gridIndex: 1,
        min: function (value) {
          return (value.min - (value.max - value.min)).toFixed(3);
        },
        max: function (value) {
          return ((value.max) + (value.max - value.min)).toFixed(3);
        },
        name: '北方向(N) m',
        axisLabel: {
          formatter: function (value, index) {
            return value.toFixed(3);
          }
        },
        minInterval: 0.001
      },
      {
        type: 'value', gridIndex: 2,
        min: function (value) {
          return (value.min - (value.max - value.min)).toFixed(3);
        },
        max: function (value) {
          return ((value.max) + (value.max - value.min)).toFixed(3);
        },
        name: '东方向(E) m'
        , axisLabel: {
          formatter: function (value, index) {
            // 格式化成月/日，只在第一个刻度显示年份
            return value.toFixed(3);
          }
        },
        minInterval: 0.001

      }
    ],
    dataset: [{
      dimensions: [
        {name: 'localt', type: 'time'},
        'lat',
        'lng',
        'ease'
      ],
      source: [["localt", "lat", "lng", "ease"]]
    }],
    axisPointer: {
      link: {xAxisIndex: 'all'},
      label: {
        backgroundColor: '#777'
      }
    },
    dataZoom: [{
      type: 'inside',
      xAxisIndex: [0, 1, 2],
    }, {
      type: 'slider', xAxisIndex: [0, 1, 2],
    }],
    series: [
      {
        type: 'scatter3D',
        symbolSize: 10,
        encode: {
          x: 'lat',
          y: 'lng',
          z: 'ease',
          tooltip: [0, 1, 2, 3, 4, 5]
        },
        tooltip: {
          formatter: function (params) {
            let xName = params.data[0];
            let tool = "时间：" + xName + "<br/>"
            for (let i = 1; i < params.data.length; i++) {
              let item = params.dimensionNames[i];
              if (item == 'lat') {
                item = '北方向（N）m';
              }
              if (item == 'lng') {
                item = '东方向（E）m';
              }
              if (item == 'ease') {
                item = '高程（H）m';
              }
              tool += item + "："
                  + params.data[i] + "<br>";
            }
            return tool;
          }
        }
      },

      {
        name: '高程(H) m',

        type: 'line',
        symbolSize: symbolSize,
        xAxisIndex: 0,
        yAxisIndex: 0,
        encode: {
          x: 'localt',
          y: 'ease',
          //    tooltip: [0, 1, 2, 3]
        }

      },
      {
        name: '北方向(N) m',
        type: 'line',
        symbolSize: symbolSize,
        xAxisIndex: 1,
        yAxisIndex: 1,
        encode: {
          x: 'localt',
          y: 'lat',
          //     tooltip: [0, 1, 2, 3]
        }
      },
      {
        name: '东方向(E) m',
        type: 'line',
        symbolSize: symbolSize,
        xAxisIndex: 2,
        yAxisIndex: 2,
        encode: {
          x: 'localt',
          y: 'lng',
          //   tooltip: [0, 1, 2, 3]
        }
      }
    ]
  };

  markerClick(id, type) {
    let row = detect.rowObject[id];
    let marker = detect.rowObject[id].marker;
    let icon = marker.getIcon();

    type = type || '3';
    if (detect.lInterval) {
      clearInterval(detect.lInterval);
    }
    if (type == '1') {
      $("#mapContent").hide();
      $("#map").show();
      marker.getLatLng();
      detect.map.flyTo(marker.getLatLng(), 16);
      return;
    }
    $("#map").hide();
    $("#mapContent").show();

    if (!row) {
      return;
    }
    $('.loading').show();
    let sourcePort = row["sourcePort"];//gpsid
    option.params.timeRange = $("#gpsGgaRecordSelect").val() || "12";
    option.params.sourcePort = sourcePort;
    option.baseData = row;
    let unit = L.CRS.EPSG3857.project(L.latLng(row.baseLat, row.baseLng));
    option.baseData.unit = unit;
    option.callback = function (table) {
      let $select = $('<select class="gpsGgaRecordSelect" >' +
          '<option  value="0">所有</option>' +
          '<option  value="8">最近30分钟</option><option value="9">最近1小时</option>' +
          '<option  value="10">最近6小时</option><option value="11">最近12小时</option>'
          +
          '<option  value="5">最近24小时</option><option selected value="12">最近2天</option>'
          +
          '<option value="6">最近7天</option>' +
          '<option value="7">最近15天</option>' +
          '<option value="1" >最近一个月</option><option value="2">最近三个月</option>' +
          '<option value="3">最近半年</option><option value="4">最近一年</option>' +
          '</select>');
      $select.appendTo(
          $("<label><span>接收时间：</span></label>").appendTo(".datatable-header"));
      $select.off("change").on("change", function () {
        option.params.timeRange = $(".gpsGgaRecordSelect").val();
        table.ajax.reload();
      })
      $select.select2({
        minimumResultsForSearch: Infinity,
        width: 'auto'
      });
      // 重新加载
      $(document).on('refreshData', function () {
        table.ajax.reload();
      });
    }
    option.dataAjaxCallback = function (rep) {

    }
    $("#myModalLabel").text(row['location'] + "GPS数据");
    $(".tab-pane").removeClass("active");
    $(".tab-pane").eq(Number(type) - 2).addClass("active");
    $(document).trigger('searchDatatables', option);
    $("#chart").css("width", $("#mapContent").width());
    $("#chart").css("height", $("#mapContent").height());

    if ($(".tab-pane.active").attr("id") == "2") {
      loadChart(row);
    }
    $('.loading').hide();
  }

  loadChart(row) {

    let unit = L.CRS.EPSG3857.project(L.latLng(row.baseLat, row.baseLng));
    let elevation = row.baseElevation || 0;
    let timeInterval = row.timeInterval || 10;//刷新间隔 毫秒
    let sourcePort = row["sourcePort"];//gpsid
    detect[sourcePort] = detect[sourcePort] || {};
    let day2 = 24 * 60 * 60 * 1000;
    if (!detect[sourcePort].endTime) {
      loadData("/gpsPosRecords/read/getTopTime", {sourcePort: sourcePort},
          function (data) {
            detect[sourcePort].endTime = data - 1000;
          }, false)
    }
    let nowTime = new Date().getTime() - 1000;
    let startTime = detect[sourcePort].endTime || (nowTime - day2);
    let endTime = nowTime;
    //获取延迟一秒的数据
    endTime = new Date().getTime() - 1000;
    detect[sourcePort].endTime = endTime;
    detect[sourcePort].title = row["location"] + "点位变化";
    $.ajax({
      url: '/gpsPosRecords/read/echartList',
      data: {sourcePort: sourcePort, startTime: startTime, endTime: endTime},
      success: function (data) {

        updateChart(data.rows, sourcePort, unit, elevation);
        startTime = endTime;
      },
      async: false,
      dataType: 'json',
      beforeSend: function (evt, request, settings) {
        //request.url = 'XBLK-Web' + request.url;
      },
    })
    detect.lInterval = setInterval(function () {
      //获取延迟一秒的数据
      endTime = new Date().getTime() - 1000;
      detect[sourcePort].endTime = endTime;
      $.ajax({
        url: '/gpsPosRecords/read/echartList',
        data: {sourcePort: sourcePort, startTime: startTime, endTime: endTime},
        success: function (data) {

          updateChart(data.rows, sourcePort, unit, elevation);
          startTime = endTime;
        },
        async: false,
        dataType: 'json',
        beforeSend: function (evt, request, settings) {
          //request.url = 'XBLK-Web' + request.url;
        },
      })
    }, timeInterval * 1000)
  }

  updateChart(data, sourcePort, unit, elevation) {

    let sourceEchartOption = $.extend(true, {}, option2);

    if (detect[sourcePort].option) {
      sourceEchartOption = detect[sourcePort].option;
    }
    sourceEchartOption.title.text = detect[sourcePort].title;
    let datasetSource = sourceEchartOption.dataset[0].source;
    if (data.length > 0) {
      let l = data.length - 1;
      for (let i = l; i > -1; i--) {
        let localt = data[i]["localt"];
        let ebase = (Number(data[i]["ubase"]) + Number(elevation)).toFixed(4);

        let lat = (Number(data[i]["nbase"]) + Number(unit.y)).toFixed(4);
        let lng = (Number(data[i]["ebase"]) + Number(unit.x)).toFixed(4);
        datasetSource.push([localt, lat, lng, ebase]);
      }

    }

    let lastDate = datasetSource[datasetSource.length - 1][0];
    let sDate = new Date(new Date(lastDate) - 10 * 24 * 60 * 60 * 1000);
    sourceEchartOption.dataZoom[0].startValue = sDate;
    sourceEchartOption.dataZoom[1].startValue = sDate;
    sourceEchartOption.dataZoom[0].endValue = lastDate;
    sourceEchartOption.dataZoom[1].endValue = lastDate;
    sourceEchartOption.dataset.source = datasetSource;

    if (detect.myChart) {
      detect.myChart.setOption(sourceEchartOption);
      detect[sourcePort].option = sourceEchartOption;
    } else {
      detect.myChart = echarts.init(document.getElementById('chart'));
      detect.myChart.clear();
      detect.myChart.setOption(sourceEchartOption, {
        notMerge: true
      });
      detect[sourcePort].option = sourceEchartOption;
    }

  }

  bindUIEvent() {

    $(".right-content").width(
        $(".content-wrapper").width() - $(".left-tool").width());
    $(".side_bar_stretch").click(function () {
      if ($(this).find("span").hasClass("glyphicon-chevron-left")) {
        $(this).find("span").removeClass("glyphicon-chevron-left");
        $(this).find("span").addClass("glyphicon-chevron-right");
        $(".left-tool").css({width: '0px'});
        $(this).css({left: '0px'});
        $(".right-content").css({left: '0px'});
        $(".right-content").width($(".content-wrapper").width());
      } else {
        $(this).find("span").addClass("glyphicon-chevron-left");
        $(this).find("span").removeClass("glyphicon-chevron-right");
        $(".left-tool").width('250px');
        $(this).css({left: '250px'});
        $(".right-content").css({left: '250px'});
        $(".right-content").width($(".content-wrapper").width() - 250);
      }
      setTimeout(function () {
        let w = $('#chart').parent().width();
        $('#chart').width(w);
        if (detect.myChart) {
          detect.myChart.resize();
        }

      }, 1000)

    })
    $("#map,#mapContent").height($(".page-container").height());
    $(".department").height($("#map").height() - 40 - 49);
    $(window).resize(function () {
      $(".right-content").width(
          $(".content-wrapper").width() - $(".left-tool").width());
      $("#map,#mapContent").height($(".page-container").height());
      $(".department").height($("#map").height() - 40 - 49);
      $('#chart').css({width: $('#chart').parent().width()});
      if (detect.myChart) {
        detect.myChart.resize();
      }
    })
  }
  bindUIEvent();
  init();
}
export default MapLeafletHelper;
