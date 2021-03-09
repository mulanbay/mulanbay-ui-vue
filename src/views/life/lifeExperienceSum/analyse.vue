<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选择年份">
        <el-date-picker
          v-model="queryParams.startYear"
          type="year"
          format="yyyy"
          value-format="yyyy"
          placeholder="开始年份">
        </el-date-picker>
        <el-date-picker
          v-model="queryParams.endYear"
          type="year"
          format="yyyy"
          value-format="yyyy"
          placeholder="结束年份">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['life:lifeExperienceSum:analyse']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="16">
        <div class="chart-wrapper">
          <shadow-chart :chart-data="shadowChartData"/>
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <pie-chart :chart-data="pieChartData"/>
        </div>
      </el-col>
    </el-row>

  </div>
</template>

<script>
  import {analyseLifeExperienceSum} from "@/api/life/lifeExperienceSum";
  import {deepClone} from "@/utils/index";
  import PieChart from '../../chart/pieChart'
  import ShadowChart from '../../chart/shadowChart'

export default {
  name: "LifeExperienceSumAnalyse",
  components: {
    'shadow-chart':ShadowChart,
    'pie-chart':PieChart
  },
  data() {
    return {
      shadowChartData:{},
      pieChartData:{},
      //加载层配置
      loadingOptions: this.loadingOptions,
      // 查询参数
      queryParams: {

      }
    };
  },
  created() {
    this.initChart();
  },
  methods: {
    /** 搜索按钮操作 */
    handleQuery() {
      this.initChart();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.initChart();
    },
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    initChart() {
      this.openLoading();
      analyseLifeExperienceSum(this.queryParams).then(
        response => {
          this.shadowChartData= response.chartShadowData;
          this.pieChartData= response.chartPieData;
          this.loading.close();
        }
      );
    }
  }
};
</script>
<style lang="scss" scoped>
@media (max-width:1024px) {
  .chart-wrapper {
    padding: 0px;
  }
}
</style>
