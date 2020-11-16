<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import echarts from 'echarts'
import {createLineChart} from "@/utils/echarts";

require('echarts/theme/macarons') // echarts theme
import resize from '../dashboard/mixins/resize.js'

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
      if(this.isObjectEmpty(this.chartData)){
        return;
      }
      this.chart = echarts.init(this.$el, 'macarons');
      //折线上是否显示值
      this.chartData.itemLabelShow = false;
      createLineChart(this.chartData,this.chart);
    }
  }
}
</script>
