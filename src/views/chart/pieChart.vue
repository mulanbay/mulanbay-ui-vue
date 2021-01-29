<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
  import * as echarts from 'echarts';
  import {createPieChart} from "@/utils/echarts";

require('echarts/theme/macarons') // echarts theme

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
    handleReceiveData(data){
      this.chartData =data;
      if(this.chartData.height!=null){
        this.height = this.chartData.height;
      }
      console.log('height:'+this.height);
      this.initChart();
    },
    initChart() {
      if(this.isObjectEmpty(this.chartData)){
        return;
      }
      if(this.chart==null){
        this.chart = echarts.init(this.$el);
      }
      createPieChart(this.chartData,this.chart);
    }
  }
}
</script>
