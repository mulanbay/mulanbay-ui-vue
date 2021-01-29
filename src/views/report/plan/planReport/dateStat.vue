<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="选取计划" prop="userPlanId">
       <treeselect
        v-model="queryParams.userPlanId"
        style="width: 240px"
        :options="userPlanOptions"
        :disable-branch-nodes="true"
        :show-count="true"
        :searchable="true"
        placeholder="请选择"
        />
      </el-form-item>
      <el-form-item label="起止日期">
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
      <el-form-item label="统计类型" prop="countValueStatResults">
        <el-select
          v-model="queryParams.countValueStatResults"
          style="width: 160px"
          clearable
          multiple
          placeholder="次数">
          <el-option
            v-for="dict in statResultsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
        <el-select
          v-model="queryParams.valueStatResults"
          style="width: 160px"
          clearable
          multiple
          placeholder="值">
          <el-option
            v-for="dict in statResultsOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="过滤全零数据" prop="minValue">
        <el-switch v-model="queryParams.minValue" active-value="0" inactive-value="null" ></el-switch>
      </el-form-item>
      <el-form-item label="统计数据" prop="dataStatType">
        <el-select
          v-model="queryParams.dataStatType"
          style="width: 240px"
          clearable
          placeholder="次数">
          <el-option
            v-for="dict in dataStatTypeOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="stat" icon="el-icon-s-data" size="mini" @click="handleQuery" v-hasPermi="['report:plan:planReport:dateStat']">统计</el-button>
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
  import {getUserPlanTree} from "@/api/report/plan/userPlan";
  import {getPlanReportDateStat} from "@/api/report/plan/planReport";
  import {deepClone} from "@/utils/index";
  import Treeselect from "@riophae/vue-treeselect";
  import "@riophae/vue-treeselect/dist/vue-treeselect.css";
  import CommonChart from '../../../chart/commonChart'

export default {
  name: "DateStat",
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
      //运动类型
      userPlanOptions:[],
      statResultsOptions:[],
      dataStatTypeOptions:[],
      //加载层配置
      loadingOptions: this.loadingOptions,
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      // 查询参数
      queryParams: {
        dataStatType:'ORIGINAL',
        minValue:null
      }
    };
  },
  created() {
    //加载查询条件和表单的
    this.getUserPlanOptionsTreeselect();
    this.getEnumTree('PlanStatResultType','FIELD',false).then(response => {
      this.statResultsOptions = response;
    });
    this.getEnumTree('PlanReportDataStatType','FIELD',false).then(response => {
      this.dataStatTypeOptions = response;
    });
  },
  methods: {
    /** 查询搜索条件中的模板下拉树结构 */
    getUserPlanOptionsTreeselect() {
      getUserPlanTree(false,null,null).then(response => {
        this.userPlanOptions = response;
      });
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
    // 打开加载层
    openLoading() {
      this.loading = this.$loading(this.loadingOptions);
    },
    initChart() {
      let qp = this.addDateRange(this.queryParams, this.dateRange);
      let acQueryParams = deepClone(qp);
      if(acQueryParams.countValueStatResults!=null){
        acQueryParams.countValueStatResults = acQueryParams.countValueStatResults.join(',');
      }
      if(acQueryParams.valueStatResults!=null){
        acQueryParams.valueStatResults = acQueryParams.valueStatResults.join(',');
      }
      if(acQueryParams.minValue=='null'){
        acQueryParams.minValue=undefined;
      }
      this.openLoading();
      getPlanReportDateStat(acQueryParams).then(
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
