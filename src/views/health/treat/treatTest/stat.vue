<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true">
      <el-form-item label="检验项目" prop="name">
        <el-select
          v-model="queryParams.name"
          filterable
          allow-create
          default-first-option
          :style="{width: '200px'}"
          @change="handleQuery"
          >
          <el-option
            v-for="dict in nameOptions"
            :key="dict.id"
            :label="dict.text"
            :value="dict.id"
          />
        </el-select>
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
  import {getTreatTestCategoryTree,getTreatTestStat} from "@/api/health/treat/treatTest";
  import CommonChart from '../../../chart/commonChart'

export default {
  name: "Stat",
  components: {
    'common-chart':CommonChart
  },
  props: {
    //父层带过来的账户信息值
    statTreatTestData: {
      name: '',
    }
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
      //日期范围快速选择
      datePickerOptions:this.datePickerOptions,
      // 日期范围
      dateRange: [],
      //项目
      nameOptions:[],
      // 查询参数
      queryParams: {
        name:undefined
      }
    };
  },
  created() {
    this.handleReceiveData(this.statTreatTestData);
  },
  //监听父层带过来的账户信息值
  watch:{
    statTreatTestData(newVal,oldVal){
      this.handleReceiveData(newVal);
    }
  },
  methods: {
    /** 处理父类发起的数据 */
    handleReceiveData(data){
      //需要重新查询账户树，否则显示不更新
      this.initOptionList();
      this.queryParams.name=data.name;
      this.initChart();
    },
    /** 初始化下拉树结构 */
    initOptionList(){
      getTreatTestCategoryTree(false).then(response => {
        this.nameOptions = response;
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
      getTreatTestStat(this.addDateRange(this.queryParams, this.dateRange)).then(
        response => {
          //组装chart数据
          this.chartData = response.chartData;
          this.chartData.chartType=response.chartType;
          this.loading.close();
        }
      );
    }
  }
};
</script>
