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
  let serieName= '旅行';
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
        normal: {
          color: color[i],
          width: 0,
          curveness: 0.2
        }
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
        normal: {
          color: color[i],
          width: 1,
          opacity: 0.4,
          curveness: 0.2
        }
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
        normal: {
          show: true,
          position: 'right',
          formatter: '{b}'
        }
      },
      //                    symbolSize: function (val) {
      //                        return val[2] / 8;
      //                    },
      itemStyle: {
        normal: {
          color: color[i]
        }
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
        return params.name + ' : ' + params.value[2]+mapData.unit;
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
        emphasis: {
          show: false
        }
      },
      itemStyle: {
        normal: {
          areaColor: '#323c48',
          borderColor: '#111'
        },
        emphasis: {
          areaColor: '#2a333d'
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
            return 20;
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
        return params.name + ' : ' + params.value[2]+mapData.unit;
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
        emphasis: {
          show: false
        }
      },
      itemStyle: {
        normal: {
          areaColor: '#323c48',
          borderColor: '#111'
        },
        emphasis: {
          areaColor: '#2a333d'
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
          show:true,
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
      }
    ]
  };
  createMapChart(option, myChart);
}
