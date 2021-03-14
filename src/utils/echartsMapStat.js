/**
 * 生成图形
 * @param {Object} option
 * @param {Object} myChart
 */
export function createMapChart(option, myChart) {
  myChart.clear();
  myChart.setOption(option, true);
  //this.chart.resize();
}

/**
 * 默认地图
 * @param {Object} mapData
 * @param {Object} myChart
 */
export function createDefaultMapChart(mapData, myChart, echarts) {
  //基于模板：https://www.makeapie.com/editor.html?c=xi5eszo651
  var mapName = mapData.mapName;
  var data = mapData.dataList;
  var geoCoordMap = {};
  /*获取地图数据*/
  myChart.showLoading();
  var mapFeatures = echarts.getMap(mapName).geoJson.features;
  myChart.hideLoading();
  mapFeatures.forEach(function(v) {
    // 地区名称
    var name = v.properties.name;
    // 地区经纬度
    geoCoordMap[name] = v.properties.cp;

  });
  var max = mapData.maxValue;
  var min = 0;
  var maxSize4Pin = 50,
    minSize4Pin = 20;

  var convertData = function(data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
      var geoCoord = geoCoordMap[data[i].name];
      if (geoCoord) {
        res.push({
          name: data[i].name,
          value: geoCoord.concat(data[i].value),
        });
      }
    }
    return res;
  };
  let option = {
    backgroundColor: '#404a59',
    title: {
      text: mapData.title,
      subtext: mapData.subTitle,
      x: 'center',
      textStyle: {
        color: '#ffffff',
        fontFamily: '等线',
        fontSize: 18
      },
      subtextStyle: {
        color: '#e7e7e7',
        fontSize: 15,
        fontFamily: '等线'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        if (params.data != null && params.data.days != null) {
          var toolTiphtml = params.data.name +
            '<br>天数:' + params.data.days +
            '<br>次数:' + params.data.counts +
            '<br>花费:' + params.data.cost + '元'
          return toolTiphtml;
        } else {
          return '';
        }
      }
    },
    visualMap: {
      show: true,
      min: min,
      max: max,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'], // 文本，默认为数值文本
      calculable: true,
      seriesIndex: [1],
      inRange: {
        // color: ['#ffc0cb', '#800080'] // 红紫
        color: ['#00557f', '#00246d'], // 蓝绿
      }
    },
    geo: {
      show: true,
      map: mapName,
      label: {
        show: false,
        emphasis: {
          show: true
        }
      },
      roam: true,
      emphasis: {
        itemStyle: {
          areaColor: '#ffff7f'
        }
      },
      itemStyle: {
        normal: {
          //地图的背景颜色
          areaColor: '#bcbcbc',
          borderColor: '#111'
        }
      }
    },
    series: [{
        name: '散点',
        type: 'scatter',
        coordinateSystem: 'geo',
        data: convertData(data),
        symbolSize: function(val) {
          return val[2] / 10;
        },
        label: {
          formatter: '{b}',
          position: 'right',
          show: true
        },
        emphasis: {
          label: {
            show: true
          }
        },
        itemStyle: {
          color: '#05C3F9'
        }
      },
      {
        type: 'map',
        map: mapName,
        geoIndex: 0,
        aspectScale: 0.75, //长宽比
        showLegendSymbol: false, // 存在legend时显示
        label: {
          show: true
        },
        emphasis: {
          label: {
            show: false,
            color: '#fff'
          },
          areaColor: '#2B91B7'
        },
        roam: true,
        itemStyle: {
          areaColor: '#031525',
          borderColor: '#3B5077'
        },
        animation: false,
        data: data
      },
      {
        name: '点',
        type: 'scatter',
        coordinateSystem: 'geo',
        symbol: 'pin', //气泡

        symbolSize: function(val) {
          var a = (maxSize4Pin - minSize4Pin) / (max - min);
          var b = minSize4Pin - a * min;
          b = maxSize4Pin - a * max;
          return a * val[2] + b;
        },
        label: {
          formatter: '{@[2]}',
          show: true,
          color: '#fff',
          fontSize: 9
        },
        itemStyle: {
          color: '#F62157', //标志颜色
        },
        zlevel: 6,
        data: convertData(data),
      },
      {
        name: 'Top 5',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: convertData(data.sort(function(a, b) {
          return b.value - a.value;
        }).slice(0, 5)),
        //定义圆圈大小
        // symbolSize: function(val) {
        //   return val[2] / 25;
        // },
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke'
        },
        hoverAnimation: true,
        label: {
          formatter: '{b}',
          position: 'right',
          show: true
        },
        itemStyle: {
          color: 'yellow',
          shadowBlur: 10,
          shadowColor: 'yellow'
        },
        zlevel: 1
      },
    ]
  };
  createMapChart(option, myChart);
}

/**
 * 世界地图
 * @param {Object} mapData
 * @param {Object} myChart
 */
export function createWorldMapChart(mapData, myChart, echarts) {
  // 飞线颜色
  var flyLineColor = "yellow";
  //线条颜色
  var lineColor = "rgba(31,20,252,1)";
  //高亮地图填充色
  var lightColor = "red";
  // 散点图默认颜色
  var ScatterColor = "yellow"
  // 地图默认状态填充色
  var mapAreaColor = "#06265c"

  //字体颜色
  var textColor = "#fff";


  var geoCoordMap = {
    上海: [121.4648, 31.2891],
    尼日利亚: [-4.388361, 11.186148],
    美国洛杉矶: [-118.24311, 34.052713],
    香港邦泰: [114.195466, 22.282751],
    美国芝加哥: [-87.801833, 41.870975],
    加纳库马西: [-4.62829, 7.72415],
    英国曼彻斯特: [-1.657222, 51.886863],
    德国汉堡: [10.01959, 54.38474],
    哈萨克斯坦阿拉木图: [45.326912, 41.101891],
    俄罗斯伊尔库茨克: [89.116876, 67.757906],
    巴西: [-48.678945, -10.493623],
    埃及达米埃塔: [31.815593, 31.418032],
    西班牙巴塞罗纳: [2.175129, 41.385064],
    柬埔寨金边: [104.88659, 11.545469],
    意大利米兰: [9.189948, 45.46623],
    乌拉圭蒙得维的亚: [-56.162231, -34.901113],
    莫桑比克马普托: [32.608571, -25.893473],
    阿尔及利亚阿尔及尔: [3.054275, 36.753027],
    阿联酋迪拜: [55.269441, 25.204514],
    匈牙利布达佩斯: [17.108519, 48.179162],
    澳大利亚悉尼: [150.993137, -33.675509],
    美国加州: [-121.910642, 41.38028],
    澳大利亚墨尔本: [144.999416, -37.781726],
    墨西哥: [-99.094092, 19.365711],
    加拿大温哥华: [-123.023921, 49.311753]
  };
  var BJData = [
    [{
      name: "尼日利亚",
      value: 9100
    }],
    [{
      name: "美国洛杉矶",
      value: 2370
    }]
  ];
  var convertData = function(data) {
    var res = [];
    for (var i = 0; i < data.length; i++) {
      var dataItem = data[i];
      var fromCoord = geoCoordMap[dataItem[0].name];
      var toCoord = geoCoordMap[dataItem[1].name];
      if (fromCoord && toCoord) {
        res.push([{
            coord: fromCoord,
            value: dataItem[0].value
          },
          {
            coord: toCoord
          }
        ]);
      }
    }
    return res;
  };

  var series = [];
  [
    ["", BJData]
  ].forEach(function(item, i) {
    series.push(

      {
        type: "effectScatter",
        coordinateSystem: "geo",
        zlevel: 1,
        rippleEffect: {
          //涟漪特效
          period: 6, //动画时间，值越小速度越快
          brushType: "stroke", //波纹绘制方式 stroke, fill
          scale: 4 //波纹圆环最大限制，值越大波纹越大
        },
        label: {
          normal: {
            show: true,
            position: "right", //显示位置
            offset: [8, 0], //偏移设置
            formatter: "{b}", //圆环显示文字
            color: textColor,
            fontSize: 10,
            lineHeight: 14,
            borderWidth: 1,
            backgroundColor: "#061a4c",
            borderColor: "#97b5f0",
            padding: 3,
          },
          emphasis: {
            show: true
          }
        },
        symbol: "circle",
        symbolSize: 12,
        itemStyle: {
          normal: {
            show: true,
            "color": ScatterColor,
            "shadowBlur": 10,
            "shadowColor": ScatterColor
          }
        },
        data: item[1].map(function(dataItem) {
          return {
            name: dataItem[0].name,
            value: geoCoordMap[dataItem[0].name].concat([dataItem[0].value])
          };
        })
      },

      // 高亮显示中国
      {
        type: 'map',
        roam: true,
        layoutCenter: ["50%", "50%"], //地图位置
        layoutSize: "180%",
        label: {
          normal: {
            show: false,
          },
          emphasis: {
            show: false,
          }
        },

        itemStyle: {
          normal: {
            areaColor: mapAreaColor,
            borderColor: '#8F98A6'
          },
          emphasis: {
            areaColor: lightColor
          }
        },
        map: 'world', //使用
        data: [{
          "selected": true,
          "name": "China"
        }]
      },
    );
  });

  let option = {
    backgroundColor: '#000',
    title: {
      text: '',
      left: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    tooltip: {
      trigger: "item",
      backgroundColor: "#1540a1",
      borderColor: "#FFFFCC",
      showDelay: 0,
      hideDelay: 0,
      enterable: true,
      transitionDuration: 0,
      extraCssText: "z-index:100",
      formatter: function(params, ticket, callback) {
        //根据业务自己拓展要显示的内容
        var res = "";
        var name = params.name;
        var value = params.value[params.seriesIndex + 1];
        res =
          "<span style='color:#fff;'>" +
          name +
          "</span><br/>数据：" +
          value;
        return res;
      }
    },
    geo: {
      show: false,
      map: "world",
      label: {
        emphasis: {
          show: false
        }
      },
      roam: true, //是否允许缩放
      layoutCenter: ["50%", "50%"], //地图位置
      layoutSize: "180%",
      itemStyle: {
        normal: {
          areaColor: mapAreaColor,
          borderColor: '#8F98A6'
        },
        emphasis: {
          areaColor: '#2a333d'
        }
      }
    },
    series: series
  };
  createMapChart(option, myChart);
}

/**
 * 单向地图
 * @param {Object} data
 * @param {Object} myChart
 */
export function createSingleTransferMapChart(data, myChart) {
  let geoCoordMap = data.geoCoordMapData;
  let planePath =
    'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';
  let convertData = function(data) {
    let res = [];
    for (let i = 0; i < data.length; i++) {
      let dataItem = data[i];
      let fromCoord = geoCoordMap[dataItem[0].name];
      let toCoord = geoCoordMap[dataItem[1].name];
      if (fromCoord && toCoord) {
        res.push({
          fromName: dataItem[0].name,
          toName: dataItem[1].name,
          coords: [fromCoord, toCoord]
        });
      }
    }
    return res;
  };

  let color = ['#a6c84c', '#ffa022', '#46bee9'];
  let series = [];
  for (let i = 0; i < data.statData.length; i++) {
    let srData = convertSeriesData(data.statData[i]);
    //alert(JSON.stringify(srData));
    series.push({
      name: data.legendData[i],
      type: 'lines',
      zlevel: 1,
      effect: {
        show: true,
        period: 6,
        trailLength: 0.7,
        color: '#fff',
        symbolSize: 3
      },
      lineStyle: {
        normal: {
          color: color[i],
          width: 0,
          curveness: 0.2
        }
      },
      data: convertData(srData)
    }, {
      name: data.legendData[i],
      type: 'lines',
      zlevel: 2,
      symbol: ['none', 'arrow'],
      symbolSize: 10,
      effect: {
        show: true,
        period: 6,
        trailLength: 0,
        symbol: planePath,
        symbolSize: 15
      },
      lineStyle: {
        normal: {
          color: color[i],
          width: 1,
          opacity: 0.6,
          curveness: 0.2
        }
      },
      data: convertData(srData)
    }, {
      name: data.legendData[i],
      type: 'effectScatter',
      coordinateSystem: 'geo',
      zlevel: 2,
      rippleEffect: {
        brushType: 'stroke'
      },
      label: {
        normal: {
          show: true,
          position: 'right',
          formatter: '{b}'
        }
      },
      //定义圆圈的大小
      //                    symbolSize: function (val) {
      //                        return val[2] *20;
      //                    },
      itemStyle: {
        normal: {
          color: color[i]
        }
      },
      data: srData.map(function(dataItem) {
        return {
          name: dataItem[1].name,
          value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value])
        };
      })
    });
  }
  let option = {
    backgroundColor: '#404a59',
    title: {
      text: data.title,
      subtext: data.subTitle,
      left: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      top: 'bottom',
      left: 'right',
      data: data.legendData,
      textStyle: {
        color: '#fff'
      },
      selectedMode: 'single'
    },
    geo: {
      map: 'china',
      label: {
        emphasis: {
          show: false
        }
      },
      roam: true,
      itemStyle: {
        normal: {
          areaColor: '#323c48',
          borderColor: '#404a59'
        },
        emphasis: {
          areaColor: '#2a333d'
        }
      }
    },
    series: series
  };
  createMapChart(option, myChart);
}

/**
 * 双向地图
 * @param {Object} data
 * @param {Object} myChart
 */
export function createDoubleTransferMapChart(data, myChart) {
  let geoCoordMap = data.geoCoordMapData;
  let BJData = convertSeriesData(data.statData);
  let planePath =
    'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';

  let convertData = function(data) {
    let res = [];
    for (let i = 0; i < data.length; i++) {
      let dataItem = data[i];
      let fromCoord = geoCoordMap[dataItem[0].name];
      let toCoord = geoCoordMap[dataItem[1].name];
      if (fromCoord && toCoord) {
        res.push({
          fromName: dataItem[0].name,
          toName: dataItem[1].name,
          coords: [fromCoord, toCoord]
        });
      }
    }
    return res;
  };

  let color = ['#a6c84c', '#ffa022', '#46bee9'];
  let serieName = '旅行';
  let series = [];
  [
    [serieName, BJData]
  ].forEach(function(item, i) {
    series.push({
      name: serieName,
      type: 'lines',
      zlevel: 1,
      effect: {
        show: true,
        period: 6,
        trailLength: 0.7,
        color: '#fff',
        symbolSize: 3
      },
      lineStyle: {
        color: color[i],
        width: 0,
        curveness: 0.2
      },
      data: convertData(item[1])
    }, {
      name: serieName,
      type: 'lines',
      zlevel: 2,
      effect: {
        show: true,
        period: 6,
        trailLength: 0,
        //symbol: planePath,
        symbolSize: 5
      },
      lineStyle: {
        color: color[i],
        width: 1,
        opacity: 0.4,
        curveness: 0.2
      },
      data: convertData(item[1])
    }, {
      name: serieName,
      type: 'effectScatter',
      coordinateSystem: 'geo',
      zlevel: 2,
      rippleEffect: {
        brushType: 'stroke'
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{b}'
      },
      itemStyle: {
        color: color[i]
      },
      data: item[1].map(function(dataItem) {
        return {
          name: dataItem[1].name,
          value: geoCoordMap[dataItem[1].name].concat([dataItem[1].value])
        };
      })
    });
  });
  let option = {
    backgroundColor: '#404a59',
    title: {
      text: data.title,
      subtext: data.subTitle,
      left: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    tooltip: {
      trigger: 'item'
    },
    toolbox: {
      show: true,
      feature: {
        dataView: {
          show: true,
          readOnly: false
        },
        restore: {},
        saveAsImage: {}
      }
    },
    legend: {
      orient: 'vertical',
      top: 'bottom',
      left: 'right',
      data: [],
      textStyle: {
        color: '#fff'
      },
      selectedMode: 'single'
    },
    geo: {
      map: 'china',
      label: {
        emphasis: {
          show: false
        }
      },
      roam: true,
      emphasis: {
        areaColor: '#2a333d'
      },
      itemStyle: {
        areaColor: '#323c48',
        borderColor: '#404a59'
      }
    },
    series: series
  };
  createMapChart(option, myChart);
}

export function convertSeriesData(data) {
  let res = [];
  for (let i = 0; i < data.length; i++) {
    res.push([{
      name: data[i].startCity
    }, {
      name: data[i].arriveCity,
      value: data[i].totalCount
    }]);
  }
  return res;
}

/**
 * 基于地点的地图统计（有默认的最高Top的显示）
 * @param {Object} mapData
 * @param {Object} myChart
 */
export function createLocationMapChart(mapData, myChart) {
  let geoCoordMap = mapData.geoCoordMapData;

  let convertData = function(data) {
    let res = [];
    for (let i = 0; i < data.length; i++) {
      let geoCoord = geoCoordMap[data[i].name];
      if (geoCoord) {
        res.push({
          name: data[i].name,
          value: geoCoord.concat(data[i].value)
        });
      }
    }
    return res;
  };
  //最高的
  let topSize = 0;
  let ds = mapData.dataList.length;
  if (ds == 0) {
    topSize = 0;
  } else if (ds <= 3) {
    topSize = 1;
  } else if (ds <= 5) {
    topSize = 3;
  } else {
    topSize = 5;
  }
  let option = {
    backgroundColor: '#404a59',
    title: {
      text: mapData.title,
      subtext: '----',
      sublink: '----',
      x: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        return params.name + ' : ' + params.value[2] + mapData.unit;
      }
    },
    legend: {
      orient: 'vertical',
      y: 'bottom',
      x: 'right',
      data: ['次数'],
      textStyle: {
        color: '#fff'
      }
    },
    visualMap: {
      min: 0,
      max: mapData.max,
      calculable: true,
      inRange: {
        color: ['#50a3ba', '#eac736', '#d94e5d']
      },
      textStyle: {
        color: '#fff'
      }
    },
    geo: {
      map: 'china',
      label: {
        show: true,
        emphasis: {
          show: true
        }
      },
      roam: true,
      emphasis: {
        itemStyle: {
          areaColor: '#ffff7f'
        }
      },
      itemStyle: {
        normal: {
          //地图的背景颜色
          areaColor: '#323c48',
          borderColor: '#111'
        }
      }
    },
    series: [{
        name: mapData.name,
        type: 'scatter',
        coordinateSystem: 'geo',
        data: convertData(mapData.dataList),
        symbolSize: 12,
        label: {
          normal: {
            show: false
          },
          emphasis: {
            show: false
          }
        },
        itemStyle: {
          emphasis: {
            borderColor: '#fff',
            borderWidth: 1
          }
        }
      },
      {
        name: 'Top ' + topSize,
        type: 'effectScatter',
        coordinateSystem: 'geo',
        data: convertData(mapData.dataList.sort(function(a, b) {
          return b.value - a.value;
        }).slice(0, topSize)),
        symbolSize: function(val) {
          let v = val[2] / 10;
          if (v <= 5) {
            return 5;
          } else if (v <= 10) {
            return 10;
          } else {
            return v;
          }
        },
        encode: {
          value: 2
        },
        showEffectOn: 'render',
        rippleEffect: {
          brushType: 'stroke'
        },
        hoverAnimation: true,
        label: {
          formatter: '{b}',
          position: 'right',
          show: true
        },
        itemStyle: {
          color: 'purple',
          shadowBlur: 10,
          shadowColor: '#333'
        },
        zlevel: 1
      }
    ]
  };
  createMapChart(option, myChart);
}

/**
 * 基于地点的地图统计（没有最高Top的显示）
 * @param {Object} mapData
 * @param {Object} myChart
 */
export function createNTLocationMapChart(mapData, myChart) {
  let geoCoordMap = mapData.geoCoordMapData;

  let convertData = function(data) {
    let res = [];
    for (let i = 0; i < data.length; i++) {
      let geoCoord = geoCoordMap[data[i].name];
      if (geoCoord) {
        res.push({
          name: data[i].name,
          value: geoCoord.concat(data[i].value)
        });
      }
    }
    return res;
  };
  let option = {
    backgroundColor: '#404a59',
    title: {
      text: mapData.title,
      subtext: '----',
      sublink: '----',
      x: 'center',
      textStyle: {
        color: '#fff'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        return params.name + ' : ' + params.value[2] + mapData.unit;
      }
    },
    legend: {
      orient: 'vertical',
      y: 'bottom',
      x: 'right',
      data: ['次数'],
      textStyle: {
        color: '#fff'
      }
    },
    visualMap: {
      min: 0,
      max: mapData.max,
      calculable: true,
      inRange: {
        color: ['#50a3ba', '#eac736', '#d94e5d']
      },
      textStyle: {
        color: '#fff'
      }
    },
    geo: {
      map: 'china',
      label: {
        show: true,
        emphasis: {
          show: true
        }
      },
      roam: true,
      emphasis: {
        itemStyle: {
          areaColor: '#ffff7f'
        }
      },
      itemStyle: {
        normal: {
          //地图的背景颜色
          areaColor: '#323c48',
          borderColor: '#111'
        }
      }
    },
    series: [{
      name: mapData.name,
      type: 'scatter',
      coordinateSystem: 'geo',
      data: convertData(mapData.dataList),
      symbolSize: 12,
      label: {
        show: true,
        position: 'top',
        formatter: function(params) {
          return params.name;
        }
      },
      itemStyle: {
        emphasis: {
          borderColor: '#fff',
          borderWidth: 1
        }
      }
    }]
  };
  createMapChart(option, myChart);
}
