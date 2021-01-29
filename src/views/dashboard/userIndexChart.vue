<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
  import * as echarts from 'echarts';
  require('echarts/theme/macarons') // echarts theme
  import resize from './mixins/resize'
  import {createPieChart,createBarChart} from "@/utils/echarts";
  import {getShowIndexChart,getChartPara,statChart} from "@/api/report/chart/userChart";

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '350px'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartConfig:{
      index:1
    }
  },
  data() {
    return {
      chart: null
    }
  },
  created() {
    this.initChart();
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
      //第一步：获取图表
      getShowIndexChart(this.chartConfig.index).then(
        response => {
          let userChart = response;
          if(userChart==null){
            return;
          }
          this.getChartPara(userChart);
        }
      );
    },
    getChartPara(userChart){
      getChartPara(userChart.id).then(
        response => {
          let supportDate = response.supportDate;
          this.detailUrl = response.detailUrl;
          let para = eval('(' + response.para + ')');
          const url = response.url;
          if(supportDate==true){
            //今年的
            const v = this.getYearDateRange(0);
            para.startDate=v[0];
            para.endDate=v[1];
          }
          this.handleStatChart(url,para,response.chartType);
        }
      );
    },
    handleStatChart(url,para,chartType){
      statChart(url,para).then(
        response => {
          let chartData = response;
          chartData.showLegend=false;
          //组装chart数据
          this.chart = echarts.init(this.$el, 'macarons');
          //折线上是否显示值
          if(chartType=='PIE'){
            createPieChart(chartData,this.chart);
          }else{
            createBarChart(chartData,this.chart);
          }
        }
      );
    }
  }
}
</script>
