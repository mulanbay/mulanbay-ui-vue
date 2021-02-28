<template>
  <!--图表数据-->
  <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />
  </div>
</template>

<script>
  import * as echarts from 'echarts';
  import {createChart} from "@/utils/echarts";
  import resize from '../../dashboard/mixins/resize.js'

  export default {
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
      autoResize: {
        type: Boolean,
        default: true
      },
      chartData: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        chart: null,
        height:'350px'
      }
    },
    watch: {
      chartData: {
        deep: true,
        handler(val) {
          this.chartData =val;
          this.initChart();
        }
      }
    },
    mounted() {
      this.$nextTick(() => {
        //this.initChart()
      })
    },
    beforeDestroy() {
      if (!this.chart) {
        return
      }
      this.chart.dispose()
      this.chart = null
    },
    methods: {
      initChart() {
        if (this.isObjectEmpty(this.chartData)) {
          return;
        }
        if (this.chart == null) {
          this.chart = echarts.init(document.getElementById(this.id));
        }
        let option = this.createChartOption();
        createChart(option, this.chart);
      },
      /** 构建Option */
      createChartOption() {
        let option = {
          title: {
            text: this.chartData.title,
            left: 'center',
            align: 'right'
          },
          grid: {//四周的宽度
            left: '2%',
            right: '3%',
            bottom: '5%',
            containLabel: true
          },
          toolbox: {
            feature: {
              dataZoom: {
                yAxisIndex: 'none'
              },
              restore: {},
              saveAsImage: {}
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              animation: false
            }
          },
          legend: {
            data: this.chartData.legendData,
            left: 10
          },
          xAxis: [{
            type: 'category',
            boundaryGap: false,
            axisLine: {
              onZero: false
            },
            data: this.chartData.xdata
          }],
          yAxis: [{
              name: this.chartData.yaxis[0].name,
              type: 'value',
              axisLabel: {
                formatter: '{value} '+this.chartData.yaxis[0].unit
              }
            },
            {
              name: this.chartData.yaxis[1].name,
              nameLocation: 'start',
              type: 'value',
              axisLabel: {
                formatter: '{value} '+this.chartData.yaxis[1].unit
              },
              inverse: false
            }
          ],
          series: [{
              name: this.chartData.ydata[0].name,
              type: 'line',
              areaStyle: {},
              lineStyle: {
                width: 1
              },
              emphasis: {
                focus: 'series'
              },
              data: this.chartData.ydata[0].data
            },
            {
              name: this.chartData.ydata[1].name,
              type: 'line',
              yAxisIndex: 1,
              areaStyle: {},
              lineStyle: {
                width: 1
              },
              emphasis: {
                focus: 'series'
              },
              data: this.chartData.ydata[1].data
            }
          ]
        };
        return option;
      }
    }
  }
</script>
