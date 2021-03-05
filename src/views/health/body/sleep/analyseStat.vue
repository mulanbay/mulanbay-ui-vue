<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="睡眠日期">
        <el-date-picker
          v-model="dateRange"
          size="small"
          style="width: 240px"
          value-format="yyyy-MM-dd"
          type="daterange"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="datePickerOptions"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="X轴数据" prop="xgroupType">
        <el-select
          v-model="queryParams.xgroupType"
          placeholder="X轴数据"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in xgroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Y轴数据" prop="ygroupType">
        <el-select
          v-model="queryParams.ygroupType"
          placeholder="Y轴数据"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in ygroupTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['health:body:sleep:analyseStat']">统计</el-button>
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
  import {getSleepAnalyseStat} from "@/api/health/body/sleep";
  import CommonChart from '../../../chart/commonChart'

export default {
  name: "Stat",
  components: {
    'common-chart':CommonChart
  },
  mounted() {
     //this.initChart();
  },
  data() {
    return {
      //加载层配置
      loadingOptions: this.loadingOptions,
      //图表数据
      chartData:{},
      xgroupTypeOptions:[],
      ygroupTypeOptions:[],
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: this.getYearDateRange(0),
      // 查询参数
      queryParams: {
        xgroupType:'DAY',
        ygroupType:'DURATION'
      }
    };
  },
  created() {
    this.getDictItemTree('SLEEP_STAT_X_FIELD',false).then(response => {
      this.xgroupTypeOptions = response;
    });
    this.getEnumTree('SleepStatType','FIELD',false).then(response => {
      this.ygroupTypeOptions = response;
    });
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
      getSleepAnalyseStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          response.chartType='SCATTER';
          response.dateGroup=this.queryParams.xgroupType;
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
