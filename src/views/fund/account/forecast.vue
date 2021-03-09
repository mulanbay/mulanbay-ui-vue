<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="当前的账户余额">
          <el-input-number v-model="queryParams.currentAmount"  placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item label="每月工资收入">
          <el-input-number v-model="queryParams.monthlySalary"  placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item label="每月其他收入">
          <el-input-number v-model="queryParams.monthlyOtherIncome"  placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item label="每月消费">
          <el-input-number v-model="queryParams.monthlyConsume"  placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item label="每年年终收益">
          <el-input-number v-model="queryParams.yearlyIncome"  placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item label="其他固定支出">
          <el-input-number v-model="queryParams.fixExpend"  placeholder="单位:元" controls-position="right" :min="0" :controls="false" :precision="2" style="width: 120px"></el-input-number>
      </el-form-item>
      <el-form-item label="每年工资增长率">
          <el-input-number v-model="queryParams.yearlySalaryRate"  placeholder="百分率" controls-position="right" :min="0" :controls="false" :precision="2" style="width: 120px"></el-input-number>%
      </el-form-item>
      <el-form-item label="每年存款理财">
          投资比例<el-input-number v-model="queryParams.amountInvestRate"  placeholder="百分率" controls-position="right" :min="0" :controls="false" :precision="2" style="width: 80px"></el-input-number>%
          收益率<el-input-number v-model="queryParams.yearlyAmountRate"  placeholder="百分率" controls-position="right" :min="0" :controls="false" :precision="2" style="width: 80px"></el-input-number>%
      </el-form-item>
      <el-form-item label="预测类型">
          <el-select
            v-model="queryParams.forecastType"
            placeholder="数据分组"
            size="small"
            style="width: 120px"
          >
            <el-option
              v-for="dict in forecastTypeOptions"
              :key="dict.id"
              :label="dict.text"
              :value="dict.id"
            />
          </el-select>
      </el-form-item>
      <el-form-item label="预测值">
          <el-input-number v-model="queryParams.forecastValue"  placeholder="" controls-position="right" :min="0" :controls="false" :precision="0" style="width: 100px"></el-input-number>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-s-data" size="mini" @click="handleQuery">统计</el-button>
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
  import {getAccountForecast} from "@/api/fund/account";
  import CommonChart from '../../chart/commonChart'
  
export default {
  name: "AccountForecast",
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
      //数据方式
      forecastTypeOptions:[
        {
          id: '0',
          text: '预计总存款'
        },
        {
          id: '1',
          text: '预计n个月后'
        }
      ],
      // 查询参数
      queryParams: {
        currentAmount:0,
        monthlySalary:3000,
        monthlyOtherIncome:3000,
        monthlyConsume:1000,
        yearlyIncome:0,
        yearlySalaryRate:5,
        fixExpend:0,
        amountInvestRate:30,
        yearlyAmountRate:4,
        forecastValue:12,
        forecastType:'1'
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
      getAccountForecast(this.queryParams).then(
        response => {
          //组装chart数据
          response.chartType='LINE';
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
