<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="预算周期" prop="period">
        <el-select
          v-model="queryParams.period"
          placeholder="预算周期"
          clearable
          size="small"
          style="width: 160px"
        >
          <el-option
            v-for="dict in periodOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="流水日期">
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
          :picker-options="datePickerOptions">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['fund:budgetLog:valueErrorStat']">统计</el-button>
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
  import {getBudgetLogValueErrorStat} from "@/api/fund/budgetLog";
  import CommonChart from '../../chart/commonChart'

  export default {
    name: "BudgetLogValueErrorStat",
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
        loadingOptions: this.loadingOptions,
        //预算列表
        budgetOptions: [],
        //周期
        periodOptions: [{
            id: 'MONTHLY',
            text: '月度预算'
          },
          {
            id: 'YEARLY',
            text: '年度预算'
          }
        ],
        //日期范围快速选择
        datePickerOptions: this.datePickerOptions,
        // 日期范围
        dateRange: this.getYearDateRange(0),
        // 查询参数
        queryParams: {
          period:undefined
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
        getBudgetLogValueErrorStat(this.addDateRange(this.queryParams, this.dateRange)).then(
          response => {
            //组装chart数据
            response.chartType='MIX_LINE_BAR';
            this.chartData = response;
            this.loading.close();
          }
        );
      }
    }
  };
</script>
