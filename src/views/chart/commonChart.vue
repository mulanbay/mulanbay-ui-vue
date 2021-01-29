<template>
  <!--图表数据-->
  <div :id="id" :class="className" :style="{height:height,width:width,margin:0 }" />
  </div>
</template>

<script>
  import * as echarts from 'echarts';
  import {chartProps,createChart,createMixLineBarChart,createPieChart,createBarChart,createCalanderHeatMapChart,createGaugeChart,
  createTreeMapChart,createRadarChart,createCalanderChart,createLineChart,
  createScatterChart,createShadowChart,createDoublePieChart,
  createCompareCalanderChart,createCalanderPieChart,
  createPolarBarChart,createTreeChart,createSunburstChart} from "@/utils/echarts";
  import {deepClone} from "@/utils/index";
  import resize from '../dashboard/mixins/resize.js'

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
      height:(document.body.clientHeight - 240).toString() + 'px'
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
      if(this.isObjectEmpty(this.chartData)){
        return;
      }
      if(this.chartData.height){
        this.height=this.chartData.height;
      }
      if(this.chart==null){
        this.chart = echarts.init(document.getElementById(this.id));
      }
      this.chart.resize();
      const chartType = this.chartData.chartType;
      /**
       * 这里需要赋值一次，否则报：
       * you may have an infinite update loop in watcher with expression
       * createCalanderChart里面应该对数组做了一些操作
       * 主要是createCalanderChart
       */
      let newChartData = deepClone(this.chartData);
      if(chartType=='PIE'){
        createPieChart(newChartData,this.chart);
        return;
      }else if(chartType=='DOUBLE_PIE'){
        createDoublePieChart(newChartData,this.chart);
        return;
      }else if(chartType=='BAR'){
        createBarChart(newChartData,this.chart);
        return;
      }else if(chartType=='MIX_LINE_BAR'){
        createMixLineBarChart(newChartData,this.chart);
        return;
      }else if(chartType=='TREE_MAP'){
        createTreeMapChart(newChartData,this.chart,echarts);
        return;
      }else if(chartType=='CALANDER'){
        createCalanderChart(newChartData,this.chart);
        return;
      }else if(chartType=='CALANDER_HEAT_MAP'){
        createCalanderHeatMapChart(newChartData,this.chart,echarts);
        return;
      }else if(chartType=='RADAR'){
        createRadarChart(newChartData,this.chart);
        return;
      }else if(chartType=='LINE'){
        createLineChart(newChartData,this.chart);
      }else if(chartType=='GAUGE'){
        createGaugeChart(newChartData,this.chart);
        return;
      }else if(chartType=='SCATTER'){
        createScatterChart(newChartData,this.chart);
        return;
      }else if(chartType=='SHADOW'){
        createShadowChart(newChartData,this.chart);
        return;
      }else if(chartType=='COMPARE_CALANDER'){
        createCompareCalanderChart(newChartData,this.chart);
        return;
      }else if(chartType=='CALANDER_PIE'){
        createCalanderPieChart(newChartData,this.chart,echarts);
        return;
      }else if(chartType=='POLAR_BAR'){
        createPolarBarChart(newChartData,this.chart);
        return;
      }else if(chartType=='TREE'){
        createTreeChart(newChartData,this.chart,echarts);
        return;
      }else if(chartType=='SUNBURST'){
        createSunburstChart(newChartData,this.chart);
        return;
      }else{
        this.msgError('暂不支持的图形类型:'+chartType);
      }
    }
  }
}
</script>
