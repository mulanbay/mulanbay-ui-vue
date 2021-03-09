<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="起止日期">
        <el-date-picker v-model="dateRange" size="small" style="width: 240px" value-format="yyyy-MM-dd" type="daterange"
          unlink-panels range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="datePickerOptions"></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['data:userRewardPointRecord:fullStat']">统计</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!--图表数据-->
    <div>
      <common-chart :chartData="chartData"/>
    </div>

  </div>
</template>

<script>
  import {getUserRewardPointRecordFullStat} from "@/api/data/userRewardPointRecord";
  import CommonChart from '../../chart/commonChart'

  export default {
    name: "UserRewardPointRecordFullStat",
    components: {
      'common-chart':CommonChart
    },
    mounted() {
       //this.initChart();
    },
    data() {
      return {
        //图表数据
        chartData: {},
        // 加载层信息
        loading: [],
        //加载层配置
        loadingOptions: this.loadingOptions,
        //日期范围快速选择
        datePickerOptions: this.datePickerOptions,
        // 日期范围
        dateRange: this.getYearDateRange(0),
        // 查询参数
        queryParams: {

        }
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
        getUserRewardPointRecordFullStat(this.addDateRange(this.queryParams, this.dateRange)).then(
          response => {
            //组装chart数据
            response.chartType='SUNBURST';
            this.chartData = response;
            this.loading.close();
          }
        );
      }
    }
  };
</script>
