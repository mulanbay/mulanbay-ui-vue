<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
  import * as echarts from 'echarts';
  import {chartProps,createChart} from "@/utils/echarts";

export default {
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '90%'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: (document.body.clientHeight - 200).toString() + 'px'
    },
    chartData: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chart: null,
    }
  },
  watch: {
    chartData(newVal,oldVal){
      this.handleReceiveData(newVal);
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
    /** 收到数据 */
    handleReceiveData(data){
      this.chartData =data;
      if(this.chartData.height!=null){
        this.height = this.chartData.height;
      }
      this.initChart();
    },
    /** 构建图形 */
    initChart() {
      if(this.isObjectEmpty(this.chartData)){
        return;
      }
      if(this.chart==null){
        this.chart = echarts.init(this.$el);
      }
      let option = this.createChartOption(this.chartData.avg,this.chartData.title);
      createChart(option,this.chart);
    },
    /** 构建Option */
    createChartOption(avg,title){
      let option = {
        title: {
          text: title,
          x: 'center'
        },
        series: [{
          type: 'gauge',
          min: 0,
          max: 1,
          splitNumber: 8,
          axisLine: {
            lineStyle: {
              width: 6,
              color: [
                [0.25, '#7CFFB2'],
                [0.5, '#58D9F9'],
                [0.75,'#FDDD60'],
                [1, '#FF6E76']
              ]
            }
          },
          pointer: {
            icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
            length: '12%',
            width: 20,
            offsetCenter: [0, '-60%'],
            itemStyle: {
                color: 'auto'
            }
          },
          axisTick: {
            length: 12,
            lineStyle: {
              color: 'auto',
              width: 2
            }
          },
          splitLine: {
            length: 20,
            lineStyle: {
              color: 'auto',
              width: 5
            }
          },
          axisLabel: {
            color: '#464646',
            fontSize: 20,
            distance: -60,
            formatter: function (value) {
              if (value === 0.875) {
                return '差';
              }
              else if (value === 0.625) {
                return '良';
              }
              else if (value === 0.375) {
                return '中';
              }
              else if (value === 0.125) {
                return '优';
              }
            }
          },
          title: {
            offsetCenter: [0, '-20%'],
            fontSize: 30
          },
          detail: {
            fontSize: 50,
            offsetCenter: [0, '0%'],
            valueAnimation: true,
            formatter: function (value) {
              return Math.round(value * 100)  + '%';
            },
            color: 'auto'
          },
          data: [{
            value: avg,
            name: title
          }]
        }]
      };
      return option;
    }
  }
}
</script>
