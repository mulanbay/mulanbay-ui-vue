<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="数据分组" prop="statType">
        <el-select
          v-model="queryParams.statType"
          placeholder="数据分组"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in statTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="type">
        <el-select
          v-model="queryParams.type"
          placeholder="类型"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in typeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="周期" prop="period">
        <el-select
          v-model="queryParams.period"
          placeholder="周期"
          clearable
          size="small"
          style="width: 120px"
        >
          <el-option
            v-for="dict in periodOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">统计</el-button>
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
  import {getBudgetStat} from "@/api/fund/budget";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import CommonChart from '../../chart/commonChart'

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
      //图表数据
      chartData:{},
      // 加载层信息
      loading: [],
      //加载层配置
      loadingOptions:this.loadingOptions,
      //统计分组列表
      statTypeOptions:[],
      //类型列表
      typeOptions:[],
      //账户状态
      statusOptions:[],
      //周期
      periodOptions:[],
      // 查询参数
      queryParams: {
        statType:'NAME'
      }
    };
  },
  created() {
    //查询类型树
    this.getEnumTree('BudgetStatType','FIELD',false).then(response => {
      this.statTypeOptions = response;
    });
    //状态类型树
    this.getEnumTree('BudgetType','FIELD',false).then(response => {
      this.typeOptions = response;
    });
    this.getEnumTree('PeriodType','FIELD',false).then(response => {
      this.periodOptions = response;
    });
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
      getBudgetStat(this.queryParams).then(
        response => {
          //组装chart数据
          response.chartType='PIE';
          this.chartData = response;
          this.loading.close();
        }
      );
    }
  }
};
</script>
