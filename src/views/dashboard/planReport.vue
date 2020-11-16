<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
require('echarts/theme/macarons') // echarts theme
import resize from './mixins/resize'
import {fetchList} from "@/api/report/plan/userPlan";
import {getPlanReportTimelineStat} from "@/api/report/plan/planReport";
import {getNowDateString} from "@/utils/datetime";
import {createLineChart} from "@/utils/echarts";

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
      //第一步：获取排第一个的计划
      const para ={
        page:1,
        pageSize:1,
        needTotal:false
      };
      fetchList(para).then(
        response => {
          let userPlan = response.rows[0];
          //时间线统计
          this.timelineStat(userPlan);
        }
      );
    },
    timelineStat(userPlan){
      const dateGroupType = userPlan.planConfig.planType;
      const v = getNowDateString();
      //const v = '2020-06-01';
      const para ={
        userPlanId:userPlan.id,
        dateGroupType:dateGroupType,
        year: v.substring(0,4),
        month: v.substring(5,7)
      };
      getPlanReportTimelineStat(para).then(
        response => {
          //组装chart数据
          let chartData = response;
          this.chart = echarts.init(this.$el, 'macarons');
          //折线上是否显示值
          chartData.itemLabelShow = false;
          createLineChart(chartData,this.chart);
        }
      );
    }
  }
}
</script>
