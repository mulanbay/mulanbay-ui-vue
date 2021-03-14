<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="名称" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入名称" clearable size="small" style="width: 240px"
          @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery"
          v-hasPermi="['system:qaConfig:stat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />
  </div>

  </div>
</template>

<script>
  import {getQaConfigStat} from "@/api/system/qaConfig";
  import * as echarts from 'echarts';
  import {chartProps,createChart} from "@/utils/echarts";
  import resize from '../../dashboard/mixins/resize.js'

  export default {
    name: "QaConfigStat",
    mixins: [resize],
    mixins: [resize],
    props: {
      className: {
        type: String,
        default: 'chart'
      },
      id: {
        type: String,
        default: 'chart'
      },
      width: {
        type: String,
        default: '100%'
      },
      height: {
        type: String,
        default: (document.body.clientHeight - 180).toString() + 'px'
      },
      autoResize: {
        type: Boolean,
        default: true
      }
    },
    mounted() {
      //this.initChart();
    },
    data() {
      return {
        // 加载层信息
        loading: [],
        //加载层配置
        loadingOptions: this.loadingOptions,
        // 查询参数
        queryParams: {}
      };
    },
    created() {
      this.initChart();
    },
    methods: {
      // 打开加载层
      openLoading() {
        this.loading = this.$loading(this.loadingOptions);
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.initChart();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.resetForm("queryForm");
        this.initChart();
      },
      initChart() {
        this.openLoading();
        getQaConfigStat(this.queryParams).then(
          response => {
            //组装chart数据
            if (this.chart == null) {
              this.chart = echarts.init(document.getElementById(this.id));
            }
            this.chart.resize();
            var resData = [];
            resData.push(response);
            let option = this.createChartOption(resData);
            createChart(option, this.chart);
            this.loading.close();
          }
        );
      },
      /**
       * 参考：http://makeapie.com/editor.html?c=xO6bpzhc_c
       * @param {Object} resData
       */
      createChartOption(resData) {
        var colors = [{
            c1: "#00c7ef",
            c2: "#0AF3FF"
          },
          {
            c1: "#FF8E14",
            c2: "#FFA12F"
          },
          {
            c1: "#AF5AFF",
            c2: "#B62AFF"
          },
          {
            c1: "#25dd59",
            c2: "#29f463"
          },
          {
            c1: "#6E35FF",
            c2: "#6E67FF"
          },
          {
            c1: "#002AFF",
            c2: "#0048FF"
          },
          {
            c1: "#8CD282",
            c2: "#95F300"
          },
          {
            c1: "#3B0EFF",
            c2: "#604BFF"
          },
          {
            c1: "#00BE74",
            c2: "#04FDB8"
          },
          {
            c1: "#4a3ac6",
            c2: "#604BFF"
          }
        ];

        var listData = resData;
        var list = [];
        var links = [];
        var legend = [];

        var categories = listData[0].children.map(item => {
          return {
            name: item.name
          };
        });

        var legendColor = colors.map(item => item.c2)


        handle2(JSON.parse(JSON.stringify(listData)), 0);
        handle3(JSON.parse(JSON.stringify(listData)), 0);

        //计算list
        function handle2(arr, idx, color, category) {
          arr.forEach((item, index) => {
            if (item.name === null) {
              return false;
            }
            // 设置节点大小
            let symbolSize = 15;
            switch (idx) {
              case 0:
                symbolSize = 85;
                break;
              case 1:
                symbolSize = 60;
                break;
              default:
                symbolSize = 15;
                break;
            }

            // 每个节点所对应的文本标签的样式。
            let label = null;
            switch (idx) {
              case 0:
              case 1:
                label = {
                  position: "inside",
                  rotate: 0
                };
                break;
              default:
                break;
            }

            //计算出颜色,从第二级开始
            if (idx === 0) {
              color = colors[0];
            }
            if (idx == 1) {
              color = colors.find((itemm, eq) => eq == index % 10);
              legend.push(item.name);
            }
            // 设置线条颜色
            let lineStyle = {
              color: color.c2
            };
            // 设置节点样式
            let bgcolor = null;
            if (idx === 0) {
              bgcolor = {
                type: "radial",
                x: 0.5,
                y: 0.5,
                r: 0.5,
                colorStops: [{
                    offset: 0,
                    color: color.c1 // 0% 处的颜色
                  },
                  {
                    offset: 0.8,
                    color: color.c1 // 80% 处的颜色
                  },
                  {
                    offset: 1,
                    color: "rgba(0, 0, 0, 0.3)" // 100% 处的颜色
                  }
                ],
                global: false
              };
            } else {
              bgcolor = {
                type: "radial",
                x: 0.5,
                y: 0.5,
                r: 0.5,
                colorStops: [{
                    offset: 0,
                    color: color.c1 // 0% 处的颜色
                  },
                  {
                    offset: 0.4,
                    color: color.c1 // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: color.c2 // 100% 处的颜色
                  }
                ],
                global: false
              };
            }
            let itemStyle = null;
            if (item.children && item.children.length !== 0) {
              //非子节点
              itemStyle = {
                borderColor: color.c2,
                color: bgcolor
              };
            } else {
              //子节点
              item.isEnd = true;
              if (item.isdisease == "true") {
                itemStyle = {
                  color: color.c2,
                  borderColor: color.c2
                };
              } else {
                itemStyle = {
                  color: "transparent",
                  borderColor: color.c2
                };
              }
            }
            //可以改变来实现节点发光效果，但体验不好
            itemStyle = Object.assign(itemStyle, {
              shadowColor: "rgba(255, 255, 255, 0.5)",
              shadowBlur: 10
            });

            if (idx == 1) {
              category = item.name;
            }
            let obj = {
              name: item.name,
              symbolSize: symbolSize,
              category: category,
              label,
              color: bgcolor,
              itemStyle,
              lineStyle
            };
            obj = Object.assign(item, obj);
            if (idx === 0) {
              obj = Object.assign(obj, {
                root: true
              });
            }
            if (item.children && item.children.length === 0) {
              obj = Object.assign(obj, {
                isEnd: true
              });
            }
            list.push(obj);
            if (item.children && item.children.length > 0) {
              handle2(item.children, idx + 1, color, category);
            }
          });
        }
        // 计算links
        function handle3(arr, index, color) {
          arr.forEach(item => {
            if (item.children) {
              item.children.forEach((item2, eq) => {
                if (index === 0) {
                  color = colors.find((itemm, eq2) => eq2 == eq % 10);
                }
                let lineStyle = null;
                switch (index) {
                  case 0:
                    if (item2.children.length > 0) {
                      lineStyle = {
                        normal: {
                          color: "target"
                        }
                      };
                    } else {
                      lineStyle = {
                        normal: {
                          color: color.c2
                        }
                      };
                    }
                    break;
                  default:
                    lineStyle = {
                      normal: {
                        color: "source"
                      }
                    };
                    break;
                }
                let obj = {
                  source: item.name,
                  target: item2.name,
                  lineStyle
                };
                links.push(obj);
                if (item2.children && item.children.length > 0) {
                  handle3(item.children, index + 1);
                }
              });
            }

          });
        }

        let option = {
          backgroundColor: "#404a59",
          toolbox: {
            show: true,
            left: "right",
            right: 20,
            top: "bottom",
            bottom: 20,
          },
          color: legendColor,
          legend: {
            show: true,
            data: legend,
            textStyle: {
              color: "#fff",
              fontSize: 10
            },
            // inactiveColor: "#fff",
            icon: "circle",
            type: "scroll",
            orient: "vertical",
            left: "right",
            right: 20,
            top: 20,
            bottom: 80,
            // itemWidth: 12,
            // itemHeight: 12,
            pageIconColor: "#00f6ff",
            pageIconInactiveColor: "#fff",
            pageIconSize: 12,
            pageTextStyle: {
              color: "#fff",
              fontSize: 12
            }
          },
          selectedMode: "false",
          bottom: 20,
          left: 0,
          right: 0,
          top: 0,
          animationDuration: 1500,
          animationEasingUpdate: "quinticInOut",
          series: [{
            name: "知识图谱",
            type: "graph",
            hoverAnimation: true,
            layout: "force",
            force: {
              repulsion: 300,
              edgeLength: 100
            },
            nodeScaleRatio: 0.6,
            draggable: true,
            roam: true,
            symbol: "circle",
            data: list,
            links: links,
            categories: categories,
            focusNodeAdjacency: true,
            scaleLimit: {
              //所属组件的z分层，z值小的图形会被z值大的图形覆盖
              min: 0.5, //最小的缩放值
              max: 9 //最大的缩放值
            },
            edgeSymbol: ["circle", "arrow"],
            edgeSymbolSize: [4, 8],
            label: {
              normal: {
                show: true,
                position: "right",
                color: "#fff",
                distance: 5,
                fontSize: 10
              }
            },
            lineStyle: {
              normal: {
                width: 1.5,
                curveness: 0,
                type: "solid"
              }
            }
          }]
        };
        return option;
      }
    }
  };
</script>
