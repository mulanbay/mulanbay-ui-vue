<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="关联预算" prop="budgetKey">
        <treeselect
          v-model="queryParams.budgetKey"
          :options="budgetOptions"
          :disable-branch-nodes="false"
          :show-count="true"
          placeholder="请选择预算"
          style="width: 240px" />
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
      <el-form-item label="包含突发消费" prop="needOutBurst">
        <el-switch v-model="queryParams.needOutBurst"></el-switch>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['fund:budgetLog:stat']">统计</el-button>
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
  import {getBudgetLogStat} from "@/api/fund/budgetLog";
  import {getBudgetTree} from "@/api/fund/budget";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import CommonChart from '../../chart/commonChart'

  export default {
    name: "Stat",
    components: {
      Treeselect,
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
        //日期范围快速选择
        datePickerOptions: this.datePickerOptions,
        // 日期范围
        dateRange: this.getYearDateRange(0),
        // 查询参数
        queryParams: {
          type: 'MONTHLY',
          needOutBurst: true,
          budgetKey: "p3"
        }
      };
    },
    created() {
      this.getBudgetTreeselect();
      this.initChart();
    },
    methods: {
      /** 查询预算下拉树结构 */
      getBudgetTreeselect() {
        getBudgetTree(false).then(response => {
          this.budgetOptions = response;
        });
      },
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
        getBudgetLogStat(this.addDateRange(this.queryParams, this.dateRange)).then(
          response => {
            response.chartType='MIX_LINE_BAR';
            this.chartData = response;
            this.loading.close();
          }
        );
      }
    }
  };
</script>
