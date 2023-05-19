<template>
  <div class="app-container">

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getBuyRecordTreeStat } from "@/api/consume/buyRecord";
  import CommonChart from '../../../chart/commonChart'

export default {
  name: "BuyRecordTreeStat",
  props: {
      //父层带过来的信息值
      buyRecordTSData: {id:undefined}
  },
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //图表数据
      chartData:{},
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      // 查询参数
      queryParams: {
        id: undefined
      }
    };
  },
  created() {
    this.handleReceiveData(this.buyRecordTSData);
  },
  //监听父层带过来的账户信息值
  watch:{
    buyRecordTSData: {
      deep: true,
      handler(val) {
        this.buyRecordTSData =val;
        this.handleReceiveData(this.buyRecordTSData);
      }
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      this.initChart(data.id);
    },
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    initChart(id) {
      this.openLoading();
      this.queryParams.id = id;
      getBuyRecordTreeStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          this.chartData = response;
          this.chartData.chartType='TREE';
          this.loading.close();
        }
      );
    }
  }
};
</script>
